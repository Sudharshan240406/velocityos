"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TimerRing from "../components/TimerRing";
import MusicPanel from "../components/MusicPanel";
import SpotifyPanel from "../components/SpotifyPanel";
import StatsPanel from "../components/StatsPanel";
import AchievementPanel from "../components/AchievementPanel";
import FloatingWidget from "../components/FloatingWidget";
import BackgroundScene from "../components/BackgroundScene";
import WallpaperSelector from "../components/WallpaperSelector";
import SettingsPanel from "../components/SettingsPanel";
import MobileBottomNav, { NavTab } from "../components/MobileBottomNav";
import { usePomodoro } from "../hooks/usePomodoro";
import { AnimatePresence, motion } from "framer-motion";

// Panel switching for mobile
const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function Home() {
  usePomodoro();

  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [mobileTab, setMobileTab] = useState<NavTab>("timer");
  const [showSpotify, setShowSpotify] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col p-3 md:p-5 lg:p-6 z-10 bg-[#050308] mobile-nav-safe">
      {/* Animated background */}
      <BackgroundScene />

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

        {/* Center column */}
        <div className="flex-1 flex items-center justify-center">
          <TimerRing />
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
          <AchievementPanel />
        </div>
      )}

      {/* ── DESKTOP Stats ── */}
      <footer className="hidden lg:block max-w-[1440px] mx-auto w-full mt-auto">
        <StatsPanel />
      </footer>

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
              <AchievementPanel />
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
