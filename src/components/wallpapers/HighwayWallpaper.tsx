"use client";
import { safeColor } from "../../utils/safeColor";

import React, { useEffect, useRef } from "react";

interface LightLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
}

export default function HighwayWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId: number;

    const lines: LightLine[] = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * width,
      y: height * 0.5 + Math.random() * (height * 0.5),
      length: Math.random() * 150 + 80,
      speed: Math.random() * 8 + 4,
      color: Math.random() < 0.5 ? "rgba(249, 115, 22, 0.4)" : "rgba(6, 182, 212, 0.4)",
    }));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      // Dark highway background
      ctx.fillStyle = "#030206";
      ctx.fillRect(0, 0, width, height);

      // Draw horizon glow
      const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      grad.addColorStop(0, safeColor("rgba(168, 85, 247, 0.0)"));
      grad.addColorStop(0.3, safeColor("rgba(236, 72, 153, 0.03)"));
      grad.addColorStop(1, safeColor("rgba(6, 182, 212, 0.08)"));
      ctx.fillStyle = grad;
      ctx.fillRect(0, height * 0.4, width, height * 0.6);

      // Draw perspective lanes
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const horizonY = height * 0.5;
      
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(width * 0.5, horizonY);
        ctx.lineTo(width * 0.5 + i * (width * 0.25), height);
        ctx.stroke();
      }

      // Draw highway light lines
      lines.forEach((line) => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Calculate perspective scaling
        const progress = (line.y - horizonY) / (height - horizonY);
        const scaleX = width * 0.5 + (line.x - width * 0.5) * progress;
        
        ctx.moveTo(scaleX, line.y);
        ctx.lineTo(scaleX - (line.length * progress), line.y);
        ctx.stroke();

        line.y += line.speed * progress;
        if (line.y > height) {
          line.y = horizonY + Math.random() * 50;
          line.x = Math.random() * width;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-50 pointer-events-none" />
  );
}
