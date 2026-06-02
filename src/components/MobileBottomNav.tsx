"use client";

import React from "react";
import { motion } from "framer-motion";
import { Timer, Music, BarChart2, Trophy, Settings } from "lucide-react";

type NavTab = "timer" | "music" | "stats" | "achievements" | "settings";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "timer", label: "Timer", icon: Timer },
  { id: "music", label: "Music", icon: Music },
  { id: "stats", label: "Stats", icon: BarChart2 },
  { id: "achievements", label: "Awards", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MobileBottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Glassmorphism bar */}
      <div className="mx-3 mb-3 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="flex items-center justify-around py-2 px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 flex-1"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-white/8"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-purple-400" : "text-gray-500"}`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider relative z-10 transition-colors ${isActive ? "text-purple-400" : "text-gray-600"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export type { NavTab };
