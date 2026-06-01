"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerMode, BackgroundEffect } from "@/lib/types";

type Settings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  backgroundEffect: BackgroundEffect;
  soundEnabled: boolean;
};

type CompletionReward = {
  minutesFocused: number;
  sessionsCompleted: number;
  streak: number;
};

type FocusState = {
  timerMode: TimerMode;
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  timerRunning: boolean;
  sessionsCompletedInCycle: number;
  totalSessionsCompleted: number;
  streak: number;
  todayFocusMinutes: number;
  weekFocusMinutes: number;
  settings: Settings;
  completionModalOpen: boolean;
  completionReward: CompletionReward | null;
  setTimerMode: (mode: TimerMode) => void;
  tick: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  completeSession: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  closeCompletionModal: () => void;
};

const settingsToSeconds = {
  focus: (settings: Settings) => settings.focusMinutes * 60,
  shortBreak: (settings: Settings) => settings.shortBreakMinutes * 60,
  longBreak: (settings: Settings) => settings.longBreakMinutes * 60,
} as const;

function nextMode(current: TimerMode, sessionsCompletedInCycle: number, settings: Settings): TimerMode {
  if (current !== "focus") {
    return "focus";
  }
  return sessionsCompletedInCycle >= settings.sessionsBeforeLongBreak ? "longBreak" : "shortBreak";
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      timerMode: "focus",
      timerSecondsLeft: 25 * 60,
      timerTotalSeconds: 25 * 60,
      timerRunning: false,
      sessionsCompletedInCycle: 1,
      totalSessionsCompleted: 0,
      streak: 0,
      todayFocusMinutes: 0,
      weekFocusMinutes: 0,
      settings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
        backgroundEffect: "highway",
        soundEnabled: false,
      },
      completionModalOpen: false,
      completionReward: null,

      setTimerMode: (mode) =>
        set((state) => {
          const total =
            mode === "focus"
              ? settingsToSeconds.focus(state.settings)
              : mode === "shortBreak"
                ? settingsToSeconds.shortBreak(state.settings)
                : settingsToSeconds.longBreak(state.settings);

          return {
            timerMode: mode,
            timerSecondsLeft: total,
            timerTotalSeconds: total,
            timerRunning: false,
          };
        }),

      tick: () =>
        set((state) => {
          if (!state.timerRunning) {
            return state;
          }

          if (state.timerSecondsLeft <= 1) {
            return {
              timerSecondsLeft: 0,
              timerRunning: false,
            };
          }

          return {
            timerSecondsLeft: state.timerSecondsLeft - 1,
          };
        }),

      startTimer: () => set({ timerRunning: true }),
      pauseTimer: () => set({ timerRunning: false }),
      resetTimer: () =>
        set((state) => ({
          timerRunning: false,
          timerSecondsLeft: state.timerTotalSeconds,
        })),

      skipSession: () =>
        set((state) => {
          const mode = nextMode(state.timerMode, state.sessionsCompletedInCycle, state.settings);
          const total =
            mode === "focus"
              ? settingsToSeconds.focus(state.settings)
              : mode === "shortBreak"
                ? settingsToSeconds.shortBreak(state.settings)
                : settingsToSeconds.longBreak(state.settings);

          return {
            timerMode: mode,
            timerSecondsLeft: total,
            timerTotalSeconds: total,
            timerRunning: false,
          };
        }),

      completeSession: () =>
        set((state) => {
          const completedFocus = state.timerMode === "focus";
          const sessionsCompletedInCycle = completedFocus
            ? state.sessionsCompletedInCycle + 1
            : state.sessionsCompletedInCycle;
          const upcomingMode = nextMode(state.timerMode, sessionsCompletedInCycle, state.settings);
          const total =
            upcomingMode === "focus"
              ? settingsToSeconds.focus(state.settings)
              : upcomingMode === "shortBreak"
                ? settingsToSeconds.shortBreak(state.settings)
                : upcomingMode === "longBreak"
                  ? settingsToSeconds.longBreak(state.settings)
                  : settingsToSeconds.shortBreak(state.settings);

          const addedMinutes = completedFocus ? state.settings.focusMinutes : 0;
          const newTotalSessions = completedFocus ? state.totalSessionsCompleted + 1 : state.totalSessionsCompleted;
          const newStreak = completedFocus && state.totalSessionsCompleted === 0 ? state.streak + 1 : state.streak || 1;

          return {
            timerMode: upcomingMode,
            timerSecondsLeft: total,
            timerTotalSeconds: total,
            timerRunning: false,
            sessionsCompletedInCycle:
              upcomingMode === "focus" && state.timerMode !== "focus"
                ? sessionsCompletedInCycle > state.settings.sessionsBeforeLongBreak
                  ? 1
                  : sessionsCompletedInCycle
                : sessionsCompletedInCycle,
            totalSessionsCompleted: newTotalSessions,
            streak: newStreak,
            todayFocusMinutes: state.todayFocusMinutes + addedMinutes,
            weekFocusMinutes: state.weekFocusMinutes + addedMinutes,
            completionModalOpen: completedFocus,
            completionReward: completedFocus
              ? {
                  minutesFocused: addedMinutes,
                  sessionsCompleted: newTotalSessions,
                  streak: newStreak,
                }
              : null,
          };
        }),

      updateSettings: (patch) =>
        set((state) => {
          const settings = { ...state.settings, ...patch };
          const total =
            state.timerMode === "focus"
              ? settings.focusMinutes * 60
              : state.timerMode === "shortBreak"
                ? settings.shortBreakMinutes * 60
                : settings.longBreakMinutes * 60;

          return {
            settings,
            timerSecondsLeft: state.timerRunning ? state.timerSecondsLeft : total,
            timerTotalSeconds: total,
          };
        }),

      closeCompletionModal: () => set({ completionModalOpen: false, completionReward: null }),
    }),
    {
      name: "velocityos-focus-store",
    },
  ),
);
