import Link from "next/link";
import { ArrowRight, Gauge, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";

const features = [
  {
    title: "Velocity Mode",
    copy: "A supercar-inspired focus dashboard with telemetry visuals, redline celebrations, and live performance gauges.",
    icon: Gauge,
  },
  {
    title: "Garage System",
    copy: "Earn XP, unlock new vehicles, and turn daily deep work into long-term collection progression.",
    icon: Trophy,
  },
  {
    title: "AI Driver Coach",
    copy: "Actionable insights, weekly predictions, and rhythm guidance based on your own focus telemetry.",
    icon: Sparkles,
  },
  {
    title: "Offline-First Control",
    copy: "Runs as a PWA with local persistence today and cloud-sync scaffolding ready for Supabase deployment.",
    icon: ShieldCheck,
  },
];

const stats = [
  { label: "Landing First Load Target", value: "<250kB" },
  { label: "Work Sessions Rewarded", value: "+50 XP" },
  { label: "Garage Unlocks", value: "8 Vehicles" },
  { label: "Atmospheres", value: "6 Effects" },
];

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <section className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-10 -z-10 h-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,84,37,0.18),transparent_55%)] blur-3xl" />
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="font-[family:var(--font-display)] text-xl tracking-[0.28em] text-white">VELOCITYOS</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Gamified Deep Work for Future Builders</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/workspace" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5">
              Open Workspace
            </Link>
            <Link href="/demo" className="rounded-full border border-orange-300/20 bg-orange-400/10 px-4 py-2 text-sm text-orange-100 transition hover:bg-orange-400/15">
              Try Demo
            </Link>
            <a href="#pricing" className="hidden rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 sm:block">
              Pricing
            </a>
          </div>
        </header>

        <div className="grid gap-10 pt-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-orange-200">
              <Zap className="h-4 w-4" />
              VelocityOS Ultimate Edition
            </p>
            <h1 className="mt-6 max-w-4xl font-[family:var(--font-display)] text-5xl leading-[0.94] text-white sm:text-6xl lg:text-7xl">
              Deep work that feels like stepping into a concept car cockpit.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              VelocityOS turns focus into a premium automotive operating system with telemetry-driven sessions,
              garage progression, AI coaching, cloud-ready architecture, and startup-grade polish.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/workspace"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400 px-6 py-4 font-medium text-slate-950 shadow-[0_0_45px_rgba(255,99,71,0.2)]"
              >
                Launch VelocityOS
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-4 text-white/85">
                Explore Features
              </a>
              <Link href="/demo" className="inline-flex items-center justify-center rounded-full border border-orange-300/20 bg-orange-400/10 px-6 py-4 text-orange-100">
                Try Demo
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-black/30 p-6 shadow-[0_0_60px_rgba(255,99,71,0.14)] backdrop-blur-2xl">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/40">Velocity Mode</p>
                  <h2 className="mt-2 font-[family:var(--font-display)] text-3xl text-white">Future Builders HUD</h2>
                </div>
                <div className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                  Live
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Focus Speed</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-5xl text-white">88 MPH</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">RPM</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-5xl text-white">6500</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Turbo</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-5xl text-cyan-300">85%</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">Nitro</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-5xl text-orange-300">60%</p>
                </div>
              </div>
              <div className="mt-6 rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_40%),linear-gradient(135deg,#111827,#030712)] p-5">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Garage Progress</span>
                  <span>Supercar unlock at L30</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white/5">
                  <div className="h-full w-[42%] rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Why teams love it</p>
            <h2 className="mt-2 text-4xl font-semibold text-white">Built like a premium product, not a toy timer.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">
            VelocityOS blends startup-quality presentation with a serious productivity engine: telemetry focus mode,
            progression systems, analytics, coach insights, and PWA reliability.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="inline-flex rounded-2xl border border-white/10 bg-black/30 p-3 text-orange-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          ["Velocity Mode", "Speedometer timer, redline climax, ignition boot flow."],
          ["Garage System", "XP-driven unlock path from city hatchback to concept car."],
          ["AI Coach", "Predictive insights, behavior analysis, and weekly rhythm reads."],
        ].map(([title, copy]) => (
          <div key={title} className="rounded-[30px] border border-white/10 bg-black/25 p-6">
            <p className="text-sm uppercase tracking-[0.26em] text-orange-200">{title}</p>
            <p className="mt-3 text-slate-300">{copy}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-8 backdrop-blur-2xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Pricing</p>
              <h2 className="mt-3 text-4xl font-semibold text-white">Premium focus infrastructure for future builders.</h2>
              <p className="mt-4 max-w-2xl text-slate-300">
                Start with the local-first workspace today, then connect Supabase for cloud sync, social rooms, and rankings when you are ready to deploy.
              </p>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-black/35 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-white/50">Founding Driver</p>
              <p className="mt-3 font-[family:var(--font-display)] text-6xl text-white">$10</p>
              <p className="text-sm text-white/55">per month</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li>Velocity Mode workspace</li>
                <li>Garage progression system</li>
                <li>AI Driver Coach insights</li>
                <li>PWA and offline-first support</li>
              </ul>
              <Link href="/workspace" className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 font-medium text-slate-950">
                Enter the cockpit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
