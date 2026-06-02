"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  len: number;
  speed: number;
  dx: number;
  dy: number;
  active: boolean;
}

export default function AuroraWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: Star[] = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.65),
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
    }));

    const shootingStars: ShootingStar[] = Array.from({ length: 2 }).map(() => ({
      x: 0, y: 0, len: 0, speed: 0, dx: 0, dy: 0, active: false,
    }));

    const triggerShootingStar = (ss: ShootingStar) => {
      ss.x = Math.random() * width * 0.6;
      ss.y = Math.random() * height * 0.3;
      ss.len = Math.random() * 80 + 40;
      ss.speed = Math.random() * 15 + 10;
      const angle = Math.PI / 6;
      ss.dx = Math.cos(angle) * ss.speed;
      ss.dy = Math.sin(angle) * ss.speed;
      ss.active = true;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let auroraTime = 0;

    const draw = () => {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#080616");
      skyGrad.addColorStop(0.4, "#0b0c24");
      skyGrad.addColorStop(0.8, "#1a1033");
      skyGrad.addColorStop(1, "#07040d");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      shootingStars.forEach((ss) => {
        if (!ss.active) {
          if (Math.random() < 0.002) triggerShootingStar(ss);
          return;
        }
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.dx, ss.y - ss.dy);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.5, "rgba(236, 72, 153, 0.4)");
        grad.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.dx * 1.5, ss.y - ss.dy * 1.5);
        ctx.stroke();
        ss.x += ss.dx;
        ss.y += ss.dy;
        if (ss.x > width || ss.y > height) ss.active = false;
      });

      auroraTime += 0.001;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const waveHeight = height * 0.35;
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        if (i === 0) {
          grad.addColorStop(0, "rgba(168, 85, 247, 0.08)");
          grad.addColorStop(0.3, "rgba(236, 72, 153, 0.04)");
          grad.addColorStop(0.6, "rgba(0, 0, 0, 0)");
        } else if (i === 1) {
          grad.addColorStop(0.1, "rgba(6, 182, 212, 0.06)");
          grad.addColorStop(0.4, "rgba(139, 92, 246, 0.03)");
          grad.addColorStop(0.8, "rgba(0, 0, 0, 0)");
        } else {
          grad.addColorStop(0.05, "rgba(219, 39, 119, 0.05)");
          grad.addColorStop(0.35, "rgba(0, 0, 0, 0)");
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 10) {
          const shift = auroraTime * (i + 1) * 2;
          const y = waveHeight + Math.sin(x * 0.003 + shift) * 60 + Math.cos(x * 0.0015 - shift) * 40 + (i * 30);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = "rgba(11, 12, 36, 0.15)";
      ctx.fillRect(0, height * 0.8, width, height * 0.2);

      ctx.fillStyle = "#050308";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.9);
      ctx.lineTo(width * 0.15, height * 0.82);
      ctx.lineTo(width * 0.35, height * 0.88);
      ctx.lineTo(width * 0.55, height * 0.78);
      ctx.lineTo(width * 0.7, height * 0.86);
      ctx.lineTo(width * 0.85, height * 0.81);
      ctx.lineTo(width, height * 0.9);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#020104";
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height * 0.95);
      ctx.lineTo(width * 0.25, height * 0.91);
      ctx.lineTo(width * 0.5, height * 0.94);
      ctx.lineTo(width * 0.75, height * 0.89);
      ctx.lineTo(width, height * 0.96);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

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
