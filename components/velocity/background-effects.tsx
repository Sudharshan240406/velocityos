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

    // Highway effect state
    const highwayTrails: { x: number; y: number; length: number; speed: number; color: string }[] = [];
    if (effect === "highway") {
      for (let i = 0; i < 35; i++) {
        highwayTrails.push({
          x: Math.random() * width,
          y: height * 0.3 + Math.random() * (height * 0.5),
          length: 80 + Math.random() * 180,
          speed: 12 + Math.random() * 12,
          color: Math.random() > 0.5 ? "rgba(251, 146, 60, 0.28)" : "rgba(34, 211, 238, 0.28)",
        });
      }
    }

    // Garage effect state (grid/dots matrix dashboard)
    let garagePulse = 0;

    // Track effect state (cyber space grid with depth perspective)
    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space cockpit background
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      if (effect === "highway") {
        ctx.lineWidth = 1.5;
        highwayTrails.forEach((trail) => {
          ctx.beginPath();
          ctx.strokeStyle = trail.color;
          ctx.moveTo(trail.x, trail.y);
          ctx.lineTo(trail.x + trail.length, trail.y);
          ctx.stroke();

          // Move left
          trail.x -= trail.speed;
          if (trail.x + trail.length < 0) {
            trail.x = width;
            trail.y = height * 0.3 + Math.random() * (height * 0.5);
          }
        });
      } else if (effect === "garage") {
        garagePulse += 0.008;
        ctx.strokeStyle = "rgba(251, 146, 60, 0.06)";
        ctx.lineWidth = 1;

        // Draw concentric circles in center
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.45;
        
        ctx.beginPath();
        for (let r = 80; r < maxRadius; r += 120) {
          ctx.arc(centerX, centerY, r + Math.sin(garagePulse + r) * 12, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Draw telemetry dashboard dots grid
        ctx.fillStyle = "rgba(34, 211, 238, 0.04)";
        for (let x = 50; x < width; x += 90) {
          for (let y = 50; y < height; y += 90) {
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        }
      } else if (effect === "track") {
        gridOffset += 1.2;
        if (gridOffset >= 60) gridOffset = 0;

        ctx.strokeStyle = "rgba(244, 63, 94, 0.06)";
        ctx.lineWidth = 1.5;

        const horizon = height * 0.45;

        // Vertical perspective lines
        const numLines = 20;
        for (let i = 0; i <= numLines; i++) {
          const xStart = (width / numLines) * i;
          const xEnd = width * 0.5 + (xStart - width * 0.5) * 5;
          ctx.beginPath();
          ctx.moveTo(xStart, horizon);
          ctx.lineTo(xEnd, height);
          ctx.stroke();
        }

        // Horizontal lines moving forward
        ctx.lineWidth = 1;
        for (let y = horizon + gridOffset; y < height; y += 45) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Ambient gradients overlay
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(2, 6, 23, 0.85)");
      grad.addColorStop(0.4, "rgba(2, 6, 23, 0.15)");
      grad.addColorStop(0.6, "rgba(2, 6, 23, 0.15)");
      grad.addColorStop(1, "rgba(2, 6, 23, 0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Cockpit dashboard glow
      const topGlow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, height * 0.45);
      topGlow.addColorStop(0, "rgba(239, 68, 68, 0.1)");
      topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = topGlow;
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
