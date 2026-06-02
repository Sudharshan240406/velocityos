"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function F1GarageWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const spawnParticle = () => {
      particles.push({
        x: Math.random() * width,
        y: height + 10,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 4 + 2),
        life: 0,
        maxLife: Math.random() * 80 + 40,
        size: Math.random() * 3 + 1,
      });
    };

    let frame = 0;
    let glowPulse = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      frame++;
      glowPulse = Math.sin(frame * 0.02) * 0.5 + 0.5;

      // Dark garage background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#080808");
      bg.addColorStop(0.3, "#0d0a06");
      bg.addColorStop(1, "#050402");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Perspective floor grid
      ctx.save();
      ctx.globalAlpha = 0.25;
      const vx = width / 2;
      const vy = height * 0.55;
      const gridLines = 20;
      for (let i = 0; i <= gridLines; i++) {
        const t = i / gridLines;
        ctx.strokeStyle = `rgba(255, ${Math.round(80 + t * 80)}, 0, ${0.3 + t * 0.3})`;
        ctx.lineWidth = 0.8;
        // Horizontal
        const yPos = height * 0.55 + t * height * 0.5;
        const xLeft = vx - (vx * t * 2);
        const xRight = vx + (vx * t * 2);
        ctx.beginPath();
        ctx.moveTo(Math.max(0, xLeft), yPos);
        ctx.lineTo(Math.min(width, xRight), yPos);
        ctx.stroke();
      }
      // Vertical perspective lines
      for (let i = -10; i <= 10; i++) {
        ctx.strokeStyle = `rgba(255, 100, 0, 0.2)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx + i * (width / 10), height);
        ctx.stroke();
      }
      ctx.restore();

      // Orange/red ground glow
      const groundGlow = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, width * 0.7);
      groundGlow.addColorStop(0, `rgba(255, 80, 0, ${0.12 + glowPulse * 0.05})`);
      groundGlow.addColorStop(0.5, `rgba(200, 30, 0, 0.05)`);
      groundGlow.addColorStop(1, "transparent");
      ctx.fillStyle = groundGlow;
      ctx.fillRect(0, 0, width, height);

      // Speed lines from center
      ctx.save();
      ctx.globalAlpha = 0.06 + glowPulse * 0.04;
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        const len = (Math.sin(frame * 0.01 + i) * 0.5 + 0.5) * 200 + 100;
        ctx.strokeStyle = `hsl(${20 + i * 3}, 100%, 60%)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(width / 2 + Math.cos(angle) * len, height / 2 + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.restore();

      // Spawn spark particles
      if (frame % 3 === 0) spawnParticle();
      if (frame % 5 === 0) spawnParticle();

      // Draw particles
      particles.forEach((p, idx) => {
        const t = p.life / p.maxLife;
        ctx.globalAlpha = (1 - t) * 0.8;
        ctx.fillStyle = `hsl(${30 - t * 30}, 100%, ${70 - t * 30}%)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ff6000";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t), 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.05;
        p.life++;
        if (p.life >= p.maxLife) particles.splice(idx, 1);
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Overhead lights
      const numLights = 5;
      for (let i = 0; i < numLights; i++) {
        const lx = (width / (numLights + 1)) * (i + 1);
        const lightGlow = ctx.createRadialGradient(lx, 0, 0, lx, 0, 200);
        lightGlow.addColorStop(0, "rgba(255, 220, 150, 0.08)");
        lightGlow.addColorStop(1, "transparent");
        ctx.fillStyle = lightGlow;
        ctx.fillRect(0, 0, width, height);

        // Light source dot
        ctx.fillStyle = "rgba(255, 220, 150, 0.9)";
        ctx.beginPath();
        ctx.arc(lx, 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dark vignette
      const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, width * 0.8);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = vignette;
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
