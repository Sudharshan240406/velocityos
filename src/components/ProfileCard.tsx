"use client";

import React, { useEffect, useState } from "react";
import { useXP } from "../hooks/useXP";
import { useStreak } from "../hooks/useStreak";
import { useXPStore } from "../store/xpStore";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Flame } from "lucide-react";

export default function ProfileCard() {
  const { level, progressPercent, xpInCurrentLevel, xpNeededForNextLevel } = useXP();
  const { currentStreak, bestStreak } = useStreak();
  const totalFocusTime = useXPStore((state) => state.totalFocusTime);
  const [xpFloater, setXpFloater] = useState<{ id: number; amount: number; isDaily: boolean }[]>([]);
  const [levelUpMessage, setLevelUpMessage] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleXPGained = (e: Event) => {
      const { xp, isDailyGoal } = (e as CustomEvent).detail;
      setXpFloater((prev) => [...prev, { id: Date.now(), amount: xp, isDaily: isDailyGoal }]);
    };

    const handleLevelUp = (e: Event) => {
      const { level: newLevel } = (e as CustomEvent).detail;
      setLevelUpMessage(newLevel);
      setTimeout(() => setLevelUpMessage(null), 4000);
    };

    window.addEventListener("focusos:xp_gained", handleXPGained);
    window.addEventListener("focusos:level_up", handleLevelUp);

    return () => {
      window.removeEventListener("focusos:xp_gained", handleXPGained);
      window.removeEventListener("focusos:level_up", handleLevelUp);
    };
  }, []);

  const totalFocusHours = (totalFocusTime / 60).toFixed(1);

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/8 relative overflow-hidden group hover:border-white/15 transition-all duration-300">
      {/* Background neon visual noise */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
      
      {/* Floating XP Floater animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {xpFloater.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1.1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              onAnimationComplete={() => {
                setXpFloater((prev) => prev.filter((f) => f.id !== item.id));
              }}
              className="absolute right-4 bottom-8 flex flex-col items-end z-30"
            >
              <span className="text-sm font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                +{item.amount} XP
              </span>
              {item.isDaily && (
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-pink-400 bg-pink-950/40 border border-pink-500/20 px-1 py-0.5 rounded mt-0.5">
                  Daily Goal!
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Level Up Flash overlay */}
        <AnimatePresence>
          {levelUpMessage !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm flex flex-col items-center justify-center border border-purple-500/40 z-40 rounded-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
                className="text-2xl"
              >
                👑
              </motion.div>
              <h3 className="text-xs font-black uppercase text-purple-300 tracking-widest mt-1">Level Up!</h3>
              <p className="text-lg font-black text-white">LEVEL {levelUpMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-0.5 shadow-lg shadow-purple-500/20 border border-white/10 flex items-center justify-center text-lg font-bold">
          {level}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-white tracking-tight">Pilot Level {level}</span>
            <span className="text-[10px] text-gray-400 font-medium">
              {xpInCurrentLevel} / {xpNeededForNextLevel} XP
            </span>
          </div>
          {/* XP Progress Bar */}
          <div className="w-full bg-white/5 h-2 rounded-full mt-1.5 border border-white/5 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Streak & Focus metrics grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 border-t border-white/5 pt-3">
        <div className="flex flex-col items-center p-1.5 rounded-lg bg-white/2 hover:bg-white/5 transition-colors border border-white/3">
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
            <span className="text-xs font-black text-white">{currentStreak}</span>
          </div>
          <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1">Streak</span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-white/2 hover:bg-white/5 transition-colors border border-white/3">
          <div className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20" />
            <span className="text-xs font-black text-white">{bestStreak}</span>
          </div>
          <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1">Best</span>
        </div>

        <div className="flex flex-col items-center p-1.5 rounded-lg bg-white/2 hover:bg-white/5 transition-colors border border-white/3">
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
            <span className="text-xs font-black text-white">{totalFocusHours}h</span>
          </div>
          <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1">Hours</span>
        </div>
      </div>
    </div>
  );
}
