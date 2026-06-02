"use client";

import React from "react";
import { useGamificationStore } from "../store/gamificationStore";
import { motion } from "framer-motion";
import { Zap, Flame, Star } from "lucide-react";

export default function XPCard() {
  const { xp, level, currentStreak, bestStreak } = useGamificationStore();

  const xpInLevel = xp % 100;
  const xpProgress = xpInLevel / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3"
    >
      {/* Level badge row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-500/30 to-orange-500/30 border border-yellow-500/30">
            <Star className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Level</span>
            <span className="text-base font-black text-white leading-none">{level}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-bold text-white">{currentStreak}</span>
          <span className="text-[10px] text-gray-400 uppercase">day streak</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1 text-yellow-400">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">XP</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">{xpInLevel} / 100</span>
        </div>

        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="text-center">
          <span className="text-[10px] text-gray-500 block uppercase tracking-widest">Total XP</span>
          <span className="text-xs font-bold text-yellow-400">{xp}</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] text-gray-500 block uppercase tracking-widest">Best Streak</span>
          <span className="text-xs font-bold text-orange-400">{bestStreak}d</span>
        </div>
      </div>
    </motion.div>
  );
}
