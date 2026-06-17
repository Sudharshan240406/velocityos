"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TimerRing from "../components/TimerRing";
import MusicPanel from "../components/MusicPanel";
import DailyStats from "../components/DailyStats";
import FloatingWidget from "../components/FloatingWidget";
import BackgroundScene from "../components/BackgroundScene";
import WallpaperSelector from "../components/WallpaperSelector";
import SettingsPanel from "../components/SettingsPanel";
import MobileBottomNav, { NavTab } from "../components/MobileBottomNav";
import { usePomodoro } from "../hooks/usePomodoro";
import { AnimatePresence, motion } from "framer-motion";
import PWAManager from "../components/PWAManager";
import dynamic from "next/dynamic";
import { recordEvent } from "../lib/memoryEngine";

// Dynamically imported widgets & panels
const SpotifyPanel = dynamic(() => import("../components/SpotifyPanel"), { ssr: false });
const StatsPanel = dynamic(() => import("../components/StatsPanel"), { ssr: false });
const WidgetContainer = dynamic(() => import("../components/widgets/WidgetContainer"), { ssr: false });
const ThemeSelector = dynamic(() => import("../components/ThemeSelector"), { ssr: false });
const InsightCard = dynamic(() => import("../components/insights/InsightCard"), { ssr: false });
const SessionHistory = dynamic(() => import("../components/history/SessionHistory"), { ssr: false });
const Achievements = dynamic(() => import("../components/Achievements"), { ssr: false });
const CopilotPanel = dynamic(() => import("../components/CopilotPanel"), { ssr: false });

// New Phase 6-10 components
const AutoPanel = dynamic(() => import("../components/AutoPanel"), { ssr: false });
const JarvisPanel = dynamic(() => import("../components/JarvisPanel"), { ssr: false });
const MemoryPanel = dynamic(() => import("../components/MemoryPanel"), { ssr: false });
const ProfileSync = dynamic(() => import("../components/ProfileSync"), { ssr: false });

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

type DesktopTab = "cockpit" | "ai-center" | "automotive" | "cloud-sync";

export default function Home() {
  usePomodoro();

  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [mobileTab, setMobileTab] = useState<NavTab>("timer");
  const [showSpotify, setShowSpotify] = useState(false);

  // Desktop Workspace Switcher state
  const [desktopTab, setDesktopTab] = useState<DesktopTab>("cockpit");

  // Track memory events from store interactions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSessionComplete = (e: any) => {
      const preset = e.detail?.presetName || "Sprint";
      const mins = preset === "Sprint" ? 25 : preset === "Deep Sprint" ? 50 : 90;
      recordEvent("session_complete", { preset, durationMinutes: mins });
    };

    const handleBreakComplete = () => {
      recordEvent("break_taken", { timestamp: Date.now() });
    };

    window.addEventListener("focusos:session_complete", handleSessionComplete);
    window.addEventListener("focusos:break_complete", handleBreakComplete);

    // Initial load tracking
    recordEvent("mode_switch", { mode: "cockpit_load" });

    return () => {
      window.removeEventListener("focusos:session_complete", handleSessionComplete);
      window.removeEventListener("focusos:break_complete", handleBreakComplete);
    };
  }, []);

  // Handle routing commands from JARVIS Core router callbacks
  const handleJarvisNavigation = (panel: string) => {
    if (panel === "stats" || panel === "copilot") {
      setDesktopTab("cockpit");
    } else if (panel === "auto") {
      setDesktopTab("automotive");
    } else if (panel === "sync-export" || panel === "sync-import") {
      setDesktopTab("cloud-sync");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col p-3 md:p-5 lg:p-6 z-10 bg-[#050308] mobile-nav-safe">
      {/* Animated background */}
      <BackgroundScene />

      {/* ── DESKTOP SYSTEM WORKSPACE BAR (lg+) ── */}
      <header className="hidden lg:flex max-w-[1440px] mx-auto w-full mb-5 items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
            <span className="text-white font-black text-sm">V</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest leading-none">VelocityOS</h1>
            <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider">Productivity Cockpit</span>
          </div>
        </div>

        {/* Workspace DOCK tabs */}
        <div className="flex bg-white/3 border border-white/5 rounded-xl p-1 gap-1">
          {[
            { id: "cockpit", label: "Focus HUD" },
            { id: "ai-center", label: "AI & Jarvis" },
            { id: "automotive", label: "Telemetry OS" },
            { id: "cloud-sync", label: "Profile Cloud" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setDesktopTab(tab.id as DesktopTab);
                recordEvent("mode_switch", { mode: tab.id });
              }}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                desktopTab === tab.id
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-mono text-gray-500">
          SYS STATUS: <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </header>

      {/* ── DESKTOP LAYOUT (lg+) ── */}
      <div className="hidden lg:flex flex-1 gap-5 max-w-[1440px] mx-auto w-full items-stretch mb-5">
        {/* Left column */}
        <div className="w-[260px] shrink-0">
          <Sidebar
            onOpenWallpaper={() => setShowWallpaper(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenAchievements={() => setShowAchievements(true)}
          />
        </div>

        {/* Dynamic Center Workspaces */}
        <div className="flex-1 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            {desktopTab === "cockpit" && (
              <motion.div
                key="cockpit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col gap-5"
              >
                <div className="flex-1 flex items-center justify-center">
                  <TimerRing />
                </div>
                <WidgetContainer />
                {/* Mounted DailyStats Row */}
                <DailyStats />
              </motion.div>
            )}

            {desktopTab === "ai-center" && (
              <motion.div
                key="ai-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col gap-5"
              >
                <JarvisPanel
                  onNavigate={handleJarvisNavigation}
                  onOpenWallpaper={() => setShowWallpaper(true)}
                  onOpenSettings={() => setShowSettings(true)}
                />
                <CopilotPanel />
                <MemoryPanel />
              </motion.div>
            )}

            {desktopTab === "automotive" && (
              <motion.div
                key="automotive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col gap-5"
              >
                <AutoPanel />
              </motion.div>
            )}

            {desktopTab === "cloud-sync" && (
              <motion.div
                key="cloud-sync"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 flex flex-col gap-5"
              >
                <ProfileSync />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column — toggle between Music and Spotify */}
        <div className="w-[260px] shrink-0 flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowSpotify(false)}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition border ${
                !showSpotify ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-gray-500 hover:text-gray-300"
              }`}
            >
              Ambient
            </button>
            <button
              onClick={() => setShowSpotify(true)}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition border ${
                showSpotify ? "bg-[#1DB954]/20 border-[#1DB954]/40 text-[#1DB954]" : "border-white/5 text-gray-500 hover:text-gray-300"
              }`}
            >
              Spotify
            </button>
          </div>
          <div className="flex-1">
            {showSpotify ? <SpotifyPanel /> : <MusicPanel />}
          </div>
        </div>
      </div>

      {/* ── DESKTOP Achievements Panel (conditional) ── */}
      {showAchievements && (
        <div className="hidden lg:block max-w-[1440px] mx-auto w-full mb-5">
          <Achievements />
        </div>
      )}

      {/* ── DESKTOP Footer metrics (if on cockpit tab) ── */}
      {desktopTab === "cockpit" && (
        <footer className="hidden lg:flex flex-col gap-5 max-w-[1440px] mx-auto w-full mt-auto mb-5">
          <StatsPanel />
          <ThemeSelector />
          <InsightCard />
          <SessionHistory />
        </footer>
      )}

      {/* ── TABLET LAYOUT (md, not lg) ── */}
      <div className="hidden md:flex lg:hidden flex-1 flex-col gap-4 max-w-3xl mx-auto w-full mb-4">
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="col-span-2 flex items-center justify-center">
            <TimerRing />
          </div>
          <Sidebar
            onOpenWallpaper={() => setShowWallpaper(true)}
            onOpenSettings={() => setShowSettings(true)}
            onOpenAchievements={() => setShowAchievements(true)}
          />
          <MusicPanel />
        </div>
        <StatsPanel />
      </div>

      {/* ── MOBILE LAYOUT (<md) ── */}
      <div className="flex flex-col md:hidden flex-1 max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          {mobileTab === "timer" && (
            <motion.div key="timer" {...panelVariants} className="flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-center flex-1">
                <TimerRing />
              </div>
              <Sidebar
                onOpenWallpaper={() => setShowWallpaper(true)}
                onOpenSettings={() => setShowSettings(true)}
                onOpenAchievements={() => { setMobileTab("achievements"); }}
              />
            </motion.div>
          )}

          {mobileTab === "music" && (
            <motion.div key="music" {...panelVariants} className="flex flex-col gap-3 flex-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSpotify(false)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition ${
                    !showSpotify ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-gray-500"
                  }`}
                >
                  Ambient
                </button>
                <button
                  onClick={() => setShowSpotify(true)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition ${
                    showSpotify ? "bg-[#1DB954]/20 border-[#1DB954]/40 text-[#1DB954]" : "border-white/5 text-gray-500"
                  }`}
                >
                  Spotify
                </button>
              </div>
              <div className="flex-1">
                {showSpotify ? <SpotifyPanel /> : <MusicPanel />}
              </div>
            </motion.div>
          )}

          {mobileTab === "stats" && (
            <motion.div key="stats" {...panelVariants} className="flex-1">
              <StatsPanel />
            </motion.div>
          )}

          {mobileTab === "achievements" && (
            <motion.div key="achievements" {...panelVariants} className="flex-1">
              <Achievements />
            </motion.div>
          )}

          {mobileTab === "settings" && (
            <motion.div key="settings-inline" {...panelVariants} className="flex-1">
              {/* Inline settings for mobile */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <h2 className="text-base font-bold text-white">Settings</h2>
                <button
                  onClick={() => setShowWallpaper(true)}
                  className="w-full text-left p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition text-sm text-white flex items-center justify-between"
                >
                  Change Wallpaper <span className="text-gray-400 text-xs">→</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating widget always visible */}
      <FloatingWidget />
      <PWAManager />

      {/* Modals */}
      {showWallpaper && <WallpaperSelector onClose={() => setShowWallpaper(false)} />}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onOpenWallpaper={() => { setShowSettings(false); setTimeout(() => setShowWallpaper(true), 150); }}
        />
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
    </div>
  );
}
