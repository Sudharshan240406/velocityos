import { useXPStore, getXPForLevel } from "../store/xpStore";

export function useXP() {
  const { xp, level, addXP, completeSession } = useXPStore();

  const currentLevelXPStart = getXPForLevel(level);
  const nextLevelXPEnd = getXPForLevel(level + 1);
  const xpInCurrentLevel = xp - currentLevelXPStart;
  const xpNeededForNextLevel = nextLevelXPEnd - currentLevelXPStart;
  
  const progressPercent = Math.min(
    100,
    Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100)
  );

  return {
    xp,
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
    addXP,
    completeSession,
  };
}
