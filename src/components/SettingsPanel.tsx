"use client";

import React from "react";
import { useFocusStore } from "../store/focusStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImageIcon, Volume2, Bell, Timer } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

interface SettingsPanelProps {
  onClose: () => void;
  onOpenWallpaper: () => void;
}

export default function SettingsPanel({ onClose, onOpenWallpaper }: SettingsPanelProps) {
  const {
    volume, setVolume,
    notificationsEnabled, setNotificationsEnabled,
    autoStartBreaks, setAutoStartBreaks,
    autoStartFocus, setAutoStartFocus,
    wallpaper,
  } = useFocusStore();

  const { requestPermission } = useNotifications();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (granted) setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  };

  const wallpaperLabels: Record<string, string> = {
    aurora: "Aurora Mountains",
    cybercity: "Cyberpunk City",
    f1garage: "Formula 1 Garage",
    neontokyo: "Neon Tokyo",
    spacenebula: "Deep Space Nebula",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="relative z-10 w-full max-w-sm bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white tracking-wide">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">

            {/* Appearance */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appearance</span>
              </div>
              <button
                onClick={() => { onClose(); setTimeout(onOpenWallpaper, 150); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition"
              >
                <span className="text-sm text-white">Wallpaper</span>
                <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">
                  {wallpaperLabels[wallpaper] || wallpaper}
                </span>
              </button>
            </section>

            {/* Audio */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audio</span>
              </div>
              <div className="p-3 rounded-xl border border-white/8 bg-white/3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">Sound Volume</span>
                  <span className="text-xs text-gray-400 font-mono">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </section>

            {/* Notifications */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notifications</span>
              </div>
              <div className="p-3 rounded-xl border border-white/8 bg-white/3 flex items-center justify-between">
                <div>
                  <span className="text-sm text-white block">Browser Alerts</span>
                  <span className="text-[10px] text-gray-500">Session & break notifications</span>
                </div>
                <button
                  onClick={() => handleNotificationToggle(!notificationsEnabled)}
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${notificationsEnabled ? "bg-purple-500" : "bg-white/10"}`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"
                    animate={{ x: notificationsEnabled ? 18 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                </button>
              </div>
            </section>

            {/* Timer */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timer</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Auto-start Breaks", value: autoStartBreaks, set: setAutoStartBreaks, desc: "Auto begin break after focus" },
                  { label: "Auto-start Focus", value: autoStartFocus, set: setAutoStartFocus, desc: "Auto resume after break ends" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl border border-white/8 bg-white/3 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-white block">{item.label}</span>
                      <span className="text-[10px] text-gray-500">{item.desc}</span>
                    </div>
                    <button
                      onClick={() => item.set(!item.value)}
                      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${item.value ? "bg-emerald-500" : "bg-white/10"}`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow"
                        animate={{ x: item.value ? 18 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
