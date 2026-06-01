"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BrainCircuit,
  CarFront,
  Gauge,
  Home,
  LayoutDashboard,
  NotebookPen,
  Settings2,
  Signal,
  Users,
  Wrench,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { loadNotes, loadSessions, saveNotes, saveSessions } from "@/lib/idb";
import { trackEvent } from "@/lib/analytics";
import { backgroundEffects, navItems } from "@/lib/data";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildDailyData, buildMonthlyTrend, formatTimer, getCurrentVehicle, getGreeting, getTodayMinutes } from "@/lib/velocity-utils";
import { useSoundscape } from "@/hooks/use-soundscape";
import { useFocusStore } from "@/stores/focus-store";
import { BackgroundEffects } from "@/components/velocity/background-effects";
import { GlassCard, StatCard } from "@/components/velocity/ui";
import type { AppView, UserProfile } from "@/lib/types";

const TimerPanel = dynamic(() => import("./sections/timer-panel").then((mod) => mod.TimerPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Booting telemetry dashboard" />,
});
const DashboardPanel = dynamic(() => import("./sections/dashboard-panel").then((mod) => mod.DashboardPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading dashboard" />,
});
const TasksPanel = dynamic(() => import("./sections/tasks-panel").then((mod) => mod.TasksPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading task controls" />,
});
const AnalyticsPanel = dynamic(() => import("./sections/analytics-panel").then((mod) => mod.AnalyticsPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading analytics" />,
});
const GaragePanel = dynamic(() => import("./sections/garage-panel").then((mod) => mod.GaragePanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading garage" />,
});
const CoachPanel = dynamic(() => import("./sections/coach-panel").then((mod) => mod.CoachPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading AI Driver Coach" />,
});
const NotesPanel = dynamic(() => import("./sections/notes-panel").then((mod) => mod.NotesPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading notes" />,
});
const SocialPanel = dynamic(() => import("./sections/social-panel").then((mod) => mod.SocialPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading social systems" />,
});
const SettingsPanel = dynamic(() => import("./sections/settings-panel").then((mod) => mod.SettingsPanel), {
  ssr: false,
  loading: () => <SectionLoading label="Loading settings" />,
});
const CompletionOverlay = dynamic(
  () => import("./sections/completion-overlay").then((mod) => mod.CompletionOverlay),
  { ssr: false },
);
const CloudSyncProvider = dynamic(
  () => import("@/components/cloud-sync-provider").then((mod) => mod.CloudSyncProvider),
  { ssr: false },
);

const navIcons = {
  timer: Gauge,
  dashboard: LayoutDashboard,
  tasks: Wrench,
  analytics: Signal,
  garage: CarFront,
  coach: BrainCircuit,
  notes: NotebookPen,
  social: Users,
  settings: Settings2,
} satisfies Record<AppView, React.ComponentType<{ className?: string }>>;

export function WorkspaceShell({
  demoMode = false,
  userProfile = null,
}: {
  demoMode?: boolean;
  userProfile?: UserProfile | null;
}) {
  const router = useRouter();
  const {
    activeView,
    timerMode,
    timerSecondsLeft,
    timerTotalSeconds,
    timerRunning,
    sessionsCompletedInCycle,
    totalPomodoros,
    streak,
    xp,
    level,
    tasks,
    notes,
    sessionLogs,
    settings,
    completionModalOpen,
    completionReward,
    unlockedVehicleIds,
    profile,
    socialEnabled,
    isDemoMode,
    setActiveView,
    setTimerMode,
    tick,
    startTimer,
    pauseTimer,
    resetTimer,
    skipSession,
    completeSession,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    addNote,
    updateNote,
    setNotes,
    setSessionLogs,
    updateSettings,
    closeCompletionModal,
    enableSocialPreview,
    activateDemoMode,
    setProfile,
  } = useFocusStore();
  const { enabled, setEnabled, track, setTrack, volume, setVolume, playSuccess } = useSoundscape();
  const [taskInput, setTaskInput] = useState("");
  const [activeNoteId, setActiveNoteId] = useState(notes[0]?.id ?? "");
  const [noteSearch, setNoteSearch] = useState("");
  const deferredNoteSearch = useDeferredValue(noteSearch);
  const [widgetMinimized, setWidgetMinimized] = useState(false);
  const [widgetPosition, setWidgetPosition] = useState({ x: 24, y: 24 });
  const completionHandledRef = useRef(false);
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  const dailyData = useMemo(() => buildDailyData(sessionLogs), [sessionLogs]);
  const monthlyData = useMemo(() => buildMonthlyTrend(sessionLogs), [sessionLogs]);
  const totalMinutesToday = useMemo(() => getTodayMinutes(sessionLogs), [sessionLogs]);
  const weeklyMinutes = useMemo(() => dailyData.reduce((sum, item) => sum + item.minutes, 0), [dailyData]);
  const productivityScore = Math.min(100, Math.round((weeklyMinutes / 600) * 100));
  const focusScore = Math.min(100, Math.round((streak / 30) * 100));
  const currentVehicle = useMemo(() => getCurrentVehicle(level), [level]);
  const filteredNotes = useMemo(() => {
    if (!deferredNoteSearch.trim()) {
      return notes;
    }

    const query = deferredNoteSearch.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [deferredNoteSearch, notes]);
  const activeNote = notes.find((note) => note.id === activeNoteId) ?? notes[0];
  const progress = timerTotalSeconds === 0 ? 0 : 1 - timerSecondsLeft / timerTotalSeconds;

  useEffect(() => {
    if (demoMode && !isDemoMode) {
      activateDemoMode();
    }
  }, [activateDemoMode, demoMode, isDemoMode]);

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [setProfile, userProfile]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      tick();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    if (timerSecondsLeft === 0 && !completionHandledRef.current) {
      completionHandledRef.current = true;
      completeSession();
      playSuccess();
      trackEvent("session_complete", {
        mode: timerMode,
      });
      return;
    }

    if (timerSecondsLeft > 0) {
      completionHandledRef.current = false;
    }
  }, [completeSession, playSuccess, timerMode, timerSecondsLeft]);

  useEffect(() => {
    if (activeView === "coach") {
      trackEvent("ai_coach_usage", { source: "workspace" });
    }
  }, [activeView]);

  useEffect(() => {
    if (completionReward?.unlockedVehicle) {
      trackEvent("garage_unlock", {
        vehicle: completionReward.unlockedVehicle.name,
      });
    }

    if (completionReward && completionReward.currentStreak % 7 === 0) {
      trackEvent("achievement_unlock", {
        achievement: "consistency",
        streak: completionReward.currentStreak,
      });
    }
  }, [completionReward]);

  useEffect(() => {
    void loadSessions().then((storedSessions) => {
      if (storedSessions.length > 0) {
        setSessionLogs(storedSessions);
      }
    });
    void loadNotes().then((storedNotes) => {
      if (storedNotes.length > 0) {
        setNotes(storedNotes);
        setActiveNoteId(storedNotes[0]?.id ?? "");
      }
    });
  }, [setNotes, setSessionLogs]);

  useEffect(() => {
    void saveSessions(sessionLogs);
  }, [sessionLogs]);

  useEffect(() => {
    void saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!draggingRef.current) {
        return;
      }

      setWidgetPosition((current) => ({
        x: Math.max(16, current.x - (event.clientX - dragOriginRef.current.x)),
        y: Math.max(16, current.y - (event.clientY - dragOriginRef.current.y)),
      }));
      dragOriginRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <CloudSyncProvider />
      <BackgroundEffects effect={settings.backgroundEffect} />
      {completionModalOpen && completionReward ? <CompletionOverlay reward={completionReward} onClose={closeCompletionModal} /> : null}
      <div className="relative mx-auto grid max-w-[1680px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <GlassCard className="p-5">
            <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-white/55 transition hover:text-white">
              <Home className="h-4 w-4" />
              Landing Page
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-orange-400 via-rose-500 to-cyan-400 text-lg font-bold text-slate-950 shadow-[0_0_30px_rgba(255,99,71,0.2)]">
                V
              </div>
              <div>
                <p className="font-[family:var(--font-display)] text-2xl tracking-[0.26em] text-white">VELOCITYOS</p>
                <p className="text-sm text-white/45">Gamified Deep Work for Future Builders</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-3">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = navIcons[item.id];
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                      active
                        ? "bg-white/10 text-white shadow-[0_0_24px_rgba(255,99,71,0.18)]"
                        : "text-white/70 hover:bg-white/5",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="space-y-5 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Driver Profile</p>
              <p className="mt-2 text-xl font-semibold text-white">{profile.name}</p>
              <p className="text-sm text-white/45">Level {level} focus driver</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.2em] text-white/40">
                <span>Garage XP</span>
                <span>{xp} XP</span>
              </div>
              <div className="h-3 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400" style={{ width: `${Math.min(100, (xp % 120) / 1.2)}%` }} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">Current ride</p>
                <p className="mt-2 text-lg text-white">{currentVehicle.name}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">Streak</p>
                <p className="mt-2 text-lg text-white">{streak} days</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (demoMode || isDemoMode) {
                  await fetch("/api/demo", { method: "DELETE" });
                } else {
                  const supabase = createSupabaseBrowserClient();
                  await supabase?.auth.signOut();
                }
                router.push("/auth");
                router.refresh();
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
            >
              {demoMode || isDemoMode ? "Exit Demo" : "Sign Out"}
            </button>
          </GlassCard>
        </aside>

        <main className="relative space-y-4 pb-24 lg:pb-8">
          <GlassCard className="p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-orange-200">Velocity Workspace</p>
                <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                  {getGreeting()}, {profile.name.split(" ")[0]}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                  You are inside a premium automotive-inspired productivity cockpit. Build momentum, earn unlocks,
                  and keep the engine hot.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Focus Today" value={`${totalMinutesToday}m`} accent="text-cyan-300" />
                <StatCard label="Garage Level" value={`${level}`} accent="text-orange-300" />
                <StatCard label="Unlocked Cars" value={`${unlockedVehicleIds.length}/8`} accent="text-rose-300" />
              </div>
            </div>
          </GlassCard>

          {activeView === "timer" ? (
            <TimerPanel
              currentVehicle={currentVehicle}
              progress={progress}
              sessionsCompletedInCycle={sessionsCompletedInCycle}
              taskCount={tasks.filter((task) => !task.completed).length}
              timerMode={timerMode}
              timerRunning={timerRunning}
              timerSecondsLeft={timerSecondsLeft}
              onModeChange={setTimerMode}
              onPause={pauseTimer}
              onReset={resetTimer}
              onSkip={skipSession}
              onStart={() => {
                trackEvent("session_start", { mode: timerMode });
                startTimer();
              }}
            />
          ) : null}

          {activeView === "dashboard" ? (
            <DashboardPanel
              currentVehicleName={currentVehicle.name}
              focusScore={focusScore}
              productivityScore={productivityScore}
              streak={streak}
              totalMinutesToday={totalMinutesToday}
              totalPomodoros={totalPomodoros}
              weeklyMinutes={weeklyMinutes}
            />
          ) : null}

          {activeView === "tasks" ? (
            <TasksPanel
              input={taskInput}
              tasks={tasks}
              onChangeInput={setTaskInput}
              onDeleteTask={deleteTask}
              onDragEnd={reorderTasks}
              onSubmitTask={() => {
                if (taskInput.trim()) {
                  addTask(taskInput.trim());
                  setTaskInput("");
                }
              }}
              onToggleTask={toggleTask}
            />
          ) : null}

          {activeView === "analytics" ? (
            <AnalyticsPanel dailyData={dailyData} monthlyData={monthlyData} sessionLogs={sessionLogs} />
          ) : null}

          {activeView === "garage" ? (
            <GaragePanel level={level} unlockedVehicleIds={unlockedVehicleIds} xp={xp} />
          ) : null}

          {activeView === "coach" ? (
            <CoachPanel
              dailyData={dailyData}
              focusMinutesToday={totalMinutesToday}
              productivityScore={productivityScore}
              streak={streak}
              weeklyMinutes={weeklyMinutes}
            />
          ) : null}

          {activeView === "notes" ? (
            <NotesPanel
              activeNote={activeNote}
              filteredNotes={filteredNotes}
              noteSearch={noteSearch}
              onAddNote={addNote}
              onChangeNoteSearch={setNoteSearch}
              onSelectNote={setActiveNoteId}
              onUpdateNote={updateNote}
            />
          ) : null}

          {activeView === "social" ? (
            <SocialPanel onEnablePreview={enableSocialPreview} profile={profile} socialEnabled={socialEnabled} />
          ) : null}

          {activeView === "settings" ? (
            <SettingsPanel
              availableEffects={backgroundEffects}
              settings={settings}
              track={track}
              volume={volume}
              onSetEnabled={setEnabled}
              onSetTrack={setTrack}
              onSetVolume={setVolume}
              soundEnabled={enabled}
              onUpdate={(patch) => {
                if (patch.theme) {
                  trackEvent("theme_usage", { theme: patch.theme });
                }
                updateSettings(patch);
              }}
            />
          ) : null}
        </main>
      </div>

      <div
        style={{ right: widgetPosition.x, bottom: widgetPosition.y }}
        className="velocity-panel fixed z-40 hidden w-[250px] rounded-[24px] p-4 shadow-[0_0_28px_rgba(255,99,71,0.16)] md:block"
      >
        <div
          onMouseDown={(event) => {
            draggingRef.current = true;
            dragOriginRef.current = { x: event.clientX, y: event.clientY };
          }}
          className="mb-3 flex cursor-move items-center justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Floating Widget</p>
            <p className="text-sm text-white/80">{timerMode === "focus" ? "Velocity Mode" : "Recovery"}</p>
          </div>
          <button
            type="button"
            onClick={() => setWidgetMinimized((value) => !value)}
            className="text-white/45 hover:text-white"
            aria-label={widgetMinimized ? "Expand widget" : "Minimize widget"}
          >
            {widgetMinimized ? "+" : "-"}
          </button>
        </div>
        {!widgetMinimized ? (
          <>
            <p className="font-[family:var(--font-display)] text-3xl text-white">{formatTimer(timerSecondsLeft)}</p>
            <div className="mt-4 h-2 rounded-full bg-white/5">
              <div className="h-full rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400" style={{ width: `${progress * 100}%` }} />
            </div>
          </>
        ) : null}
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 rounded-[26px] border border-white/10 bg-slate-950/85 p-2 backdrop-blur xl:hidden">
        <div className="grid grid-cols-5 gap-1">
          {(["timer", "dashboard", "tasks", "garage", "settings"] as AppView[]).map((item) => {
            const Icon = navIcons[item];
            const active = activeView === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveView(item)}
                className={clsx("rounded-2xl px-2 py-3 text-center text-xs", active ? "bg-white/10 text-white" : "text-white/45")}
              >
                <Icon className="mx-auto mb-1 h-4 w-4" />
                {item === "timer" ? "Mode" : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionLoading({ label }: { label: string }) {
  return (
    <GlassCard className="p-8">
      <p className="text-sm uppercase tracking-[0.3em] text-orange-200">{label}</p>
      <div className="mt-4 h-2 rounded-full bg-white/5">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400" />
      </div>
    </GlassCard>
  );
}
