"use client";

import React, { useEffect, useRef } from "react";
import { useThemeStore, THEMES } from "../../store/themeStore";
import { useFocusStore } from "../../store/focusStore";
import { safeColor } from "../../utils/safeColor";

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  colorType: number;
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

interface FloatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
  decay: number;
}

interface RainDrop {
  x: number;
  y: number;
  vy: number;
  vx: number;
  length: number;
  opacity: number;
}

interface WaterSplash {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
  decay: number;
}

interface Snowflake {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  alpha: number;
  swing: number;
  swingSpeed: number;
}

interface FogLayer {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  alpha: number;
}

interface PineTree {
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
}

interface Cabin {
  x: number;
  y: number;
  w: number;
  h: number;
  windows: Array<{wx: number, wy: number, isOn: boolean, flicker: number}>;
}

interface Lightning {
  active: boolean;
  opacity: number;
  x: number;
}

export default function AuroraWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme: currentThemeId } = useThemeStore();
  const { isMusicPlaying, volume, mode, status } = useFocusStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      targetMouse.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);

    const getThemeColors = () => {
      const currentTheme = THEMES[currentThemeId] || THEMES.default;
      return {
        primary: currentTheme.primary,
        secondary: currentTheme.secondary,
        accent: currentTheme.accent,
      };
    };

    const hexToRgbaStr = (hex: string, alpha: number) => {
      const clean = hex.replace("#", "");
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    let weatherCondition = "clear";
    try {
      const cached = localStorage.getItem("focusos:weather_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const condition = parsed.data?.condition?.toLowerCase() || "";
        if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("slight rain") || condition.includes("moderate rain") || condition.includes("heavy rain")) {
          weatherCondition = "rain";
        } else if (condition.includes("thunderstorm")) {
          weatherCondition = "thunderstorm";
        } else if (condition.includes("snow") || condition.includes("snowfall")) {
          weatherCondition = "snow";
        } else if (condition.includes("fog")) {
          weatherCondition = "fog";
        }
      }
    } catch (e) {
      console.error("Failed to read weather condition", e);
    }

    const interpolateColor = (color1: string, color2: string, factor: number): string => {
      const c1 = color1.startsWith("#") ? color1 : "#000000";
      const c2 = color2.startsWith("#") ? color2 : "#000000";
      const r1 = parseInt(c1.substring(1, 3), 16);
      const g1 = parseInt(c1.substring(3, 5), 16);
      const b1 = parseInt(c1.substring(5, 7), 16);
      
      const r2 = parseInt(c2.substring(1, 3), 16);
      const g2 = parseInt(c2.substring(3, 5), 16);
      const b2 = parseInt(c2.substring(5, 7), 16);
      
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      
      return `rgb(${r}, ${g}, ${b})`;
    };

    const getSkyColors = (hour: number) => {
      const night = ["#030208", "#080616", "#0b0c24", "#04020a"];
      const sunrise = ["#120c2e", "#25123e", "#5c258d", "#4389a2"];
      const day = ["#070a1e", "#0e133c", "#161b5c", "#0a071a"];
      const sunset = ["#0c061a", "#2c0c30", "#8e2de2", "#4a00e0"];
      
      let from, to, factor;
      if (hour >= 4 && hour < 7) {
        from = night; to = sunrise; factor = (hour - 4) / 3;
      } else if (hour >= 7 && hour < 12) {
        from = sunrise; to = day; factor = (hour - 7) / 5;
      } else if (hour >= 12 && hour < 18) {
        from = day; to = day; factor = 0;
      } else if (hour >= 18 && hour < 21) {
        from = day; to = sunset; factor = (hour - 18) / 3;
      } else if (hour >= 21 && hour < 23) {
        from = sunset; to = night; factor = (hour - 21) / 2;
      } else {
        from = night; to = night; factor = 0;
      }
      
      return from.map((color, i) => interpolateColor(color, to[i], factor));
    };

    const stars: Star[] = Array.from({ length: 900 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height * 0.7),
      size: Math.random() * 3.5 + 0.8,
      alpha: Math.random(),
      speed: Math.random() * 0.012 + 0.003,
      colorType: Math.random() < 0.2 ? 1 : Math.random() < 0.2 ? 2 : 0,
    }));

    const shootingStars: ShootingStar[] = Array.from({ length: 7 }).map(() => ({
      x: 0, y: 0, len: 0, speed: 0, dx: 0, dy: 0, active: false,
    }));

    const triggerShootingStar = (ss: ShootingStar) => {
      ss.x = Math.random() * width * 0.7;
      ss.y = Math.random() * height * 0.4;
      ss.len = Math.random() * 180 + 100;
      ss.speed = Math.random() * 30 + 20;
      const angle = Math.PI / 6;
      ss.dx = Math.cos(angle) * ss.speed;
      ss.dy = Math.sin(angle) * ss.speed;
      ss.active = true;
    };

    const particles: FloatParticle[] = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: height * 0.5 + Math.random() * (height * 0.5),
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(Math.random() * 0.6 + 0.3),
      size: Math.random() * 5.0 + 2.0,
      alpha: Math.random() * 0.8 + 0.2,
      alphaSpeed: Math.random() * 0.01 + 0.005,
      decay: 0.0003,
    }));

    const rainDrops: RainDrop[] = [];
    if (weatherCondition === "rain" || weatherCondition === "thunderstorm") {
      for (let i = 0; i < 200; i++) {
        rainDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vy: 12 + Math.random() * 8,
          vx: -2.5 - Math.random() * 2,
          length: 20 + Math.random() * 20,
          opacity: 0.25 + Math.random() * 0.4,
        });
      }
    }

    const splashes: WaterSplash[] = [];

    const snowflakes: Snowflake[] = [];
    if (weatherCondition === "snow") {
      for (let i = 0; i < 150; i++) {
        snowflakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vy: 1.5 + Math.random() * 2.0,
          vx: (Math.random() - 0.5) * 1.0,
          r: Math.random() * 6.0 + 2.0,
          alpha: Math.random() * 0.6 + 0.4,
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 0.01 + Math.random() * 0.03,
        });
      }
    }

    const fogLayers: FogLayer[] = [];
    if (weatherCondition === "fog" || weatherCondition === "rain" || weatherCondition === "thunderstorm") {
      for (let i = 0; i < 8; i++) {
        fogLayers.push({
          x: Math.random() * width,
          y: height * 0.3 + i * (height * 0.08),
          vx: (Math.random() - 0.5) * 0.3,
          width: width * 1.8,
          height: height * 0.45,
          alpha: weatherCondition === "fog" ? (0.1 + Math.random() * 0.1) : (0.05 + Math.random() * 0.05),
        });
      }
    }

    const lightning: Lightning = { active: false, opacity: 0, x: 0 };

    // Pine Forest Generation
    const pineTrees: PineTree[] = [];
    const pineCount = Math.floor(width / 15);
    for (let i = 0; i < pineCount; i++) {
      pineTrees.push({
        x: (i * (width / pineCount)) + (Math.random() * 20 - 10),
        y: height * 0.8 - (Math.random() * 40 + 20),
        w: Math.random() * 20 + 15,
        h: Math.random() * 80 + 60,
        opacity: Math.random() * 0.3 + 0.7,
      });
    }

    // Cabins Generation
    const cabins: Cabin[] = [];
    const cabinCount = Math.floor(width / 400) + 1;
    for (let i = 0; i < cabinCount; i++) {
      cabins.push({
        x: Math.random() * (width - 100) + 50,
        y: height * 0.8 - 35,
        w: 50 + Math.random() * 20,
        h: 35 + Math.random() * 10,
        windows: Array.from({length: 2}).map(() => ({
          wx: Math.random() * 20 + 10,
          wy: Math.random() * 10 + 10,
          isOn: Math.random() > 0.3,
          flicker: Math.random()
        }))
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let auroraTime = 0;
    let frameCount = 0;

    const draw = () => {
      frameCount++;
      
      // Focus Reactivity
      const isFocus = mode === "focus" && status === "running";
      const focusIntensity = isFocus ? 1.5 : 1.0;
      
      const themeColors = getThemeColors();
      const currentHour = new Date().getHours() + new Date().getMinutes() / 60;

      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;

      const breathX = Math.sin(frameCount * 0.0006) * 20;
      const breathY = Math.cos(frameCount * 0.0008) * 15;
      
      const totalOffsetX = mouse.x * 50 + breathX;
      const totalOffsetY = mouse.y * 30 + breathY;

      const waterLine = height * 0.8;

      // Cinematic Camera Zoom & Pan
      ctx.save();
      const zoom = 1.05 + Math.sin(frameCount * 0.0002) * 0.05;
      ctx.translate(width/2, height/2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width/2, -height/2);

      // 1. SKY GRADIENT
      const skyColors = getSkyColors(currentHour);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, safeColor(skyColors[0]));
      skyGrad.addColorStop(0.4, safeColor(skyColors[1]));
      skyGrad.addColorStop(0.8, safeColor(skyColors[2]));
      skyGrad.addColorStop(1, safeColor(skyColors[3]));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(-100, -100, width+200, height+200);

      // Lightning
      if (weatherCondition === "thunderstorm") {
        if (!lightning.active && Math.random() < 0.005) {
          lightning.active = true;
          lightning.opacity = 1.0;
          lightning.x = Math.random() * width;
        }
        if (lightning.active) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lightning.opacity * 0.3})`;
          ctx.fillRect(-100, -100, width+200, height+200);
          lightning.opacity -= 0.05;
          if (lightning.opacity <= 0) lightning.active = false;
        }
      }

      // 2. STARS
      const drawStars = (isReflection: boolean) => {
        stars.forEach((star) => {
          const musicTwinkleMult = isMusicPlaying ? 1.5 + volume * 2.0 : 1.0;
          star.alpha += star.speed * musicTwinkleMult * focusIntensity;
          if (star.alpha > 1 || star.alpha < 0.1) star.speed = -star.speed;
          
          let drawY = star.y - totalOffsetY * 0.4;
          let drawX = star.x - totalOffsetX * 0.3;

          if (drawX < -100) drawX += width+200;
          if (drawX > width+100) drawX -= width+200;

          let displayAlpha = Math.max(0.1, Math.min(1, star.alpha));
          if (isReflection) {
            drawY = waterLine + (waterLine - drawY) * 0.6;
            displayAlpha *= 0.65;
            if (drawY > height+100) return;
          }

          ctx.save();
          ctx.globalAlpha = displayAlpha;
          
          if (star.colorType === 1) ctx.fillStyle = "#fff4cc";
          else if (star.colorType === 2) ctx.fillStyle = "#ccd9ff";
          else ctx.fillStyle = "#ffffff";

          if (star.size > 1.3 && !isReflection) {
            ctx.shadowBlur = star.size * 6.0 * focusIntensity;
            ctx.shadowColor = star.colorType === 1 ? "#fff4cc" : star.colorType === 2 ? "#ccd9ff" : "#ffffff";
          }

          let drawRippleX = drawX;
          if (isReflection) {
            drawRippleX += Math.sin(drawY * 0.05 + frameCount * 0.08) * 3.5;
          }

          ctx.beginPath();
          ctx.arc(drawRippleX, drawY, star.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      };

      drawStars(false);

      // 3. SHOOTING STARS
      const drawShootingStars = (isReflection: boolean) => {
        shootingStars.forEach((ss) => {
          if (!ss.active) {
            if (!isReflection && Math.random() < 0.01 * focusIntensity) triggerShootingStar(ss);
            return;
          }

          const theme = getThemeColors();
          let ssX = ss.x - totalOffsetX * 0.6;
          let ssY = ss.y - totalOffsetY * 0.6;

          let startY = ssY;
          let endY = ssY - ss.dy * 1.5;
          let startX = ssX;
          let endX = ssX - ss.dx * 1.5;

          if (isReflection) {
            startY = waterLine + (waterLine - startY) * 0.6;
            endY = waterLine + (waterLine - endY) * 0.6;
            startX += Math.sin(startY * 0.08 + frameCount * 0.08) * 2;
            endX += Math.sin(endY * 0.08 + frameCount * 0.08) * 2;
            if (startY > height+100 && endY > height+100) return;
          }

          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, safeColor("rgba(255, 255, 255, 1)"));
          grad.addColorStop(0.4, safeColor(hexToRgbaStr(theme.secondary, isReflection ? 0.7 : 0.95)));
          grad.addColorStop(1, safeColor(hexToRgbaStr(theme.accent, 0)));

          ctx.save();
          ctx.strokeStyle = grad;
          ctx.lineWidth = isReflection ? 3.0 : 5.5;
          ctx.shadowBlur = isReflection ? 0 : 15;
          ctx.shadowColor = theme.secondary;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          ctx.restore();

          if (!isReflection) {
            ss.x += ss.dx;
            ss.y += ss.dy;
            if (ss.x > width+200 || ss.y > height+200) ss.active = false;
          }
        });
      };

      drawShootingStars(false);

      // 4. AURORA RIBBONS
      const musicSpeedMult = isMusicPlaying ? 1.4 + volume * 1.5 : 1.0;
      const musicAmpMult = isMusicPlaying ? 1.25 + volume * 0.75 : 1.0;
      auroraTime += 0.0012 * musicSpeedMult * focusIntensity;

      const drawAuroraRibbons = (isReflection: boolean) => {
        const theme = getThemeColors();
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          
          const waveHeight = height * 0.32 - totalOffsetY * 0.5;
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          
          let alpha1 = 0.65 * focusIntensity, alpha2 = 0.50 * focusIntensity, alpha3 = 0.55 * focusIntensity;
          if (isReflection) {
            alpha1 *= 0.70; alpha2 *= 0.70; alpha3 *= 0.70;
          }

          const pulseMult = isMusicPlaying ? 0.8 + Math.sin(frameCount * 0.04) * 0.2 : 1.0;

          if (i === 0) {
            grad.addColorStop(0, safeColor(hexToRgbaStr(theme.primary, alpha1 * musicAmpMult * pulseMult)));
            grad.addColorStop(0.35, safeColor(hexToRgbaStr(theme.secondary, alpha2 * musicAmpMult * pulseMult)));
            grad.addColorStop(0.7, safeColor("rgba(0, 0, 0, 0)"));
          } else if (i === 1) {
            grad.addColorStop(0.08, safeColor(hexToRgbaStr(theme.accent, alpha3 * musicAmpMult * pulseMult)));
            grad.addColorStop(0.45, safeColor(hexToRgbaStr(theme.primary, alpha2 * musicAmpMult * pulseMult)));
            grad.addColorStop(0.85, safeColor("rgba(0, 0, 0, 0)"));
          } else {
            grad.addColorStop(0.04, safeColor(hexToRgbaStr(theme.secondary, alpha1 * musicAmpMult * pulseMult)));
            grad.addColorStop(0.4, safeColor("rgba(0, 0, 0, 0)"));
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          
          if (!isReflection) {
            ctx.moveTo(-100, height+100);
            for (let x = -100; x <= width + 100; x += 10) {
              const shift = auroraTime * (i + 1) * 2.5;
              const drawX = x - totalOffsetX * 0.4;
              const y = waveHeight + 
                        Math.sin(x * 0.0025 + shift) * 85 * musicAmpMult + 
                        Math.cos(x * 0.0012 - shift) * 55 * musicAmpMult + 
                        (i * 35);
              ctx.lineTo(drawX, y);
            }
            ctx.lineTo(width+100, height+100);
          } else {
            ctx.moveTo(-100, waterLine);
            for (let x = -100; x <= width + 100; x += 10) {
              const shift = auroraTime * (i + 1) * 2.5;
              const drawX = x - totalOffsetX * 0.4;
              const skyY = waveHeight + 
                           Math.sin(x * 0.0025 + shift) * 85 * musicAmpMult + 
                           Math.cos(x * 0.0012 - shift) * 55 * musicAmpMult + 
                           (i * 35);
              let reflectedY = waterLine + (waterLine - skyY) * 0.6;
              reflectedY = Math.max(waterLine, reflectedY);
              const rippleOffset = Math.sin(x * 0.06 + frameCount * 0.09) * 4.5;
              ctx.lineTo(drawX + rippleOffset, reflectedY);
            }
            ctx.lineTo(width+100, waterLine);
          }

          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      };

      drawAuroraRibbons(false);

      // 5. LAKE REFLECTIONS
      drawStars(true);
      drawShootingStars(true);
      drawAuroraRibbons(true);

      // Draw reflected forest & cabins before overlay
      const drawPineForest = (isReflection: boolean) => {
        ctx.save();
        pineTrees.forEach(pine => {
          let px = pine.x - totalOffsetX * 0.8;
          let py = pine.y - totalOffsetY * 0.8;
          if (isReflection) {
             py = waterLine + (waterLine - py) * 0.6;
             ctx.fillStyle = `rgba(3, 4, 10, ${pine.opacity * 0.6})`;
          } else {
             ctx.fillStyle = `rgba(6, 8, 15, ${pine.opacity})`;
          }
          ctx.beginPath();
          if (isReflection) {
             let ripple = Math.sin(py * 0.05 + frameCount * 0.08) * 3;
             ctx.moveTo(px + pine.w/2 + ripple, py + pine.h * 0.6); // Tip reversed
             ctx.lineTo(px + ripple, py);
             ctx.lineTo(px + pine.w + ripple, py);
          } else {
             ctx.moveTo(px + pine.w/2, py); // Tip
             ctx.lineTo(px, py + pine.h);
             ctx.lineTo(px + pine.w, py + pine.h);
          }
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      };

      const drawCabins = (isReflection: boolean) => {
        ctx.save();
        cabins.forEach(cabin => {
          let cx = cabin.x - totalOffsetX * 0.9;
          let cy = cabin.y - totalOffsetY * 0.9;
          if (isReflection) {
             cy = waterLine + (waterLine - (cy + cabin.h)) * 0.6;
             ctx.fillStyle = `rgba(15, 10, 5, 0.4)`;
          } else {
             ctx.fillStyle = `rgba(20, 15, 10, 1.0)`;
          }
          
          let ripple = isReflection ? Math.sin(cy * 0.05 + frameCount * 0.08) * 3 : 0;
          
          ctx.beginPath();
          if (isReflection) {
             ctx.fillRect(cx + ripple, cy, cabin.w, cabin.h * 0.6);
          } else {
             ctx.fillRect(cx, cy, cabin.w, cabin.h);
             // Roof
             ctx.beginPath();
             ctx.moveTo(cx - 5, cy);
             ctx.lineTo(cx + cabin.w/2, cy - 15);
             ctx.lineTo(cx + cabin.w + 5, cy);
             ctx.closePath();
             ctx.fillStyle = "#0a0a0c";
             ctx.fill();
          }

          // Windows
          cabin.windows.forEach(w => {
            if (w.isOn) {
               w.flicker += (Math.random() - 0.5) * 0.2;
               w.flicker = Math.max(0.6, Math.min(1.0, w.flicker));
               ctx.fillStyle = `rgba(255, 200, 100, ${w.flicker * (isReflection ? 0.5 : 1.0)})`;
               if (!isReflection) {
                 ctx.shadowBlur = 10;
                 ctx.shadowColor = "rgba(255, 200, 100, 0.8)";
               }
               ctx.fillRect(cx + w.wx + ripple, isReflection ? cy + w.wy * 0.6 : cy + w.wy, 8, 8);
               ctx.shadowBlur = 0;
            }
          });
        });
        ctx.restore();
      };

      drawPineForest(true);
      drawCabins(true);

      ctx.save();
      const waterGrad = ctx.createLinearGradient(0, waterLine, 0, height);
      waterGrad.addColorStop(0, "rgba(8, 8, 36, 0.45)");
      waterGrad.addColorStop(0.5, "rgba(4, 5, 22, 0.65)");
      waterGrad.addColorStop(1, "rgba(2, 2, 12, 0.85)");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(-100, waterLine, width+200, height - waterLine + 100);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = safeColor(hexToRgbaStr(themeColors.accent, 0.35));
      ctx.lineWidth = 1.8;
      const rippleRows = 15;
      for (let r = 0; r < rippleRows; r++) {
        const ry = waterLine + (r / rippleRows) * (height - waterLine);
        const waveSpeed = 0.02 + r * 0.005;
        ctx.beginPath();
        for (let rx = -100; rx <= width+100; rx += 25) {
          const rw = Math.sin(rx * 0.015 + frameCount * waveSpeed) * 2.5;
          if (rx === -100) ctx.moveTo(rx, ry + rw);
          else ctx.lineTo(rx, ry + rw);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 6. MOUNTAINS/HILLS (Background)
      ctx.save();
      ctx.fillStyle = "#030206";
      ctx.beginPath();
      ctx.moveTo(-100, height+100);
      ctx.lineTo(-100, waterLine - totalOffsetY * 0.4 - 30);
      ctx.lineTo(width * 0.2 - totalOffsetX * 0.3, waterLine - totalOffsetY * 0.4 - 80);
      ctx.lineTo(width * 0.45 - totalOffsetX * 0.3, waterLine - totalOffsetY * 0.4 - 20);
      ctx.lineTo(width * 0.7 - totalOffsetX * 0.3, waterLine - totalOffsetY * 0.4 - 90);
      ctx.lineTo(width + 200, waterLine - totalOffsetY * 0.4 - 40);
      ctx.lineTo(width + 200, height+100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // MOUNTAINS (Midground)
      ctx.save();
      ctx.fillStyle = "#06040a";
      ctx.beginPath();
      ctx.moveTo(-100, height+100);
      ctx.lineTo(-100, waterLine - totalOffsetY * 0.8 - 10);
      ctx.lineTo(width * 0.15 - totalOffsetX * 0.6, waterLine - totalOffsetY * 0.8 - 40);
      ctx.lineTo(width * 0.35 - totalOffsetX * 0.6, waterLine - totalOffsetY * 0.8 + 20);
      ctx.lineTo(width * 0.55 - totalOffsetX * 0.6, waterLine - totalOffsetY * 0.8 - 50);
      ctx.lineTo(width * 0.72 - totalOffsetX * 0.6, waterLine - totalOffsetY * 0.8 + 35);
      ctx.lineTo(width * 0.88 - totalOffsetX * 0.6, waterLine - totalOffsetY * 0.8 - 25);
      ctx.lineTo(width + 200, waterLine - totalOffsetY * 0.8 + 15);
      ctx.lineTo(width + 200, height+100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      drawPineForest(false);
      
      ctx.save();
      ctx.fillStyle = "#010103";
      ctx.beginPath();
      ctx.moveTo(-100, height+100);
      ctx.lineTo(-100, waterLine - totalOffsetY * 1.0 + 40);
      ctx.lineTo(width * 0.28 - totalOffsetX * 1.1, waterLine - totalOffsetY * 1.0 - 5);
      ctx.lineTo(width * 0.52 - totalOffsetX * 1.1, waterLine - totalOffsetY * 1.0 + 35);
      ctx.lineTo(width * 0.78 - totalOffsetX * 1.1, waterLine - totalOffsetY * 1.0 - 15);
      ctx.lineTo(width + 200, waterLine - totalOffsetY * 1.0 + 55);
      ctx.lineTo(width + 200, height+100);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      drawCabins(false);

      // 7. WEATHER EFFECTS LAYER
      if ((weatherCondition === "rain" || weatherCondition === "thunderstorm") && rainDrops.length > 0) {
        ctx.save();
        ctx.lineWidth = 1.5;
        rainDrops.forEach((drop) => {
          ctx.strokeStyle = `rgba(174, 220, 255, ${drop.opacity})`;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.vx, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.vy;
          drop.x += drop.vx;

          if (drop.y >= waterLine && drop.y - drop.vy < waterLine && Math.random() < 0.4) {
            splashes.push({
              x: drop.x,
              y: waterLine + Math.random() * (height - waterLine),
              r: 1,
              maxR: Math.random() * 20 + 10,
              alpha: 0.5,
              decay: 0.02,
            });
          }

          if (drop.y > height+100 || drop.x < -100 || drop.x > width + 100) {
            drop.y = -drop.length;
            drop.x = Math.random() * width;
          }
        });
        ctx.restore();
      }

      if (splashes.length > 0) {
        ctx.save();
        splashes.forEach((sp, idx) => {
          ctx.strokeStyle = `rgba(200, 235, 255, ${sp.alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y, sp.r, sp.r * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();

          sp.r += 0.5;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            splashes.splice(idx, 1);
          }
        });
        ctx.restore();
      }

      if (weatherCondition === "snow" && snowflakes.length > 0) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        snowflakes.forEach((flake) => {
          flake.swing += flake.swingSpeed;
          const driftX = Math.sin(flake.swing) * 2.0;

          ctx.globalAlpha = flake.alpha;
          ctx.beginPath();
          ctx.arc(flake.x + driftX, flake.y, flake.r, 0, Math.PI * 2);
          ctx.fill();

          flake.y += flake.vy;
          flake.x += flake.vx + driftX * 0.3;

          if (flake.y > height+100 || flake.x < -100 || flake.x > width + 100) {
            flake.y = -20;
            flake.x = Math.random() * width;
            flake.swing = Math.random() * Math.PI * 2;
          }
        });
        ctx.restore();
      }

      if (fogLayers.length > 0) {
        ctx.save();
        fogLayers.forEach((fog) => {
          const fogGrad = ctx.createLinearGradient(fog.x, fog.y, fog.x, fog.y + fog.height);
          fogGrad.addColorStop(0, "rgba(250, 250, 255, 0)");
          fogGrad.addColorStop(0.5, `rgba(240, 240, 255, ${fog.alpha})`);
          fogGrad.addColorStop(1, "rgba(250, 250, 255, 0)");

          ctx.fillStyle = fogGrad;
          ctx.fillRect(fog.x - fog.width / 2, fog.y, fog.width, fog.height);

          fog.x += fog.vx;
          if (fog.x - fog.width / 2 > width+100) {
            fog.x = -fog.width / 2;
          } else if (fog.x + fog.width / 2 < -100) {
            fog.x = width + fog.width / 2;
          }
        });
        ctx.restore();
      }

      // 8. FOREGROUND FLOATING EMBERS/PARTICLES
      ctx.save();
      particles.forEach((p) => {
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          p.y = height * 0.75 + Math.random() * (height * 0.25);
          p.x = Math.random() * width;
          p.alpha = Math.random() * 0.8 + 0.2;
          p.size = Math.random() * 5.0 + 2.0;
          p.vy = -(Math.random() * 0.5 + 0.3);
          p.vx = (Math.random() - 0.5) * 0.4;
        }

        const musicSpeed = isMusicPlaying ? 1.7 + volume * 1.8 : 1.0;
        const pulseAlpha = p.alpha * (0.5 + Math.sin(frameCount * p.alphaSpeed * musicSpeed) * 0.5) * focusIntensity;

        ctx.fillStyle = hexToRgbaStr(themeColors.accent, pulseAlpha);
        ctx.shadowBlur = p.size * 10 * focusIntensity;
        ctx.shadowColor = themeColors.accent;

        ctx.beginPath();
        const displayX = p.x - totalOffsetX * 1.5;
        const displayY = p.y - totalOffsetY * 1.5;
        ctx.arc(displayX, displayY, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx * musicSpeed;
        p.y += p.vy * musicSpeed;
      });
      ctx.restore();

      ctx.restore(); // End Cinematic Camera Zoom
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [currentThemeId, isMusicPlaying, volume, mode, status]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
    />
  );
}
