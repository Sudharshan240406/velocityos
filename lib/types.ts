export type TimerMode = "focus" | "shortBreak" | "longBreak";

export type AppView =
  | "timer"
  | "dashboard"
  | "tasks"
  | "analytics"
  | "garage"
  | "coach"
  | "notes"
  | "social"
  | "settings";

export type ThemeMode =
  | "velocity"
  | "cyberpunk"
  | "aurora"
  | "space"
  | "racing";

export type BackgroundEffect =
  | "aurora"
  | "stars"
  | "racingLights"
  | "cyberGrid"
  | "rain"
  | "neonParticles";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  minutes: number;
  energy: "low" | "medium" | "high";
};

export type SessionLog = {
  id: string;
  mode: TimerMode;
  startedAt: string;
  completedAt: string;
  duration: number;
  xpEarned: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
};

export type Vehicle = {
  id: string;
  name: string;
  unlockLevel: number;
  speed: number;
  control: number;
  boost: number;
  className: string;
  description: string;
};

export type UserProfile = {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  created_at?: string;
  authProvider: "local" | "google" | "supabase";
};
