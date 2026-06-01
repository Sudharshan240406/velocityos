"use client";

import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Award, Flame, Gauge, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/velocity/ui";

export function CompletionOverlay({
  reward,
  onClose,
}: {
  reward: {
    minutesFocused: number;
    sessionsCompleted: number;
    streak: number;
  };
  onClose: () => void;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Speed burst canvas lines animation
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Zoom lines state
    const lines: { angle: number; speed: number; length: number; distance: number; color: string }[] = [];
    for (let i = 0; i < 50; i++) {
      lines.push({
        angle: Math.random() * Math.PI * 2,
        speed: 12 + Math.random() * 20,
        length: 40 + Math.random() * 120,
        distance: Math.random() * 80,
        color: Math.random() > 0.5 ? "rgba(251, 146, 60, 0.35)" : "rgba(34, 211, 238, 0.35)",
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      ctx.lineWidth = 1.5;
      lines.forEach((line) => {
        const startX = centerX + Math.cos(line.angle) * line.distance;
        const startY = centerY + Math.sin(line.angle) * line.distance;
        const endX = centerX + Math.cos(line.angle) * (line.distance + line.length);
        const endY = centerY + Math.sin(line.angle) * (line.distance + line.length);

        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        line.distance += line.speed;
        if (line.distance > Math.max(width, height)) {
          line.distance = Math.random() * 40;
          line.length = 40 + Math.random() * 120;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-4 backdrop-blur-2xl overflow-hidden animate-[fadeIn_0.3s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      {/* Canvas for speed burst lines */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />
      
      {/* Confetti overlay */}
      <Confetti width={size.width} height={size.height} recycle={false} numberOfPieces={300} />

      {/* Checkered flag banner background effect */}
      <div className="absolute inset-x-0 top-1/4 h-20 bg-[repeating-conic-gradient(#ffffff08_0_25%,transparent_0_50%)] [background-size:36px_36px] opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-1/4 h-20 bg-[repeating-conic-gradient(#ffffff08_0_25%,transparent_0_50%)] [background-size:36px_36px] opacity-30 pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="w-full max-w-xl relative z-10"
      >
        <GlassCard className="overflow-hidden p-6 sm:p-8 text-center border-orange-500/20 shadow-[0_0_80px_rgba(251,146,60,0.15)] bg-slate-950/90">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(251,146,60,0.15),transparent_60%)]" />
          <div className="relative">
            {/* Supercar Trophy Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-orange-400 via-rose-500 to-cyan-400 text-slate-950 shadow-[0_0_55px_rgba(251,146,60,0.45)]">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.45em] text-orange-200 animate-pulse">Checkered Flag</p>
            <h2 id="completion-title" className="mt-3 font-[family:var(--font-display)] text-3xl text-white tracking-wider sm:text-5xl">
              RUN COMPLETE
            </h2>
            <p className="mt-2 text-sm text-white/55">You redlined your focus capacity. Engine is fully primed.</p>

            <div className="mt-8 grid gap-4 grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/40 p-4">
                <div className="flex justify-center text-cyan-300">
                  <Gauge className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/35">Focused</p>
                <p className="mt-1 text-lg font-bold text-white sm:text-xl">{reward.minutesFocused}m</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/40 p-4">
                <div className="flex justify-center text-orange-300">
                  <Award className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/35">Runs Today</p>
                <p className="mt-1 text-lg font-bold text-white sm:text-xl">{reward.sessionsCompleted}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/40 p-4">
                <div className="flex justify-center text-rose-400">
                  <Flame className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/35">Streak</p>
                <p className="mt-1 text-lg font-bold text-white sm:text-xl">{reward.streak}d</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full bg-linear-to-r from-orange-400 via-rose-500 to-cyan-400 px-6 py-4 font-semibold text-slate-950 shadow-[0_0_35px_rgba(255,99,71,0.25)] hover:scale-[1.02] transition"
              >
                Cool Down / Continue
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
