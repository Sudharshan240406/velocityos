/**
 * JARVIS NL Command Router — Phase 10
 * Modular natural language command parser that routes intent to VelocityOS actions.
 */

export type JarvisAction =
  | { type: "TIMER_START" }
  | { type: "TIMER_PAUSE" }
  | { type: "TIMER_RESET" }
  | { type: "TIMER_SKIP" }
  | { type: "MODE_STUDY"; mode: string }
  | { type: "NAV_STATS" }
  | { type: "NAV_ACHIEVEMENTS" }
  | { type: "NAV_MUSIC" }
  | { type: "NAV_AUTO" }
  | { type: "NAV_COPILOT" }
  | { type: "TASK_ADD"; text: string }
  | { type: "MUSIC_PLAY" }
  | { type: "MUSIC_PAUSE" }
  | { type: "MUSIC_TRACK"; track: string }
  | { type: "WALLPAPER_OPEN" }
  | { type: "SETTINGS_OPEN" }
  | { type: "SYNC_EXPORT" }
  | { type: "SYNC_IMPORT" }
  | { type: "HELP" }
  | { type: "UNKNOWN"; input: string };

export interface JarvisResult {
  action: JarvisAction;
  confidence: number; // 0–1
  reply: string;
}

interface IntentPattern {
  patterns: RegExp[];
  action: (m: RegExpMatchArray | null, input: string) => JarvisAction;
  reply: (input: string) => string;
  confidence: number;
}

const INTENT_MAP: IntentPattern[] = [
  // Timer controls
  {
    patterns: [/start (focus|timer|session)/i, /begin (focus|session)/i, /let('s| us) (go|start)/i],
    action: () => ({ type: "TIMER_START" }),
    reply: () => "🚀 Focus session initiated. Stay locked in.",
    confidence: 0.97,
  },
  {
    patterns: [/pause (focus|timer|session)/i, /stop timer/i, /hold on/i, /freeze timer/i],
    action: () => ({ type: "TIMER_PAUSE" }),
    reply: () => "⏸ Session paused. Breathe.",
    confidence: 0.95,
  },
  {
    patterns: [/reset (focus|timer|session)/i, /restart timer/i, /clear timer/i],
    action: () => ({ type: "TIMER_RESET" }),
    reply: () => "🔄 Timer reset to default.",
    confidence: 0.95,
  },
  {
    patterns: [/skip (break|session)/i, /next (session|round)/i],
    action: () => ({ type: "TIMER_SKIP" }),
    reply: () => "⏭ Skipping to next phase.",
    confidence: 0.9,
  },
  // Study modes
  {
    patterns: [/gate mode/i, /activate gate/i],
    action: () => ({ type: "MODE_STUDY", mode: "GATE Mode" }),
    reply: () => "🎯 GATE Mode activated. 45-minute high-intensity sessions configured.",
    confidence: 0.98,
  },
  {
    patterns: [/coding mode/i, /activate cod(ing|e)/i, /dev mode/i],
    action: () => ({ type: "MODE_STUDY", mode: "Coding Mode" }),
    reply: () => "💻 Coding Mode on. 60-minute programming sprints ready.",
    confidence: 0.98,
  },
  {
    patterns: [/project mode/i, /activate project/i, /deep work/i],
    action: () => ({ type: "MODE_STUDY", mode: "Project Mode" }),
    reply: () => "🏗 Project Mode on. 90-minute architecture blocks loaded.",
    confidence: 0.98,
  },
  {
    patterns: [/revision mode/i, /activate revision/i, /review mode/i],
    action: () => ({ type: "MODE_STUDY", mode: "Revision Mode" }),
    reply: () => "📚 Revision Mode on. 25-minute recall cycles active.",
    confidence: 0.98,
  },
  // Navigation
  {
    patterns: [/(show|open|go to|navigate to|view) (stats|statistics|analytics)/i],
    action: () => ({ type: "NAV_STATS" }),
    reply: () => "📊 Navigating to Analytics dashboard.",
    confidence: 0.93,
  },
  {
    patterns: [/(show|open|go to) achievement/i, /my badges/i, /my awards/i],
    action: () => ({ type: "NAV_ACHIEVEMENTS" }),
    reply: () => "🏆 Opening Achievements.",
    confidence: 0.93,
  },
  {
    patterns: [/(show|open|go to|play) music/i, /open spotify/i, /music panel/i],
    action: () => ({ type: "NAV_MUSIC" }),
    reply: () => "🎵 Opening Music panel.",
    confidence: 0.92,
  },
  {
    patterns: [/(show|open|go to) (auto|automotive|car|vehicle)/i],
    action: () => ({ type: "NAV_AUTO" }),
    reply: () => "🚗 Opening Automotive panel.",
    confidence: 0.92,
  },
  {
    patterns: [/(show|open|go to) (copilot|ai assistant|assistant)/i],
    action: () => ({ type: "NAV_COPILOT" }),
    reply: () => "🧠 Opening AI Copilot.",
    confidence: 0.92,
  },
  // Task management
  {
    patterns: [/add task[: ]?(.+)/i, /create task[: ]?(.+)/i, /remind me to (.+)/i, /schedule (.+)/i],
    action: (m, input) => {
      const text = m?.[1]?.trim() || input.replace(/add task|create task|remind me to|schedule/i, "").trim();
      return { type: "TASK_ADD", text };
    },
    reply: (input) => {
      const text = input.replace(/add task|create task|remind me to|schedule/i, "").trim();
      return `✅ Task queued: "${text}"`;
    },
    confidence: 0.9,
  },
  // Music
  {
    patterns: [/(play|resume) music/i, /turn on music/i],
    action: () => ({ type: "MUSIC_PLAY" }),
    reply: () => "🎶 Music resumed.",
    confidence: 0.9,
  },
  {
    patterns: [/(pause|stop|mute) music/i, /turn off music/i],
    action: () => ({ type: "MUSIC_PAUSE" }),
    reply: () => "🔇 Music paused.",
    confidence: 0.9,
  },
  {
    patterns: [/play (lofi|lo-fi)/i, /switch to lofi/i],
    action: () => ({ type: "MUSIC_TRACK", track: "LoFi" }),
    reply: () => "🎵 Switched to LoFi beats.",
    confidence: 0.93,
  },
  {
    patterns: [/play rain/i, /switch to rain/i, /rain sounds/i],
    action: () => ({ type: "MUSIC_TRACK", track: "Rain" }),
    reply: () => "🌧 Rain ambiance activated.",
    confidence: 0.93,
  },
  {
    patterns: [/play (forest|nature)/i, /forest sounds/i],
    action: () => ({ type: "MUSIC_TRACK", track: "Forest" }),
    reply: () => "🌲 Forest sounds playing.",
    confidence: 0.93,
  },
  {
    patterns: [/play ocean/i, /ocean sounds/i, /beach sounds/i],
    action: () => ({ type: "MUSIC_TRACK", track: "Ocean" }),
    reply: () => "🌊 Ocean waves activated.",
    confidence: 0.93,
  },
  {
    patterns: [/play night/i, /night ambiance/i],
    action: () => ({ type: "MUSIC_TRACK", track: "Night" }),
    reply: () => "🌙 Night ambiance on.",
    confidence: 0.93,
  },
  // Settings & sync
  {
    patterns: [/(open|show|go to) (wallpaper|background)/i, /change wallpaper/i],
    action: () => ({ type: "WALLPAPER_OPEN" }),
    reply: () => "🖼 Wallpaper selector opened.",
    confidence: 0.9,
  },
  {
    patterns: [/(open|show) settings/i, /settings panel/i],
    action: () => ({ type: "SETTINGS_OPEN" }),
    reply: () => "⚙️ Settings opened.",
    confidence: 0.9,
  },
  {
    patterns: [/(export|save|backup|sync) (profile|data|settings)/i, /download profile/i],
    action: () => ({ type: "SYNC_EXPORT" }),
    reply: () => "💾 Exporting profile data.",
    confidence: 0.9,
  },
  {
    patterns: [/(import|load|restore) (profile|data|settings)/i],
    action: () => ({ type: "SYNC_IMPORT" }),
    reply: () => "📂 Import dialog opened.",
    confidence: 0.9,
  },
  // Help
  {
    patterns: [/help/i, /what can you do/i, /commands/i, /jarvis help/i],
    action: () => ({ type: "HELP" }),
    reply: () =>
      "💡 JARVIS understands: start/pause/reset timer, activate study modes, navigate panels, add tasks, control music, and sync profiles.",
    confidence: 0.99,
  },
];

/**
 * Parse natural language input and return the best matching action.
 */
export function parseJarvisCommand(input: string): JarvisResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      action: { type: "UNKNOWN", input: trimmed },
      confidence: 0,
      reply: "Please say something. Try 'start focus' or 'help'.",
    };
  }

  for (const intent of INTENT_MAP) {
    for (const pattern of intent.patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return {
          action: intent.action(match, trimmed),
          confidence: intent.confidence,
          reply: intent.reply(trimmed),
        };
      }
    }
  }

  // Fuzzy fallback: tokenize and score
  const tokens = trimmed.toLowerCase().split(/\s+/);
  if (tokens.some((t) => ["start", "go", "begin", "run"].includes(t))) {
    return {
      action: { type: "TIMER_START" },
      confidence: 0.6,
      reply: "🚀 Guessing you want to start the timer. Starting now.",
    };
  }
  if (tokens.some((t) => ["stop", "pause", "hold"].includes(t))) {
    return {
      action: { type: "TIMER_PAUSE" },
      confidence: 0.6,
      reply: "⏸ Pausing timer.",
    };
  }

  return {
    action: { type: "UNKNOWN", input: trimmed },
    confidence: 0,
    reply: `I didn't understand "${trimmed}". Try saying 'help' to see available commands.`,
  };
}
