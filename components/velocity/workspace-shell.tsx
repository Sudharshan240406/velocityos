"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings2,
  Download,
  Volume2,
  VolumeX,
  X,
  Flame,
  Award,
  Calendar,
  Compass,
  Music,
  BarChart2,
  Tv,
} from "lucide-react";
import { useFocusStore } from "@/stores/focus-store";
import { BackgroundEffects } from "@/components/velocity/background-effects";
import { CompletionOverlay } from "@/components/velocity/sections/completion-overlay";
import type { BackgroundEffect } from "@/lib/types";

interface DeferredInstallPrompt {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
}

const playSynthSound = (type: "click" | "startup" | "complete", enabled: boolean) => {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "startup") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === "complete") {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.8);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.8);
      });
    }
  } catch (err) {
    console.error("Audio synth error:", err);
  }
};

const formatTimer = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export function WorkspaceShell() {
  const {
    timerMode,
    timerSecondsLeft,
    timerTotalSeconds,
    timerRunning,
    sessionsCompletedInCycle,
    totalSessionsCompleted,
    streak,
    todayFocusMinutes,
    weekFocusMinutes,
    settings,
    completionModalOpen,
    completionReward,
    tick,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    completeSession,
    updateSettings,
    closeCompletionModal,
  } = useFocusStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hudActive, setHudActive] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);

  // Focus Music State
  const [selectedMusic, setSelectedMusic] = useState("Lofi Radio");

  // Sync ticker interval
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  // Handle countdown complete chimes
  useEffect(() => {
    if (timerSecondsLeft === 0 && timerRunning) {
      completeSession();
      playSynthSound("complete", settings.soundEnabled);
    }
  }, [timerSecondsLeft, timerRunning, completeSession, settings.soundEnabled]);

  // Capture PWA Install trigger
  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as DeferredInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const progress = timerTotalSeconds === 0 ? 0 : 1 - timerSecondsLeft / timerTotalSeconds;

  const handleActionClick = (action: () => void) => {
    playSynthSound("click", settings.soundEnabled);
    action();
  };

  return (
    <div className="relative min-h-screen text-white select-none overflow-x-hidden font-[family:var(--font-body)] bg-[#02040a]">
      {/* Cinematic animated mountains, sky and aurora background */}
      <BackgroundEffects effect={settings.backgroundEffect} />

      {/* Main Responsive Grid Layout */}
      <div className="relative z-10 mx-auto max-w-[1440px] min-h-screen p-4 md:p-6 flex flex-col justify-between">
        
        {/* Header Block */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4 backdrop-blur-xs">
          <div>
            <h1 className="font-[family:var(--font-display)] text-xl tracking-[0.24em] text-white">VELOCITYOS</h1>
            <p className="text-[10px] uppercase tracking-[0.26em] text-orange-200 mt-1">CINEMATIC FOCUS OPERATING SYSTEM</p>
          </div>
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button
                type="button"
                onClick={triggerInstall}
                className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs uppercase tracking-[0.15em] text-orange-100 hover:bg-orange-400/20 transition"
              >
                <Download className="h-3.5 w-3.5" />
                Install App
              </button>
            )}
            <button
              type="button"
              onClick={() => handleActionClick(() => setHudActive((v) => !v))}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition ${
                hudActive ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : "border-white/10 text-white hover:bg-white/5"
              }`}
            >
              Pop HUD
            </button>
            <button
              type="button"
              onClick={() => handleActionClick(() => setSettingsOpen(true))}
              className="rounded-full border border-white/10 p-2 text-white hover:bg-white/5 transition"
              aria-label="Open settings panel"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* 3-Column Cockpit Workspace */}
        <div className="grid gap-6 py-6 lg:grid-cols-[280px_1fr_280px] flex-1 items-stretch">
          
          {/* LEFT SIDEBAR: Presets & Atmospheres */}
          <aside className="hidden lg:flex lg:flex-col lg:gap-4 justify-between">
            {/* Session Preset Selector */}
            <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Compass className="h-4 w-4 text-orange-200" />
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Run Presets</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Sprint (25m / 5m)", focus: 25, short: 5, long: 15 },
                  { label: "Deep Sprints (50m / 10m)", focus: 50, short: 10, long: 20 },
                  { label: "Redline Run (90m / 20m)", focus: 90, short: 20, long: 30 },
                ].map((preset) => {
                  const active = settings.focusMinutes === preset.focus && settings.shortBreakMinutes === preset.short;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        handleActionClick(() => {
                          updateSettings({
                            focusMinutes: preset.focus,
                            shortBreakMinutes: preset.short,
                            longBreakMinutes: preset.long,
                          });
                        })
                      }
                      className={`w-full rounded-2xl border p-3.5 text-left text-xs tracking-wider transition ${
                        active ? "border-orange-400 bg-orange-400/10 text-white" : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Atmosphere selection */}
            <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Tv className="h-4 w-4 text-cyan-300" />
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Atmosphere</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "highway", label: "Night Highway" },
                  { id: "garage", label: "F1 Garage" },
                  { id: "track", label: "Cyber Track" },
                  { id: "minimal", label: "Minimal Mode" },
                ].map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() =>
                      handleActionClick(() => updateSettings({ backgroundEffect: env.id as BackgroundEffect }))
                    }
                    className={`rounded-xl border px-2 py-3 text-[10px] text-center transition ${
                      settings.backgroundEffect === env.id
                        ? "border-orange-400 bg-orange-400/10 text-white"
                        : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER PANEL: Giant Neon Timer Ring */}
          <section className="flex flex-col items-center justify-center p-4">
            
            {/* The circular glowing timer centerpiece */}
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square flex items-center justify-center">
              
              {/* Outer neon glow ring */}
              <div className="absolute inset-2 rounded-full border border-white/5 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]" />
              
              {/* Glowing SVG Energy Loop */}
              <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full -rotate-90">
                {/* Background track circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="132"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="8"
                />
                {/* Active neon progress circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="132"
                  fill="none"
                  stroke="url(#timer-glow-grad)"
                  strokeWidth="8"
                  strokeDasharray="829"
                  strokeDashoffset={829 - 829 * progress}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                  style={{
                    filter: "drop-shadow(0px 0px 8px rgba(251, 146, 60, 0.35))",
                  }}
                />

                <defs>
                  <linearGradient id="timer-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Digital core layout inside progress loop */}
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/35">
                  {timerMode === "focus" ? "Active Lap" : timerMode === "shortBreak" ? "Pit Stop" : "Cooldown"}
                </span>
                <span className="font-[family:var(--font-display)] text-6xl md:text-7xl font-bold tracking-wider text-white mt-3">
                  {formatTimer(timerSecondsLeft)}
                </span>
                <span className="text-[10px] text-white/40 tracking-[0.2em] mt-3">
                  Lap {Math.min(sessionsCompletedInCycle, 4)} / 4
                </span>
              </div>
            </div>

            {/* Core Ignition Buttons Directly Under Timer */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => handleActionClick(timerRunning ? pauseTimer : startTimer)}
                className="flex items-center gap-3 rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400 px-8 py-3.5 font-semibold text-slate-950 shadow-[0_0_35px_rgba(255,99,71,0.25)] hover:scale-[1.03] transition text-sm"
              >
                {timerRunning ? <Pause className="h-4 w-4 fill-slate-950" /> : <Play className="h-4 w-4 fill-slate-950" />}
                {timerRunning ? "Pause Run" : "Ignite Focus"}
              </button>
              <button
                type="button"
                onClick={() => handleActionClick(resetTimer)}
                className="rounded-full border border-white/10 p-3.5 text-white/80 hover:bg-white/5 transition"
                aria-label="Reset countdown timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleActionClick(skipSession)}
                className="rounded-full border border-white/10 p-3.5 text-white/80 hover:bg-white/5 transition"
                aria-label="Skip current session"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* RIGHT SIDEBAR: Focus Music & Daily Progress */}
          <aside className="hidden lg:flex lg:flex-col lg:gap-4 justify-between">
            {/* Audio Ambience Ticker */}
            <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <Music className="h-4 w-4 text-cyan-300" />
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Focus Music</p>
              </div>
              <div className="space-y-2">
                {["Lofi Radio", "Rainfall Synth", "Ocean Deep Work", "F1 Engine Idle"].map((station) => {
                  const active = selectedMusic === station;
                  return (
                    <button
                      key={station}
                      type="button"
                      onClick={() => handleActionClick(() => setSelectedMusic(station))}
                      className={`w-full rounded-xl border px-3.5 py-3 text-left text-xs transition ${
                        active
                          ? "border-cyan-400 bg-cyan-400/10 text-white"
                          : "border-white/5 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {station}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ambient sound chimes controls */}
            <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <BarChart2 className="h-4 w-4 text-orange-200" />
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Synth Engine</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleActionClick(() => updateSettings({ soundEnabled: !settings.soundEnabled }))
                }
                className={`flex w-full items-center justify-center gap-2 rounded-full border py-3 text-xs uppercase tracking-wider transition ${
                  settings.soundEnabled
                    ? "border-orange-400 bg-orange-400/10 text-orange-200 shadow-[0_0_15px_rgba(251,146,60,0.15)]"
                    : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {settings.soundEnabled ? "Ambience Enabled" : "Ambience Muted"}
              </button>
            </div>
          </aside>
        </div>

        {/* BOTTOM: Horizontal telemetry stats block */}
        <footer className="grid grid-cols-4 gap-2 border-t border-white/10 pt-6 pb-2">
          {[
            { label: "Focused Today", value: `${todayFocusMinutes}m`, icon: Calendar },
            { label: "Focused Week", value: `${weekFocusMinutes}m`, icon: Calendar },
            { label: "Laps Completed", value: totalSessionsCompleted, icon: Award },
            { label: "Current Streak", value: `${streak}d`, icon: Flame },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center text-center p-1">
                <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.18em] text-white/40">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{stat.label}</span>
                  <span className="sm:hidden">{stat.label.split(" ")[0]}</span>
                </div>
                <p className="mt-2 font-[family:var(--font-display)] text-lg sm:text-2xl text-white font-semibold">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </footer>

      </div>

      {/* Settings Drawer Popup */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 z-40 bg-black"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-[family:var(--font-display)] text-lg tracking-wider">CONFIGURATION</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-orange-200 mt-1">Tuning parameters</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleActionClick(() => setSettingsOpen(false))}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Duration Config Sliders */}
                <div className="mt-6 space-y-5">
                  {[
                    { key: "focusMinutes", label: "Focus Sprint (Min)", min: 5, max: 120 },
                    { key: "shortBreakMinutes", label: "Short Pit Stop (Min)", min: 1, max: 30 },
                    { key: "longBreakMinutes", label: "Long Break Cooldown (Min)", min: 5, max: 60 },
                  ].map((field) => {
                    const settingsKey = field.key as keyof typeof settings;
                    return (
                      <div key={field.key} className="rounded-[20px] border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <label htmlFor={`field-${field.key}`} className="text-white/70">{field.label}</label>
                          <span className="font-semibold text-orange-300">{settings[settingsKey]}m</span>
                        </div>
                        <input
                          id={`field-${field.key}`}
                          type="range"
                          min={field.min}
                          max={field.max}
                          value={settings[settingsKey] as number}
                          onChange={(e) => updateSettings({ [field.key]: Number(e.target.value) })}
                          className="mt-3 w-full accent-orange-400"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center text-[10px] text-white/20 tracking-wider">
                VELOCITYOS V2.0.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkered Flag celebration overlay popup */}
      {completionModalOpen && completionReward && (
        <CompletionOverlay reward={completionReward} onClose={closeCompletionModal} />
      )}

      {/* Draggable HUD Racing Widget Overlay */}
      {hudActive && (
        <motion.div
          drag
          dragMomentum={false}
          className="fixed z-50 rounded-[28px] border border-orange-500/20 bg-slate-950/90 p-5 shadow-[0_0_35px_rgba(255,99,71,0.25)] cursor-grab active:cursor-grabbing w-[260px] text-white backdrop-blur-md"
          initial={{ right: 24, bottom: 24 }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">TELEMETRY HUD</p>
              <p className="text-xs text-white/80 font-bold">
                {timerMode === "focus" ? "RUN SPRINT" : "PIT STOP"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleActionClick(() => setHudActive(false))}
              className="text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-end justify-between">
            <span className="font-[family:var(--font-display)] text-3xl font-bold tracking-wider text-orange-400">
              {formatTimer(timerSecondsLeft)}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleActionClick(timerRunning ? pauseTimer : startTimer)}
                className="rounded-full bg-white p-2 text-slate-950"
              >
                {timerRunning ? <Pause className="h-3 w-3 fill-slate-950" /> : <Play className="h-3 w-3 fill-slate-950" />}
              </button>
              <button
                type="button"
                onClick={() => handleActionClick(resetTimer)}
                className="rounded-full border border-white/10 p-2 hover:bg-white/5"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Graphical RPM Bar in HUD */}
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
