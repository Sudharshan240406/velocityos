"use client";

import clsx from "clsx";
import type { BackgroundEffect } from "@/lib/types";

export function BackgroundEffects({ effect }: { effect: BackgroundEffect }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,87,34,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.12),transparent_28%)]" />
      <div
        className={clsx(
          "absolute inset-0 opacity-70",
          effect === "aurora" && "bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.18),transparent_30%)] animate-[pulse_8s_ease-in-out_infinite]",
          effect === "stars" && "bg-[radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:42px_42px] opacity-20",
          effect === "racingLights" && "bg-[linear-gradient(120deg,transparent_15%,rgba(255,99,71,0.16)_30%,transparent_45%,rgba(34,211,238,0.16)_62%,transparent_78%)] animate-[pulse_6s_linear_infinite]",
          effect === "cyberGrid" && "bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:80px_80px]",
          effect === "rain" && "bg-[repeating-linear-gradient(115deg,transparent,transparent_14px,rgba(255,255,255,0.08)_15px,transparent_16px)]",
          effect === "neonParticles" && "bg-[radial-gradient(circle,rgba(255,99,71,0.22)_1px,transparent_1px)] [background-size:28px_28px] opacity-25",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.7))]" />
    </div>
  );
}
