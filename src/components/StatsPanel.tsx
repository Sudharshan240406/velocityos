"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useFocusStore } from "../store/focusStore";
import { useGamificationStore } from "../store/gamificationStore";
import { Clock, CheckCircle2, Flame, TrendingUp, Star, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const FocusChart = dynamic(() => import("./FocusChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[180px] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  ),
});

type TabId = "overview" | "weekly" | "monthly";

export default function StatsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { streak, sessionsCompleted, dailyStats, totalFocusTime } = useFocusStore();
  const { xp, level } = useGamificationStore();

  const todayFocus =
    dailyStats.find((s) => s.date === new Date().toLocaleDateString("en-CA"))?.focusTime ?? 0;

  // Productivity score: sessions × (avg_focus_time / 25m baseline), capped at 100
  const avgFocusPerSession = sessionsCompleted > 0 ? totalFocusTime / sessionsCompleted : 0;
  const productivityScore = Math.min(100, Math.round((sessionsCompleted * (avgFocusPerSession / 25)) * 2));

  // Best focus day
  const bestDay = dailyStats.reduce(
    (best, day) => (day.focusTime > (best?.focusTime ?? 0) ? day : best),
    dailyStats[0] as typeof dailyStats[0] | undefined
  );

  // Weekly total
  const weeklyTotal = dailyStats
    .filter((s) => {
      const diff = (Date.now() - new Date(s.date + "T12:00:00").getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    })
    .reduce((sum, s) => sum + s.focusTime, 0);

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "weekly", label: "Weekly", icon: TrendingUp },
    { id: "monthly", label: "Monthly", icon: Star },
  ];

  const overviewStats = [
    { label: "Today's Focus", value: `${todayFocus}m`, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Sessions Done", value: sessionsCompleted.toString(), icon: CheckCircle2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Current Streak", value: `${streak}d`, icon: Flame, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Productivity", value: `${productivityScore}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Level", value: `${level}`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Total XP", value: `${xp}`, icon: BarChart2, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">

      {/* Tab Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="stat-tab-bg"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3 h-3 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {bestDay && (
          <div className="text-right hidden sm:block">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Best Day</span>
            <span className="text-xs font-bold text-white">{bestDay.date} · {bestDay.focusTime}m</span>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {overviewStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className={`p-1.5 rounded-lg w-fit ${stat.bg} ${stat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">{stat.label}</span>
                    <span className="text-lg font-black text-white tabular-nums">{stat.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "weekly" && (
          <div className="flex flex-col md:flex-row gap-4">
            {/* Weekly summary cards */}
            <div className="flex flex-col gap-3 md:w-[180px] md:shrink-0">
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Weekly Focus</span>
                <span className="text-2xl font-black text-purple-400">{weeklyTotal}m</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Daily Avg</span>
                <span className="text-2xl font-black text-cyan-400">{Math.round(weeklyTotal / 7)}m</span>
              </div>
              {/* Productivity score bar */}
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-2">Productivity</span>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${productivityScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">{productivityScore}%</span>
              </div>
            </div>

            {/* 7-day chart */}
            <div className="flex-1 border border-white/5 bg-white/[0.01] rounded-xl p-4 min-h-[180px]">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">
                Activity · Last 7 Days
              </span>
              <FocusChart mode="weekly" />
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-3 md:w-[180px] md:shrink-0">
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Total Focus</span>
                <span className="text-2xl font-black text-purple-400">{totalFocusTime}m</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">All Sessions</span>
                <span className="text-2xl font-black text-cyan-400">{sessionsCompleted}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest block">Focus Hours</span>
                <span className="text-2xl font-black text-pink-400">{(totalFocusTime / 60).toFixed(1)}h</span>
              </div>
            </div>
            <div className="flex-1 border border-white/5 bg-white/[0.01] rounded-xl p-4 min-h-[180px]">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">
                Monthly Summary · Last 30 Days
              </span>
              <FocusChart mode="monthly" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
