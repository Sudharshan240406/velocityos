"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Mic, MicOff, Send, Sparkles, ChevronRight,
  Terminal, Volume2, Zap, Command
} from "lucide-react";
import { useFocusStore } from "../store/focusStore";
import { parseJarvisCommand, JarvisResult } from "../lib/jarvisRouter";
import { MusicTrack } from "../types";

interface JarvisLog {
  id: number;
  type: "user" | "jarvis" | "system";
  text: string;
  timestamp: string;
  confidence?: number;
}

interface JarvisPanelProps {
  onNavigate?: (panel: string) => void;
  onOpenWallpaper?: () => void;
  onOpenSettings?: () => void;
}

const QUICK_COMMANDS = [
  "Start focus",
  "Pause timer",
  "GATE Mode",
  "Coding Mode",
  "Show stats",
  "Play LoFi",
  "Export profile",
  "Help",
];

let logCounter = 0;

export default function JarvisPanel({ onNavigate, onOpenWallpaper, onOpenSettings }: JarvisPanelProps) {
  const store = useFocusStore();
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<JarvisLog[]>([
    {
      id: ++logCounter,
      type: "system",
      text: "JARVIS ONLINE — VelocityOS Command Interface v10.0. Say 'help' for commands.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [taskQueue, setTaskQueue] = useState<{ text: string; added: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Init speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setIsListening(false);
      addLog("user", `🎤 "${transcript}"`);
      handleExecute(transcript);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = useCallback((type: JarvisLog["type"], text: string, confidence?: number) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev.slice(-49), { id: ++logCounter, type, text, timestamp, confidence }]);
  }, []);

  const speakReply = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text.replace(/[🚀⏸🔄⏭🎯💻🏗📚📊🏆🎵🌧🌲🌊🌙⚙️💾📂💡✅🔇🎶🖼]/g, ""));
    utt.rate = 1.1;
    utt.pitch = 0.95;
    window.speechSynthesis.speak(utt);
  };

  const executeAction = useCallback((result: JarvisResult) => {
    const { action } = result;
    setLastAction(action.type);

    switch (action.type) {
      case "TIMER_START":
        store.startTimer();
        break;
      case "TIMER_PAUSE":
        store.pauseTimer();
        break;
      case "TIMER_RESET":
        store.resetTimer();
        break;
      case "TIMER_SKIP":
        store.completeSession();
        break;
      case "MODE_STUDY": {
        const modeMap: Record<string, number> = {
          "GATE Mode": 45 * 60,
          "Coding Mode": 60 * 60,
          "Project Mode": 90 * 60,
          "Revision Mode": 25 * 60,
        };
        if (modeMap[action.mode]) store.setTimeLeft(modeMap[action.mode]);
        break;
      }
      case "NAV_STATS":
        onNavigate?.("stats");
        document.getElementById("stats-dashboard-card")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "NAV_ACHIEVEMENTS":
        onNavigate?.("achievements");
        break;
      case "NAV_MUSIC":
        onNavigate?.("music");
        break;
      case "NAV_AUTO":
        onNavigate?.("auto");
        break;
      case "NAV_COPILOT":
        onNavigate?.("copilot");
        break;
      case "TASK_ADD":
        setTaskQueue((prev) => [
          ...prev,
          { text: action.text, added: new Date().toLocaleTimeString() },
        ]);
        break;
      case "MUSIC_PLAY":
        store.toggleMusic();
        break;
      case "MUSIC_PAUSE":
        if (store.isMusicPlaying) store.toggleMusic();
        break;
      case "MUSIC_TRACK":
        store.setMusicTrack(action.track as MusicTrack);
        break;
      case "WALLPAPER_OPEN":
        onOpenWallpaper?.();
        break;
      case "SETTINGS_OPEN":
        onOpenSettings?.();
        break;
      case "SYNC_EXPORT":
        onNavigate?.("sync-export");
        break;
      case "SYNC_IMPORT":
        onNavigate?.("sync-import");
        break;
      case "HELP":
      case "UNKNOWN":
        break;
    }
  }, [store, onNavigate, onOpenWallpaper, onOpenSettings]);

  const handleExecute = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;
    setIsProcessing(true);

    // Simulate brief processing delay for UX
    await new Promise((r) => setTimeout(r, 280));

    const result = parseJarvisCommand(cmd);

    addLog("jarvis", result.reply, result.confidence);
    speakReply(result.reply);
    executeAction(result);

    setIsProcessing(false);
  }, [addLog, executeAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    addLog("user", input);
    handleExecute(input);
    setInput("");
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      addLog("system", "⚠ Web Speech API not supported in this browser.");
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

  const logTypeStyle = (type: JarvisLog["type"]) => {
    if (type === "user") return "text-cyan-300";
    if (type === "jarvis") return "text-purple-300";
    return "text-gray-500";
  };

  const logPrefix = (type: JarvisLog["type"]) => {
    if (type === "user") return "USER";
    if (type === "jarvis") return "JARVIS";
    return "SYS";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-[1440px] mx-auto w-full mb-6">
      
      {/* ── MAIN TERMINAL ── */}
      <div className="lg:col-span-2 flex flex-col bg-black/60 backdrop-blur-2xl border border-purple-500/20 rounded-2xl p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] min-h-[360px]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              <Cpu className="w-4 h-4 text-white" />
              {isProcessing && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-purple-400"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
              )}
            </div>
            <div>
              <span className="text-[11px] font-black text-white uppercase tracking-widest">JARVIS</span>
              <p className="text-[9px] text-purple-400 uppercase tracking-wider">Phase 10 — Command Interface</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastAction && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-[8px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md uppercase"
              >
                {lastAction.replace(/_/g, " ")}
              </motion.span>
            )}
            <button
              onClick={toggleMic}
              className={`p-2 rounded-xl border transition ${
                isListening
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Log terminal */}
        <div className="flex-1 bg-black/50 border border-white/5 rounded-xl p-3 overflow-y-auto max-h-[200px] font-mono text-[10px] flex flex-col gap-1.5 select-text">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 leading-relaxed"
              >
                <span className="text-gray-600 shrink-0">{log.timestamp}</span>
                <span className={`font-bold shrink-0 ${logTypeStyle(log.type)}`}>[{logPrefix(log.type)}]</span>
                <span className={logTypeStyle(log.type)}>{log.text}</span>
                {log.confidence !== undefined && log.confidence < 0.8 && (
                  <span className="text-amber-600 text-[8px] self-center">(~{Math.round(log.confidence * 100)}%)</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Natural language command..."
              className="w-full bg-white/5 border border-purple-500/20 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            {isProcessing ? (
              <motion.div
                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
              />
            ) : (
              <Send className="w-3 h-3" />
            )}
          </button>
        </form>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex flex-col gap-4">

        {/* Quick Commands */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quick Commands</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_COMMANDS.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  addLog("user", cmd);
                  handleExecute(cmd);
                }}
                className="text-left px-2.5 py-1.5 rounded-lg bg-white/3 border border-white/5 text-[9px] text-gray-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition flex items-center gap-1"
              >
                <ChevronRight className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Task Queue (JARVIS scheduled tasks) */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">JARVIS Task Queue</span>
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[120px]">
            {taskQueue.length === 0 ? (
              <p className="text-[9px] text-gray-600 text-center py-3">
                No tasks queued. Say "add task [description]".
              </p>
            ) : (
              taskQueue.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-white/2 border border-white/5 rounded-lg px-2.5 py-1.5 text-[9px]">
                  <span className="text-gray-300 truncate flex-1">{t.text}</span>
                  <span className="text-cyan-500 font-mono shrink-0 ml-2">{t.added}</span>
                </div>
              ))
            )}
          </div>

          {/* Live status */}
          <div className="mt-auto pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[8px]">
            <div className="bg-white/3 rounded-lg p-2 flex flex-col">
              <span className="text-gray-500 uppercase tracking-wider">Timer</span>
              <span className="text-white font-bold capitalize">{store.status}</span>
            </div>
            <div className="bg-white/3 rounded-lg p-2 flex flex-col">
              <span className="text-gray-500 uppercase tracking-wider">Mode</span>
              <span className="text-white font-bold capitalize">{store.mode}</span>
            </div>
            <div className="bg-white/3 rounded-lg p-2 flex flex-col">
              <span className="text-gray-500 uppercase tracking-wider">Streak</span>
              <span className="text-white font-bold">{store.streak} days</span>
            </div>
            <div className="bg-white/3 rounded-lg p-2 flex flex-col">
              <span className="text-gray-500 uppercase tracking-wider">Sessions</span>
              <span className="text-white font-bold">{store.sessionsCompleted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
