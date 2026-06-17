"use client";

import React, { useState } from "react";
import { initiateSpotifyLogin } from "../lib/spotify";
import { Music } from "lucide-react";

export default function SpotifyLogin() {
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!clientId.trim()) {
      setError("Spotify Client ID is required.");
      return;
    }
    setError("");
    localStorage.setItem("spotify:client_id", clientId.trim());
    try {
      await initiateSpotifyLogin(clientId.trim());
    } catch (e) {
      console.error(e);
      setError("OAuth redirect failed.");
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/8 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center text-[#1DB954] mb-4">
        <Music className="w-6 h-6 animate-pulse" />
      </div>
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
        Spotify PKCE Authorization
      </h3>
      <p className="text-[10px] text-gray-400 max-w-[200px] mb-4">
        Enter your Spotify Developer Client ID to synchronize your playback.
      </p>

      {error && (
        <span className="text-[10px] text-red-400 font-bold mb-3">{error}</span>
      )}

      <input
        type="text"
        placeholder="Client ID"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-[#1DB954]/50 transition-colors"
      />

      <button
        onClick={handleLogin}
        className="w-full py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-black uppercase text-[10px] tracking-wider transition active:scale-95 shadow-[0_0_15px_rgba(29,185,84,0.3)]"
      >
        Authenticate Spotify
      </button>
    </div>
  );
}
