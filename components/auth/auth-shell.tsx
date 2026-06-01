import { AuthForm } from "@/components/auth/client-auth-form";

export function AuthShell({
  authConfigured,
  mode,
}: {
  authConfigured: boolean;
  mode: "signin" | "reset";
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center">
        <section>
          <p className="text-xs uppercase tracking-[0.34em] text-orange-200">VelocityOS Launch Access</p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-5xl leading-[0.95] text-white sm:text-6xl">
            Production-ready deep work, now with real access control.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Sign in with email or Google, or jump into the instant demo profile if you are reviewing the product.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Demo Ready", "Explore the full product instantly."],
              ["Cloud Sync", "Supabase auth and sync flow prepared."],
              ["Recruiter Friendly", "No account friction for judges or visitors."],
            ].map(([title, copy]) => (
              <div key={title} className="velocity-panel rounded-[28px] p-5">
                <p className="text-lg font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </section>
        <AuthForm authConfigured={authConfigured} initialMode={mode} />
      </div>
    </main>
  );
}
