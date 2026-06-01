"use client";

import clsx from "clsx";
import { themeMarketplace } from "@/lib/data";
import { GlassCard, SectionHeader } from "@/components/velocity/ui";
import type { BackgroundEffect, ThemeMode } from "@/lib/types";

export function SettingsPanel({
  availableEffects,
  settings,
  track,
  volume,
  soundEnabled,
  onSetEnabled,
  onSetTrack,
  onSetVolume,
  onUpdate,
}: {
  availableEffects: { id: BackgroundEffect; label: string }[];
  settings: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;
    theme: ThemeMode;
    backgroundEffect: BackgroundEffect;
  };
  track: string;
  volume: number;
  soundEnabled: boolean;
  onSetEnabled: (enabled: boolean) => void;
  onSetTrack: (track: "lofi" | "rain" | "forest" | "ocean" | "cafe" | "brown") => void;
  onSetVolume: (volume: number) => void;
  onUpdate: (patch: Partial<typeof settings>) => void;
}) {
  const fields = [
    { key: "focusMinutes", label: "Focus duration", min: 1, max: 180 },
    { key: "shortBreakMinutes", label: "Short break", min: 1, max: 60 },
    { key: "longBreakMinutes", label: "Long break", min: 1, max: 120 },
    { key: "sessionsBeforeLongBreak", label: "Sessions before long break", min: 1, max: 10 },
  ] as const;

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <SectionHeader eyebrow="Advanced settings" title="Theme marketplace" copy="VelocityOS now supports unlockable themes and configurable background atmospheres." />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themeMarketplace.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => onUpdate({ theme: theme.id })}
              className={clsx(
                "rounded-[24px] border p-5 text-left transition",
                settings.theme === theme.id ? "border-orange-300/30 bg-orange-400/10 text-white" : "border-white/10 bg-black/20 text-white/75",
              )}
            >
              <p className="text-lg font-semibold">{theme.label}</p>
              <p className="mt-2 text-sm text-white/45">{theme.description}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <GlassCard className="p-6">
          <SectionHeader eyebrow="Engine tuning" title="Session controls" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <label htmlFor={`settings-${field.key}`} className="text-white">{field.label}</label>
                  <span className="text-sm text-orange-200">{settings[field.key]}</span>
                </div>
                <input
                  id={`settings-${field.key}`}
                  type="range"
                  min={field.min}
                  max={field.max}
                  value={settings[field.key]}
                  onChange={(event) => onUpdate({ [field.key]: Number(event.target.value) })}
                  className="mt-4 w-full accent-orange-400"
                />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeader eyebrow="Atmosphere" title="Background effects" />
          <div className="mt-6 flex flex-wrap gap-2">
            {availableEffects.map((effect) => (
              <button
                key={effect.id}
                type="button"
                onClick={() => onUpdate({ backgroundEffect: effect.id })}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm",
                  settings.backgroundEffect === effect.id ? "border-orange-300/30 bg-orange-400/10 text-white" : "border-white/10 bg-black/20 text-white/55",
                )}
              >
                {effect.label}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white">Ambient sound engine</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/35">Current track: {track}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["lofi", "rain", "forest", "ocean", "cafe", "brown"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSetTrack(item as "lofi" | "rain" | "forest" | "ocean" | "cafe" | "brown")}
                  className={clsx(
                    "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em]",
                    track === item ? "border-cyan-300/30 bg-cyan-400/10 text-white" : "border-white/10 bg-white/5 text-white/45",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => onSetEnabled(!soundEnabled)} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950">
                {soundEnabled ? "Mute ambience" : "Enable ambience"}
              </button>
              <label htmlFor="ambient-volume" className="sr-only">
                Ambient volume control
              </label>
              <input
                id="ambient-volume"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => onSetVolume(Number(event.target.value))}
                className="mt-4 w-full accent-cyan-400"
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
