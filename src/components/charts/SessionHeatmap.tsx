"use client";

import React, { useMemo } from "react";
import { useFocusStore } from "../../store/focusStore";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BUCKETS = ["00-02", "02-04", "04-06", "06-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-22", "22-24"];

export default function SessionHeatmap() {
  const { dailyStats } = useFocusStore();

  // Aggregate stats: Day of Week (0-6) x Hour Bucket (0-11)
  const heatmapData = useMemo(() => {
    const grid = Array(7).fill(0).map(() => Array(12).fill(0));

    dailyStats.forEach((stat) => {
      if (!stat.hourlyActivity) return;
      const dateObj = new Date(stat.date + "T12:00:00");
      const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat

      Object.entries(stat.hourlyActivity).forEach(([hourStr, minutes]) => {
        const hour = parseInt(hourStr, 10);
        const bucketIndex = Math.min(11, Math.floor(hour / 2));
        grid[dayOfWeek][bucketIndex] += minutes;
      });
    });

    return grid;
  }, [dailyStats]);

  // Find max value for color scaling
  const maxValue = useMemo(() => {
    let max = 0;
    heatmapData.forEach(row => {
      row.forEach(val => {
        if (val > max) max = val;
      });
    });
    return max || 1;
  }, [heatmapData]);

  const getColorClass = (value: number) => {
    if (value === 0) return "bg-white/3 border-white/5";
    const ratio = value / maxValue;
    if (ratio < 0.25) return "bg-cyan-950/40 border-cyan-800/30 text-cyan-400";
    if (ratio < 0.5) return "bg-cyan-800/50 border-cyan-500/40 text-cyan-300";
    if (ratio < 0.75) return "bg-purple-800/60 border-purple-500/50 text-purple-300";
    return "bg-purple-500 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]";
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/8 mt-2 overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Heatmap grid header */}
        <div className="flex items-center gap-1.5 mb-2 pl-8">
          {BUCKETS.map((b, idx) => (
            <span key={idx} className="flex-1 text-[8px] font-bold text-gray-500 text-center">
              {b}
            </span>
          ))}
        </div>

        {/* Heatmap rows */}
        <div className="flex flex-col gap-1.5">
          {DAYS.map((dayName, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-1.5">
              <span className="w-8 text-[9px] font-black text-gray-400 uppercase tracking-wider shrink-0 text-left">
                {dayName}
              </span>
              {heatmapData[dayIdx].map((value, bucketIdx) => (
                <div
                  key={bucketIdx}
                  title={`${dayName} during ${BUCKETS[bucketIdx]}: ${value} focus mins`}
                  className={`flex-1 aspect-[2/1] rounded border flex items-center justify-center transition-all duration-300 group relative ${getColorClass(value)}`}
                >
                  <span className="text-[7px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {value}m
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center gap-1.5 mt-3 text-[8px] font-bold text-gray-500">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-white/3 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-950/40 border border-cyan-800/30" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-800/50 border border-cyan-500/40" />
          <div className="w-2.5 h-2.5 rounded bg-purple-800/60 border border-purple-500/50" />
          <div className="w-2.5 h-2.5 rounded bg-purple-500 border border-purple-400" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
