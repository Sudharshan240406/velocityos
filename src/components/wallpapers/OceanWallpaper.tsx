"use client";
import { safeColor } from "../../utils/safeColor";

import React, { useEffect, useRef } from "react";

export default function OceanWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationId: number;
    let waveTime = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      // Background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, safeColor("#020108"));
      skyGrad.addColorStop(0.5, safeColor("#0b0c20"));
      skyGrad.addColorStop(1, safeColor("#020205"));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw horizon line
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6);
      ctx.lineTo(width, height * 0.6);
      ctx.stroke();

      // Render calm rolling sea waves
      waveTime += 0.005;
      ctx.fillStyle = "rgba(6, 182, 212, 0.03)";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 15) {
          const y = height * 0.6 + i * 20 + Math.sin(x * 0.003 + waveTime * (i + 1)) * (5 + i * 2);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
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
