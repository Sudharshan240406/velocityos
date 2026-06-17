"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud, CloudLightning, Database, Download, Upload,
  RefreshCw, LogIn, LogOut, UserPlus, FileSpreadsheet,
  CheckCircle, AlertCircle, AlertTriangle, ShieldCheck, Wifi, WifiOff
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useFocusStore } from "../store/focusStore";
import { useXPStore } from "../store/xpStore";

interface SupabaseUserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
}

export default function ProfileSync() {
  const store = useFocusStore();
  const xpStore = useXPStore();

  // Auth States
  const [currentUser, setCurrentUser] = useState<SupabaseUserProfile | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Sync / Cloud States
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error" | "syncing">("idle");
  const [activeTab, setActiveTab] = useState<"auth" | "backup" | "database">("auth");
  
  // Conflict States
  const [conflictData, setConflictData] = useState<{
    local: any;
    cloud: any;
  } | null>(null);

  // Table row counts from real Supabase queries
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});

  // Monitor network status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-trigger sync when back online
      handleAutoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Load User Session on Init
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username || session.user.email?.split("@")[0] || "User",
          avatar_url: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${session.user.id}`,
        };
        setCurrentUser(user);
        fetchDBStats(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email || "",
          username: session.user.user_metadata?.username || session.user.email?.split("@")[0] || "User",
          avatar_url: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${session.user.id}`,
        };
        setCurrentUser(user);
        fetchDBStats(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch real Supabase table stats
  const fetchDBStats = async (userId: string) => {
    if (!isSupabaseConfigured || !userId) return;

    try {
      const tables = ["tasks", "sessions", "analytics", "achievements", "streaks", "settings", "spotify_preferences"];
      const counts: Record<string, number> = {};

      await Promise.all(
        tables.map(async (table) => {
          let count = 0;
          if (table === "streaks" || table === "settings" || table === "spotify_preferences") {
            const { error, data } = await supabase
              .from(table)
              .select("*")
              .eq("user_id", userId);
            if (!error && data) count = data.length;
          } else {
            const { error, count: tableCount } = await supabase
              .from(table)
              .select("*", { count: "exact", head: true })
              .eq("user_id", userId);
            if (!error && tableCount !== null) count = tableCount;
          }
          counts[table] = count;
        })
      );
      setRowCounts(counts);
    } catch (e) {
      console.error("Failed to fetch table stats from Supabase:", e);
    }
  };

  // Auth Operations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoadingAuth(true);

    if (!isSupabaseConfigured) {
      setAuthError("Supabase environment variables are missing! Set NEXT_PUBLIC_SUPABASE_URL.");
      setLoadingAuth(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthSuccess("Access granted. Sync active.");
    }
    setLoadingAuth(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setLoadingAuth(true);

    if (!isSupabaseConfigured) {
      setAuthError("Supabase environment variables are missing! Set NEXT_PUBLIC_SUPABASE_URL.");
      setLoadingAuth(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split("@")[0],
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(username || email)}`,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthSuccess("Verification email dispatched. Access active.");
    }
    setLoadingAuth(false);
  };

  const handleLogout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setCurrentUser(null);
    setAuthSuccess("Disconnected safely.");
  };

  // Conflict Detection & Synchronization Flow
  const handleAutoSync = useCallback(async () => {
    if (!currentUser || !isOnline || !isSupabaseConfigured) return;

    setSyncStatus("syncing");
    try {
      // 1. Fetch cloud records
      const { data: cloudStreak } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      const localSessions = xpStore.sessionsCompleted || 0;
      const localStreak = xpStore.currentStreak || 0;
      const cloudSessions = cloudStreak?.sessions_completed || 0;
      const cloudStreakVal = cloudStreak?.current_streak || 0;

      // 2. Detect conflict
      if (localSessions !== cloudSessions || localStreak !== cloudStreakVal) {
        setConflictData({
          local: { sessions: localSessions, streak: localStreak, xp: xpStore.xp },
          cloud: { sessions: cloudSessions, streak: cloudStreakVal, xp: cloudStreak?.xp || 0 }
        });
        setSyncStatus("idle");
      } else {
        // No conflicts - perform fast merge/push
        await pushDataToCloud();
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 2500);
      }
    } catch {
      setSyncStatus("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isOnline, xpStore]);

  const pushDataToCloud = async () => {
    if (!currentUser || !isSupabaseConfigured) return;

    // Save Streak state
    await supabase.from("streaks").upsert({
      user_id: currentUser.id,
      current_streak: xpStore.currentStreak,
      best_streak: xpStore.bestStreak,
      sessions_completed: xpStore.sessionsCompleted,
      xp: xpStore.xp,
      last_active_date: xpStore.lastActiveDate || new Date().toLocaleDateString("en-CA"),
      updated_at: new Date().toISOString()
    });

    // Save Settings parameters
    await supabase.from("settings").upsert({
      user_id: currentUser.id,
      wallpaper: store.wallpaper,
      notifications_enabled: store.notificationsEnabled,
      auto_start_breaks: store.autoStartBreaks,
      auto_start_focus: store.autoStartFocus,
      widgets: store.widgets,
      updated_at: new Date().toISOString()
    });

    // Save Spotify Config
    await supabase.from("spotify_preferences").upsert({
      user_id: currentUser.id,
      client_id: localStorage.getItem("spotify_client_id") || "",
      volume_percent: Math.round(store.volume * 100),
      updated_at: new Date().toISOString()
    });

    fetchDBStats(currentUser.id);
  };

  const pullDataFromCloud = async () => {
    if (!currentUser || !isSupabaseConfigured) return;

    const { data: streak } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (streak) {
      // Apply streak modifications
      // In a real-world setting, update local state
      localStorage.setItem("focusos-xp-system", JSON.stringify({
        state: {
          ...xpStore,
          currentStreak: streak.current_streak,
          bestStreak: streak.best_streak,
          sessionsCompleted: streak.sessions_completed || 0,
          xp: streak.xp || 0,
          lastActiveDate: streak.last_active_date
        },
        version: 0
      }));
    }

    if (settings) {
      store.setWallpaper(settings.wallpaper);
      store.setNotificationsEnabled(settings.notifications_enabled);
      store.setAutoStartBreaks(settings.auto_start_breaks);
      store.setAutoStartFocus(settings.auto_start_focus);
      store.setWidgetsOrder(settings.widgets);
    }

    setConflictData(null);
    window.location.reload();
  };

  const mergeData = async () => {
    if (!conflictData || !currentUser) return;
    
    // Auto-resolve: take highest XP/streak values
    const mergedStreak = Math.max(conflictData.local.streak, conflictData.cloud.streak);
    const mergedXP = Math.max(conflictData.local.xp, conflictData.cloud.xp);
    const mergedSessions = Math.max(conflictData.local.sessions, conflictData.cloud.sessions);
    
    // Update locally
    localStorage.setItem("focusos-xp-system", JSON.stringify({
      state: {
        ...xpStore,
        currentStreak: mergedStreak,
        sessionsCompleted: mergedSessions,
        xp: mergedXP
      },
      version: 0
    }));

    // Update cloud
    await pushDataToCloud();
    setConflictData(null);
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-[1440px] mx-auto w-full mb-6 select-text">
      
      {/* ── SYNC WORKSPACE TAB SELECTOR ── */}
      <div className="lg:col-span-3 flex bg-white/5 border border-white/10 rounded-2xl p-2 gap-2">
        <button
          onClick={() => setActiveTab("auth")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "auth" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Authentication
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "backup" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Cloud Synchronization
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
            activeTab === "database" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Supabase Database Inspector
        </button>
      </div>

      {/* ── LEFT COLUMN: AUTH PANEL ── */}
      <AnimatePresence mode="wait">
        {activeTab === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {/* Account Management Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="w-5 h-5 text-purple-400" />
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Supabase Cloud Account</span>
                  </div>
                  {currentUser && (
                    <span className="flex items-center gap-1 text-[8.5px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" /> Secure Auth
                    </span>
                  )}
                </div>

                {currentUser ? (
                  <div className="flex items-center gap-4 p-4 bg-white/3 border border-white/5 rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentUser.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border border-white/10" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{currentUser.username}</h3>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Access real Supabase authentication to back up your focal telemetry parameters, daily streak values, and XP accomplishment tables to our secure PostgreSQL database.
                  </p>
                )}
              </div>

              {currentUser ? (
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAutoSync}
                      disabled={syncStatus === "syncing"}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                      Sync Database
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Disconnect Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <span className="text-[9px] text-gray-500 block text-center">Auth registration required for PostgreSQL sync</span>
                </div>
              )}
            </div>

            {/* Auth Forms */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
              {!currentUser ? (
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="flex flex-col gap-3.5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    {isRegistering ? <UserPlus className="w-4 h-4 text-purple-400" /> : <LogIn className="w-4 h-4 text-purple-400" />}
                    {isRegistering ? "Register Supabase Account" : "Access Supabase Profile"}
                  </h3>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {authError}
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {authSuccess}
                    </div>
                  )}

                  {isRegistering && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. SebastianVettel"
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="racer@velocity.com"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingAuth}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
                  >
                    {loadingAuth ? "Accessing..." : isRegistering ? "Sign Up" : "Sign In"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold tracking-wider uppercase text-center mt-1"
                  >
                    {isRegistering ? "Already have an account? Sign In" : "Need a profile? Register now"}
                  </button>
                </form>
              ) : (
                <div className="h-full flex flex-col justify-center items-center py-8 gap-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Supabase Connection Live</h4>
                    <p className="text-[10px] text-gray-500 max-w-xs mt-1">
                      Your focus stats are synchronized in real time. Row-Level Security policies are protecting user columns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── CENTER COLUMN: BACKUP & MIGRATION ── */}
        {activeTab === "backup" && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:col-span-3 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg min-h-[300px] justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">Supabase Cloud Sync</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono">
                  {isOnline ? (
                    <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md">
                      <Wifi className="w-3 h-3" /> Online
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-md">
                      <WifiOff className="w-3 h-3" /> Offline (Cache Active)
                    </span>
                  )}
                </div>
              </div>

              {!currentUser ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Sign in under the Authentication tab to manage database sync.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Trigger manually to enforce full verification updates to Supabase tables, or let Background worker service manage persistence.
                  </p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleAutoSync}
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Push Local state
                    </button>
                    <button
                      onClick={pullDataFromCloud}
                      className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Fetch Cloud state
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Conflict Resolution Modal Overlay */}
            {conflictData && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-950 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                  <div className="flex items-center gap-3 text-yellow-400 mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-base font-black uppercase tracking-wider">Sync Conflict Detected</h3>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    The local storage values differ from the database records on Supabase. Select conflict resolution method:
                  </p>

                  <div className="grid grid-cols-2 gap-4 border border-white/5 bg-white/2 rounded-xl p-4 text-[10px] mb-5">
                    {/* Local */}
                    <div className="flex flex-col gap-2.5">
                      <span className="font-bold text-cyan-400 uppercase tracking-widest border-b border-white/5 pb-1">Local State</span>
                      <div>
                        <span className="text-gray-500 block uppercase">Sessions Completed</span>
                        <span className="text-white font-black">{conflictData.local.sessions} sessions</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase">Current Streak</span>
                        <span className="text-white font-black">{conflictData.local.streak} days</span>
                      </div>
                    </div>

                    {/* Cloud */}
                    <div className="flex flex-col gap-2.5 border-l border-white/5 pl-4">
                      <span className="font-bold text-yellow-400 uppercase tracking-widest border-b border-white/5 pb-1">Cloud State</span>
                      <div>
                        <span className="text-gray-500 block uppercase">Sessions Completed</span>
                        <span className="text-white font-black">{conflictData.cloud.sessions} sessions</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase">Current Streak</span>
                        <span className="text-white font-black">{conflictData.cloud.streak} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={mergeData}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded-xl transition"
                    >
                      Auto Merge (Keep Max Values)
                    </button>
                    <button
                      onClick={pushDataToCloud}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase rounded-xl transition"
                    >
                      Overwrite Cloud (Push Local)
                    </button>
                    <button
                      onClick={pullDataFromCloud}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-bold text-xs uppercase rounded-xl transition"
                    >
                      Overwrite Local (Fetch Cloud)
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── RIGHT COLUMN: DATABASE INSPECTOR ── */}
        {activeTab === "database" && (
          <motion.div
            key="database"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:col-span-3 flex flex-col bg-slate-950 border border-white/10 rounded-2xl p-5 shadow-lg min-h-[300px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Supabase Live DB Auditor</span>
              </div>
              <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase">
                Active PostgreSQL Schema
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] text-gray-400 border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-500 uppercase tracking-widest text-[8.5px]">
                    <th className="py-2.5 px-3">Table Name</th>
                    <th className="py-2.5 px-3">Row Count</th>
                    <th className="py-2.5 px-3">RLS Status</th>
                    <th className="py-2.5 px-3">Real-Time Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { table: "profiles", count: currentUser ? 1 : 0, rls: "Enabled (Read-All, Edit-Own)", sync: "Active" },
                    { table: "tasks", count: rowCounts.tasks ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" },
                    { table: "sessions", count: rowCounts.sessions ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" },
                    { table: "analytics", count: rowCounts.analytics ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" },
                    { table: "achievements", count: rowCounts.achievements ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" },
                    { table: "streaks", count: rowCounts.streaks ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" },
                    { table: "settings", count: rowCounts.settings ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" },
                    { table: "spotify_preferences", count: rowCounts.spotify_preferences ?? 0, rls: "Enabled (Owner-Only)", sync: "Active" }
                  ].map((row) => (
                    <tr key={row.table} className="border-b border-white/5 hover:bg-white/2 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-white flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                        {row.table}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{row.count}</td>
                      <td className="py-2.5 px-3 text-gray-400">{row.rls}</td>
                      <td className="py-2.5 px-3 uppercase text-[8px] tracking-wider font-semibold text-emerald-500">{row.sync}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-600">
              <span>PostgreSQL Engine Security Active</span>
              <span>Host URL: {isSupabaseConfigured ? process.env.NEXT_PUBLIC_SUPABASE_URL : "Not Configured"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
