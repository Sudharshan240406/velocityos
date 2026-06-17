"use client";

import React, { useState } from "react";
import { useFocusStore } from "../../store/focusStore";
import WeatherWidget from "./WeatherWidget";
import XPWidget from "./XPWidget";
import AchievementWidget from "./AchievementWidget";
import MusicWidget from "./MusicWidget";
import StatsPanel from "../StatsPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Eye, EyeOff } from "lucide-react";

const WIDGET_MAP: Record<string, { label: string; component: React.ReactNode }> = {
  weather: { label: "Weather Widget", component: <WeatherWidget /> },
  xp: { label: "XP & Streaks Profile", component: <XPWidget /> },
  music: { label: "Music Synthesizer", component: <MusicWidget /> },
  achievements: { label: "Achievements Badges", component: <AchievementWidget /> },
  stats: { label: "Analytics Dashboard", component: <StatsPanel /> },
};

export default function WidgetContainer() {
  const { widgets, toggleWidget } = useFocusStore();
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Widget Control Toggle Header */}
      <div className="flex justify-between items-center bg-white/3 border border-white/5 rounded-xl px-4 py-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Modular Workspace Cockpit
        </span>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-300 hover:text-white transition"
        >
          <Sliders className="w-3 h-3" />
          Workspace Controls
        </button>
      </div>

      {/* Widget Configuration menu */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/2 border border-white/5 rounded-xl p-3 flex flex-wrap gap-2"
          >
            {Object.entries(WIDGET_MAP).map(([id, item]) => {
              const isEnabled = widgets.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleWidget(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all ${
                    isEnabled
                      ? "bg-purple-950/20 border-purple-500/30 text-purple-300"
                      : "bg-white/2 border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10"
                  }`}
                >
                  {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active Widgets Grid */}
      <div className="grid grid-cols-1 gap-4">
        {widgets.map((id) => {
          const item = WIDGET_MAP[id];
          if (!item) return null;

          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              {item.component}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
