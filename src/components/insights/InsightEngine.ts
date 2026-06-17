import { DailyStat } from "../../types";

export interface Insight {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  description: string;
}

export function generateInsights(dailyStats: DailyStat[], currentStreak: number): Insight[] {
  const insights: Insight[] = [];

  if (dailyStats.length === 0) {
    insights.push({
      id: "no_data",
      type: "info",
      title: "System Initializing",
      description: "Complete your first focus sessions to begin generating analytics insights.",
    });
    return insights;
  }

  // 1. Calculate Peak Hour
  const hourlyTotals: Record<number, number> = {};
  dailyStats.forEach((stat) => {
    if (stat.hourlyActivity) {
      Object.entries(stat.hourlyActivity).forEach(([hourStr, mins]) => {
        const hour = parseInt(hourStr, 10);
        hourlyTotals[hour] = (hourlyTotals[hour] || 0) + mins;
      });
    }
  });

  let peakHour = -1;
  let peakMins = 0;
  Object.entries(hourlyTotals).forEach(([hourStr, mins]) => {
    const hour = parseInt(hourStr, 10);
    if (mins > peakMins) {
      peakMins = mins;
      peakHour = hour;
    }
  });

  if (peakHour !== -1) {
    const ampm = peakHour >= 12 ? "PM" : "AM";
    const displayHour = peakHour % 12 || 12;
    insights.push({
      id: "peak_hour",
      type: "success",
      title: "Peak Focus Window",
      description: `You are most productive around ${displayHour} ${ampm}, having logged ${peakMins} focus minutes in this slot.`,
    });
  }

  // 2. Calculate Strongest Day of Week
  const dayOfWeekTotals: Record<number, number> = {};
  dailyStats.forEach((stat) => {
    const d = new Date(stat.date + "T12:00:00");
    const day = d.getDay();
    dayOfWeekTotals[day] = (dayOfWeekTotals[day] || 0) + stat.focusTime;
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let strongestDayIdx = -1;
  let strongestDayMins = 0;
  Object.entries(dayOfWeekTotals).forEach(([dayStr, mins]) => {
    const day = parseInt(dayStr, 10);
    if (mins > strongestDayMins) {
      strongestDayMins = mins;
      strongestDayIdx = day;
    }
  });

  if (strongestDayIdx !== -1) {
    insights.push({
      id: "strongest_day",
      type: "success",
      title: "Dominant Day",
      description: `${dayNames[strongestDayIdx]} is your strongest day this month with ${strongestDayMins} total focus minutes.`,
    });
  }

  // 3. Streak Insights
  if (currentStreak > 0) {
    insights.push({
      id: "streak_momentum",
      type: "info",
      title: "Momentum Highlight",
      description: `Your active ${currentStreak}-day streak is maintaining high levels of neuro-performance. Keep it up!`,
    });
  }

  // 4. Session Preset Suggestion
  const sprints = dailyStats.reduce((sum, s) => sum + s.sessions, 0);
  const totalMins = dailyStats.reduce((sum, s) => sum + s.focusTime, 0);
  const avgSession = sprints > 0 ? Math.round(totalMins / sprints) : 0;

  if (avgSession > 35) {
    insights.push({
      id: "preset_suggestion",
      type: "info",
      title: "Flow State Profile",
      description: `Your average focus duration of ${avgSession}m suggests you excel at prolonged Deep Sprints. Consider locking in Deep Focus mode.`,
    });
  } else if (avgSession > 0) {
    insights.push({
      id: "preset_suggestion",
      type: "info",
      title: "Pomodoro Rhythm",
      description: `A steady ${avgSession}m average focus length matches the classic Pomodoro loop. It keeps your mental fatigue low.`,
    });
  }

  return insights;
}
