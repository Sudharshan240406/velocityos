"use client";

import React, { useMemo } from "react";
import { useFocusStore } from "../../store/focusStore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function MonthlyFocusChart() {
  const { dailyStats } = useFocusStore();

  const chartData = useMemo(() => {
    const last30Days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push(d.toLocaleDateString("en-CA"));
    }

    return last30Days.map((date) => {
      const stat = dailyStats.find((s) => s.date === date);
      const label = new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        name: label,
        minutes: stat ? stat.focusTime : 0,
      };
    });
  }, [dailyStats]);

  const tooltipStyle = {
    backgroundColor: "rgba(10, 8, 16, 0.95)",
    borderColor: "rgba(6, 182, 212, 0.3)",
    borderRadius: "12px",
    fontSize: "11px",
    color: "#fff",
    boxShadow: "0 0 15px rgba(6, 182, 212, 0.25)",
  };

  return (
    <div className="w-full h-[180px] mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlyCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0891b2" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={9} tickLine={false} axisLine={false} interval={5} />
          <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="minutes" name="Focus Mins" fill="url(#monthlyCyan)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
