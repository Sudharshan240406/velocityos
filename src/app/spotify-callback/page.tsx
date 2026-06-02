"use client";

import React, { useEffect, useState } from "react";
import { exchangeCodeForToken } from "../../lib/spotify";

export default function SpotifyCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error || !code) {
      setStatus("error");
      return;
    }

    const clientId = localStorage.getItem("spotify_client_id") || "";
    if (!clientId) {
      setStatus("error");
      return;
    }

    exchangeCodeForToken(code, clientId)
      .then((tok) => {
        if (tok) {
          setStatus("success");
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-[#050308] flex items-center justify-center">
      <div className="text-center space-y-3">
        {status === "loading" && (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin mx-auto" />
            <p className="text-white text-sm">Connecting to Spotify…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl">🎵</div>
            <p className="text-[#1DB954] font-bold">Connected! Redirecting…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-4xl">❌</div>
            <p className="text-red-400 text-sm">Connection failed.</p>
            <a href="/" className="text-white text-xs underline">Go back</a>
          </>
        )}
      </div>
    </div>
  );
}
