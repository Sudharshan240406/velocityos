"use client";

import React, { useState } from "react";
import { useXPStore } from "../../store/xpStore";
import SessionTable from "./SessionTable";
import { exportReportToPDF } from "../../utils/exportPDF";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

export default function SessionHistory() {
  const { sessionsLog } = useXPStore();
  const [filterPreset, setFilterPreset] = useState("all");

  const filteredLog = sessionsLog.filter((s) => {
    if (filterPreset === "all") return true;
    return s.preset === filterPreset;
  });

  const exportCSV = () => {
    if (sessionsLog.length === 0) return;
    const headers = ["ID", "Date", "Time", "Preset", "Duration", "Completion Rate", "XP Earned", "Mood"];
    const rows = sessionsLog.map((s) => [
      s.id,
      s.date,
      s.time,
      s.preset,
      s.duration,
      s.completionRate,
      s.xpEarned,
      s.mood,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "focusos_session_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    await exportReportToPDF("session-history-container", "FocusOS Session History Report");
  };

  return (
    <div id="session-history-container" className="glass-card rounded-2xl p-5 border border-white/8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Session History Explorer
          </h3>
          <span className="text-[10px] text-gray-500 font-medium">
            Review and export your local focus logs
          </span>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          <select
            value={filterPreset}
            onChange={(e) => setFilterPreset(e.target.value)}
            className="bg-white/5 border border-white/8 rounded-lg px-2.5 py-1 text-[10px] font-bold text-gray-300 focus:outline-none transition-colors"
          >
            <option value="all" className="bg-[#050308]">All Presets</option>
            <option value="Sprint" className="bg-[#050308]">Sprint</option>
            <option value="Deep Sprint" className="bg-[#050308]">Deep Sprint</option>
            <option value="Redline Run" className="bg-[#050308]">Redline Run</option>
          </select>

          <button
            onClick={exportCSV}
            title="Export CSV"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 hover:text-white transition active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleExportPDF}
            title="Export PDF"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 text-gray-400 hover:text-white transition active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SessionTable sessions={filteredLog} />
    </div>
  );
}
