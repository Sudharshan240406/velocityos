# VelocityOS Deployment Guide

## Requirements

- Node.js 20+
- npm
- Optional Supabase project for auth and sync

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_GA_ID=
```

If these are omitted, VelocityOS still runs in local-first mode.

## Local Development

```bash
npm install
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/workspace`

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Recommended Hosting

- Vercel for the Next.js app
- Supabase for auth, database, and sync

## Supabase Rollout Plan

1. Run [supabase/migrations/0001_velocityos_prod.sql](/C:/Users/Admin/Desktop/Pomodoro/supabase/migrations/0001_velocityos_prod.sql).
2. Enable Google auth in Supabase Auth.
3. Configure the auth redirect URL for `/auth/callback`.
4. Verify row-level security policies with a non-owner user session.

## Accessibility and QA

- Run Lighthouse on both `/` and `/workspace`
- Verify keyboard access for navigation, tasks, settings, and notes
- Verify PWA install prompt and service worker caching behavior
