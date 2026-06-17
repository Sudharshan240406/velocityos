import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeId =
  | "default"
  | "cyber-neon"
  | "midnight-blue"
  | "sunset-purple"
  | "arctic-frost"
  | "ferrari-red"
  | "mclaren-orange"
  | "lamborghini-green";

export interface Theme {
  id: ThemeId;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  background: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  default: {
    id: "default",
    name: "FocusOS Default",
    primary: "#a855f7", // purple
    secondary: "#ec4899", // pink
    accent: "#06b6d4", // cyan
    glow: "rgba(168, 85, 247, 0.4)",
    background: "#050308",
  },
  "cyber-neon": {
    id: "cyber-neon",
    name: "Cyber Neon",
    primary: "#f43f5e", // rose
    secondary: "#d946ef", // fuchsia
    accent: "#06b6d4", // cyan
    glow: "rgba(244, 63, 94, 0.5)",
    background: "#020204",
  },
  "midnight-blue": {
    id: "midnight-blue",
    name: "Midnight Blue",
    primary: "#2563eb", // blue
    secondary: "#3b82f6", // lighter blue
    accent: "#60a5fa", // soft blue
    glow: "rgba(37, 99, 235, 0.4)",
    background: "#02040a",
  },
  "sunset-purple": {
    id: "sunset-purple",
    name: "Sunset Purple",
    primary: "#8b5cf6", // violet
    secondary: "#f43f5e", // rose
    accent: "#f59e0b", // amber
    glow: "rgba(139, 92, 246, 0.4)",
    background: "#06030c",
  },
  "arctic-frost": {
    id: "arctic-frost",
    name: "Arctic Frost",
    primary: "#14b8a6", // teal
    secondary: "#06b6d4", // cyan
    accent: "#93c5fd", // ice blue
    glow: "rgba(20, 184, 166, 0.4)",
    background: "#03080a",
  },
  "ferrari-red": {
    id: "ferrari-red",
    name: "Ferrari Red",
    primary: "#ef4444", // racing red
    secondary: "#b91c1c", // deep red
    accent: "#f59e0b", // racing yellow
    glow: "rgba(239, 68, 68, 0.5)",
    background: "#050102",
  },
  "mclaren-orange": {
    id: "mclaren-orange",
    name: "McLaren Orange",
    primary: "#f97316", // orange
    secondary: "#ea580c", // dark orange
    accent: "#3b82f6", // gulf blue
    glow: "rgba(249, 115, 22, 0.5)",
    background: "#040201",
  },
  "lamborghini-green": {
    id: "lamborghini-green",
    name: "Lamborghini Green",
    primary: "#22c55e", // lime green
    secondary: "#15803d", // dark green
    accent: "#eab308", // gold yellow
    glow: "rgba(34, 197, 94, 0.5)",
    background: "#010402",
  },
};

interface ThemeState {
  theme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "default",
      setTheme: (themeId) => {
        set({ theme: themeId });
        if (typeof window !== "undefined") {
          const selected = THEMES[themeId];
          const root = document.documentElement;
          root.style.setProperty("--color-primary", selected.primary);
          root.style.setProperty("--color-secondary", selected.secondary);
          root.style.setProperty("--color-accent", selected.accent);
          root.style.setProperty("--color-glow", selected.glow);
          root.style.setProperty("--color-bg", selected.background);
        }
      },
    }),
    {
      name: "focusos-theme-store",
    }
  )
);
