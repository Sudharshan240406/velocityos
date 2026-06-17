"use client";

import React, { useState } from "react";
import { SessionLogEntry } from "../../store/xpStore";
import { ArrowUpDown, Search } from "lucide-react";

interface Props {
  sessions: SessionLogEntry[];
}

type SortField = "date" | "duration" | "xpEarned" | "completionRate";

export default function SessionTable({ sessions }: Props) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = sessions
    .filter((s) => {
      const query = search.toLowerCase();
      return (
        s.preset.toLowerCase().includes(query) ||
        s.mood.toLowerCase().includes(query) ||
        s.date.includes(query)
      );
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "date") {
        valA = new Date(`${a.date}T${a.time}`).getTime();
        valB = new Date(`${b.date}T${b.time}`).getTime();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by preset, mood, or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto border border-white/8 rounded-xl bg-white/[0.01]">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-white/3 text-gray-400 font-bold uppercase tracking-wider">
              <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("date")}>
                <div className="flex items-center gap-1">
                  Date & Time <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Preset</th>
              <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("duration")}>
                <div className="flex items-center gap-1">
                  Duration <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("completionRate")}>
                <div className="flex items-center gap-1">
                  Completion <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("xpEarned")}>
                <div className="flex items-center gap-1">
                  XP Earned <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Mood</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 font-medium">
                  No focus sessions matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors text-white font-medium">
                  <td className="p-3">
                    <span className="block font-black">{s.date}</span>
                    <span className="text-[9px] text-gray-500">{s.time}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black">
                      {s.preset}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{s.duration}m</td>
                  <td className="p-3 font-mono">{s.completionRate}%</td>
                  <td className="p-3 font-mono text-cyan-400">+{s.xpEarned}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px]">
                      {s.mood}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
