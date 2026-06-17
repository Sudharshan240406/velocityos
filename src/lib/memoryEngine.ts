/**
 * AI Memory Engine — Phase 8
 * Persists, retrieves, and analyzes user behavior patterns locally.
 * All data stored in localStorage under 'velocityos-memory'.
 */

export interface MemoryEvent {
  id: string;
  type:
    | "session_complete"
    | "mode_switch"
    | "task_added"
    | "achievement_unlock"
    | "command_issued"
    | "music_changed"
    | "break_taken";
  payload: Record<string, unknown>;
  timestamp: number; // epoch ms
  day: string; // YYYY-MM-DD
  hour: number; // 0–23
}

export interface MemoryInsight {
  type: "peak_hour" | "best_mode" | "streak_pattern" | "music_preference" | "session_length";
  label: string;
  value: string;
  confidence: number; // 0–1
  icon: string;
}

const MEMORY_KEY = "velocityos-memory";
const MAX_EVENTS = 500;

function today(): string {
  return new Date().toLocaleDateString("en-CA");
}

function currentHour(): number {
  return new Date().getHours();
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Storage helpers ──────────────────────────────────────────────────────────

function loadEvents(): MemoryEvent[] {
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    return raw ? (JSON.parse(raw) as MemoryEvent[]) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: MemoryEvent[]): void {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // localStorage may be full — drop oldest 100 events
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(events.slice(-400)));
    } catch {
      // ignore
    }
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export function recordEvent(
  type: MemoryEvent["type"],
  payload: Record<string, unknown> = {}
): void {
  const events = loadEvents();
  const event: MemoryEvent = {
    id: uuid(),
    type,
    payload,
    timestamp: Date.now(),
    day: today(),
    hour: currentHour(),
  };
  saveEvents([...events, event]);
}

export function getAllEvents(): MemoryEvent[] {
  return loadEvents();
}

export function getRecentEvents(limit = 20): MemoryEvent[] {
  const events = loadEvents();
  return events.slice(-limit).reverse();
}

export function clearMemory(): void {
  localStorage.removeItem(MEMORY_KEY);
}

// ── Analytics & Insights ─────────────────────────────────────────────────────

/**
 * Compute which hour has the most focus sessions.
 */
function computePeakHour(events: MemoryEvent[]): MemoryInsight | null {
  const sessions = events.filter((e) => e.type === "session_complete");
  if (sessions.length < 3) return null;

  const hourCounts: Record<number, number> = {};
  sessions.forEach((e) => {
    hourCounts[e.hour] = (hourCounts[e.hour] || 0) + 1;
  });

  const peak = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (!peak) return null;

  const hour = parseInt(peak[0]);
  const label = `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
  return {
    type: "peak_hour",
    label: "Peak Focus Hour",
    value: label,
    confidence: Math.min(0.99, sessions.length * 0.08),
    icon: "⏰",
  };
}

/**
 * Detect the most-used study mode.
 */
function computeBestMode(events: MemoryEvent[]): MemoryInsight | null {
  const modes = events.filter((e) => e.type === "mode_switch");
  if (modes.length < 2) return null;

  const modeCounts: Record<string, number> = {};
  modes.forEach((e) => {
    const mode = e.payload.mode as string;
    if (mode) modeCounts[mode] = (modeCounts[mode] || 0) + 1;
  });

  const best = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;

  return {
    type: "best_mode",
    label: "Favourite Study Mode",
    value: best[0],
    confidence: Math.min(0.95, modes.length * 0.12),
    icon: "🎯",
  };
}

/**
 * Detect preferred music track.
 */
function computeMusicPreference(events: MemoryEvent[]): MemoryInsight | null {
  const music = events.filter((e) => e.type === "music_changed");
  if (music.length < 2) return null;

  const counts: Record<string, number> = {};
  music.forEach((e) => {
    const track = e.payload.track as string;
    if (track) counts[track] = (counts[track] || 0) + 1;
  });

  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!best) return null;

  return {
    type: "music_preference",
    label: "Preferred Music",
    value: best[0],
    confidence: Math.min(0.93, music.length * 0.1),
    icon: "🎵",
  };
}

/**
 * Estimate average session duration from session completion events.
 */
function computeSessionLength(events: MemoryEvent[]): MemoryInsight | null {
  const sessions = events.filter(
    (e) => e.type === "session_complete" && typeof e.payload.durationMinutes === "number"
  );
  if (sessions.length < 2) return null;

  const avg = Math.round(
    sessions.reduce((acc, e) => acc + (e.payload.durationMinutes as number), 0) / sessions.length
  );

  return {
    type: "session_length",
    label: "Avg Session Length",
    value: `${avg} min`,
    confidence: Math.min(0.97, sessions.length * 0.1),
    icon: "⏱",
  };
}

/**
 * Compute streak pattern — how consistent the user is.
 */
function computeStreakPattern(events: MemoryEvent[]): MemoryInsight | null {
  const sessions = events.filter((e) => e.type === "session_complete");
  if (sessions.length < 5) return null;

  const days = [...new Set(sessions.map((e) => e.day))].sort();
  const totalDays = days.length;
  const spanDays =
    totalDays > 1
      ? Math.ceil(
          (new Date(days[days.length - 1]).getTime() - new Date(days[0]).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 1;

  const consistency = Math.round((totalDays / spanDays) * 100);
  let label = "Sporadic";
  if (consistency > 80) label = "Elite";
  else if (consistency > 60) label = "Consistent";
  else if (consistency > 40) label = "Growing";

  return {
    type: "streak_pattern",
    label: "Focus Consistency",
    value: `${label} (${consistency}%)`,
    confidence: Math.min(0.95, sessions.length * 0.05),
    icon: "🔥",
  };
}

/**
 * Run all insight engines and return valid insights sorted by confidence.
 */
export function generateInsights(): MemoryInsight[] {
  const events = loadEvents();
  const candidates = [
    computePeakHour(events),
    computeBestMode(events),
    computeMusicPreference(events),
    computeSessionLength(events),
    computeStreakPattern(events),
  ];

  return candidates
    .filter((i): i is MemoryInsight => i !== null)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get today's summary.
 */
export function getTodaySummary(): {
  sessionsToday: number;
  focusMinutesToday: number;
  commandsToday: number;
  tasksAddedToday: number;
} {
  const events = loadEvents();
  const todayStr = today();
  const todayEvents = events.filter((e) => e.day === todayStr);

  return {
    sessionsToday: todayEvents.filter((e) => e.type === "session_complete").length,
    focusMinutesToday: todayEvents
      .filter((e) => e.type === "session_complete")
      .reduce((acc, e) => acc + ((e.payload.durationMinutes as number) || 0), 0),
    commandsToday: todayEvents.filter((e) => e.type === "command_issued").length,
    tasksAddedToday: todayEvents.filter((e) => e.type === "task_added").length,
  };
}
