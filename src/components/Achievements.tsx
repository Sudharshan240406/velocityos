"use client";

import React from "react";
import { useXPStore } from "../store/xpStore";
import { motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

export default function Achievements() {
  const { achievements, sessionsCompleted, currentStreak, totalFocusTime } = useXPStore();
  const totalFocusHours = totalFocusTime / 60;

  const getAchievementProgress = (id: string) => {
    switch (id) {
      case "first_focus":
        return { current: Math.min(1, sessionsCompleted), target: 1 };
      case "sessions_10":
        return { current: Math.min(10, sessionsCompleted), target: 10 };
      case "sessions_50":
        return { current: Math.min(50, sessionsCompleted), target: 50 };
      case "sessions_100":
        return { current: Math.min(100, sessionsCompleted), target: 100 };
      case "streak_5":
        return { current: Math.min(5, currentStreak), target: 5 };
      case "streak_10":
        return { current: Math.min(10, currentStreak), target: 10 };
      case "hours_50":
        return { current: Math.min(50, Math.floor(totalFocusHours)), target: 50 };
      case "hours_100":
        return { current: Math.min(100, Math.floor(totalFocusHours)), target: 100 };
      default:
        return { current: 0, target: 1 };
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/8">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Achievements</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {achievements.map((ach) => {
          const { current, target } = getAchievementProgress(ach.id);
          const percent = Math.min(100, Math.round((current / target) * 100));
          
          return (
            <motion.div
              key={ach.id}
              whileHover={{ y: -2 }}
              className={`p-3 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                ach.unlocked
                  ? "bg-purple-950/15 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "bg-white/2 border-white/5 opacity-60"
              }`}
            >
              {/* Unlocked background neon radial gradient */}
              {ach.unlocked && (
                <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-purple-500/10 rounded-full blur-xl" />
              )}
              
              <div className="flex gap-2 items-start">
                <div className="text-2xl p-1.5 bg-white/5 rounded-lg border border-white/5 shrink-0">
                  {ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] font-black text-white truncate">{ach.title}</h4>
                    {ach.unlocked ? (
                      <Unlock className="w-3 h-3 text-purple-400 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-gray-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 font-medium leading-tight mt-0.5">{ach.description}</p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-3">
                <div className="flex justify-between text-[8px] font-bold text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{current} / {target} ({percent}%)</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"
                        : "bg-gray-700"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
