"use client";

import { GlassCard, SectionHeader, StatCard } from "@/components/velocity/ui";

export function DashboardPanel({
  currentVehicleName,
  focusScore,
  productivityScore,
  streak,
  totalMinutesToday,
  totalPomodoros,
  weeklyMinutes,
}: {
  currentVehicleName: string;
  focusScore: number;
  productivityScore: number;
  streak: number;
  totalMinutesToday: number;
  totalPomodoros: number;
  weeklyMinutes: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Focus Today" value={`${totalMinutesToday}m`} accent="text-cyan-300" />
        <StatCard label="Weekly Focus" value={`${weeklyMinutes}m`} accent="text-orange-300" />
        <StatCard label="Pomodoros" value={`${totalPomodoros}`} accent="text-rose-300" />
        <StatCard label="Current Streak" value={`${streak}`} accent="text-white" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Performance snapshot" title="Driver dashboard" copy="A fast overview of your momentum, current garage tier, and output quality." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Focus score</p>
              <p className="mt-3 font-[family:var(--font-display)] text-5xl text-white">{focusScore}%</p>
              <p className="mt-2 text-sm text-white/45">Consistency and streak quality.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Productivity score</p>
              <p className="mt-3 font-[family:var(--font-display)] text-5xl text-white">{productivityScore}%</p>
              <p className="mt-2 text-sm text-white/45">Minutes captured against elite weekly rhythm.</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Garage telemetry" title={currentVehicleName} />
          <div className="mt-6 space-y-4">
            {[
              ["Launch quality", "83%", "You start strong once the first sprint begins."],
              ["Midweek rhythm", "76%", "Tuesday and Wednesday remain your strongest runs."],
              ["Recovery discipline", "68%", "Long breaks are helping, but short breaks can tighten up."],
            ].map(([title, value, copy]) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white">{title}</p>
                  <p className="font-[family:var(--font-display)] text-2xl text-orange-300">{value}</p>
                </div>
                <p className="mt-2 text-sm text-white/45">{copy}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
