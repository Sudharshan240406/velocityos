"use client";

import clsx from "clsx";
import { vehicles } from "@/lib/data";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";

export function GaragePanel({
  level,
  unlockedVehicleIds,
  xp,
}: {
  level: number;
  unlockedVehicleIds: string[];
  xp: number;
}) {
  const completionPercentage = Math.round((unlockedVehicleIds.length / vehicles.length) * 100);

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <SectionHeader
          eyebrow="My Garage"
          title="Vehicle collection"
          copy="Every completed Pomodoro feeds the garage. Level up to unlock faster, rarer, and more theatrical machines."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Completion</p>
            <p className="mt-2 font-[family:var(--font-display)] text-5xl text-white">{completionPercentage}%</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Driver level</p>
            <p className="mt-2 font-[family:var(--font-display)] text-5xl text-orange-300">{level}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Garage XP</p>
            <p className="mt-2 font-[family:var(--font-display)] text-5xl text-cyan-300">{xp}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => {
          const unlocked = unlockedVehicleIds.includes(vehicle.id);
          return (
            <GlassCard key={vehicle.id} className="p-5">
              <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,99,71,0.18),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                <div className={clsx("h-32 rounded-[24px] border border-white/10", unlocked ? "bg-[linear-gradient(135deg,#fb923c,#f43f5e,#22d3ee)]" : "bg-white/5")} />
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-white">{vehicle.name}</p>
                  <p className="text-sm text-white/45">
                    Level {vehicle.unlockLevel} | {vehicle.className}
                  </p>
                </div>
                <span className={clsx("rounded-full px-3 py-1 text-xs", unlocked ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-white/45")}>
                  {unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{vehicle.description}</p>
              <div className="mt-5 space-y-3">
                {[
                  ["Speed", vehicle.speed],
                  ["Control", vehicle.control],
                  ["Boost", vehicle.boost],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm text-white/55">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
