"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useFocusStore } from "../store/focusStore";
import { Play, Pause, RotateCcw, GripHorizontal, LayoutGrid, Disc, SkipBack, SkipForward, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStoredToken,
  getCurrentTrack,
  playTrack,
  pauseTrack,
  nextTrack,
  previousTrack,
  refreshSpotifyToken,
  SpotifyToken,
  SpotifyTrack,
} from "../lib/spotify";

type WidgetMode = "mini" | "compact" | "expanded";

export default function FloatingWidget() {
  const { timeLeft, status, mode, currentPreset, presets, startTimer, pauseTimer, resetTimer } = useFocusStore();
  const [widgetMode, setWidgetMode] = useState<WidgetMode>("compact");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // Spotify integration states for Expanded Mode
  const [spotifyToken, setSpotifyToken] = useState<SpotifyToken | null>(null);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [clientId, setClientId] = useState("");
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activePreset = presets[currentPreset];
  const maxDuration = mode === "focus" ? activePreset.focusDuration : activePreset.breakDuration;
  const progress = timeLeft / maxDuration;
  const strokeDashoffset = 88 - (88 * progress);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    setIsMounted(true);
    const savedPos = localStorage.getItem("focusos:floating_position");
    const savedMode = localStorage.getItem("focusos:floating_mode") as WidgetMode;
    if (savedMode) {
      setWidgetMode(savedMode);
    }
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {
        console.error("Failed to parse floating widget position", e);
      }
    } else {
      if (typeof window !== "undefined") {
        setPosition({
          x: window.innerWidth - 220,
          y: window.innerHeight - 150
        });
      }
    }

    const storedClientId = localStorage.getItem("spotify_client_id") || "";
    setClientId(storedClientId);
    const tok = getStoredToken();
    if (tok) setSpotifyToken(tok);
  }, []);

  const fetchSpotifyTrack = useCallback(async () => {
    if (!spotifyToken) return;
    if (spotifyToken.expiresAt < Date.now() + 30000) {
      const newTok = await refreshSpotifyToken(spotifyToken.refreshToken, clientId);
      if (newTok) setSpotifyToken(newTok);
      return;
    }
    const t = await getCurrentTrack(spotifyToken.accessToken);
    if (t) {
      setSpotifyTrack(t);
      setIsSpotifyPlaying(t.is_playing);
    } else {
      setSpotifyTrack(null);
      setIsSpotifyPlaying(false);
    }
  }, [spotifyToken, clientId]);

  useEffect(() => {
    if (widgetMode !== "expanded" || !spotifyToken) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    fetchSpotifyTrack();
    pollRef.current = setInterval(fetchSpotifyTrack, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [widgetMode, spotifyToken, fetchSpotifyTrack]);

  const handleToggle = () => {
    if (status === "running") {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  const handleSpotifyPlay = async () => {
    if (!spotifyToken) return;
    if (isSpotifyPlaying) {
      await pauseTrack(spotifyToken.accessToken);
      setIsSpotifyPlaying(false);
    } else {
      await playTrack(spotifyToken.accessToken);
      setIsSpotifyPlaying(true);
    }
    setTimeout(fetchSpotifyTrack, 500);
  };

  const handleSpotifyNext = async () => {
    if (!spotifyToken) return;
    await nextTrack(spotifyToken.accessToken);
    setTimeout(fetchSpotifyTrack, 800);
  };

  const handleSpotifyPrev = async () => {
    if (!spotifyToken) return;
    await previousTrack(spotifyToken.accessToken);
    setTimeout(fetchSpotifyTrack, 800);
  };

  const handleDragEnd = (event: any, info: any) => {
    if (typeof window === "undefined") return;

    let newX = position.x + info.offset.x;
    let newY = position.y + info.offset.y;

    let widgetWidth = 190;
    let widgetHeight = 50;
    if (widgetMode === "mini") {
      widgetWidth = 120;
      widgetHeight = 48;
    } else if (widgetMode === "expanded") {
      widgetWidth = 260;
      widgetHeight = 180;
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Constrain within window boundaries
    newX = Math.max(10, Math.min(newX, screenWidth - widgetWidth - 10));
    newY = Math.max(10, Math.min(newY, screenHeight - widgetHeight - 10));

    // Snap Edges: if within 80px of any edge, snap directly to it
    if (newX < 80) newX = 10;
    if (newX > screenWidth - widgetWidth - 80) newX = screenWidth - widgetWidth - 10;
    if (newY < 80) newY = 10;
    if (newY > screenHeight - widgetHeight - 80) newY = screenHeight - widgetHeight - 10;

    const finalPos = { x: newX, y: newY };
    setPosition(finalPos);
    localStorage.setItem("focusos:floating_position", JSON.stringify(finalPos));
  };

  const toggleWidgetMode = () => {
    let nextMode: WidgetMode = "mini";
    if (widgetMode === "mini") nextMode = "compact";
    else if (widgetMode === "compact") nextMode = "expanded";
    else if (widgetMode === "expanded") nextMode = "mini";

    setWidgetMode(nextMode);
    localStorage.setItem("focusos:floating_mode", nextMode);
  };

  if (!isMounted) return null;

  // Render sizes based on widgetMode
  const getDimensions = () => {
    switch (widgetMode) {
      case "mini":
        return { width: "120px", height: "48px" };
      case "expanded":
        return { width: "260px", height: "180px" };
      case "compact":
      default:
        return { width: "190px", height: "52px" };
    }
  };

  const dim = getDimensions();

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="pointer-events-auto absolute flex flex-col bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] select-none hover:border-purple-500/35 transition-colors cursor-grab active:cursor-grabbing p-3 overflow-hidden"
        style={{
          width: dim.width,
          height: dim.height,
        }}
      >
        {/* Top Header / Mode Switcher */}
        {widgetMode !== "mini" && (
          <div className="flex items-center justify-between w-full h-5 mb-1.5 shrink-0">
            <div className="flex items-center gap-1.5 text-gray-500">
              <GripHorizontal className="w-3.5 h-3.5 cursor-grab active:cursor-grabbing" />
              <div
                className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] ${
                  mode === "focus" ? "text-purple-400 bg-purple-400" : "text-cyan-400 bg-cyan-400"
                }`}
              />
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">
                {mode === "focus" ? "Focus" : "Break"}
              </span>
            </div>

            <button
              onClick={toggleWidgetMode}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              title="Toggle Widget Mode"
            >
              <LayoutGrid className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        {/* Main Section */}
        <div className="flex items-center justify-between w-full flex-1 shrink-0">
          {/* Mini/Progress circle */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  className="stroke-white/5 fill-none"
                  strokeWidth="2.5"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  className={`fill-none ${
                    mode === "focus" ? "stroke-purple-500" : "stroke-cyan-400"
                  }`}
                  strokeWidth="2.5"
                  strokeDasharray="88"
                  animate={{ strokeDashoffset }}
                  transition={{ ease: "linear" }}
                />
              </svg>
              {widgetMode === "mini" ? (
                <button
                  onClick={handleToggle}
                  className="absolute inset-0 flex items-center justify-center text-white hover:text-purple-400 transition"
                >
                  {status === "running" ? (
                    <Pause className="w-2.5 h-2.5 fill-current" />
                  ) : (
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  )}
                </button>
              ) : (
                <div
                  className={`absolute w-1.5 h-1.5 rounded-full ${
                    status === "running" ? "animate-ping" : ""
                  } ${mode === "focus" ? "bg-purple-400" : "bg-cyan-400"}`}
                />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black font-mono tracking-widest text-white leading-none">
                {formatTime(timeLeft)}
              </span>
              {widgetMode !== "mini" && (
                <span className="text-[7.5px] font-semibold text-gray-500 uppercase tracking-wider truncate mt-0.5">
                  {currentPreset}
                </span>
              )}
            </div>
          </div>

          {/* Quick controls (Compact / Expanded) */}
          {widgetMode !== "mini" && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggle}
                className={`flex items-center justify-center w-6 h-6 rounded-lg border transition active:scale-95 ${
                  status === "running"
                    ? "bg-purple-950/20 border-purple-500/30 text-purple-400"
                    : "bg-white/10 border-white/5 text-white hover:bg-white/15"
                }`}
              >
                {status === "running" ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={resetTimer}
                className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {widgetMode === "mini" && (
            <button
              onClick={toggleWidgetMode}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition shrink-0"
            >
              <LayoutGrid className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Expanded Mode: Spotify Mini Player */}
        {widgetMode === "expanded" && (
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5 shrink-0">
            {spotifyToken ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {spotifyTrack?.album?.images?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={spotifyTrack.album.images[0].url} alt="Track Art" className="w-full h-full object-cover animate-spin [animation-duration:12s]" />
                    ) : (
                      <Disc className="w-4 h-4 text-[#1DB954]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-white block truncate leading-tight">
                      {spotifyTrack?.name ?? "No Track"}
                    </span>
                    <span className="text-[8px] text-gray-400 block truncate leading-none">
                      {spotifyTrack?.artists?.map((a) => a.name).join(", ") ?? "Offline / Idle"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleSpotifyPrev}
                    className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSpotifyPlay}
                    className="w-6 h-6 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition"
                  >
                    {isSpotifyPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={handleSpotifyNext}
                    className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-2 gap-1">
                <Music className="w-4 h-4 text-gray-500" />
                <span className="text-[8px] text-gray-400">Connect Spotify in Sidebar</span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
