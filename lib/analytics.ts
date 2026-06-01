"use client";

import { track } from "@vercel/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type AnalyticsEvent =
  | "user_signup"
  | "login"
  | "session_start"
  | "session_complete"
  | "achievement_unlock"
  | "garage_unlock"
  | "ai_coach_usage"
  | "theme_usage"
  | "demo_started"
  | "auth_oauth_success"
  | "auth_failure"
  | "sync_failure";

export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean | null>,
) {
  track(event, properties);

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, properties ?? {});
  }
}

export function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_location: url,
      page_path: new URL(url).pathname,
    });
  }
}
