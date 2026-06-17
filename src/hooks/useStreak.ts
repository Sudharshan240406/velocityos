import { useEffect } from "react";
import { useXPStore } from "../store/xpStore";

export function useStreak() {
  const { currentStreak, bestStreak, resetStreakIfNeeded } = useXPStore();

  useEffect(() => {
    // Check and reset streak on mount
    resetStreakIfNeeded();
  }, [resetStreakIfNeeded]);

  return {
    currentStreak,
    bestStreak,
  };
}
