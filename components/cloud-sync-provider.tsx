"use client";

import { useEffect, useMemo, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useFocusStore } from "@/stores/focus-store";
import { trackEvent } from "@/lib/analytics";
import type { Task, Note, ThemeMode, BackgroundEffect } from "@/lib/types";

// Retry helper with exponential backoff
async function executeWithRetry<T>(
  fn: () => PromiseLike<{ data: T | null; error: unknown } | { error: unknown }>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const res = await fn();
      if ("error" in res && res.error) {
        throw res.error;
      }
      return ("data" in res ? res.data : null) as T;
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  throw new Error("Sync operation failed after retries");
}

interface RemoteTask {
  id: string;
  title: string;
  completed: boolean;
  minutes: number;
  energy: "low" | "medium" | "high";
}

interface RemoteNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updated_at: string;
}

interface RemoteSession {
  id: string;
  mode: "focus" | "shortBreak" | "longBreak";
  started_at: string;
  completed_at: string;
  duration: number;
  xp_earned: number;
}

export function CloudSyncProvider() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const hasHydratedRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    tasks,
    notes,
    sessionLogs,
    settings,
    unlockedVehicleIds,
    xp,
    level,
    streak,
    profile,
    isDemoMode,
  } = useFocusStore();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user || hasHydratedRef.current) {
        return;
      }

      hasHydratedRef.current = true;
      const userId = session.user.id;

      if (session.user.app_metadata.provider === "google") {
        trackEvent("auth_oauth_success", { provider: "google" });
      }

      try {
        const [tasksData, notesData, settingsData, garageData, analyticsData, sessionsData] =
          await Promise.all([
            executeWithRetry<RemoteTask[]>(() =>
              supabase
                .from("tasks")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false }),
            ),
            executeWithRetry<RemoteNote[]>(() =>
              supabase
                .from("notes")
                .select("*")
                .eq("user_id", userId)
                .order("updated_at", { ascending: false }),
            ),
            executeWithRetry<{
              focus_minutes: number;
              short_break_minutes: number;
              long_break_minutes: number;
              sessions_before_long_break: number;
              theme: string;
              background_effect: string;
            } | null>(() =>
              supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle(),
            ),
            executeWithRetry<{
              level: number;
              xp: number;
              unlocked_vehicle_ids: string[];
            } | null>(() =>
              supabase.from("garage_progress").select("*").eq("user_id", userId).maybeSingle(),
            ),
            executeWithRetry<{
              level: number;
              xp: number;
              streak: number;
            } | null>(() =>
              supabase.from("analytics_snapshots").select("*").eq("user_id", userId).maybeSingle(),
            ),
            executeWithRetry<RemoteSession[]>(() =>
              supabase
                .from("session_history")
                .select("*")
                .eq("user_id", userId)
                .order("completed_at", { ascending: false }),
            ),
          ]);

        // Conflict Resolution - Merge tasks
        const localTasks = useFocusStore.getState().tasks;
        const remoteTasks = tasksData ?? [];
        const mergedTasksMap = new Map<string, Task>();
        remoteTasks.forEach((rt) => {
          mergedTasksMap.set(rt.id, {
            id: rt.id,
            title: rt.title,
            completed: rt.completed,
            minutes: rt.minutes,
            energy: rt.energy,
          });
        });
        localTasks.forEach((lt) => {
          mergedTasksMap.set(lt.id, lt);
        });

        // Conflict Resolution - Merge notes
        const localNotes = useFocusStore.getState().notes;
        const remoteNotes = notesData ?? [];
        const mergedNotesMap = new Map<string, Note>();
        remoteNotes.forEach((rn) => {
          mergedNotesMap.set(rn.id, {
            id: rn.id,
            title: rn.title,
            content: rn.content,
            tags: rn.tags,
            updatedAt: rn.updated_at,
          });
        });
        localNotes.forEach((ln) => {
          const existing = mergedNotesMap.get(ln.id);
          if (!existing || new Date(ln.updatedAt) > new Date(existing.updatedAt)) {
            mergedNotesMap.set(ln.id, ln);
          }
        });

        useFocusStore.setState((state) => ({
          ...state,
          tasks: Array.from(mergedTasksMap.values()),
          notes: Array.from(mergedNotesMap.values()),
          sessionLogs:
            sessionsData?.map((session) => ({
              id: session.id,
              mode: session.mode,
              startedAt: session.started_at,
              completedAt: session.completed_at,
              duration: session.duration,
              xpEarned: session.xp_earned,
            })) ?? state.sessionLogs,
          settings: settingsData
            ? {
                ...state.settings,
                focusMinutes: settingsData.focus_minutes,
                shortBreakMinutes: settingsData.short_break_minutes,
                longBreakMinutes: settingsData.long_break_minutes,
                sessionsBeforeLongBreak: settingsData.sessions_before_long_break,
                theme: settingsData.theme as ThemeMode,
                backgroundEffect: settingsData.background_effect as BackgroundEffect,
              }
            : state.settings,
          unlockedVehicleIds: garageData?.unlocked_vehicle_ids ?? state.unlockedVehicleIds,
          xp: garageData?.xp ?? analyticsData?.xp ?? state.xp,
          level: garageData?.level ?? analyticsData?.level ?? state.level,
          streak: analyticsData?.streak ?? state.streak,
        }));
      } catch (error) {
        trackEvent("sync_failure", {
          error: error instanceof Error ? error.message : "initial_load_failed",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || isDemoMode) {
      return;
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !navigator.onLine) {
          return;
        }

        const userId = user.id;

        // Perform Deletion Synchronization
        const remoteTasksList = await executeWithRetry<{ id: string }[]>(() =>
          supabase.from("tasks").select("id").eq("user_id", userId),
        );
        if (remoteTasksList) {
          const localTaskIds = new Set(tasks.map((t) => t.id));
          const tasksToDelete = remoteTasksList
            .filter((rt) => !localTaskIds.has(rt.id))
            .map((rt) => rt.id);
          if (tasksToDelete.length > 0) {
            await executeWithRetry(() =>
              supabase.from("tasks").delete().in("id", tasksToDelete),
            );
          }
        }

        const remoteNotesList = await executeWithRetry<{ id: string }[]>(() =>
          supabase.from("notes").select("id").eq("user_id", userId),
        );
        if (remoteNotesList) {
          const localNoteIds = new Set(notes.map((n) => n.id));
          const notesToDelete = remoteNotesList
            .filter((rn) => !localNoteIds.has(rn.id))
            .map((rn) => rn.id);
          if (notesToDelete.length > 0) {
            await executeWithRetry(() =>
              supabase.from("notes").delete().in("id", notesToDelete),
            );
          }
        }

        // Core data upserts
        await Promise.all([
          executeWithRetry(() =>
            supabase.from("profiles").upsert({
              id: userId,
              username: profile.username ?? profile.name.toLowerCase().replace(/\s+/g, "_"),
              avatar: profile.avatar ?? null,
              level,
              xp,
              streak,
            }),
          ),
          executeWithRetry(() =>
            supabase.from("user_settings").upsert({
              user_id: userId,
              focus_minutes: settings.focusMinutes,
              short_break_minutes: settings.shortBreakMinutes,
              long_break_minutes: settings.longBreakMinutes,
              sessions_before_long_break: settings.sessionsBeforeLongBreak,
              theme: settings.theme,
              background_effect: settings.backgroundEffect,
            }),
          ),
          executeWithRetry(() =>
            supabase.from("garage_progress").upsert({
              user_id: userId,
              level,
              xp,
              unlocked_vehicle_ids: unlockedVehicleIds,
            }),
          ),
          executeWithRetry(() =>
            supabase.from("analytics_snapshots").upsert({
              user_id: userId,
              level,
              xp,
              streak,
              weekly_minutes: sessionLogs.slice(0, 7).reduce((sum, session) => sum + session.duration, 0),
              total_pomodoros: sessionLogs.length,
            }),
          ),
        ]);

        // Lists upserts
        if (tasks.length > 0) {
          await executeWithRetry(() =>
            supabase.from("tasks").upsert(
              tasks.map((task) => ({
                id: task.id,
                user_id: userId,
                title: task.title,
                completed: task.completed,
                minutes: task.minutes,
                energy: task.energy,
              })),
            ),
          );
        }

        if (notes.length > 0) {
          await executeWithRetry(() =>
            supabase.from("notes").upsert(
              notes.map((note) => ({
                id: note.id,
                user_id: userId,
                title: note.title,
                content: note.content,
                tags: note.tags,
                updated_at: note.updatedAt,
              })),
            ),
          );
        }

        if (sessionLogs.length > 0) {
          await executeWithRetry(() =>
            supabase.from("session_history").upsert(
              sessionLogs.map((session) => ({
                id: session.id,
                user_id: userId,
                mode: session.mode,
                started_at: session.startedAt,
                completed_at: session.completedAt,
                duration: session.duration,
                xp_earned: session.xpEarned,
              })),
            ),
          );
        }
      } catch (error) {
        trackEvent("sync_failure", {
          error: error instanceof Error ? error.message : "sync_write_failed",
        });
      }
    }, 800);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    supabase,
    tasks,
    notes,
    sessionLogs,
    settings,
    unlockedVehicleIds,
    xp,
    level,
    streak,
    profile,
    isDemoMode,
  ]);

  return null;
}
