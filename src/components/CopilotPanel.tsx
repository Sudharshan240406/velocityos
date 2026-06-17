"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Mic, MicOff, Play, Pause, AlertTriangle, Sparkles, Send,
  Clock, CheckSquare, Award, Music, BarChart3, TrendingUp, Smile
} from "lucide-react";
import { useFocusStore } from "../store/focusStore";
import { MusicTrack } from "../types";

// AI Study Modes config
interface StudyMode {
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  musicPreference: MusicTrack;
  suggestion: string;
}

const STUDY_MODES: Record<string, StudyMode> = {
  "GATE Mode": {
    name: "GATE Mode",
    focusMinutes: 45,
    breakMinutes: 5,
    musicPreference: "LoFi",
    suggestion: "Optimized for high-density analytical solving and engineering drills."
  },
  "Coding Mode": {
    name: "Coding Mode",
    focusMinutes: 60,
    breakMinutes: 10,
    musicPreference: "LoFi",
    suggestion: "Designed for programming sprints, logic building, and syntax retention."
  },
  "Project Mode": {
    name: "Project Mode",
    focusMinutes: 90,
    breakMinutes: 15,
    musicPreference: "Night",
    suggestion: "Best for system designs, codebase refactoring, and deep architecture work."
  },
  "Revision Mode": {
    name: "Revision Mode",
    focusMinutes: 25,
    breakMinutes: 5,
    musicPreference: "Ocean",
    suggestion: "Ideal for active recall cycles, flashcard reviews, and fast recaps."
  }
};

interface PlannedTask {
  text: string;
  priority: "HIGH" | "MID" | "LOW";
  estimatedMinutes: number;
  scheduledTime: string;
}

export default function CopilotPanel() {
  const store = useFocusStore();
  const [commandInput, setCommandInput] = useState("");
  const [commandLogs, setCommandLogs] = useState<string[]>([
    "VelocityOS AI Copilot initialized. Say 'Start focus' or type commands to begin."
  ]);
  const [isListening, setIsListening] = useState(false);
  const [activeStudyMode, setActiveStudyMode] = useState<string | null>(null);

  // Smart Task Planner States
  const [taskText, setTaskText] = useState("");
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);

  // Speech Recognition API reference
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onresult = (e: any) => {
          const command = e.results[0][0].transcript.toLowerCase();
          setCommandLogs(prev => [...prev, `Voice Input: "${command}"`]);
          executeCommand(command);
          setIsListening(false);
        };

        rec.onerror = () => {
          setIsListening(false);
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Web Speech API recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Command Parser Engine
  const executeCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();

    if (cmd.includes("start focus") || cmd.includes("start timer")) {
      store.startTimer();
      setCommandLogs(prev => [...prev, "AI: Initializing focus session."]);
      speakText("Focus timer started. Let's make this session count.");
    } else if (cmd.includes("pause focus") || cmd.includes("pause timer")) {
      store.pauseTimer();
      setCommandLogs(prev => [...prev, "AI: Focus session paused."]);
      speakText("Focus session paused.");
    } else if (cmd.includes("reset timer")) {
      store.resetTimer();
      setCommandLogs(prev => [...prev, "AI: Resetting focus duration."]);
      speakText("Timer has been reset.");
    } else if (cmd.includes("open analytics") || cmd.includes("show stats")) {
      setCommandLogs(prev => [...prev, "AI: Aligning cockpit widgets to analytics view."]);
      speakText("Opening analytics dashboard.");
      const statsWidget = document.getElementById("stats-dashboard-card");
      if (statsWidget) statsWidget.scrollIntoView({ behavior: "smooth" });
    } else if (cmd.includes("gate mode")) {
      handleSelectStudyMode("GATE Mode");
    } else if (cmd.includes("coding mode")) {
      handleSelectStudyMode("Coding Mode");
    } else if (cmd.includes("project mode")) {
      handleSelectStudyMode("Project Mode");
    } else if (cmd.includes("revision mode")) {
      handleSelectStudyMode("Revision Mode");
    } else {
      // General feedback
      setCommandLogs(prev => [...prev, `AI Command recognized: "${cmd}"`]);
      speakText(`Command received.`);
    }
  };

  const handleSelectStudyMode = (modeName: string) => {
    const mode = STUDY_MODES[modeName];
    if (!mode) return;

    setActiveStudyMode(modeName);
    
    // Dynamically update timer settings directly
    store.setTimeLeft(mode.focusMinutes * 60);
    store.setMusicTrack(mode.musicPreference);
    
    // Set auto-run triggers
    localStorage.setItem("spotify_auto_focus_query", mode.musicPreference);

    setCommandLogs(prev => [
      ...prev,
      `AI: Activated ${mode.name}. Adjusted focus to ${mode.focusMinutes}m and breaks to ${mode.breakMinutes}m. Playlist recommendation: ${mode.musicPreference}.`
    ]);

    speakText(`${mode.name} configured. Ready for deep learning.`);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    setCommandLogs(prev => [...prev, `User: ${commandInput}`]);
    executeCommand(commandInput);
    setCommandInput("");
  };

  // Smart Task Auto-Scheduler Priority Engine
  const handleAddTask = () => {
    if (!taskText.trim()) return;

    // AI task duration heuristics
    let estimatedMinutes = 30;
    let priority: "HIGH" | "MID" | "LOW" = "MID";

    const text = taskText.toLowerCase();
    if (text.includes("exam") || text.includes("gate") || text.includes("deadline")) {
      estimatedMinutes = 60;
      priority = "HIGH";
    } else if (text.includes("fix") || text.includes("code") || text.includes("debug")) {
      estimatedMinutes = 45;
      priority = "HIGH";
    } else if (text.includes("read") || text.includes("research")) {
      estimatedMinutes = 40;
      priority = "MID";
    } else if (text.includes("clean") || text.includes("break") || text.includes("chill")) {
      estimatedMinutes = 15;
      priority = "LOW";
    }

    // Auto Schedule Time Calculation
    const now = new Date();
    const scheduledTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const newTask: PlannedTask = {
      text: taskText,
      priority,
      estimatedMinutes,
      scheduledTime
    };

    setPlannedTasks(prev => [...prev, newTask]);
    setTaskText("");
    speakText(`Task added and prioritized as ${priority}.`);
  };

  // AI Productivity calculations
  const totalSessions = store.sessionsCompleted || 0;
  const focusHours = (store.totalFocusTime || 0) / 60;
  const computedFocusScore = Math.min(100, Math.round(50 + (totalSessions * 5) + (store.streak * 4)));
  
  // Predictive metrics
  const focusPotential = Math.min(100, Math.round(65 + (store.streak * 3)));
  const expectedFocusDuration = totalSessions > 0 ? Math.round((store.totalFocusTime || 0) / totalSessions) : 25;
  const recommendedStartTime = "09:30 AM";

  // Burnout Detection Heuristics
  const burnoutRisk = totalSessions > 8 ? "HIGH" : totalSessions > 5 ? "MEDIUM" : "LOW";
  const showWellnessAlert = totalSessions > 6;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1440px] mx-auto w-full mb-6">
      
      {/* ── SECTION 1: COMMAND CENTER & VOICE ── */}
      <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">VelocityOS Copilot</span>
          </div>
          <button
            onClick={toggleListening}
            className={`p-2 rounded-xl transition ${
              isListening ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            }`}
            title="Voice Assistant"
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Command line logs */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2 overflow-y-auto max-h-[160px] text-[10px] font-mono text-gray-400 select-text">
          {commandLogs.map((log, idx) => (
            <div key={idx} className="leading-tight">
              {log}
            </div>
          ))}
        </div>

        <form onSubmit={handleCommandSubmit} className="flex gap-2 mt-3">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type focus/stats/schedule command..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-purple-500 text-black hover:bg-purple-600 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ── SECTION 2: AI STUDY MODES ── */}
      <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin [animation-duration:10s]" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AI Study Modes</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.keys(STUDY_MODES).map((modeKey) => (
              <button
                key={modeKey}
                onClick={() => handleSelectStudyMode(modeKey)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  activeStudyMode === modeKey
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                    : "bg-white/3 border-white/5 hover:border-white/15 text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider block">{modeKey}</span>
                <span className="text-[8px] text-gray-500 block mt-0.5">{STUDY_MODES[modeKey].focusMinutes}m timer</span>
              </button>
            ))}
          </div>
        </div>

        {activeStudyMode && (
          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-[10px] text-yellow-300/80 leading-relaxed">
            <span className="font-bold block uppercase tracking-wider mb-0.5 text-[8.5px]">AI Recommendation</span>
            {STUDY_MODES[activeStudyMode].suggestion}
          </div>
        )}
      </div>

      {/* ── SECTION 3: SMART TASK PLANNER & WELLNESS ── */}
      <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Smart Planner</span>
            </div>
            {showWellnessAlert && (
              <span className="flex items-center gap-1 text-[8.5px] font-bold uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                <AlertTriangle className="w-3 h-3" /> Burnout Risk: {burnoutRisk}
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="e.g. GATE revision or logic code"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none"
            />
            <button
              onClick={handleAddTask}
              className="px-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[10px] uppercase rounded-xl transition"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[140px] flex flex-col gap-1.5 pr-1 select-text">
          {plannedTasks.length === 0 ? (
            <span className="text-[9px] text-gray-500 text-center py-4 block">No scheduled tasks yet. Add tasks above to prioritize.</span>
          ) : (
            plannedTasks.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-white/2 border border-white/5 text-[10px] text-gray-300"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold block truncate leading-tight">{t.text}</span>
                  <span className="text-[8px] text-gray-500 block">Est: {t.estimatedMinutes}m • Priority: {t.priority}</span>
                </div>
                <span className="text-[8.5px] font-mono text-emerald-400 font-bold">{t.scheduledTime}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── SECTION 4: PREDICTIVE ANALYTICS & FOCUS INTEL ── */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white/2 border border-white/5 rounded-2xl p-4 shadow-md">
        
        <div className="flex flex-col gap-1 bg-white/3 border border-white/5 rounded-xl p-3 justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Focus Potential</span>
          </div>
          <span className="text-xl font-black text-white">{focusPotential}%</span>
          <span className="text-[8px] text-gray-500">Predicted energy capacity based on current daily streak.</span>
        </div>

        <div className="flex flex-col gap-1 bg-white/3 border border-white/5 rounded-xl p-3 justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Expected Duration</span>
          </div>
          <span className="text-xl font-black text-white">{expectedFocusDuration} mins</span>
          <span className="text-[8px] text-gray-500">Heuristically planned session length based on logs.</span>
        </div>

        <div className="flex flex-col gap-1 bg-white/3 border border-white/5 rounded-xl p-3 justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Focus Quality Score</span>
          </div>
          <span className="text-xl font-black text-white">{computedFocusScore} / 100</span>
          <span className="text-[8px] text-gray-500">Computed via level, completed sessions, and daily streak.</span>
        </div>

        <div className="flex flex-col gap-1 bg-white/3 border border-white/5 rounded-xl p-3 justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <Smile className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Burnout & Wellness</span>
          </div>
          <span className={`text-sm font-black uppercase ${showWellnessAlert ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
            {showWellnessAlert ? "Take a Break" : "Optimal (Clear)"}
          </span>
          <span className="text-[8px] text-gray-500">AI fatigue monitoring system checking overall daily reps.</span>
        </div>

      </div>

    </div>
  );
}
