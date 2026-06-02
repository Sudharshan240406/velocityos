"use client";

import React from "react";
import { useFocusStore } from "../store/focusStore";
import { WallpaperType } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface WallpaperOption {
  id: WallpaperType;
  label: string;
  emoji: string;
  gradient: string;
  description: string;
}

const WALLPAPERS: WallpaperOption[] = [
  {
    id: "aurora",
    label: "Aurora Mountains",
    emoji: "🏔️",
    gradient: "from-purple-900/80 via-indigo-900/80 to-blue-900/80",
    description: "Northern lights over mountain peaks",
  },
  {
    id: "cybercity",
    label: "Cyberpunk City",
    emoji: "🌆",
    gradient: "from-fuchsia-900/80 via-violet-900/80 to-indigo-900/80",
    description: "Neon-lit metropolis in the rain",
  },
  {
    id: "f1garage",
    label: "Formula 1 Garage",
    emoji: "🏎️",
    gradient: "from-orange-900/80 via-red-900/80 to-gray-900/80",
    description: "Dark garage with fiery accents",
  },
  {
    id: "neontokyo",
    label: "Neon Tokyo",
    emoji: "🗼",
    gradient: "from-pink-900/80 via-purple-900/80 to-cyan-900/80",
    description: "Tokyo streets lit by neon signs",
  },
  {
    id: "spacenebula",
    label: "Deep Space Nebula",
    emoji: "🌌",
    gradient: "from-slate-900/80 via-blue-950/80 to-violet-950/80",
    description: "Drifting through the cosmos",
  },
];

interface WallpaperSelectorProps {
  onClose: () => void;
}

export default function WallpaperSelector({ onClose }: WallpaperSelectorProps) {
  const { wallpaper, setWallpaper } = useFocusStore();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* Panel */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-full max-w-xl bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Live Wallpaper</h2>
              <p className="text-xs text-gray-400 mt-0.5">Choose your focus environment</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WALLPAPERS.map((wp) => {
              const isActive = wallpaper === wp.id;
              return (
                <motion.button
                  key={wp.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setWallpaper(wp.id);
                    onClose();
                  }}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? "border-purple-500/60 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                      : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  {/* Preview gradient swatch */}
                  <div className={`w-14 h-12 rounded-lg bg-gradient-to-br ${wp.gradient} flex items-center justify-center text-2xl flex-shrink-0 border border-white/10`}>
                    {wp.emoji}
                  </div>

                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white block">{wp.label}</span>
                    <span className="text-xs text-gray-400 block mt-0.5 truncate">{wp.description}</span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="wallpaper-active"
                      className="absolute right-3 top-3 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
