"use client";

import React, { useMemo } from "react";
import { useFocusStore } from "../../store/focusStore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function WeeklyFocusChart() {
  const { dailyStats } = useFocusStore();

  const chartData = useMemo(() => {
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toLocaleDateString("en-CA"));
    }

    return last7Days.map((date) => {
      const stat = dailyStats.find((s) => s.date === date);
      const label = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
      return {
        name: label,
        minutes: stat ? stat.focusTime : 0,
        sessions: stat ? stat.sessions : 0,
      };
    });
  }, [dailyStats]);

  const tooltipStyle = {
    backgroundColor: "rgba(10, 8, 16, 0.95)",
    borderColor: "rgba(168, 85, 247, 0.3)",
    borderRadius: "12px",
    fontSize: "11px",
    color: "#fff",
    boxShadow: "0 0 15px rgba(168, 85, 247, 0.25)",
  };

  return (
    <div className="w-full h-[180px] mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="weeklyGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#d946ef" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="minutes"
            name="Focus Mins"
            stroke="#d946ef"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#weeklyGlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
