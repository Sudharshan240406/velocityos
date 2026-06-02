"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Music, LogIn, LogOut, Settings, Disc3,
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
} from "../lib/spotify";

const FOCUS_PLAYLISTS = [
  { label: "LoFi Beats", query: "lofi hip hop focus" },
  { label: "Deep Focus", query: "deep focus instrumental" },
  { label: "Coding Flow", query: "coding music concentration" },
];

export default function SpotifyPanel() {
  const [token, setToken] = useState<SpotifyToken | null>(null);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clientId, setClientId] = useState("");
  const [showClientIdInput, setShowClientIdInput] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Load client ID from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("spotify_client_id") || "";
    setClientId(stored);
    const tok = getStoredToken();
    if (tok) setToken(tok);
  }, []);

  const fetchCurrentTrack = useCallback(async () => {
    if (!token) return;
    // Check if token needs refresh
    if (token.expiresAt < Date.now() + 30000) {
      const newTok = await refreshSpotifyToken(token.refreshToken, clientId);
      if (newTok) setToken(newTok);
      return;
    }
    const t = await getCurrentTrack(token.accessToken);
    if (t) {
      setTrack(t);
      setIsPlaying(t.is_playing);
      setProgress(t.progress_ms / t.duration_ms);
    } else {
      setTrack(null);
      setIsPlaying(false);
    }
  }, [token, clientId]);

  // Poll for current track
  useEffect(() => {
    if (!token) return;
    fetchCurrentTrack();
    pollRef.current = setInterval(fetchCurrentTrack, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, fetchCurrentTrack]);

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

  const handlePlay = async () => {
    if (!token) return;
    setLoadingAction(true);
    if (isPlaying) {
      await pauseTrack(token.accessToken);
    } else {
      await playTrack(token.accessToken);
    }
    setIsPlaying(!isPlaying);
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

  const handlePlaylist = async (query: string) => {
    if (!token) return;
    setLoadingAction(true);
    const uri = await searchPlaylist(token.accessToken, query);
    if (uri) await playContext(token.accessToken, uri);
    setTimeout(fetchCurrentTrack, 1000);
    setLoadingAction(false);
  };

  const albumArt = track?.album?.images?.[0]?.url;
  const artistName = track?.artists?.map((a) => a.name).join(", ") ?? "";

  return (
    <div className="flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] h-full justify-between">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 text-[#1DB954]">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Spotify</span>
        </div>
        {token && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-gray-500 hover:text-white transition text-[10px] font-medium"
          >
            <LogOut className="w-3 h-3" />
            Disconnect
          </button>
        )}
      </div>

      {/* Not logged in state */}
      {!token && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
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
                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block">
                  Spotify Client ID
                </label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Enter your Spotify App Client ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/30"
                />
                <p className="text-[9px] text-gray-600 mt-1.5">
                  Register at developer.spotify.com → Add redirect: {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/spotify-callback
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
            >
              <LogIn className="w-4 h-4" />
              Connect Spotify
            </button>

            {!showClientIdInput && (
              <button
                onClick={() => setShowClientIdInput(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-white/8 text-gray-400 hover:text-white text-xs transition"
              >
                <Settings className="w-3 h-3" />
                Set Client ID
              </button>
            )}
          </div>
        </div>
      )}

      {/* Connected state */}
      {token && (
        <div className="flex flex-col gap-4 flex-1">
          {/* Now Playing */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              {albumArt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={albumArt} alt="Album art" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className={`w-6 h-6 text-gray-500 ${isPlaying ? "animate-spin [animation-duration:4s]" : ""}`} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                {track?.name ?? "Nothing Playing"}
              </span>
              <span className="text-[10px] text-gray-400 truncate block">{artistName || "Play something on Spotify"}</span>

              {/* Progress bar */}
              {track && (
                <div className="h-0.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#1DB954] rounded-full"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition active:scale-90"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={handlePlay}
              disabled={loadingAction}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(29,185,84,0.3)] disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition active:scale-90"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Focus Playlists */}
          <div className="mt-auto">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 block">
              Focus Playlists
            </span>
            <div className="flex flex-col gap-1.5">
              {FOCUS_PLAYLISTS.map((pl) => (
                <button
                  key={pl.query}
                  onClick={() => handlePlaylist(pl.query)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/2 hover:bg-white/5 hover:border-[#1DB954]/30 text-xs text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Music className="w-3 h-3 text-[#1DB954]" />
                  {pl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
