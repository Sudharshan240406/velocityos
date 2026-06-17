"use client";

import React, { useMemo } from "react";
import { useFocusStore } from "../../store/focusStore";
import { useXPStore } from "../../store/xpStore";
import { generateInsights } from "./InsightEngine";
import { Lightbulb, TrendingUp, Info, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function InsightCard() {
  const { dailyStats } = useFocusStore();
  const { currentStreak } = useXPStore();

  const insightsList = useMemo(() => {
    return generateInsights(dailyStats, currentStreak);
  }, [dailyStats, currentStreak]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/8">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-purple-400" />
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Productivity Insights
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {insightsList.map((ins, index) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex gap-3 items-start"
          >
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 shrink-0 mt-0.5">
              {getIcon(ins.type)}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">{ins.title}</h4>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">
                {ins.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
