"use client";

import React, { useEffect, useRef } from "react";

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface Building {
  x: number;
  w: number;
  h: number;
  windows: { wx: number; wy: number; on: boolean; flicker: number }[];
  color: string;
}

export default function CyberCityWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Rain
    const rainDrops: RainDrop[] = Array.from({ length: 180 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 8 + 6,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    // Buildings
    const buildingColors = ["#0a0a1a", "#080818", "#0c0c22", "#060614"];
    const buildings: Building[] = [];
    let bx = 0;
    while (bx < width + 120) {
      const bw = Math.random() * 80 + 40;
      const bh = Math.random() * height * 0.55 + height * 0.2;
      const wins: Building["windows"] = [];
      for (let wy = height - bh + 10; wy < height - 20; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 10; wx += 14) {
          wins.push({ wx, wy, on: Math.random() > 0.4, flicker: Math.random() * 200 });
        }
      }
      buildings.push({
        x: bx,
        w: bw,
        h: bh,
        windows: wins,
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
      });
      bx += bw + Math.random() * 8;
    }

    let gridOffset = 0;
    let frame = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      frame++;
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#010008");
      sky.addColorStop(0.5, "#04001a");
      sky.addColorStop(1, "#0a0020");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Distant city glow
      const glowGrad = ctx.createRadialGradient(width / 2, height * 0.6, 0, width / 2, height * 0.6, width * 0.6);
      glowGrad.addColorStop(0, "rgba(139, 0, 255, 0.12)");
      glowGrad.addColorStop(0.4, "rgba(255, 0, 100, 0.06)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Neon grid floor
      gridOffset = (gridOffset + 0.5) % 40;
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 0.5;
      const floorY = height * 0.72;
      // Horizontal lines
      for (let y = floorY; y < height + 40; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Perspective vertical lines
      for (let i = -20; i <= 20; i++) {
        ctx.beginPath();
        ctx.moveTo(width / 2 + i * 60, floorY);
        ctx.lineTo(width / 2 + i * 300, height + 50);
        ctx.stroke();
      }
      ctx.restore();

      // Buildings
      buildings.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, height - b.h, b.w, b.h);

        // Neon roof line
        ctx.strokeStyle = Math.random() > 0.99 ? "#ff00ff" : "rgba(255,0,255,0.6)";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ff00ff";
        ctx.beginPath();
        ctx.moveTo(b.x, height - b.h);
        ctx.lineTo(b.x + b.w, height - b.h);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Windows
        b.windows.forEach((w) => {
          if (!w.on) return;
          const flicker = frame % Math.round(w.flicker + 60) === 0;
          if (flicker) w.on = Math.random() > 0.3;
          const wColors = ["rgba(255,200,100,0.85)", "rgba(100,200,255,0.85)", "rgba(255,100,255,0.6)", "rgba(200,255,200,0.7)"];
          ctx.fillStyle = wColors[Math.floor((w.wx + w.wy) % wColors.length)];
          ctx.fillRect(w.wx, w.wy, 8, 6);
        });
      });

      // Rain
      ctx.save();
      rainDrops.forEach((drop) => {
        ctx.globalAlpha = drop.opacity;
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
      });
      ctx.restore();
      ctx.globalAlpha = 1;

      // Scan line overlay
      ctx.fillStyle = "rgba(0, 255, 255, 0.015)";
      const scanY = (frame * 2) % height;
      ctx.fillRect(0, scanY, width, 2);

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
