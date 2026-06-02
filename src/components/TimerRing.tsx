"use client";

import React from "react";
import { useFocusStore } from "../store/focusStore";
import { Play, Pause, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function TimerRing() {
  const { timeLeft, status, mode, currentPreset, presets, startTimer, pauseTimer, resetTimer } = useFocusStore();

  const activePreset = presets[currentPreset];
  const maxTime = mode === "focus" ? activePreset.focusDuration : activePreset.breakDuration;
  
  // Progress ratio (0 to 1)
  const progress = maxTime > 0 ? timeLeft / maxTime : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const radius = 140;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg aspect-square">
      {/* Massive Glowing Timer Ring */}
      <div className="relative w-full max-w-[340px] xs:max-w-[380px] md:max-w-[420px] aspect-square flex items-center justify-center rounded-full bg-slate-950/20 backdrop-blur-sm shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] border border-white/5">
        
        {/* Glow Filters & SVG Rings */}
        <svg className="absolute w-full h-full -rotate-90 p-4" viewBox="0 0 320 320">
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan */}
              <stop offset="50%" stopColor="#ec4899" /> {/* Pink */}
              <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
            </linearGradient>
            
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glowing Shadow Ring */}
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            stroke="url(#neonGradient)"
            strokeWidth={strokeWidth + 6}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ ease: "linear", duration: 0.2 }}
            className="opacity-40"
            filter="url(#neonGlow)"
          />

          {/* Primary Front Action Ring */}
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            stroke="url(#neonGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ ease: "linear", duration: 0.2 }}
          />
        </svg>

        {/* Center Timer Text & Info */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
            {mode === "focus" ? "Focusing" : "Break Time"}
          </span>

          <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-white select-text">
            {formatTime(timeLeft)}
          </span>

          <span className="text-[9px] font-semibold text-purple-400/80 uppercase tracking-widest mt-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            {currentPreset}
          </span>
        </div>
      </div>

      {/* Controller Buttons Below Ring */}
      <div className="flex items-center gap-6 mt-8">
        {/* Reset Button */}
        <button
          onClick={resetTimer}
          aria-label="Reset Timer"
          className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-300 active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Start / Pause Main Button */}
        {status === "running" ? (
          <button
            onClick={pauseTimer}
            className="flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-black font-bold tracking-wide hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          >
            <Pause className="w-5 h-5 fill-current mr-2" /> Pause
          </button>
        ) : (
          <button
            onClick={startTimer}
            className="flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold tracking-wide hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)]"
          >
            <Play className="w-5 h-5 fill-current mr-2 ml-0.5" /> Start
          </button>
        )}
      </div>
    </div>
  );
}
