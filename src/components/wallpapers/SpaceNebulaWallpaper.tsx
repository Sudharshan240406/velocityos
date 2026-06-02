"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  alphaDir: number;
  alphaSpeed: number;
  hue: number;
}

interface NebulaCloud {
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
}

export default function SpaceNebulaWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars: Star[] = Array.from({ length: 220 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.3,
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
      alphaSpeed: Math.random() * 0.01 + 0.003,
      hue: Math.random() * 60 + 180, // blue-cyan-purple range
    }));

    const nebulaClouds: NebulaCloud[] = [
      { x: width * 0.2, y: height * 0.3, rx: width * 0.35, ry: height * 0.3, color: "#6600ff", alpha: 0.06, rotation: 0, rotSpeed: 0.0002 },
      { x: width * 0.7, y: height * 0.5, rx: width * 0.3, ry: height * 0.25, color: "#ff0088", alpha: 0.05, rotation: Math.PI / 4, rotSpeed: -0.0001 },
      { x: width * 0.5, y: height * 0.2, rx: width * 0.4, ry: height * 0.2, color: "#0088ff", alpha: 0.04, rotation: 0, rotSpeed: 0.00015 },
      { x: width * 0.3, y: height * 0.7, rx: width * 0.25, ry: height * 0.3, color: "#ff6600", alpha: 0.035, rotation: Math.PI / 6, rotSpeed: 0.0002 },
    ];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      nebulaClouds[0].x = width * 0.2;
      nebulaClouds[0].rx = width * 0.35;
      nebulaClouds[1].x = width * 0.7;
      nebulaClouds[1].rx = width * 0.3;
    };
    window.addEventListener("resize", handleResize);

    let frame = 0;

    const draw = () => {
      frame++;

      // Deep space background
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#000008");
      bg.addColorStop(0.4, "#04000f");
      bg.addColorStop(0.7, "#080010");
      bg.addColorStop(1, "#020008");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Nebula gas clouds
      nebulaClouds.forEach((cloud) => {
        cloud.rotation += cloud.rotSpeed;
        ctx.save();
        ctx.translate(cloud.x, cloud.y);
        ctx.rotate(cloud.rotation);
        ctx.globalAlpha = cloud.alpha;
        ctx.globalCompositeOperation = "screen";
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.rx);
        grad.addColorStop(0, cloud.color);
        grad.addColorStop(0.5, cloud.color + "44");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.scale(1, cloud.ry / cloud.rx);
        ctx.beginPath();
        ctx.arc(0, 0, cloud.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Twinkling stars
      stars.forEach((star) => {
        star.alpha += star.alphaDir * star.alphaSpeed;
        if (star.alpha > 1) { star.alpha = 1; star.alphaDir = -1; }
        if (star.alpha < 0.05) { star.alpha = 0.05; star.alphaDir = 1; }

        ctx.globalAlpha = star.alpha;
        // Star color with slight hue variation
        ctx.fillStyle = `hsl(${star.hue}, 50%, 95%)`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Star cross glint for bigger stars
        if (star.size > 1.5 && star.alpha > 0.7) {
          ctx.globalAlpha = star.alpha * 0.3;
          ctx.strokeStyle = `hsl(${star.hue}, 80%, 95%)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 3, star.y);
          ctx.lineTo(star.x + star.size * 3, star.y);
          ctx.moveTo(star.x, star.y - star.size * 3);
          ctx.lineTo(star.x, star.y + star.size * 3);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      // Distant galaxy core glow
      const coreX = width * 0.6;
      const coreY = height * 0.35;
      const coreGlow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 120);
      const corePulse = Math.sin(frame * 0.005) * 0.5 + 0.5;
      coreGlow.addColorStop(0, `rgba(255, 200, 100, ${0.15 + corePulse * 0.05})`);
      coreGlow.addColorStop(0.4, "rgba(200, 100, 255, 0.04)");
      coreGlow.addColorStop(1, "transparent");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, width, height);

      // Shooting star
      if (frame % 300 === 0) {
        const ssX = Math.random() * width * 0.8;
        const ssY = Math.random() * height * 0.4;
        ctx.save();
        const ssGrad = ctx.createLinearGradient(ssX, ssY, ssX + 120, ssY + 40);
        ssGrad.addColorStop(0, "white");
        ssGrad.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = ssGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ssX, ssY);
        ctx.lineTo(ssX + 120, ssY + 40);
        ctx.stroke();
        ctx.restore();
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
}
