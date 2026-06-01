"use client";

import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Gauge, Sparkles, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/velocity/ui";
import type { Vehicle } from "@/lib/types";

export function CompletionOverlay({
  reward,
  onClose,
}: {
  reward: {
    xpEarned: number;
    currentStreak: number;
    totalPomodoros: number;
    nextUnlock?: Vehicle;
    unlockedVehicle?: Vehicle;
    quote: string;
  };
  onClose: () => void;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight });

    // Close on Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on mount
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = overlayRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Tab-based focus trapping
    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !overlayRef.current) {
        return;
      }

      const focusable = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          event.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleFocusTrap);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleFocusTrap);
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <Confetti width={size.width} height={size.height} recycle={false} numberOfPieces={420} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl">
        <GlassCard className="overflow-hidden p-8 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,99,71,0.22),transparent_50%)]" />
          <div className="relative">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-400/15 text-orange-300 shadow-[0_0_45px_rgba(255,99,71,0.18)]">
              <Gauge className="h-10 w-10" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.42em] text-orange-200">Session Complete</p>
            <h2 id="completion-title" className="mt-3 font-[family:var(--font-display)] text-5xl text-white">Redline Reward</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <RewardMetric label="XP Earned" value={`+${reward.xpEarned}`} />
              <RewardMetric label="Current Streak" value={`${reward.currentStreak} days`} />
              <RewardMetric label="Pomodoro" value={`#${reward.totalPomodoros}`} />
              <RewardMetric label="Next Unlock" value={reward.nextUnlock?.name ?? "Garage complete"} />
            </div>
            {reward.unlockedVehicle ? (
              <div className="mt-6 rounded-[28px] border border-emerald-300/20 bg-emerald-400/10 p-5">
                <div className="flex items-center justify-center gap-3 text-emerald-200">
                  <Trophy className="h-5 w-5" />
                  <span className="text-sm uppercase tracking-[0.24em]">Vehicle unlocked</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">{reward.unlockedVehicle.name}</p>
              </div>
            ) : null}
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 text-left">
              <div className="flex items-center gap-3 text-cyan-200">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm uppercase tracking-[0.24em]">Motivational quote</span>
              </div>
              <p className="mt-3 text-lg text-white">{reward.quote}</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onClose} className="flex-1 rounded-full bg-white px-5 py-3 font-medium text-slate-950">
                Continue
              </button>
              <button type="button" onClick={onClose} className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white">
                Start Break
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function RewardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
