import { format, isToday, parseISO, subDays } from "date-fns";
import { vehicles } from "@/lib/data";
import type { SessionLog } from "@/lib/types";

export function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function buildDailyData(logs: SessionLog[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const day = subDays(new Date(), 6 - index);
    const dayLogs = logs.filter((log) => {
      const parsed = parseISO(log.completedAt);
      return format(parsed, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
    });

    return {
      day: format(day, "EEE"),
      minutes: dayLogs.reduce((sum, log) => sum + log.duration, 0),
      sessions: dayLogs.length,
    };
  });
}

export function buildMonthlyTrend(logs: SessionLog[]) {
  return Array.from({ length: 4 }, (_, index) => {
    const label = `W${index + 1}`;
    const chunk = logs.slice(index * 7, index * 7 + 7);
    return {
      week: label,
      focus: chunk.reduce((sum, log) => sum + log.duration, 0),
      xp: chunk.reduce((sum, log) => sum + log.xpEarned, 0),
    };
  }).reverse();
}

export function getTodayMinutes(logs: SessionLog[]) {
  return logs.filter((log) => isToday(parseISO(log.completedAt))).reduce((sum, log) => sum + log.duration, 0);
}

export function getCurrentVehicle(level: number) {
  return [...vehicles].reverse().find((vehicle) => level >= vehicle.unlockLevel) ?? vehicles[0];
}
