"use client";

import { GlassCard, SectionHeader } from "@/components/velocity/ui";

export function CoachPanel({
  dailyData,
  focusMinutesToday,
  productivityScore,
  streak,
  weeklyMinutes,
}: {
  dailyData: { day: string; minutes: number; sessions: number }[];
  focusMinutesToday: number;
  productivityScore: number;
  streak: number;
  weeklyMinutes: number;
}) {
  const bestDay = [...dailyData].sort((a, b) => b.minutes - a.minutes)[0]?.day ?? "Tue";
  const productiveWindow = focusMinutesToday > 50 ? "8:30 AM - 11:00 AM" : "9:00 AM - 12:00 PM";
  const breakBoost = productivityScore > 70 ? 27 : 18;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <GlassCard className="p-6">
        <SectionHeader eyebrow="AI Driver Coach" title="Performance engine" copy="Live insight cards and recommendations generated from your session telemetry." />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Most productive time", productiveWindow],
            ["Strongest day", bestDay],
            ["Weekly output", `${weeklyMinutes} minutes`],
            ["Current streak", `${streak} days`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[26px] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {[
            `Your highest productivity occurs between ${productiveWindow}.`,
            `You perform ${breakBoost}% better after a 10-minute break.`,
            `${bestDay} is your strongest focus day.`,
          ].map((insight) => (
            <div key={insight} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
              {insight}
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-6">
        <SectionHeader eyebrow="Recommendations" title="Next best moves" />
        <div className="mt-6 space-y-3">
          {[
            "Start the next focus run within 15 minutes to keep cognitive heat.",
            "Try a 10-minute break after your second session today.",
            "Front-load a high-energy task during your first two blocks tomorrow.",
          ].map((tip) => (
            <div key={tip} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
              {tip}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
