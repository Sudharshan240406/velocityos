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
} from "lucide-react";
import { useFocusStore } from "@/stores/focus-store";
import { BackgroundEffects } from "@/components/velocity/background-effects";
import { CompletionOverlay } from "@/components/velocity/sections/completion-overlay";
import type { BackgroundEffect } from "@/lib/types";

interface DeferredInstallPrompt {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
}

// Synthesis of futuristic cockpit sound effects using HTML5 Web Audio API
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
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "startup") {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(35, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.7);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } else if (type === "complete") {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.7);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.7);
      });
    }
  } catch (err) {
    console.error("Synthesizer failed:", err);
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

  // Speedometer metrics
  const progress = timerTotalSeconds === 0 ? 0 : 1 - timerSecondsLeft / timerTotalSeconds;
  const speed = Math.round(28 + progress * 72);
  const rpm = Math.round(1200 + progress * 6300);
  const turbo = Math.round(25 + progress * 75);
  const nitro = Math.max(10, Math.round(70 - progress * 35));
  const needleAngle = -120 + progress * 240;

  const handleActionClick = (action: () => void) => {
    playSynthSound("click", settings.soundEnabled);
    action();
  };

  return (
    <div className="relative min-h-screen text-white select-none overflow-x-hidden font-[family:var(--font-body)]">
      {/* Dynamic cockpit lighting */}
      <BackgroundEffects effect={settings.backgroundEffect} />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col justify-between min-h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="font-[family:var(--font-display)] text-2xl tracking-[0.24em] text-white">VELOCITYOS</h1>
            <p className="text-xs uppercase tracking-[0.26em] text-orange-200 mt-1">AUTOMOTIVE FOCUS ENGINE</p>
          </div>
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button
                type="button"
                onClick={triggerInstall}
                className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs uppercase tracking-[0.15em] text-orange-100 hover:bg-orange-400/20 transition"
              >
                <Download className="h-4 w-4" />
                Install App
              </button>
            )}
            <button
              type="button"
              onClick={() => handleActionClick(() => setHudActive((v) => !v))}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.15em] transition ${
                hudActive ? "border-cyan-400 bg-cyan-400/10 text-cyan-300" : "border-white/10 text-white hover:bg-white/5"
              }`}
            >
              HUD Mode
            </button>
            <button
              type="button"
              onClick={() => handleActionClick(() => setSettingsOpen(true))}
              className="rounded-full border border-white/10 p-2 text-white hover:bg-white/5 transition"
              aria-label="Open cockpit configuration"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Speedometer Screen */}
        <main className="my-auto py-10 flex flex-col items-center">
          
          {/* Large dashboard telemetry display */}
          <div className="relative w-full max-w-[460px] aspect-[4/3] flex items-center justify-center">
            
            {/* Porsche speedometer rings */}
            <svg viewBox="0 0 420 320" className="absolute inset-0 w-full h-full">
              {/* Speedometer track */}
              <path
                d="M 60 250 A 150 150 0 1 1 360 250"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M 60 250 A 150 150 0 1 1 360 250"
                fill="none"
                stroke="url(#speedo-grad)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray="470"
                strokeDashoffset={470 - 470 * progress}
                className="transition-all duration-300 ease-out"
              />

              {/* Ticks and scale marks */}
              <g stroke="rgba(255,255,255,0.15)" strokeWidth="2">
                <line x1="210" y1="20" x2="210" y2="30" />
                <line x1="60" y1="250" x2="70" y2="245" />
                <line x1="360" y1="250" x2="350" y2="245" />
              </g>

              {/* Telemetry Dial Needle */}
              <g transform={`translate(210, 200) rotate(${needleAngle})`} className="transition-all duration-300 ease-out">
                <line x1="0" y1="0" x2="0" y2="-130" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                <circle cx="0" cy="0" r="10" fill="#fff" />
              </g>

              <defs>
                <linearGradient id="speedo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="60%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
            </svg>

            {/* Speeds and Digital Countdown inside Dial */}
            <div className="absolute top-[38%] flex flex-col items-center text-center">
              <span className="text-xs uppercase tracking-[0.3em] text-white/35">
                {timerMode === "focus" ? "Velocity Run" : timerMode === "shortBreak" ? "Pit Stop" : "Cooldown"}
              </span>
              <span className="font-[family:var(--font-display)] text-6xl md:text-7xl font-bold tracking-tight text-white mt-2">
                {formatTimer(timerSecondsLeft)}
              </span>
              <span className="text-xs text-white/40 tracking-[0.15em] mt-3">
                Laps Completed: {Math.min(sessionsCompletedInCycle, 4)} / 4
              </span>
            </div>
          </div>

          {/* Telemetry Gauges Deck */}
          <div className="grid grid-cols-4 gap-3 w-full max-w-lg mt-6 px-2">
            {[
              { label: "Speed", value: `${speed} MPH` },
              { label: "RPM", value: rpm },
              { label: "Turbo", value: `${turbo}%` },
              { label: "Nitro", value: `${nitro}%` },
            ].map((metric) => (
              <div key={metric.label} className="rounded-[20px] border border-white/10 bg-slate-950/40 p-3 text-center backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{metric.label}</p>
                <p className="mt-1 font-[family:var(--font-display)] text-sm sm:text-lg text-white">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Timer Modes Preset Toggles */}
          <div className="flex gap-2.5 mt-8 w-full justify-center px-4">
            {[
              { label: "25m / 5m", focus: 25, short: 5, long: 15 },
              { label: "50m / 10m", focus: 50, short: 10, long: 20 },
              { label: "90m / 20m", focus: 90, short: 20, long: 30 },
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
                  className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wider transition ${
                    active ? "bg-white text-slate-950 shadow-md" : "border border-white/10 text-white/80 hover:bg-white/5"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Ignition Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => handleActionClick(timerRunning ? pauseTimer : startTimer)}
              className="flex items-center gap-3 rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400 px-8 py-4 font-semibold text-slate-950 shadow-[0_0_35px_rgba(255,99,71,0.25)] hover:scale-[1.03] transition"
            >
              {timerRunning ? <Pause className="h-5 w-5 fill-slate-950" /> : <Play className="h-5 w-5 fill-slate-950" />}
              {timerRunning ? "Pause" : "Ignite"}
            </button>
            <button
              type="button"
              onClick={() => handleActionClick(resetTimer)}
              className="rounded-full border border-white/10 p-4 text-white/85 hover:bg-white/5 transition"
              aria-label="Reset telemetry countdown"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleActionClick(skipSession)}
              className="rounded-full border border-white/10 p-4 text-white/85 hover:bg-white/5 transition"
              aria-label="Skip break to next run"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        </main>

        {/* Focus Stats Deck */}
        <section className="grid grid-cols-4 gap-2 border-t border-white/10 pt-6 pb-4">
          {[
            { label: "Focused Today", value: `${todayFocusMinutes}m`, icon: Calendar },
            { label: "Focused Week", value: `${weekFocusMinutes}m`, icon: Calendar },
            { label: "Runs Completed", value: totalSessionsCompleted, icon: Award },
            { label: "Current Streak", value: `${streak}d`, icon: Flame },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center text-center p-1">
                <div className="flex items-center justify-center gap-1 text-[9px] sm:text-[11px] uppercase tracking-[0.16em] text-white/40">
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
        </section>

      </div>

      {/* Settings Drawer */}
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

                {/* Ambient Environment Switch */}
                <div className="mt-6">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-white/40">Atmosphere</h4>
                  <div className="grid grid-cols-2 gap-2 mt-3">
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
                        className={`rounded-xl border px-3 py-2.5 text-xs text-center transition ${
                          settings.backgroundEffect === env.id
                            ? "border-orange-400 bg-orange-400/10 text-white"
                            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {env.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound Settings */}
                <div className="mt-6">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-white/40">Telemetry Sounds</h4>
                  <button
                    type="button"
                    onClick={() =>
                      handleActionClick(() => updateSettings({ soundEnabled: !settings.soundEnabled }))
                    }
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border py-3 text-xs uppercase tracking-wider transition ${
                      settings.soundEnabled
                        ? "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-white/70"
                    }`}
                  >
                    {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    {settings.soundEnabled ? "Ambience Enabled" : "Ambience Muted"}
                  </button>
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
