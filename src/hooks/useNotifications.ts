import { useEffect, useRef } from "react";
import { useFocusStore } from "../store/focusStore";

export function useNotifications() {
  const { notificationsEnabled } = useFocusStore();
  const permissionRef = useRef<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    permissionRef.current = Notification.permission;
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === "granted";
  };

  const notify = (title: string, body: string, icon = "/icons/icon-192x192.png") => {
    if (!notificationsEnabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      const n = new Notification(title, { body, icon, badge: "/icons/icon-192x192.png" });
      setTimeout(() => n.close(), 6000);
    } catch {
      // Notifications not supported in this context
    }
  };

  const notifySessionComplete = (presetName: string) => {
    notify(
      "🎯 Focus Session Complete!",
      `Great work! ${presetName} session done. Time for a break.`
    );
  };

  const notifyBreakComplete = () => {
    notify(
      "⏰ Break Over",
      "Ready to focus again? Your next session awaits."
    );
  };

  const notifyDailyGoal = (totalMinutes: number) => {
    notify(
      "🏆 Daily Goal Reached!",
      `You've focused for ${totalMinutes} minutes today. Amazing work!`
    );
  };

  return { requestPermission, notify, notifySessionComplete, notifyBreakComplete, notifyDailyGoal };
}
