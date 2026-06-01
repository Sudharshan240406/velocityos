import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getServerAuthState() {
  const cookieStore = await cookies();
  const demoMode = cookieStore.get("velocityos-demo")?.value === "1";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      user: null,
      demoMode,
      authConfigured: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    demoMode,
    authConfigured: true,
  };
}
