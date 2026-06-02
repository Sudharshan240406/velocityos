import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FocusState, PresetName, DailyStat, WallpaperType } from "../types";

const INITIAL_PRESETS = {
  Sprint: { name: "Sprint" as PresetName, focusDuration: 25 * 60, breakDuration: 5 * 60 },
  "Deep Sprint": { name: "Deep Sprint" as PresetName, focusDuration: 50 * 60, breakDuration: 10 * 60 },
  "Redline Run": { name: "Redline Run" as PresetName, focusDuration: 90 * 60, breakDuration: 20 * 60 },
};

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      presets: INITIAL_PRESETS,
      currentPreset: "Sprint",
      mode: "focus",
      status: "idle",
      timeLeft: INITIAL_PRESETS["Sprint"].focusDuration,

      streak: 0,
      sessionsCompleted: 0,
      totalFocusTime: 0,
      dailyStats: [],
      lastActiveDate: null,

      currentTrack: "LoFi",
      volume: 0.5,
      isMusicPlaying: false,

      // Settings
      wallpaper: "aurora",
      notificationsEnabled: false,
      autoStartBreaks: false,
      autoStartFocus: false,

      setPreset: (name) => {
        const preset = get().presets[name];
        set({
          currentPreset: name,
          mode: "focus",
          status: "idle",
          timeLeft: preset.focusDuration,
        });
      },

      startTimer: () => {
        set({ status: "running" });
      },

      pauseTimer: () => {
        set({ status: "paused" });
      },

      resetTimer: () => {
        const currentPresetName = get().currentPreset;
        const preset = get().presets[currentPresetName];
        set({
          status: "idle",
          mode: "focus",
          timeLeft: preset.focusDuration,
        });
      },

      setTimeLeft: (time) => set({ timeLeft: time }),

      tick: () => {
        const { timeLeft } = get();
        if (timeLeft <= 1) {
          get().completeSession();
        } else {
          set({ timeLeft: timeLeft - 1 });
        }
      },

      completeSession: () => {
        const { mode, currentPreset, presets, streak, sessionsCompleted, totalFocusTime, dailyStats, lastActiveDate, autoStartBreaks, autoStartFocus } = get();
        const preset = presets[currentPreset];
        const today = new Date().toLocaleDateString("en-CA");

        if (mode === "focus") {
          const durationMins = Math.round(preset.focusDuration / 60);
          const newSessionsCompleted = sessionsCompleted + 1;
          const newTotalFocusTime = totalFocusTime + durationMins;
          const currentHour = new Date().getHours();

          // Calculate streak
          let newStreak = streak;
          if (lastActiveDate === null) {
            newStreak = 1;
          } else if (lastActiveDate === today) {
            // Active today already
          } else {
            const lastDate = new Date(lastActiveDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          }

          // Update dailyStats with hourly tracking
          const statsMap = new Map<string, DailyStat>();
          dailyStats.forEach(s => statsMap.set(s.date, s));
          const existingStat = statsMap.get(today) || { date: today, focusTime: 0, sessions: 0, hourlyActivity: {} };
          const hourlyActivity = existingStat.hourlyActivity || {};
          hourlyActivity[currentHour] = (hourlyActivity[currentHour] || 0) + durationMins;
          statsMap.set(today, {
            date: today,
            focusTime: existingStat.focusTime + durationMins,
            sessions: existingStat.sessions + 1,
            hourlyActivity,
          });
          const newDailyStats = Array.from(statsMap.values()).slice(-30); // keep 30 days

          // Trigger gamification from outside to avoid circular dependency
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("focusos:session_complete", {
              detail: { presetName: currentPreset, streak: newStreak }
            }));
          }

          set({
            mode: "break",
            timeLeft: preset.breakDuration,
            status: autoStartBreaks ? "running" : "idle",
            sessionsCompleted: newSessionsCompleted,
            totalFocusTime: newTotalFocusTime,
            streak: newStreak,
            lastActiveDate: today,
            dailyStats: newDailyStats,
          });
        } else {
          set({
            mode: "focus",
            timeLeft: preset.focusDuration,
            status: autoStartFocus ? "running" : "idle",
          });

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("focusos:break_complete"));
          }
        }
      },

      setMusicTrack: (track) => set({ currentTrack: track }),
      setVolume: (volume) => set({ volume }),
      toggleMusic: () => set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),
      setWallpaper: (wallpaper: WallpaperType) => set({ wallpaper }),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setAutoStartBreaks: (enabled) => set({ autoStartBreaks: enabled }),
      setAutoStartFocus: (enabled) => set({ autoStartFocus: enabled }),
    }),
    {
      name: "focusos-storage",
      partialize: (state) => ({
        streak: state.streak,
        sessionsCompleted: state.sessionsCompleted,
        totalFocusTime: state.totalFocusTime,
        dailyStats: state.dailyStats,
        lastActiveDate: state.lastActiveDate,
        volume: state.volume,
        currentTrack: state.currentTrack,
        wallpaper: state.wallpaper,
        notificationsEnabled: state.notificationsEnabled,
        autoStartBreaks: state.autoStartBreaks,
        autoStartFocus: state.autoStartFocus,
      }),
    }
  )
);
