"use client";

import { useEffect, useRef } from "react";
import type { BackgroundEffect } from "@/lib/types";

export function BackgroundEffects({ effect }: { effect: BackgroundEffect }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Stars Layer
    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        r: 0.4 + Math.random() * 1.6,
        alpha: Math.random(),
        speed: 0.008 + Math.random() * 0.015,
      });
    }

    // Nebula dust blobs
    const nebulas = [
      { x: width * 0.25, y: height * 0.3, r: 250, color: "rgba(168, 85, 247, 0.12)", vx: 0.04, vy: 0.02 },
      { x: width * 0.75, y: height * 0.2, r: 300, color: "rgba(6, 182, 212, 0.1)", vx: -0.02, vy: 0.04 },
      { x: width * 0.5, y: height * 0.5, r: 200, color: "rgba(236, 72, 153, 0.08)", vx: 0.03, vy: -0.03 },
    ];

    // Shooting stars
    const shootingStars: { x: number; y: number; len: number; dx: number; dy: number; alpha: number; active: boolean }[] = [];
    for (let i = 0; i < 3; i++) {
      shootingStars.push({ x: 0, y: 0, len: 0, dx: 0, dy: 0, alpha: 0, active: false });
    }

    let waveTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Layer 1: Deep Space Gradient
      const spaceGrad = ctx.createLinearGradient(0, 0, 0, height);
      spaceGrad.addColorStop(0, "#030008");
      spaceGrad.addColorStop(0.4, "#060112");
      spaceGrad.addColorStop(0.8, "#0a0720");
      spaceGrad.addColorStop(1, "#020108");
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // Layer 2: Moving Nebula Clouds
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      nebulas.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x - n.r > width) n.x = -n.r;
        if (n.x + n.r < 0) n.x = width + n.r;
        if (n.y - n.r > height) n.y = -n.r;
        if (n.y + n.r < 0) n.y = height + n.r;

        const radGrad = ctx.createRadialGradient(n.x, n.y, 10, n.x, n.y, n.r);
        radGrad.addColorStop(0, n.color);
        radGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Layer 3: Twinkling Stars
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, star.alpha)})`;
        ctx.fill();
      });

      // Layer 4: Shooting Stars
      shootingStars.forEach((ss) => {
        if (!ss.active) {
          if (Math.random() < 0.0015) {
            ss.x = Math.random() * width * 0.7;
            ss.y = Math.random() * height * 0.35;
            ss.len = 50 + Math.random() * 90;
            ss.dx = 5 + Math.random() * 5;
            ss.dy = 2 + Math.random() * 3;
            ss.alpha = 1;
            ss.active = true;
          }
        } else {
          ctx.beginPath();
          const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y - ss.len * 0.4);
          grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - ss.len, ss.y - ss.len * 0.4);
          ctx.stroke();

          ss.x += ss.dx;
          ss.y += ss.dy;
          ss.alpha -= 0.015;
          if (ss.alpha <= 0 || ss.x > width || ss.y > height) {
            ss.active = false;
          }
        }
      });

      // Layer 5: Aurora Waves (if not minimal mode)
      if (effect !== "minimal") {
        waveTime += 0.0025;
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const waveCount = effect === "highway" ? 3 : effect === "track" ? 2 : 1;
        for (let w = 0; w < waveCount; w++) {
          const shift = w * Math.PI * 0.4;
          const waveHeight = 90 + w * 25;
          ctx.beginPath();
          
          const grad = ctx.createLinearGradient(0, height * 0.08, 0, height * 0.6);
          if (effect === "highway") {
            // Neon pink / orange highway vibe
            grad.addColorStop(0, "rgba(236, 72, 153, 0.16)");
            grad.addColorStop(0.5, "rgba(251, 146, 60, 0.06)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          } else if (effect === "track") {
            // Cyan / deep blue track vibe
            grad.addColorStop(0, "rgba(6, 182, 212, 0.16)");
            grad.addColorStop(0.5, "rgba(59, 130, 246, 0.06)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          } else {
            // garage or custom (purple / magenta)
            grad.addColorStop(0, "rgba(168, 85, 247, 0.15)");
            grad.addColorStop(0.5, "rgba(236, 72, 153, 0.05)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          }

          ctx.fillStyle = grad;

          ctx.moveTo(0, height);
          ctx.lineTo(0, height * 0.32 + Math.sin(waveTime + shift) * 35);
          for (let x = 0; x <= width; x += 40) {
            const y = height * 0.32 + Math.sin(x * 0.0018 + waveTime * 1.8 + shift) * waveHeight;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Layer 6: Parallax Mountain Silhouettes
      ctx.fillStyle = "#010103";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.83);
      ctx.quadraticCurveTo(width * 0.2, height * 0.74, width * 0.4, height * 0.81);
      ctx.lineTo(width * 0.55, height * 0.72);
      ctx.quadraticCurveTo(width * 0.7, height * 0.82, width * 0.85, height * 0.78);
      ctx.lineTo(width, height * 0.84);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Atmospheric fog / mist layer sitting on the mountains valley
      ctx.save();
      const fogGrad = ctx.createLinearGradient(0, height * 0.72, 0, height * 0.95);
      fogGrad.addColorStop(0, "rgba(16, 12, 38, 0)");
      fogGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.04)");
      fogGrad.addColorStop(1, "rgba(6, 182, 212, 0.03)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, height * 0.7, width, height * 0.3);
      ctx.restore();

      // Foreground Closer Mountain layer
      ctx.fillStyle = "#000001";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.9);
      ctx.lineTo(width * 0.3, height * 0.84);
      ctx.lineTo(width * 0.65, height * 0.89);
      ctx.lineTo(width * 0.85, height * 0.86);
      ctx.lineTo(width, height * 0.91);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Smooth ambient bloom overlay
      const ambientGrad = ctx.createLinearGradient(0, 0, 0, height);
      ambientGrad.addColorStop(0, "rgba(3, 0, 8, 0.7)");
      ambientGrad.addColorStop(0.35, "rgba(3, 0, 8, 0)");
      ambientGrad.addColorStop(0.65, "rgba(3, 0, 8, 0)");
      ambientGrad.addColorStop(1, "rgba(3, 0, 8, 0.9)");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Fusion reactor central sky bloom glow
      const centralGlow = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.45);
      centralGlow.addColorStop(0, "rgba(168, 85, 247, 0.05)");
      centralGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.02)");
      centralGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = centralGlow;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full block"
    />
  );
}
