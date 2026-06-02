"use client";

import React, { useEffect, useRef } from "react";

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

interface Bokeh {
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
  alphaDir: number;
  alphaSpeed: number;
}

export default function NeonTokyoWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const rain: RainDrop[] = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: Math.random() * 6 + 4,
      length: Math.random() * 18 + 8,
      opacity: Math.random() * 0.25 + 0.05,
    }));

    const neonColors = ["#ff0080", "#00ffff", "#ff00ff", "#ffff00", "#ff6600", "#00ff88"];
    const bokeh: Bokeh[] = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      r: Math.random() * 30 + 10,
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      alpha: Math.random() * 0.2 + 0.05,
      alphaDir: 1,
      alphaSpeed: Math.random() * 0.003 + 0.001,
    }));

    // Silhouette building data
    type SilBuilding = { x: number; w: number; h: number };
    const silBuildings: SilBuilding[] = [];
    let bx2 = 0;
    while (bx2 < width + 100) {
      const bw = Math.random() * 60 + 30;
      const bh = Math.random() * height * 0.5 + height * 0.15;
      silBuildings.push({ x: bx2, w: bw, h: bh });
      bx2 += bw + Math.random() * 6;
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let signPhase = 0;

    const draw = () => {
      signPhase += 0.015;

      // Dark sky
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#060010");
      sky.addColorStop(0.6, "#0d0018");
      sky.addColorStop(1, "#1a001a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Bokeh lights
      bokeh.forEach((b) => {
        b.alpha += b.alphaDir * b.alphaSpeed;
        if (b.alpha > 0.25 || b.alpha < 0.03) b.alphaDir *= -1;
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.color.replace(")", `, ${b.alpha})`).replace("rgb", "rgba").replace("#", "rgba(") + "");
        grad.addColorStop(1, "transparent");
        // Draw simpler version
        ctx.globalAlpha = b.alpha;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Building silhouettes (far layer)
      ctx.fillStyle = "#080010";
      silBuildings.forEach((b) => {
        ctx.fillRect(b.x, height - b.h, b.w, b.h);
      });

      // Building silhouettes (near layer — darker, wider)
      ctx.fillStyle = "#040008";
      let nx = 0;
      while (nx < width + 100) {
        const bw = 50 + Math.floor(nx / 50) % 30;
        const bh = 80 + Math.floor(nx / 70) % (height * 0.3);
        ctx.fillRect(nx, height - bh, bw, bh);
        nx += bw + 5;
      }

      // Neon signs (animated)
      const signs = [
        { x: width * 0.12, y: height * 0.55, text: "FOCUS", color: "#ff0080" },
        { x: width * 0.35, y: height * 0.45, text: "深", color: "#00ffff" },
        { x: width * 0.58, y: height * 0.5, text: "ZONE", color: "#ff00ff" },
        { x: width * 0.78, y: height * 0.58, text: "集中", color: "#ffff00" },
      ];
      signs.forEach((s, i) => {
        const pulse = Math.sin(signPhase * 2 + i) * 0.5 + 0.5;
        ctx.globalAlpha = 0.5 + pulse * 0.4;
        ctx.shadowBlur = 20 + pulse * 15;
        ctx.shadowColor = s.color;
        ctx.fillStyle = s.color;
        ctx.font = `bold ${20 + Math.floor(i * 4)}px monospace`;
        ctx.fillText(s.text, s.x, s.y);
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Rain
      ctx.save();
      rain.forEach((drop) => {
        ctx.globalAlpha = drop.opacity;
        ctx.strokeStyle = "#aaddff";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1.5, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      });
      ctx.restore();
      ctx.globalAlpha = 1;

      // Ground reflections
      const reflGrad = ctx.createLinearGradient(0, height * 0.85, 0, height);
      reflGrad.addColorStop(0, "transparent");
      reflGrad.addColorStop(1, "rgba(255, 0, 128, 0.08)");
      ctx.fillStyle = reflGrad;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
}
