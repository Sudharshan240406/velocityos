import { useEffect, useRef } from "react";
import { useFocusStore } from "../store/focusStore";
import { useXPStore } from "../store/xpStore";
import { useNotifications } from "./useNotifications";
import { PresetName } from "../types";

import { getStoredToken, searchPlaylist, playContext } from "../lib/spotify";

function playChime() {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    const now = audioCtx.currentTime;
    playTone(523.25, now, 1.2); // C5
    playTone(659.25, now + 0.15, 1.2); // E5
    playTone(783.99, now + 0.3, 1.5); // G5
    playTone(1046.50, now + 0.45, 1.8); // C6
  } catch (e) {
    console.error("Audio chime failed to play", e);
  }
}

async function triggerSpotifyPlaylist(type: "focus" | "break") {
  const token = getStoredToken();
  if (!token) return;

  const defaultFocusPlaylist = localStorage.getItem("spotify_auto_focus_query") || "lofi hip hop focus";
  const defaultBreakPlaylist = localStorage.getItem("spotify_auto_break_query") || "chill lofi ambient";

  const query = type === "focus" ? defaultFocusPlaylist : defaultBreakPlaylist;
  try {
    const uri = await searchPlaylist(token.accessToken, query);
    if (uri) {
      await playContext(token.accessToken, uri);
    }
  } catch (err) {
    console.error("Failed to trigger automated playlist", err);
  }
}

export function usePomodoro() {
  const { status, tick, presets } = useFocusStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { notifySessionComplete, notifyBreakComplete } = useNotifications();
  const { completeSession } = useXPStore();

  // Listen for session/break complete events from the store
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSessionComplete = (e: Event) => {
      const detail = (e as CustomEvent<{ presetName: PresetName; streak: number }>).detail;
      notifySessionComplete(detail.presetName);
      playChime();
      triggerSpotifyPlaylist("break");
      
      const activePreset = presets[detail.presetName];
      const durationMins = Math.round(activePreset.focusDuration / 60);
      completeSession(detail.presetName, durationMins);
    };

    const handleBreakComplete = () => {
      notifyBreakComplete();
      playChime();
      triggerSpotifyPlaylist("focus");
    };

    window.addEventListener("focusos:session_complete", handleSessionComplete);
    window.addEventListener("focusos:break_complete", handleBreakComplete);

    return () => {
      window.removeEventListener("focusos:session_complete", handleSessionComplete);
      window.removeEventListener("focusos:break_complete", handleBreakComplete);
    };
  }, [notifySessionComplete, notifyBreakComplete, completeSession, presets]);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, tick]);
}
