"use client";

import React, { useEffect } from "react";
import { useThemeStore, THEMES, ThemeId } from "../store/themeStore";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ThemeSelector() {
  const { theme: currentThemeId, setTheme } = useThemeStore();

  // Inject variables on mount
  useEffect(() => {
    setTheme(currentThemeId);
  }, [currentThemeId, setTheme]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/8">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        Ecosystem Themes
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(THEMES) as ThemeId[]).map((themeId) => {
          const t = THEMES[themeId];
          const isSelected = currentThemeId === themeId;

          return (
            <button
              key={themeId}
              onClick={() => setTheme(themeId)}
              className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? "bg-white/10 border-white/20 shadow-lg"
                  : "bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10"
              }`}
            >
              {/* Colored dots indicators */}
              <div className="flex gap-1.5 mb-2.5">
                <div
                  className="w-3 h-3 rounded-full border border-white/10"
                  style={{ backgroundColor: t.primary }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-white/10"
                  style={{ backgroundColor: t.secondary }}
                />
                <div
                  className="w-3 h-3 rounded-full border border-white/10"
                  style={{ backgroundColor: t.accent }}
                />
              </div>

              <span className="text-xs font-bold text-white block">
                {t.name}
              </span>

              {isSelected && (
                <div className="absolute right-2 bottom-2 p-0.5 rounded-full bg-white/10 text-white border border-white/10">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
