"use client";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="velocity-panel max-w-xl rounded-[32px] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Dashboard Fault</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">The workspace failed to load.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">{error.message}</p>
        <button type="button" onClick={reset} className="mt-6 rounded-full bg-white px-5 py-3 font-medium text-slate-950">
          Reload workspace
        </button>
      </div>
    </div>
  );
}
