import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/velocity/workspace-shell";
import { getServerAuthState } from "@/lib/auth";

export default async function WorkspacePage() {
  const { authConfigured, demoMode, user } = await getServerAuthState();

  if (!demoMode && authConfigured && !user) {
    redirect("/auth");
  }

  return (
    <WorkspaceShell
      demoMode={demoMode}
      userProfile={
        user
          ? {
              id: user.id,
              name: (user.user_metadata.username as string | undefined) ?? user.email?.split("@")[0] ?? "Velocity Driver",
              username: (user.user_metadata.username as string | undefined) ?? "velocity_driver",
              email: user.email,
              avatar: (user.user_metadata.avatar_url as string | undefined) ?? undefined,
              created_at: user.created_at,
              authProvider: "supabase",
            }
          : null
      }
    />
  );
}
