create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar text,
  level integer not null default 1,
  xp integer not null default 0,
  streak integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  minutes integer not null default 25,
  energy text not null check (energy in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  focus_minutes integer not null default 25,
  short_break_minutes integer not null default 5,
  long_break_minutes integer not null default 15,
  sessions_before_long_break integer not null default 4,
  theme text not null default 'velocity',
  background_effect text not null default 'racingLights',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.garage_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  level integer not null default 1,
  xp integer not null default 0,
  unlocked_vehicle_ids text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  unlocked boolean not null default false,
  progress numeric not null default 0,
  unlocked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, key)
);

create table if not exists public.analytics_snapshots (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  level integer not null default 1,
  xp integer not null default 0,
  streak integer not null default 0,
  weekly_minutes integer not null default 0,
  total_pomodoros integer not null default 0,
  ai_coach_last_used_at timestamptz,
  theme_last_used text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null check (mode in ('focus', 'shortBreak', 'longBreak')),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration integer not null,
  xp_earned integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists achievements_user_id_idx on public.achievements(user_id);
create index if not exists session_history_user_id_idx on public.session_history(user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.handle_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.handle_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at before update on public.notes for each row execute function public.handle_updated_at();

drop trigger if exists settings_set_updated_at on public.user_settings;
create trigger settings_set_updated_at before update on public.user_settings for each row execute function public.handle_updated_at();

drop trigger if exists garage_set_updated_at on public.garage_progress;
create trigger garage_set_updated_at before update on public.garage_progress for each row execute function public.handle_updated_at();

drop trigger if exists achievements_set_updated_at on public.achievements;
create trigger achievements_set_updated_at before update on public.achievements for each row execute function public.handle_updated_at();

drop trigger if exists analytics_set_updated_at on public.analytics_snapshots;
create trigger analytics_set_updated_at before update on public.analytics_snapshots for each row execute function public.handle_updated_at();

drop trigger if exists sessions_set_updated_at on public.session_history;
create trigger sessions_set_updated_at before update on public.session_history for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)) || '_' || left(new.id::text, 8),
    new.raw_user_meta_data->>'avatar_url',
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.garage_progress (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.analytics_snapshots (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.user_settings enable row level security;
alter table public.garage_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.session_history enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "tasks_all_own" on public.tasks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes_all_own" on public.notes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "settings_all_own" on public.user_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "garage_all_own" on public.garage_progress
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "achievements_all_own" on public.achievements
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "analytics_all_own" on public.analytics_snapshots
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "session_history_all_own" on public.session_history
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
