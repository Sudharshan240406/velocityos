"use client";

import React, { useEffect, useRef } from "react";
import { useGamificationStore } from "../store/gamificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Trophy } from "lucide-react";

export default function AchievementPanel() {
  const { achievements, lastUnlocked, clearLastUnlocked } = useGamificationStore();
  const prevUnlockedRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastUnlocked && lastUnlocked !== prevUnlockedRef.current) {
      prevUnlockedRef.current = lastUnlocked;
      const timer = setTimeout(() => {
        clearLastUnlocked();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastUnlocked, clearLastUnlocked]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Achievements
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/8">
          {unlockedCount} / {achievements.length}
        </span>
      </div>

      {/* Achievement Unlock Notification */}
      <AnimatePresence>
        {lastUnlocked && (() => {
          const ach = achievements.find((a) => a.id === lastUnlocked);
          return ach ? (
            <motion.div
              key={lastUnlocked}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 flex items-center gap-3"
            >
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <span className="text-xs font-bold text-yellow-400 block">Achievement Unlocked!</span>
                <span className="text-xs text-white">{ach.title}</span>
              </div>
              <motion.div
                className="ml-auto text-yellow-400"
                animate={{ rotate: [0, 20, -20, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                ✨
              </motion.div>
            </motion.div>
          ) : null;
        })()}
      </AnimatePresence>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-2.5 overflow-y-auto flex-1">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative p-3 rounded-xl border transition-all duration-300 ${
              achievement.unlocked
                ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                : "border-white/5 bg-white/2"
            }`}
          >
            {/* Unlock shimmer animation */}
            {achievement.unlocked && achievement.id === lastUnlocked && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-yellow-400/20"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
              />
            )}

            <div className="flex flex-col items-start gap-2">
              <div className={`text-2xl ${achievement.unlocked ? "" : "grayscale opacity-30"}`}>
                {achievement.icon}
              </div>

              <div>
                <span className={`text-xs font-semibold block leading-tight ${achievement.unlocked ? "text-white" : "text-gray-600"}`}>
                  {achievement.title}
                </span>
                <span className={`text-[9px] leading-tight mt-0.5 block ${achievement.unlocked ? "text-gray-400" : "text-gray-700"}`}>
                  {achievement.description}
                </span>
              </div>

              {!achievement.unlocked && (
                <Lock className="w-3 h-3 text-gray-700 absolute top-2.5 right-2.5" />
              )}

              {achievement.unlocked && achievement.unlockedAt && (
                <span className="text-[8px] text-yellow-600/70 mt-auto">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
