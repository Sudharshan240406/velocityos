"use client";

import React, { useRef } from "react";
import { useFocusStore } from "../store/focusStore";
import { Play, Pause, GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function FloatingWidget() {
  const { timeLeft, status, mode, startTimer, pauseTimer } = useFocusStore();
  const constraintsRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => {
    if (status === "running") {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        initial={{ x: "calc(100vw - 200px)", y: "calc(100vh - 120px)" }}
        className="pointer-events-auto absolute flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] select-none hover:border-purple-500/30 transition-colors cursor-grab active:cursor-grabbing"
      >
        {/* Drag Handle */}
        <div className="text-gray-500 hover:text-gray-300 transition">
          <GripHorizontal className="w-4.5 h-4.5" />
        </div>

        {/* Mode indicator dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${
            mode === "focus" ? "text-purple-400 bg-purple-400" : "text-cyan-400 bg-cyan-400"
          }`}
        />

        {/* Time display */}
        <span className="text-sm font-bold font-mono tracking-wider text-white">
          {formatTime(timeLeft)}
        </span>

        {/* Quick controls */}
        <button
          onClick={handleToggle}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
        >
          {status === "running" ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
