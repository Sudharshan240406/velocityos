import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GamificationState, Achievement, PresetName } from "../types";

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_focus",
    title: "First Focus",
    description: "Complete your very first focus session",
    icon: "🎯",
    unlocked: false,
  },
  {
    id: "sessions_10",
    title: "Getting Started",
    description: "Complete 10 focus sessions",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "sessions_25",
    title: "Building Momentum",
    description: "Complete 25 focus sessions",
    icon: "⚡",
    unlocked: false,
  },
  {
    id: "sessions_50",
    title: "Half Century",
    description: "Complete 50 focus sessions",
    icon: "💎",
    unlocked: false,
  },
  {
    id: "sessions_100",
    title: "Century Club",
    description: "Complete 100 focus sessions",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day focus streak",
    icon: "📅",
    unlocked: false,
  },
  {
    id: "streak_30",
    title: "Monthly Master",
    description: "Maintain a 30-day focus streak",
    icon: "🌙",
    unlocked: false,
  },
  {
    id: "hours_100",
    title: "Century of Focus",
    description: "Accumulate 100 hours of focus time",
    icon: "⏱️",
    unlocked: false,
  },
];

const XP_PER_PRESET: Record<PresetName, number> = {
  Sprint: 10,
  "Deep Sprint": 20,
  "Redline Run": 40,
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 0,
      sessionsCompleted: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      lastUnlocked: null,

      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = Math.floor(newXP / 100);
        set({ xp: newXP, level: newLevel });
      },

      incrementSession: (presetName) => {
        const { addXP } = get();
        const xpAmount = XP_PER_PRESET[presetName] || 10;
        addXP(xpAmount);
        const newSessions = get().sessionsCompleted + 1;
        set({ sessionsCompleted: newSessions });
        get().checkAndUnlockAchievements();
      },

      updateStreak: (streak) => {
        const { bestStreak } = get();
        set({
          currentStreak: streak,
          bestStreak: Math.max(streak, bestStreak),
        });
        get().checkAndUnlockAchievements();
      },

      checkAndUnlockAchievements: () => {
        const { sessionsCompleted, currentStreak, xp, achievements } = get();
        const totalFocusHours = xp / 3600; // rough estimate
        let lastUnlocked: string | null = null;

        const updated = achievements.map((a) => {
          if (a.unlocked) return a;

          let shouldUnlock = false;
          switch (a.id) {
            case "first_focus":
              shouldUnlock = sessionsCompleted >= 1;
              break;
            case "sessions_10":
              shouldUnlock = sessionsCompleted >= 10;
              break;
            case "sessions_25":
              shouldUnlock = sessionsCompleted >= 25;
              break;
            case "sessions_50":
              shouldUnlock = sessionsCompleted >= 50;
              break;
            case "sessions_100":
              shouldUnlock = sessionsCompleted >= 100;
              break;
            case "streak_7":
              shouldUnlock = currentStreak >= 7;
              break;
            case "streak_30":
              shouldUnlock = currentStreak >= 30;
              break;
            case "hours_100":
              shouldUnlock = totalFocusHours >= 100;
              break;
          }

          if (shouldUnlock) {
            lastUnlocked = a.id;
            return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          return a;
        });

        set({ achievements: updated, lastUnlocked });
      },

      clearLastUnlocked: () => set({ lastUnlocked: null }),
    }),
    {
      name: "focusos-gamification",
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        sessionsCompleted: state.sessionsCompleted,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        achievements: state.achievements,
      }),
    }
  )
);
