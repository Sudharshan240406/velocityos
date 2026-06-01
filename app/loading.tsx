export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="velocity-panel w-full max-w-xl rounded-[32px] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Boot Sequence</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Loading VelocityOS…</h2>
        <div className="mt-6 h-2 rounded-full bg-white/5">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400" />
        </div>
      </div>
    </div>
  );
}
