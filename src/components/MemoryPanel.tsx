"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, RefreshCw, Trash2, Clock,
  TrendingUp, Database, Activity
} from "lucide-react";
import {
  generateInsights,
  getTodaySummary,
  getRecentEvents,
  clearMemory,
  MemoryInsight,
  MemoryEvent,
} from "../lib/memoryEngine";

export default function MemoryPanel() {
  const [insights, setInsights] = useState<MemoryInsight[]>([]);
  const [recentEvents, setRecentEvents] = useState<MemoryEvent[]>([]);
  const [summary, setSummary] = useState({
    sessionsToday: 0,
    focusMinutesToday: 0,
    commandsToday: 0,
    tasksAddedToday: 0,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = useCallback(() => {
    setInsights(generateInsights());
    setRecentEvents(getRecentEvents(15));
    setSummary(getTodaySummary());
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  const handleClear = () => {
    clearMemory();
    setShowClearConfirm(false);
    refresh();
  };

  const eventTypeLabel = (type: MemoryEvent["type"]) => {
    const map: Record<MemoryEvent["type"], string> = {
      session_complete: "✅ Session",
      mode_switch: "🎯 Mode",
      task_added: "📋 Task",
      achievement_unlock: "🏆 Achievement",
      command_issued: "⚡ Command",
      music_changed: "🎵 Music",
      break_taken: "☕ Break",
    };
    return map[type] || type;
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.9) return "text-emerald-400";
    if (c >= 0.7) return "text-yellow-400";
    return "text-gray-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1440px] mx-auto w-full mb-6">

      {/* ── TODAY'S SUMMARY ── */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Today's Memory</span>
          </div>
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Sessions", value: summary.sessionsToday, icon: "⏱", color: "text-cyan-400" },
            { label: "Focus Time", value: `${summary.focusMinutesToday}m`, icon: "🎯", color: "text-purple-400" },
            { label: "Commands", value: summary.commandsToday, icon: "⚡", color: "text-yellow-400" },
            { label: "Tasks Added", value: summary.tasksAddedToday, icon: "📋", color: "text-emerald-400" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">{icon} {label}</span>
              <span className={`text-xl font-black ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-gray-600 mt-auto">
          Last sync: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      {/* ── AI INSIGHTS ── */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AI Insights</span>
        </div>

        {insights.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
            <Sparkles className="w-6 h-6 text-gray-600" />
            <p className="text-[10px] text-gray-500">
              Complete at least 3 focus sessions to generate AI insights.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[220px]">
            <AnimatePresence>
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/3 border border-white/5 rounded-xl p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                      {insight.icon} {insight.label}
                    </span>
                    <span className={`text-[8px] font-bold ${confidenceColor(insight.confidence)}`}>
                      {Math.round(insight.confidence * 100)}% conf
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">{insight.value}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── EVENT TIMELINE ── */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Event Log</span>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition"
            title="Clear memory"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[10px] text-red-300"
            >
              <p className="mb-2 font-semibold">Clear all memory data?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg text-red-300 font-bold transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px]">
          {recentEvents.length === 0 ? (
            <p className="text-[9px] text-gray-600 text-center py-4">No events recorded yet.</p>
          ) : (
            recentEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center gap-2 bg-white/2 border border-white/5 rounded-lg px-2.5 py-1.5 text-[9px]"
              >
                <Clock className="w-2.5 h-2.5 text-gray-600 shrink-0" />
                <span className="text-gray-400 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-gray-300 flex-1 truncate">{eventTypeLabel(evt.type)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
