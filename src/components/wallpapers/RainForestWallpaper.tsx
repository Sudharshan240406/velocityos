"use client";
import { safeColor } from "../../utils/safeColor";

import React, { useEffect, useRef } from "react";

export default function RainForestWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Setup rain particles and fireflies/leaves
    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      length: number;
      opacity: number;
    }

    interface Light {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      alphaSpeed: number;
    }

    const rain: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      rain.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedY: 4 + Math.random() * 4,
        speedX: -0.5 - Math.random() * 0.5,
        length: 8 + Math.random() * 8,
        opacity: 0.05 + Math.random() * 0.1,
      });
    }

    const fireflies: Light[] = [];
    for (let i = 0; i < 15; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random(),
        alphaSpeed: 0.005 + Math.random() * 0.01,
      });
    }

    const draw = () => {
      // Deep tropical green-teal background gradient
      const forestGrad = ctx.createLinearGradient(0, 0, 0, height);
      forestGrad.addColorStop(0, safeColor("#010804"));
      forestGrad.addColorStop(0.5, safeColor("#021208"));
      forestGrad.addColorStop(1, safeColor("#010603"));
      ctx.fillStyle = forestGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw faint layered tree silhouettes
      ctx.fillStyle = "rgba(4, 30, 15, 0.2)";
      ctx.beginPath();
      // Left tree structure
      ctx.moveTo(-50, height);
      ctx.lineTo(100, height - 250);
      ctx.lineTo(200, height);
      // Right tree structure
      ctx.moveTo(width - 150, height);
      ctx.lineTo(width - 50, height - 300);
      ctx.lineTo(width + 100, height);
      ctx.fill();

      // Rain animation
      ctx.lineWidth = 1;
      for (const drop of rain) {
        ctx.strokeStyle = `rgba(16, 185, 129, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.speedX * 1.5, drop.y + drop.length);
        ctx.stroke();

        // Move
        drop.y += drop.speedY;
        drop.x += drop.speedX;

        // Reset
        if (drop.y > height) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }
      }

      // Fireflies animation
      for (const fly of fireflies) {
        ctx.fillStyle = `rgba(52, 211, 153, ${Math.abs(Math.sin(fly.alpha)) * 0.4})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring
        ctx.fillStyle = `rgba(52, 211, 153, ${Math.abs(Math.sin(fly.alpha)) * 0.08})`;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        fly.x += fly.vx;
        fly.y += fly.vy;
        fly.alpha += fly.alphaSpeed;

        // Bound check
        if (fly.x < 0 || fly.x > width) fly.vx *= -1;
        if (fly.y < 0 || fly.y > height) fly.vy *= -1;
      }

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
