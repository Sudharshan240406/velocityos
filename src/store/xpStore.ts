import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Achievement, PresetName } from "../types";

export interface SessionLogEntry {
  id: string;
  date: string;
  time: string;
  duration: number; // in minutes
  preset: PresetName;
  xpEarned: number;
  completionRate: number; // 0-100
  mood: string; // Focused, Tired, Anxious, Energized, Calm
}

export interface XPState {
  xp: number;
  level: number;
  currentStreak: number;
  bestStreak: number;
  sessionsCompleted: number;
  totalFocusTime: number; // in minutes
  achievements: Achievement[];
  lastUnlocked: string | null;
  lastActiveDate: string | null; // YYYY-MM-DD
  sessionsLog: SessionLogEntry[];

  // Actions
  addXP: (amount: number) => void;
  completeSession: (presetName: PresetName, durationMinutes: number, completionRate?: number, mood?: string) => void;
  checkAndUnlockAchievements: () => void;
  clearLastUnlocked: () => void;
  resetStreakIfNeeded: () => void;
}

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
    id: "sessions_50",
    title: "Deep Work Devotee",
    description: "Complete 50 focus sessions",
    icon: "⚡",
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
    id: "streak_5",
    title: "High Five Streak",
    description: "Maintain a 5-day focus streak",
    icon: "📅",
    unlocked: false,
  },
  {
    id: "streak_10",
    title: "Double Digit Flame",
    description: "Maintain a 10-day focus streak",
    icon: "👑",
    unlocked: false,
  },
  {
    id: "hours_50",
    title: "Elite Focus",
    description: "Accumulate 50 hours of focus time",
    icon: "⏱️",
    unlocked: false,
  },
  {
    id: "hours_100",
    title: "Master of Flow",
    description: "Accumulate 100 hours of focus time",
    icon: "💎",
    unlocked: false,
  },
];

export const getXPForLevel = (lvl: number): number => {
  if (lvl === 0) return 0;
  if (lvl === 1) return 100;
  if (lvl === 2) return 250;
  if (lvl === 3) return 500;
  if (lvl === 4) return 1000;
  return 1000 + (lvl - 4) * 1000;
};

export const getLevelForXP = (xpPoints: number): number => {
  if (xpPoints < 100) return 0;
  if (xpPoints < 250) return 1;
  if (xpPoints < 500) return 2;
  if (xpPoints < 1000) return 3;
  return 4 + Math.floor((xpPoints - 1000) / 1000);
};

const XP_PER_PRESET: Record<PresetName, number> = {
  Sprint: 25,
  "Deep Sprint": 50,
  "Redline Run": 100,
};

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 0,
      currentStreak: 0,
      bestStreak: 0,
      sessionsCompleted: 0,
      totalFocusTime: 0,
      achievements: INITIAL_ACHIEVEMENTS,
      lastUnlocked: null,
      lastActiveDate: null,
      sessionsLog: [],

      addXP: (amount) => {
        const newXP = get().xp + amount;
        const newLevel = getLevelForXP(newXP);
        const oldLevel = get().level;
        
        set({ xp: newXP, level: newLevel });

        if (newLevel > oldLevel && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("focusos:level_up", { detail: { level: newLevel } }));
        }
      },

      resetStreakIfNeeded: () => {
        const { lastActiveDate, currentStreak } = get();
        if (!lastActiveDate) return;

        const todayStr = new Date().toLocaleDateString("en-CA");
        if (lastActiveDate !== todayStr) {
          const lastDate = new Date(lastActiveDate);
          const todayDate = new Date(todayStr);
          const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 1) {
            set({ currentStreak: 0 });
          }
        }
      },

      completeSession: (presetName, durationMinutes, completionRate = 100, mood = "Focused") => {
        get().resetStreakIfNeeded();

        const { currentStreak, bestStreak, lastActiveDate, xp, sessionsLog } = get();
        const todayStr = new Date().toLocaleDateString("en-CA");
        const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        
        // Calculate Streak
        let newStreak = currentStreak;
        if (!lastActiveDate) {
          newStreak = 1;
        } else if (lastActiveDate === todayStr) {
          // Already active today, maintain current streak
        } else {
          const lastDate = new Date(lastActiveDate);
          const todayDate = new Date(todayStr);
          const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        const baseXP = XP_PER_PRESET[presetName] || 25;
        let dailyGoalBonus = 0;
        const currentSessions = get().sessionsCompleted + 1;
        
        if (currentSessions > 0 && currentSessions % 4 === 0) {
          dailyGoalBonus = 75;
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("focusos:daily_goal_reached"));
          }
        }

        const totalAwardedXP = baseXP + dailyGoalBonus;
        
        const newSessionsCompleted = get().sessionsCompleted + 1;
        const newTotalFocusTime = get().totalFocusTime + durationMinutes;
        const newBestStreak = Math.max(newStreak, bestStreak);

        const newLogEntry = {
          id: Math.random().toString(36).substring(2, 9),
          date: todayStr,
          time: timeStr,
          duration: durationMinutes,
          preset: presetName,
          xpEarned: totalAwardedXP,
          completionRate,
          mood,
        };

        set({
          sessionsCompleted: newSessionsCompleted,
          totalFocusTime: newTotalFocusTime,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          lastActiveDate: todayStr,
          sessionsLog: [newLogEntry, ...sessionsLog],
        });

        get().addXP(totalAwardedXP);
        get().checkAndUnlockAchievements();

        // Dispatch a floating XP animation event
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("focusos:xp_gained", {
              detail: { xp: totalAwardedXP, isDailyGoal: dailyGoalBonus > 0 },
            })
          );
        }
      },

      checkAndUnlockAchievements: () => {
        const { sessionsCompleted, currentStreak, totalFocusTime, achievements } = get();
        const totalFocusHours = totalFocusTime / 60;
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
            case "sessions_50":
              shouldUnlock = sessionsCompleted >= 50;
              break;
            case "sessions_100":
              shouldUnlock = sessionsCompleted >= 100;
              break;
            case "streak_5":
              shouldUnlock = currentStreak >= 5;
              break;
            case "streak_10":
              shouldUnlock = currentStreak >= 10;
              break;
            case "hours_50":
              shouldUnlock = totalFocusHours >= 50;
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

        if (lastUnlocked) {
          set({ achievements: updated, lastUnlocked });
        }
      },

      clearLastUnlocked: () => set({ lastUnlocked: null }),
    }),
    {
      name: "focusos-xp-system",
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        sessionsCompleted: state.sessionsCompleted,
        totalFocusTime: state.totalFocusTime,
        achievements: state.achievements,
        lastActiveDate: state.lastActiveDate,
        sessionsLog: state.sessionsLog,
      }),
    }
  )
);
