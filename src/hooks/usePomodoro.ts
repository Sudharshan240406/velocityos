import { useEffect, useRef } from "react";
import { useFocusStore } from "../store/focusStore";
import { useGamificationStore } from "../store/gamificationStore";
import { useNotifications } from "./useNotifications";
import { PresetName } from "../types";

export function usePomodoro() {
  const { status, tick } = useFocusStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { notifySessionComplete, notifyBreakComplete } = useNotifications();
  const { incrementSession, updateStreak } = useGamificationStore();

  // Listen for session/break complete events from the store
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSessionComplete = (e: Event) => {
      const detail = (e as CustomEvent<{ presetName: PresetName; streak: number }>).detail;
      notifySessionComplete(detail.presetName);
      incrementSession(detail.presetName);
      updateStreak(detail.streak);
    };

    const handleBreakComplete = () => {
      notifyBreakComplete();
    };

    window.addEventListener("focusos:session_complete", handleSessionComplete);
    window.addEventListener("focusos:break_complete", handleBreakComplete);

    return () => {
      window.removeEventListener("focusos:session_complete", handleSessionComplete);
      window.removeEventListener("focusos:break_complete", handleBreakComplete);
    };
  }, [notifySessionComplete, notifyBreakComplete, incrementSession, updateStreak]);

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
