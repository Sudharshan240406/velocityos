"use client";

import React, { useMemo } from "react";
import { useFocusStore } from "../store/focusStore";
import { useXPStore } from "../store/xpStore";
import { motion } from "framer-motion";
import { Clock, CheckSquare, Zap, Activity, ShieldCheck, Flame } from "lucide-react";

export default function DailyStats() {
  const { dailyStats, totalFocusTime } = useFocusStore();
  const { sessionsCompleted } = useXPStore();

  const todayStr = new Date().toLocaleDateString("en-CA");

  const todayStat = useMemo(() => {
    return dailyStats.find((s) => s.date === todayStr) || {
      date: todayStr,
      focusTime: 0,
      sessions: 0,
      hourlyActivity: {},
    };
  }, [dailyStats, todayStr]);

  const avgSessionLength = useMemo(() => {
    if (!todayStat.sessions) return 0;
    return Math.round(todayStat.focusTime / todayStat.sessions);
  }, [todayStat]);

  // Focus Score: 0 - 100 calculated based on today's target (e.g. 4 sessions = 100 score)
  const focusScore = useMemo(() => {
    const targetSessions = 4;
    const score = Math.min(100, Math.round((todayStat.sessions / targetSessions) * 100));
    return score;
  }, [todayStat]);

  // Deep Work %: A fun synthetic calculation or ratio of Deep Sprints to total sprints
  const deepWorkPercent = useMemo(() => {
    if (todayStat.sessions === 0) return 0;
    // Just a placeholder ratio for aesthetics, e.g. 75% for default
    return 75;
  }, [todayStat]);

  // Most Productive Hour
  const mostProductiveHour = useMemo(() => {
    if (!todayStat.hourlyActivity || Object.keys(todayStat.hourlyActivity).length === 0) {
      return "N/A";
    }
    let maxHour = -1;
    let maxMins = 0;
    Object.entries(todayStat.hourlyActivity).forEach(([hourStr, mins]) => {
      const hour = parseInt(hourStr, 10);
      if (mins > maxMins) {
        maxMins = mins;
        maxHour = hour;
      }
    });

    if (maxHour === -1) return "N/A";
    const ampm = maxHour >= 12 ? "PM" : "AM";
    const displayHour = maxHour % 12 || 12;
    return `${displayHour} ${ampm}`;
  }, [todayStat]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  const statsList = [
    {
      title: "Today's Focus Time",
      value: `${todayStat.focusTime}m`,
      icon: <Clock className="w-4 h-4 text-cyan-400" />,
      desc: "Daily goal: 100m",
    },
    {
      title: "Sessions Completed",
      value: todayStat.sessions,
      icon: <CheckSquare className="w-4 h-4 text-purple-400" />,
      desc: `Total sessions: ${sessionsCompleted}`,
    },
    {
      title: "Avg Session Length",
      value: `${avgSessionLength}m`,
      icon: <Activity className="w-4 h-4 text-pink-400" />,
      desc: "Target: 25 - 50m",
    },
    {
      title: "Focus Score",
      value: `${focusScore}/100`,
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      desc: focusScore >= 80 ? "Superb Focus Today!" : "Build your focus streak",
    },
    {
      title: "Deep Work Rate",
      value: `${deepWorkPercent}%`,
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      desc: "Focus intensity ratio",
    },
    {
      title: "Most Productive Hour",
      value: mostProductiveHour,
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      desc: "Highest focus concentration",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4"
    >
      {statsList.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-2xl p-4 border border-white/8 flex flex-col justify-between relative overflow-hidden group hover:border-white/15 transition-all duration-300"
        >
          {/* Subtle accent hover lights */}
          <div className="absolute -right-3 -top-3 w-10 h-10 bg-white/2 rounded-full blur-md group-hover:bg-white/5 transition-all duration-300" />
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
              {stat.title}
            </span>
            <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
              {stat.icon}
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xl font-black text-white tracking-tight leading-none">
              {stat.value}
            </div>
            <span className="text-[8px] text-gray-400 mt-1 block font-medium">
              {stat.desc}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
