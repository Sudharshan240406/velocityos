"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { starterNotes, starterSessions, starterTasks, vehicles } from "@/lib/data";
import type {
  AppView,
  BackgroundEffect,
  Note,
  SessionLog,
  Task,
  ThemeMode,
  TimerMode,
  UserProfile,
  Vehicle,
} from "@/lib/types";

type Settings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  theme: ThemeMode;
  backgroundEffect: BackgroundEffect;
};

type CompletionReward = {
  xpEarned: number;
  currentStreak: number;
  totalPomodoros: number;
  nextUnlock?: Vehicle;
  unlockedVehicle?: Vehicle;
  quote: string;
};

type FocusState = {
  activeView: AppView;
  timerMode: TimerMode;
  timerSecondsLeft: number;
  timerTotalSeconds: number;
  timerRunning: boolean;
  sessionsCompletedInCycle: number;
  totalPomodoros: number;
  streak: number;
  xp: number;
  level: number;
  tasks: Task[];
  notes: Note[];
  sessionLogs: SessionLog[];
  settings: Settings;
  completionModalOpen: boolean;
  completionReward: CompletionReward | null;
  unlockedVehicleIds: string[];
  profile: UserProfile;
  socialEnabled: boolean;
  isDemoMode: boolean;
  setActiveView: (view: AppView) => void;
  setTimerMode: (mode: TimerMode) => void;
  tick: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  completeSession: () => void;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  addNote: () => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  setNotes: (notes: Note[]) => void;
  setSessionLogs: (logs: SessionLog[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  closeCompletionModal: () => void;
  enableSocialPreview: () => void;
  activateDemoMode: () => void;
  setProfile: (profile: UserProfile) => void;
};

const celebrationQuotes = [
  "Momentum compounds faster than motivation.",
  "Precision beats intensity when repeated daily.",
  "You are building a machine that future you gets to drive.",
];

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

function resolveUnlockedVehicleIds(level: number) {
  return vehicles.filter((vehicle) => level >= vehicle.unlockLevel).map((vehicle) => vehicle.id);
}

function resolveNextVehicle(level: number) {
  return vehicles.find((vehicle) => vehicle.unlockLevel > level);
}

function randomQuote() {
  return celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set) => ({
      activeView: "timer",
      timerMode: "focus",
      timerSecondsLeft: 25 * 60,
      timerTotalSeconds: 25 * 60,
      timerRunning: false,
      sessionsCompletedInCycle: 1,
      totalPomodoros: starterSessions.length,
      streak: 27,
      xp: 1380,
      level: 12,
      tasks: starterTasks,
      notes: starterNotes,
      sessionLogs: starterSessions,
      settings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsBeforeLongBreak: 4,
        theme: "velocity",
        backgroundEffect: "racingLights",
      },
      completionModalOpen: false,
      completionReward: null,
      unlockedVehicleIds: resolveUnlockedVehicleIds(12),
      profile: {
        id: "local-driver",
        name: "Alex Mercer",
        username: "alexmercer",
        authProvider: "local",
      },
      socialEnabled: false,
      isDemoMode: false,
      setActiveView: (view) => set({ activeView: view }),
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
                : settingsToSeconds.longBreak(state.settings);
          const xpEarned = completedFocus ? 50 : 20;
          const nextXp = state.xp + xpEarned;
          const nextLevel = Math.min(100, Math.floor(nextXp / 120) + 1);
          const sessionLog: SessionLog = {
            id: crypto.randomUUID(),
            mode: state.timerMode,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            duration: Math.round(state.timerTotalSeconds / 60),
            xpEarned,
          };
          const unlockedVehicleIds = resolveUnlockedVehicleIds(nextLevel);
          const newlyUnlockedId = unlockedVehicleIds.find((id) => !state.unlockedVehicleIds.includes(id));
          const unlockedVehicle = vehicles.find((vehicle) => vehicle.id === newlyUnlockedId);
          const nextUnlock = resolveNextVehicle(nextLevel);

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
            totalPomodoros: completedFocus ? state.totalPomodoros + 1 : state.totalPomodoros,
            streak: completedFocus ? state.streak + 1 : state.streak,
            xp: nextXp,
            level: nextLevel,
            sessionLogs: [sessionLog, ...state.sessionLogs].slice(0, 180),
            completionModalOpen: true,
            completionReward: {
              xpEarned,
              currentStreak: completedFocus ? state.streak + 1 : state.streak,
              totalPomodoros: completedFocus ? state.totalPomodoros + 1 : state.totalPomodoros,
              nextUnlock,
              unlockedVehicle,
              quote: randomQuote(),
            },
            unlockedVehicleIds,
          };
        }),
      addTask: (title) =>
        set((state) => ({
          tasks: [
            {
              id: crypto.randomUUID(),
              title,
              completed: false,
              minutes: 25,
              energy: "medium",
            },
            ...state.tasks,
          ],
        })),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
          xp: state.tasks.find((task) => task.id === id && !task.completed) ? state.xp + 15 : state.xp,
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
      reorderTasks: (tasks) => set({ tasks }),
      addNote: () =>
        set((state) => ({
          notes: [
            {
              id: crypto.randomUUID(),
              title: "New strategy note",
              content: "## Quick capture\nRecord the next build insight while it is still hot.",
              tags: ["new"],
              updatedAt: new Date().toISOString(),
            },
            ...state.notes,
          ],
          activeView: "notes",
        })),
      updateNote: (id, patch) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note,
          ),
        })),
      setNotes: (notes) => set({ notes }),
      setSessionLogs: (logs) => set({ sessionLogs: logs }),
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
      enableSocialPreview: () =>
        set({
          socialEnabled: true,
          profile: {
            id: "preview-driver",
            name: "Alex Mercer",
            username: "futurebuilder",
            email: "alex@velocityos.app",
            avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=Alex",
            created_at: new Date().toISOString(),
            authProvider: "google",
          },
        }),
      activateDemoMode: () =>
        set({
          isDemoMode: true,
          socialEnabled: true,
          profile: {
            id: "demo-driver",
            name: "Demo Driver",
            username: "demo_driver",
            email: "demo@velocityos.app",
            avatar: "https://api.dicebear.com/9.x/shapes/svg?seed=VelocityOS",
            created_at: new Date().toISOString(),
            authProvider: "local",
          },
        }),
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "velocityos-store",
      partialize: (state) => ({
        activeView: state.activeView,
        timerMode: state.timerMode,
        timerSecondsLeft: state.timerSecondsLeft,
        timerTotalSeconds: state.timerTotalSeconds,
        sessionsCompletedInCycle: state.sessionsCompletedInCycle,
        totalPomodoros: state.totalPomodoros,
        streak: state.streak,
        xp: state.xp,
        level: state.level,
        tasks: state.tasks,
        notes: state.notes,
        sessionLogs: state.sessionLogs,
        settings: state.settings,
        unlockedVehicleIds: state.unlockedVehicleIds,
        profile: state.profile,
        socialEnabled: state.socialEnabled,
        isDemoMode: state.isDemoMode,
      }),
    },
  ),
);
