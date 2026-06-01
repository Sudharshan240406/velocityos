"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "reset";

export function AuthForm({
  authConfigured,
  initialMode,
}: {
  authConfigured: boolean;
  initialMode: Mode;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isPasswordUpdate = mode === "reset" && initialMode === "reset";

  async function handleSubmit() {
    if (!supabase || !authConfigured) {
      setMessage("Supabase environment variables are missing. Demo mode is still available.");
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        trackEvent("login", { provider: "email" });
        router.push("/workspace");
        router.refresh();
      }

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/workspace`,
          },
        });
        if (error) throw error;
        trackEvent("user_signup", { provider: "email" });
        setMessage("Check your email to confirm your account.");
      }

      if (mode === "reset") {
        const { error } = isPasswordUpdate
          ? await supabase.auth.updateUser({ password })
          : await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/auth/reset-password`,
            });
        if (error) throw error;
        setMessage(isPasswordUpdate ? "Password updated successfully." : "Password reset email sent.");
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Something went wrong.";
      setMessage(errMsg);
      trackEvent("auth_failure", { error: errMsg, mode });
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    if (!supabase || !authConfigured) {
      setMessage("Supabase environment variables are missing. Demo mode is still available.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/workspace`,
      },
    });

    if (error) {
      setMessage(error.message);
      trackEvent("auth_failure", { error: error.message, provider: "google" });
      return;
    }

    if (data.url) {
      trackEvent("login", { provider: "google_oauth" });
      window.location.href = data.url;
    }
  }

  async function handleDemo() {
    setPending(true);
    await fetch("/api/demo", { method: "POST" });
    trackEvent("demo_started", { source: "auth" });
    router.push("/workspace");
    router.refresh();
  }

  return (
    <section className="velocity-panel rounded-[32px] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-orange-200">
        {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">
        {mode === "signin" ? "Enter the cockpit" : mode === "signup" ? "Create your driver profile" : "Recover your account"}
      </h2>
      <div className="mt-6 space-y-4">
        {mode === "signup" ? (
          <>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </>
        ) : null}
        {!isPasswordUpdate ? (
          <>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </>
        ) : null}
        {mode !== "reset" || isPasswordUpdate ? (
          <>
            <label htmlFor="password" className="sr-only">
              {isPasswordUpdate ? "New password" : "Password"}
            </label>
            <input
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isPasswordUpdate ? "New password" : "Password"}
              type="password"
              className="w-full rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30"
            />
          </>
        ) : null}
      </div>
      {message ? <p className="mt-4 text-sm text-orange-200">{message}</p> : null}
      <div className="mt-6 space-y-3">
        <button type="button" disabled={pending} onClick={handleSubmit} className="w-full rounded-full bg-white px-5 py-3 font-medium text-slate-950 disabled:opacity-70">
          {pending ? "Working..." : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : isPasswordUpdate ? "Update Password" : "Send Reset Email"}
        </button>
        {!isPasswordUpdate ? (
          <button type="button" disabled={pending} onClick={handleGoogle} className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white disabled:opacity-70">
            Continue with Google
          </button>
        ) : null}
        <button type="button" disabled={pending} onClick={handleDemo} className="w-full rounded-full border border-orange-300/20 bg-orange-400/10 px-5 py-3 text-orange-100 disabled:opacity-70">
          Try Demo
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-400">
        {mode !== "signin" && !isPasswordUpdate ? (
          <button type="button" onClick={() => setMode("signin")} className="hover:text-white">
            Back to sign in
          </button>
        ) : null}
        {mode === "signin" && !isPasswordUpdate ? (
          <>
            <button type="button" onClick={() => setMode("signup")} className="hover:text-white">
              Create account
            </button>
            <button type="button" onClick={() => setMode("reset")} className="hover:text-white">
              Forgot password?
            </button>
          </>
        ) : null}
      </div>
      <p className="mt-6 text-xs leading-6 text-slate-500">
        By continuing, you agree to use VelocityOS for evaluation or productivity workflows.{" "}
        <Link href="/" className="text-slate-300 hover:text-white">
          Return to landing page
        </Link>
      </p>
    </section>
  );
}
