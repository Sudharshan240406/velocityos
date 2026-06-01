"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export function GlassCard({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("velocity-panel rounded-[28px]", className)}>{children}</section>;
}

export function StatCard({
  label,
  value,
  accent = "text-white",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <GlassCard className="p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className={clsx("mt-3 font-[family:var(--font-display)] text-4xl", accent)}>{value}</p>
    </GlassCard>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.32em] text-orange-200">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
      {copy ? <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">{copy}</p> : null}
    </div>
  );
}
