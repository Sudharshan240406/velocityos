import { subDays } from "date-fns";
import type { BackgroundEffect, Note, SessionLog, Task, ThemeMode, Vehicle } from "./types";

export const navItems = [
  { id: "timer", label: "Velocity Mode" },
  { id: "dashboard", label: "Dashboard" },
  { id: "tasks", label: "Tasks" },
  { id: "analytics", label: "Analytics" },
  { id: "garage", label: "My Garage" },
  { id: "coach", label: "AI Driver Coach" },
  { id: "notes", label: "Notes" },
  { id: "social", label: "Social" },
  { id: "settings", label: "Settings" },
] as const;

export const themeMarketplace: { id: ThemeMode; label: string; description: string }[] = [
  { id: "velocity", label: "Velocity Mode", description: "Formula-inspired telemetry cockpit." },
  { id: "cyberpunk", label: "Cyberpunk Mode", description: "Hot neon saturation with saturated UI glow." },
  { id: "aurora", label: "Aurora Mode", description: "Polar gradients and cooler depth lighting." },
  { id: "space", label: "Space Mode", description: "Orbital contrast and constellation accents." },
  { id: "racing", label: "Racing Mode", description: "Track-day redline palette with motion streaks." },
];

export const backgroundEffects: { id: BackgroundEffect; label: string }[] = [
  { id: "aurora", label: "Aurora" },
  { id: "stars", label: "Stars" },
  { id: "racingLights", label: "Racing Lights" },
  { id: "cyberGrid", label: "Cyber Grid" },
  { id: "rain", label: "Rain" },
  { id: "neonParticles", label: "Neon Particles" },
];

export const vehicles: Vehicle[] = [
  { id: "city-hatch", name: "City Hatchback", unlockLevel: 1, speed: 42, control: 81, boost: 21, className: "Starter", description: "Reliable first ride for city sprint sessions." },
  { id: "sedan", name: "Sedan", unlockLevel: 5, speed: 55, control: 77, boost: 34, className: "Urban", description: "Balanced commuter for smooth daily focus loops." },
  { id: "sports-sedan", name: "Sports Sedan", unlockLevel: 10, speed: 68, control: 79, boost: 51, className: "Sport", description: "Sharp acceleration for longer knowledge work runs." },
  { id: "muscle-car", name: "Muscle Car", unlockLevel: 15, speed: 74, control: 63, boost: 70, className: "Power", description: "Big reward energy for milestone-heavy days." },
  { id: "track-car", name: "Track Car", unlockLevel: 20, speed: 81, control: 88, boost: 75, className: "Track", description: "Precision tuned for elite consistency." },
  { id: "supercar", name: "Supercar", unlockLevel: 30, speed: 91, control: 84, boost: 89, className: "Exotic", description: "Pure deep-work theatre with premium telemetry." },
  { id: "hypercar", name: "Hypercar", unlockLevel: 40, speed: 97, control: 91, boost: 95, className: "Hyper", description: "Reserved for unstoppable builders with streak discipline." },
  { id: "concept-car", name: "Concept Car", unlockLevel: 50, speed: 100, control: 100, boost: 100, className: "Concept", description: "The future icon unlocked by extreme focus mastery." },
];

export const starterTasks: Task[] = [
  { id: "task-1", title: "Ship VelocityOS landing page polish", completed: false, minutes: 45, energy: "high" },
  { id: "task-2", title: "Refine AI Driver Coach insights", completed: true, minutes: 20, energy: "medium" },
  { id: "task-3", title: "Plan next unlock milestone sprint", completed: false, minutes: 30, energy: "low" },
];

export const starterNotes: Note[] = [
  {
    id: "note-1",
    title: "Launch ritual",
    content: "## Garage warm-up\n- Clear your dashboard\n- Pick one high-impact mission\n- Start the engine with a 25 minute sprint",
    tags: ["routine", "velocity"],
    updatedAt: new Date().toISOString(),
  },
];

export const starterSessions: SessionLog[] = Array.from({ length: 28 }, (_, index) => {
  const date = subDays(new Date(), index);
  const duration = 25 + ((index % 4) * 5);
  return {
    id: `session-${index}`,
    mode: "focus",
    startedAt: date.toISOString(),
    completedAt: date.toISOString(),
    duration,
    xpEarned: Math.round(duration * 2),
  };
});
