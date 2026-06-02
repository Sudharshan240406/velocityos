export type PresetName = "Sprint" | "Deep Sprint" | "Redline Run";

export interface Preset {
  name: PresetName;
  focusDuration: number; // in seconds
  breakDuration: number; // in seconds
}

export type TimerMode = "focus" | "break";
export type TimerStatus = "idle" | "running" | "paused";

export interface DailyStat {
  date: string; // YYYY-MM-DD
  focusTime: number; // in minutes
  sessions: number;
  hourlyActivity?: Record<number, number>; // hour -> minutes
}

export type MusicTrack = "LoFi" | "Rain" | "Forest";

export type WallpaperType =
  | "aurora"
  | "cybercity"
  | "f1garage"
  | "neontokyo"
  | "spacenebula";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO date string
  unlocked: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  sessionsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  achievements: Achievement[];
  lastUnlocked: string | null; // achievement id for animation trigger

  // Actions
  addXP: (amount: number) => void;
  incrementSession: (presetName: PresetName) => void;
  updateStreak: (streak: number) => void;
  checkAndUnlockAchievements: () => void;
  clearLastUnlocked: () => void;
}

export interface FocusState {
  // Presets
  presets: Record<PresetName, Preset>;
  currentPreset: PresetName;

  // Timer State
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;

  // Stats
  streak: number;
  sessionsCompleted: number;
  totalFocusTime: number; // in minutes
  dailyStats: DailyStat[];
  lastActiveDate: string | null;

  // Music State
  currentTrack: MusicTrack;
  volume: number; // 0 to 1
  isMusicPlaying: boolean;

  // Settings
  wallpaper: WallpaperType;
  notificationsEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;

  // Actions
  setPreset: (name: PresetName) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimeLeft: (time: number) => void;
  tick: () => void;
  completeSession: () => void;
  setMusicTrack: (track: MusicTrack) => void;
  setVolume: (volume: number) => void;
  toggleMusic: () => void;
  setWallpaper: (wallpaper: WallpaperType) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setAutoStartBreaks: (enabled: boolean) => void;
  setAutoStartFocus: (enabled: boolean) => void;
}
