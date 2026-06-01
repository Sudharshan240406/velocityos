"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";
import type { SessionLog } from "@/lib/types";

export function AnalyticsPanel({
  dailyData,
  monthlyData,
  sessionLogs,
}: {
  dailyData: { day: string; minutes: number; sessions: number }[];
  monthlyData: { week: string; focus: number; xp: number }[];
  sessionLogs: SessionLog[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <GlassCard className="p-6">
        <SectionHeader eyebrow="Telemetry" title="Weekly performance curves" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="velocity-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }} />
                <Area dataKey="minutes" stroke="#fb923c" strokeWidth={3} fill="url(#velocity-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)" }} />
                <Line type="monotone" dataKey="sessions" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeader eyebrow="Run history" title="Recent telemetry" />
        <div className="mt-6 space-y-3">
          {monthlyData.map((item) => (
            <div key={item.week} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-white">{item.week}</p>
                <p className="font-[family:var(--font-display)] text-2xl text-orange-300">{item.focus}m</p>
              </div>
              <p className="mt-2 text-sm text-white/45">{item.xp} XP earned</p>
            </div>
          ))}
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm uppercase tracking-[0.24em] text-white/35">Latest completions</p>
            <div className="mt-3 space-y-2">
              {sessionLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-white/45">{format(parseISO(log.completedAt), "dd MMM HH:mm")}</span>
                  <span className="text-white">
                    {log.duration}m | +{log.xpEarned} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
