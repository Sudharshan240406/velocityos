"use client";

import React from "react";
import { useFocusStore } from "../store/focusStore";
import { PresetName } from "../types";
import { Zap, Brain, Flame, Image, Settings, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import XPCard from "./XPCard";

interface SidebarProps {
  onOpenWallpaper?: () => void;
  onOpenSettings?: () => void;
  onOpenAchievements?: () => void;
}

export default function Sidebar({ onOpenWallpaper, onOpenSettings, onOpenAchievements }: SidebarProps) {
  const { currentPreset, setPreset } = useFocusStore();

  const presetItems = [
    {
      name: "Sprint" as PresetName,
      description: "25m focus / 5m break",
      icon: Zap,
      color: "from-cyan-500/20 to-blue-500/20",
      glowColor: "rgba(6, 182, 212, 0.4)",
    },
    {
      name: "Deep Sprint" as PresetName,
      description: "50m focus / 10m break",
      icon: Brain,
      color: "from-purple-500/20 to-pink-500/20",
      glowColor: "rgba(168, 85, 247, 0.4)",
    },
    {
      name: "Redline Run" as PresetName,
      description: "90m focus / 20m break",
      icon: Flame,
      color: "from-orange-500/20 to-red-500/20",
      glowColor: "rgba(249, 115, 22, 0.4)",
    },
  ];

  const actionItems = [
    { label: "Wallpaper", icon: Image, onClick: onOpenWallpaper, color: "text-purple-400" },
    { label: "Achievements", icon: Trophy, onClick: onOpenAchievements, color: "text-yellow-400" },
    { label: "Settings", icon: Settings, onClick: onOpenSettings, color: "text-gray-400" },
  ];

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] gap-5">
      {/* Header / Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
          <span className="text-white font-black text-lg tracking-wider">F</span>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            FOCUSOS
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
            Productivity Suite
          </p>
        </div>
      </div>

      {/* XP Card */}
      <XPCard />

      {/* Preset Selector */}
      <div className="flex-1 flex flex-col gap-3">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Focus Presets
        </span>

        <div className="flex flex-col gap-2.5">
          {presetItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentPreset === item.name;

            return (
              <button
                key={item.name}
                onClick={() => setPreset(item.name)}
                className="relative w-full text-left focus:outline-none group"
              >
                {isSelected && (
                  <motion.div
                    layoutId="activePreset"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ boxShadow: `0 0 20px -5px ${item.glowColor}` }}
                  />
                )}

                <div
                  className={`relative z-10 flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 border ${
                    isSelected
                      ? "border-transparent text-white"
                      : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr ${item.color} border border-white/10`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-white/5">
        {actionItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              title={item.label}
              className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-white/5 transition"
            >
              <Icon className={`w-4 h-4 ${item.color}`} />
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
