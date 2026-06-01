"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center px-6">
        <div className="velocity-panel max-w-xl rounded-[32px] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-200">System Fault</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">VelocityOS hit an unexpected error.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{error.message}</p>
          <button type="button" onClick={reset} className="mt-6 rounded-full bg-white px-5 py-3 font-medium text-slate-950">
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
