"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Music, LogIn, LogOut, Settings, Disc3,
  Volume2, VolumeX, Laptop, Smartphone, Speaker, Radio, RotateCcw, ListMusic,
  ChevronRight, AlignLeft, Maximize2, Minimize2, Sparkles, RefreshCw
} from "lucide-react";
import {
  getStoredToken,
  initiateSpotifyLogin,
  getCurrentTrack,
  playTrack,
  pauseTrack,
  nextTrack,
  previousTrack,
  searchPlaylist,
  playContext,
  clearToken,
  SpotifyToken,
  SpotifyTrack,
  refreshSpotifyToken,
  getDevices,
  transferPlayback,
  setSpotifyVolume,
  getRecentlyPlayed,
  getUserPlaylists,
  SpotifyDevice,
  SpotifyPlaylist,
  RecentlyPlayedTrack
} from "../lib/spotify";
import { getDominantColor } from "../utils/colorExtractor";
import { safeColor } from "../utils/safeColor";

// Pre-defined lyrics for common focus tracks / fallbacks
const MOCK_LYRICS: Record<string, { time: number; text: string }[]> = {
  default: [
    { time: 0, text: "🎵 Ambient Focus Soundscape 🎵" },
    { time: 10, text: "Let the mind drift into the flow state..." },
    { time: 25, text: "Deep breaths in, deep breaths out." },
    { time: 45, text: "Focus is a muscle, train it gently." },
    { time: 70, text: "Minimize distractions, maximize intent." },
    { time: 95, text: "You are doing great, keep going." },
    { time: 120, text: "Flowing through the coding cycle..." },
    { time: 150, text: "Entering the deep redline run." },
    { time: 180, text: "Silence the noise, embrace the work." },
    { time: 210, text: "Almost there. One step at a time." },
  ]
};

export default function SpotifyPanel() {
  const [token, setToken] = useState<SpotifyToken | null>(null);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clientId, setClientId] = useState("");
  const [showClientIdInput, setShowClientIdInput] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Progress state
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  
  // Advanced controls
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([]);
  const [dominantColor, setDominantColor] = useState("rgb(168, 85, 247)"); // Purple default
  
  // Panels
  const [activeTab, setActiveTab] = useState<"player" | "playlists" | "recents" | "lyrics">("player");
  const [visualizerMode, setVisualizerMode] = useState<"waveform" | "spectrum" | "circular">("waveform");
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerAnimRef = useRef<number | null>(null);

  // Load client ID from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("spotify_client_id") || "";
    setClientId(stored);
    const tok = getStoredToken();
    if (tok) setToken(tok);
  }, []);

  const fetchCurrentTrack = useCallback(async () => {
    if (!token) return;
    if (token.expiresAt < Date.now() + 30000) {
      const newTok = await refreshSpotifyToken(token.refreshToken, clientId);
      if (newTok) setToken(newTok);
      return;
    }
    
    // Fetch currently playing
    const t = await getCurrentTrack(token.accessToken);
    if (t) {
      setTrack(t);
      setIsPlaying(t.is_playing);
      setProgressMs(t.progress_ms);
      setDurationMs(t.duration_ms);
    } else {
      setTrack(null);
      setIsPlaying(false);
    }
  }, [token, clientId]);

  // Handle active track details like dominant color extraction
  useEffect(() => {
    if (track) {
      const artUrl = track.album?.images?.[0]?.url;
      getDominantColor(artUrl, track.name).then(color => {
        setDominantColor(color);
      });
    }
  }, [track]);

  // Live progress increment (local simulation for smooth updates)
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (isPlaying && track) {
      progressIntervalRef.current = setInterval(() => {
        setProgressMs((prev) => {
          if (prev >= durationMs) {
            fetchCurrentTrack();
            return durationMs;
          }
          return prev + 1000;
        });
      }, 1000);
    }
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, [isPlaying, track, durationMs, fetchCurrentTrack]);

  // Fetch extra metrics (devices, playlists, recents) when connected
  const fetchExtraMetadata = useCallback(async () => {
    if (!token) return;
    const [devs, plays, recs] = await Promise.all([
      getDevices(token.accessToken),
      getUserPlaylists(token.accessToken),
      getRecentlyPlayed(token.accessToken, 10)
    ]);
    setDevices(devs);
    if (plays.length > 0) setPlaylists(plays);
    setRecentlyPlayed(recs);

    // Sync volume from active device if any
    const activeDev = devs.find(d => d.is_active);
    if (activeDev) {
      setVolume(activeDev.volume_percent);
    }
  }, [token]);

  // Poll Spotify player state
  useEffect(() => {
    if (!token) return;
    fetchCurrentTrack();
    fetchExtraMetadata();
    
    pollRef.current = setInterval(() => {
      fetchCurrentTrack();
      // Lighter metadata poll every 12 seconds
      if (Math.random() < 0.3) {
        fetchExtraMetadata();
      }
    }, 4000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [token, fetchCurrentTrack, fetchExtraMetadata]);

  // Animated procedural visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const speed = isPlaying ? 0.08 : 0.01;
      phase += speed;

      ctx.strokeStyle = safeColor(dominantColor);
      ctx.shadowColor = safeColor(dominantColor);
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;

      if (visualizerMode === "waveform") {
        // Neon Sine Waveform
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const amplitude = isPlaying ? (15 + Math.sin(phase * 0.5) * 8) : 2;
          const y = height / 2 + Math.sin(x * 0.02 + phase) * amplitude * Math.sin(x * Math.PI / width);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (visualizerMode === "spectrum") {
        // Equalizer Spectrum Bars
        const barCount = 18;
        const barWidth = width / barCount - 3;
        for (let i = 0; i < barCount; i++) {
          const mult = isPlaying ? Math.abs(Math.sin(phase + i * 0.3)) : 0.05;
          const barHeight = Math.max(3, height * 0.8 * mult);
          const x = i * (barWidth + 3);
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, y);
          grad.addColorStop(0, safeColor(dominantColor));
          grad.addColorStop(1, "rgba(255, 255, 255, 0.8)");
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      } else if (visualizerMode === "circular") {
        // Pulsing audio ring
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.6;
        const pulse = isPlaying ? Math.sin(phase) * 5 : 0;
        const radius = baseRadius + pulse;

        ctx.beginPath();
        const points = 60;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wave = isPlaying ? Math.sin(i * 0.5 + phase * 3) * 4 : 0.5;
          const r = radius + wave;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      visualizerAnimRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (visualizerAnimRef.current) cancelAnimationFrame(visualizerAnimRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [visualizerMode, isPlaying, dominantColor]);

  const handleLogin = () => {
    if (!clientId.trim()) {
      setShowClientIdInput(true);
      return;
    }
    localStorage.setItem("spotify_client_id", clientId);
    initiateSpotifyLogin(clientId);
  };

  const handleLogout = () => {
    clearToken();
    setToken(null);
    setTrack(null);
  };

  const handlePlayToggle = async () => {
    if (!token) return;
    setLoadingAction(true);
    if (isPlaying) {
      await pauseTrack(token.accessToken);
      setIsPlaying(false);
    } else {
      await playTrack(token.accessToken);
      setIsPlaying(true);
    }
    setTimeout(fetchCurrentTrack, 500);
    setLoadingAction(false);
  };

  const handleNext = async () => {
    if (!token) return;
    await nextTrack(token.accessToken);
    setTimeout(fetchCurrentTrack, 800);
  };

  const handlePrev = async () => {
    if (!token) return;
    await previousTrack(token.accessToken);
    setTimeout(fetchCurrentTrack, 800);
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (!token) return;
    await setSpotifyVolume(token.accessToken, val);
  };

  const toggleMute = async () => {
    if (!token) return;
    const targetMute = !isMuted;
    setIsMuted(targetMute);
    const targetVal = targetMute ? 0 : volume;
    await setSpotifyVolume(token.accessToken, targetVal);
  };

  const handleSwitchDevice = async (deviceId: string) => {
    if (!token) return;
    const ok = await transferPlayback(token.accessToken, deviceId);
    if (ok) {
      setShowDeviceSelector(false);
      setTimeout(fetchExtraMetadata, 1000);
    }
  };

  const handlePlayPlaylist = async (uri: string) => {
    if (!token) return;
    setLoadingAction(true);
    await playContext(token.accessToken, uri);
    setTimeout(fetchCurrentTrack, 1000);
    setLoadingAction(false);
  };

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get current lyrics line highlighting
  const currentSeconds = progressMs / 1000;
  const activeLyrics = MOCK_LYRICS.default;
  const currentLyricIndex = activeLyrics.reduce((acc, line, idx) => {
    if (currentSeconds >= line.time) return idx;
    return acc;
  }, 0);

  const albumArt = track?.album?.images?.[0]?.url;
  const artistName = track?.artists?.map((a) => a.name).join(", ") ?? "";
  const progressRatio = durationMs > 0 ? progressMs / durationMs : 0;

  return (
    <div
      className="flex flex-col bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full transition-all duration-500 overflow-hidden"
      style={{
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 40px -10px ${dominantColor}33`,
        borderColor: `${dominantColor}22`
      }}
    >
      {/* Dynamic Background Glow Sphere */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-25 pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: dominantColor }}
      />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5" style={{ color: dominantColor }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Spotify Premium</span>
        </div>
        {token && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDeviceSelector(!showDeviceSelector)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              title="Spotify Connect Devices"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-500 hover:text-white transition text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded-lg border border-white/5"
            >
              <LogOut className="w-3 h-3" />
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Device Selector Dropdown Overlay */}
      <AnimatePresence>
        {showDeviceSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-4 right-4 z-50 bg-slate-900/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-xl"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Connect to a Device</span>
              <button onClick={() => fetchExtraMetadata()} className="p-1 text-gray-500 hover:text-white transition">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto">
              {devices.length === 0 ? (
                <span className="text-[10px] text-gray-500 text-center py-2">No active devices found. Start Spotify on your device.</span>
              ) : (
                devices.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => handleSwitchDevice(dev.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                      dev.is_active ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" : "bg-white/3 hover:bg-white/5 text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {dev.type.toLowerCase() === "computer" ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                      <span className="truncate max-w-[130px] font-medium">{dev.name}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 capitalize">{dev.is_active ? "Active" : "Connect"}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection States */}
      {!token ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
            <Music className="w-7 h-7 text-gray-500" />
          </div>

          <AnimatePresence>
            {showClientIdInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full"
              >
                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 block">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your Spotify App Client ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-black font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <LogIn className="w-4 h-4" />
              Connect Spotify
            </button>
            {!showClientIdInput && (
              <button
                onClick={() => setShowClientIdInput(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-white/8 text-gray-400 hover:text-white text-[10px] font-bold uppercase transition"
              >
                <Settings className="w-3.5 h-3.5" />
                Set Client ID
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sub Navigation */}
          <div className="flex border-b border-white/5 mb-3 shrink-0">
            {["player", "playlists", "recents", "lyrics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-purple-500 text-purple-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {activeTab === "player" && (
              <div className="flex flex-col h-full justify-between gap-4">
                {/* Artwork & Visualizer */}
                <div className="relative w-full aspect-video rounded-xl bg-white/2 border border-white/5 overflow-hidden flex items-center justify-center group">
                  {/* Visualizer canvas layered behind */}
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                  {/* Album Art (Zoom & Hover Glow) */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group-hover:scale-105 transition-all duration-300 z-10 shadow-lg">
                    {albumArt ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={albumArt} alt="Album Art" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <Disc3 className={`w-8 h-8 text-gray-600 ${isPlaying ? "animate-spin [animation-duration:10s]" : ""}`} />
                      </div>
                    )}
                  </div>

                  {/* Visualizer Toggle button */}
                  <button
                    onClick={() => {
                      if (visualizerMode === "waveform") setVisualizerMode("spectrum");
                      else if (visualizerMode === "spectrum") setVisualizerMode("circular");
                      else setVisualizerMode("waveform");
                    }}
                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-[9px] font-bold text-gray-400 hover:text-white transition z-10 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {visualizerMode}
                  </button>
                </div>

                {/* Track Details */}
                <div className="text-center">
                  <h3 className="text-sm font-black text-white truncate max-w-[220px] mx-auto leading-tight">
                    {track?.name ?? "Nothing Playing"}
                  </h3>
                  <p className="text-[10px] text-gray-400 truncate max-w-[200px] mx-auto mt-0.5">
                    {artistName || "Start playback on your Spotify Client"}
                  </p>
                </div>

                {/* Live Progress Bar */}
                <div className="flex flex-col gap-1">
                  <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ backgroundColor: dominantColor }}
                      animate={{ width: `${progressRatio * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-gray-500">
                    <span>{formatTime(progressMs)}</span>
                    <span>-{formatTime(Math.max(0, durationMs - progressMs))}</span>
                  </div>
                </div>

                {/* Basic Playback Controls */}
                <div className="flex items-center justify-center gap-4 shrink-0">
                  <button
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition active:scale-90"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    onClick={handlePlayToggle}
                    disabled={loadingAction}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                    style={{ backgroundColor: dominantColor }}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition active:scale-90"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Volume bar */}
                <div className="flex items-center gap-2 bg-white/3 border border-white/5 rounded-xl px-3 py-1.5 shrink-0">
                  <button onClick={toggleMute} className="text-gray-500 hover:text-white transition">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="text-[9px] font-mono text-gray-400 w-6 text-right">
                    {isMuted ? "0%" : `${volume}%`}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "playlists" && (
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Your Focus playlists</span>
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/3 border border-white/5 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded bg-white/5 overflow-hidden flex-shrink-0">
                        {pl.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pl.images[0].url} alt={pl.name} className="w-full h-full object-cover" />
                        ) : (
                          <ListMusic className="w-5 h-5 text-gray-500 m-2" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">{pl.name}</span>
                        <span className="text-[9px] text-gray-500 truncate block">By {pl.owner.display_name}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlayPlaylist(pl.uri)}
                      className="p-1.5 rounded-lg bg-purple-500 text-black hover:scale-105 active:scale-95 transition opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "recents" && (
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Recently Played Tracks</span>
                {recentlyPlayed.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-white/5 overflow-hidden flex-shrink-0">
                        {item.track.album.images?.[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.track.album.images[0].url} alt={item.track.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">{item.track.name}</span>
                        <span className="text-[9px] text-gray-500 truncate block">
                          {item.track.artists.map(a => a.name).join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "lyrics" && (
              <div className="flex flex-col h-full justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Live Lyrics Mode</span>
                  <button
                    onClick={() => setIsFullscreenLyrics(!isFullscreenLyrics)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                  >
                    {isFullscreenLyrics ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex-1 bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col gap-3 font-medium text-xs text-gray-400 overflow-y-auto leading-relaxed max-h-[220px]">
                  {activeLyrics.map((line, idx) => {
                    const isPassed = idx <= currentLyricIndex;
                    const isCurrent = idx === currentLyricIndex;

                    return (
                      <p
                        key={idx}
                        className={`transition-all duration-300 ${
                          isCurrent
                            ? "text-white font-bold scale-[1.03] origin-left shadow-sm"
                            : isPassed
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}
                        style={{ color: isCurrent ? dominantColor : undefined }}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Lyrics Overlay */}
      <AnimatePresence>
        {isFullscreenLyrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex flex-col p-6 items-center justify-center"
            style={{
              backgroundImage: `radial-gradient(circle at center, ${dominantColor}15, #020108)`
            }}
          >
            <div className="w-full max-w-xl flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded overflow-hidden border border-white/10 shadow-lg">
                  {albumArt && <img src={albumArt} alt="Art" className="w-full h-full object-cover" />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">{track?.name ?? "No Song"}</span>
                  <span className="text-xs text-gray-400 block">{artistName}</span>
                </div>
              </div>
              <button
                onClick={() => setIsFullscreenLyrics(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 w-full max-w-lg overflow-y-auto py-10 flex flex-col gap-6 text-center text-lg md:text-xl font-black text-gray-500 px-4">
              {activeLyrics.map((line, idx) => {
                const isCurrent = idx === currentLyricIndex;
                return (
                  <motion.p
                    key={idx}
                    animate={{
                      scale: isCurrent ? 1.05 : 0.95,
                      opacity: isCurrent ? 1 : 0.25
                    }}
                    transition={{ duration: 0.4 }}
                    style={{ color: isCurrent ? dominantColor : undefined }}
                    className="cursor-pointer py-1"
                  >
                    {line.text}
                  </motion.p>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
