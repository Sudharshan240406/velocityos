"use client";

import clsx from "clsx";
import { CirclePause, Flame, Play, RotateCcw, SkipForward } from "lucide-react";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";
import { formatTimer } from "@/lib/velocity-utils";
import type { TimerMode, Vehicle } from "@/lib/types";

export function TimerPanel({
  currentVehicle,
  progress,
  sessionsCompletedInCycle,
  taskCount,
  timerMode,
  timerRunning,
  timerSecondsLeft,
  onModeChange,
  onPause,
  onReset,
  onSkip,
  onStart,
}: {
  currentVehicle: Vehicle;
  progress: number;
  sessionsCompletedInCycle: number;
  taskCount: number;
  timerMode: TimerMode;
  timerRunning: boolean;
  timerSecondsLeft: number;
  onModeChange: (mode: TimerMode) => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onStart: () => void;
}) {
  const speed = Math.round(28 + progress * 72);
  const rpm = Math.round(1200 + progress * 6300);
  const turbo = Math.round(25 + progress * 75);
  const nitro = Math.max(10, Math.round(70 - progress * 35));
  const needleAngle = -120 + progress * 240;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <GlassCard className="overflow-hidden p-6 md:p-8">
        <SectionHeader
          eyebrow="Velocity Mode"
          title="Supercar Focus Dashboard"
          copy="Ignition-on focus mode with telemetry gauges, redline pressure, and a cockpit-style countdown."
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,90,31,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6">
            <div className="mx-auto max-w-[520px]">
              <svg viewBox="0 0 420 280" className="w-full">
                <path
                  d="M60 220 A150 150 0 0 1 360 220"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="26"
                  strokeLinecap="round"
                />
                <path
                  d="M60 220 A150 150 0 0 1 360 220"
                  fill="none"
                  stroke="url(#speed-gradient)"
                  strokeWidth="26"
                  strokeLinecap="round"
                  strokeDasharray="471"
                  strokeDashoffset={471 - 471 * progress}
                />
                <g transform={`translate(210 220) rotate(${needleAngle})`}>
                  <line x1="0" y1="0" x2="0" y2="-138" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="14" fill="#fff" />
                </g>
                <defs>
                  <linearGradient id="speed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="-mt-10 grid gap-4 text-center sm:grid-cols-4">
              {[
                { label: "Focus Speed", value: `${speed} MPH` },
                { label: "RPM", value: `${rpm}` },
                { label: "Turbo", value: `${turbo}%` },
                { label: "Nitro", value: `${nitro}%` },
              ].map((metric) => (
                <div key={metric.label} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">{metric.label}</p>
                  <p className="mt-2 font-[family:var(--font-display)] text-3xl text-white">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs uppercase tracking-[0.34em] text-white/35">
                {timerMode === "focus" ? "Velocity Run" : timerMode === "shortBreak" ? "Pit Stop" : "Long Service"}
              </p>
              <p className="mt-3 font-[family:var(--font-display)] text-6xl text-white">{formatTimer(timerSecondsLeft)}</p>
              <p className="mt-2 text-sm text-white/45">Session {Math.min(sessionsCompletedInCycle, 4)} of 4</p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ControlButton label={timerRunning ? "Pause" : "Ignite"} onClick={timerRunning ? onPause : onStart} icon={timerRunning ? CirclePause : Play} primary />
              <ControlButton label="Reset" onClick={onReset} icon={RotateCcw} />
              <ControlButton label="Skip" onClick={onSkip} icon={SkipForward} />
            </div>
          </div>

          <div className="space-y-4">
            <GlassCard className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Drive mode select</p>
              <div className="mt-4 space-y-3">
                {[
                  { id: "focus", label: "Focus", detail: "Max output deep work run" },
                  { id: "shortBreak", label: "Short Break", detail: "Quick reset pit stop" },
                  { id: "longBreak", label: "Long Break", detail: "Full service cooldown" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onModeChange(mode.id as TimerMode)}
                    className={clsx(
                      "w-full rounded-[24px] border px-4 py-4 text-left transition",
                      timerMode === mode.id ? "border-orange-300/30 bg-orange-400/10 text-white" : "border-white/10 bg-white/5 text-white/70",
                    )}
                  >
                    <p className="font-medium">{mode.label}</p>
                    <p className="mt-1 text-sm text-white/45">{mode.detail}</p>
                  </button>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-white/35">Current garage machine</p>
              <p className="mt-3 text-2xl font-semibold text-white">{currentVehicle.name}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{currentVehicle.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  ["Speed", currentVehicle.speed],
                  ["Control", currentVehicle.control],
                  ["Boost", currentVehicle.boost],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[22px] border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between text-sm text-white/70">
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
            <GlassCard className="p-5">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-300" />
                <div>
                  <p className="text-sm text-white">Engine heat</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">{taskCount} active tasks in queue</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  primary = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm transition",
        primary
          ? "border-orange-300/20 bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400 font-medium text-slate-950"
          : "border-white/10 bg-white/5 text-white hover:bg-white/10",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
