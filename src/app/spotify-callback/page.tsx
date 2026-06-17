"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeCodeForToken } from "../../lib/spotify";
import { Loader2 } from "lucide-react";

function SpotifyCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const clientId = localStorage.getItem("spotify_client_id");

    if (code && clientId) {
      exchangeCodeForToken(code, clientId)
        .then((token) => {
          if (token) {
            router.push("/");
          } else {
            setError("Failed to exchange authentication code.");
          }
        })
        .catch((err) => {
          console.error(err);
          setError("OAuth exchange encountered an error.");
        });
    } else {
      setError("Authorization code or Client ID is missing.");
    }
  }, [searchParams, router]);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/8 flex flex-col items-center max-w-sm text-center">
      {error ? (
        <>
          <span className="text-red-400 font-bold mb-2">Auth Error</span>
          <p className="text-xs text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition border border-white/10"
          >
            Back to Dashboard
          </button>
        </>
      ) : (
        <>
          <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
            Synchronizing Spotify...
          </h3>
          <p className="text-xs text-gray-500">
            Please wait while we establish a secure connection.
          </p>
        </>
      )}
    </div>
  );
}

export default function SpotifyCallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050308] text-white">
      <Suspense fallback={
        <div className="glass-card p-6 rounded-2xl border border-white/8 flex flex-col items-center max-w-sm text-center">
          <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Loading Callback Handler...</h3>
        </div>
      }>
        <SpotifyCallbackContent />
      </Suspense>
    </div>
  );
}
