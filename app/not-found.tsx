import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="velocity-panel max-w-xl rounded-[32px] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-200">404</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">This route drifted off the track.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The page you requested does not exist, or the link is out of date.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">
            Go Home
          </Link>
          <Link href="/workspace" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white">
            Open Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
