import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { getServerAuthState } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to VelocityOS with email, password, Google OAuth, or try the instant demo mode.",
};

export default async function AuthPage() {
  const { authConfigured, demoMode, user } = await getServerAuthState();

  if (demoMode || user) {
    redirect("/workspace");
  }

  return <AuthShell authConfigured={authConfigured} mode="signin" />;
}
