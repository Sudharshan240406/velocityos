"use client";

import { Crown, Globe2, ShieldCheck, Users } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";
import type { UserProfile } from "@/lib/types";

export function SocialPanel({
  onEnablePreview,
  profile,
  socialEnabled,
}: {
  onEnablePreview: () => void;
  profile: UserProfile;
  socialEnabled: boolean;
}) {
  const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const socialStats = [
    { label: "Global ranking", value: "#128", Icon: Crown },
    { label: "Weekly challenge", value: "4/7 sprints", Icon: Globe2 },
    { label: "Focus room", value: "Design Crew", Icon: Users },
    { label: "Auth status", value: socialEnabled ? profile.authProvider : "local", Icon: ShieldCheck },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="Social systems"
          title="Leaderboards, friends, and focus rooms"
          copy="The workspace now includes a production-ready social architecture surface with local preview flows and Supabase-ready hooks."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {socialStats.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3 text-orange-200">
                <Icon className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.22em]">{label}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onEnablePreview} className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">
            Preview Google Login
          </button>
          <div className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/70">
            Supabase env: {hasSupabaseEnv ? "configured" : "missing"}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Cloud sync" title="Offline-first sync layer" />
        <div className="mt-6 space-y-3">
          {[
            "Tasks, notes, settings, garage, achievements, and analytics are modeled for Supabase sync.",
            "The app remains fully usable offline thanks to local persistence and IndexedDB hydration.",
            "Automatic online sync can be enabled once NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are provided.",
          ].map((item) => (
            <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
