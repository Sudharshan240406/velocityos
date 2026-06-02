"use client";

import React, { useMemo } from "react";
import { useFocusStore } from "../store/focusStore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  mode?: "weekly" | "monthly";
}

export default function FocusChart({ mode = "weekly" }: Props) {
  const { dailyStats } = useFocusStore();

  const chartData = useMemo(() => {
    const days = mode === "monthly" ? 30 : 7;
    const last: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last.push(d.toLocaleDateString("en-CA"));
    }

    return last.map((date) => {
      const stat = dailyStats.find((s) => s.date === date);
      const label =
        mode === "monthly"
          ? new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
      return {
        name: label,
        minutes: stat ? stat.focusTime : 0,
        sessions: stat ? stat.sessions : 0,
      };
    });
  }, [dailyStats, mode]);

  const tooltipStyle = {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#fff",
  };

  if (mode === "monthly") {
    return (
      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="minutes" name="Minutes" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="minutes"
            name="Minutes"
            stroke="#a855f7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMinutes)"
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="#06b6d4"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fillOpacity={1}
            fill="url(#colorSessions)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
