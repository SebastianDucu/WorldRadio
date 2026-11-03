import { useEffect, useRef, useState } from "react";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { useUiStore } from "@/store/ui";

interface SnowFlake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  alpha: number;
  oscillation: number;
  isGold: boolean;
}

export function ChristmasAura() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isChristmas = useChristmasActive();
  const { motionOff } = useUiStore();
  const [sleighProgress, setSleighProgress] = useState(-250);

  // Santa's sleigh flight across the sky
  useEffect(() => {
    if (!isChristmas || motionOff) return;

    let timeoutId: number;
    let animFrame: number;

    const triggerSleigh = () => {
      setSleighProgress(-320);
      const startTime = performance.now();
      const duration = 14000; // 14 seconds to gracefully cross

      const animateSleigh = (now: number) => {
        const elapsed = now - startTime;
        const p = (elapsed / duration) * (window.innerWidth + 640) - 320;
        setSleighProgress(p);

        if (elapsed < duration) {
          animFrame = requestAnimationFrame(animateSleigh);
        } else {
          // Trigger next flight after 18-35 seconds
          timeoutId = window.setTimeout(triggerSleigh, 18000 + Math.random() * 16000);
        }
      };

      animFrame = requestAnimationFrame(animateSleigh);
    };

    // First appearance after 2.5 seconds
    timeoutId = window.setTimeout(triggerSleigh, 2500);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animFrame);
    };
  }, [isChristmas, motionOff]);

  // Snowfall, Golden Stardust & Aurora Canvas
  useEffect(() => {
    if (!isChristmas || motionOff) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", onResize);

    // Multi-layer snow & golden stardust particles (optimized per device)
    const isMobile = width < 768;
    const flakeCount = isMobile ? Math.min(38, Math.floor(width / 18)) : Math.min(85, Math.floor(width / 15));
    const flakes: SnowFlake[] = Array.from({ length: flakeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.6,
      speed: Math.random() * 1.0 + 0.35,
      wind: Math.random() * 0.6 - 0.3,
      alpha: Math.random() * 0.6 + 0.35,
      oscillation: Math.random() * Math.PI * 2,
      isGold: i % 4 === 0, // 25% golden stardust particles
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Shimmering Aurora Borealis curtains across the top sky
      const auroraGrad = ctx.createLinearGradient(0, 0, width, height * 0.48);
      const pulseGreen = Math.sin(time * 0.6) * 0.04 + 0.08;
      const pulseViolet = Math.cos(time * 0.4) * 0.03 + 0.06;

      auroraGrad.addColorStop(0, `rgba(16, 185, 129, ${pulseGreen * 1.4})`); // Pine Green
      auroraGrad.addColorStop(0.38, `rgba(139, 92, 246, ${pulseViolet * 0.8})`); // Cosmic Violet
      auroraGrad.addColorStop(0.7, `rgba(255, 201, 74, 0.04)`); // Golden Radiance
      auroraGrad.addColorStop(1, "rgba(3, 8, 22, 0)");
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, width, height * 0.55);

      // 2. High-performance Snowflakes & Golden Stardust (0 GPU raster blur stalls)
      for (const flake of flakes) {
        flake.oscillation += 0.025;
        const currentWind = flake.wind + Math.sin(flake.oscillation) * 0.45;

        if (flake.isGold) {
          const goldTwinkle = Math.sin(flake.oscillation * 2) * 0.3 + 0.7;
          // Outer subtle aura ring
          ctx.fillStyle = `rgba(255, 201, 74, ${flake.alpha * goldTwinkle * 0.35})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius * 1.7, 0, Math.PI * 2);
          ctx.fill();

          // Crisp core
          ctx.fillStyle = `rgba(255, 230, 150, ${flake.alpha * goldTwinkle})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();

          // Draw small 4-point star glint for larger golden stardust
          if (flake.radius > 1.8) {
            ctx.strokeStyle = `rgba(255, 230, 150, ${flake.alpha * 0.7})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(flake.x - 3, flake.y);
            ctx.lineTo(flake.x + 3, flake.y);
            ctx.moveTo(flake.x, flake.y - 3);
            ctx.lineTo(flake.x, flake.y + 3);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = `rgba(248, 250, 252, ${flake.alpha})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        flake.y += flake.speed;
        flake.x += currentWind;

        if (flake.y > height) {
          flake.y = -8;
          flake.x = Math.random() * width;
        }
        if (flake.x > width) flake.x = 0;
        if (flake.x < 0) flake.x = width;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [isChristmas, motionOff]);

  if (!isChristmas) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none" aria-hidden="true">
      {/* Canvas for Aurora, Parallax Snow & Golden Stardust */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Decorative overhead garland of glowing festive lights (responsive density) */}
      <div className="absolute top-0 inset-x-0 flex justify-around px-3 sm:px-6 py-1 opacity-85">
        {Array.from({ length: 22 }).map((_, i) => {
          const colors = [
            { bg: "#E11D48", glow: "rgba(225, 29, 72, 0.75)" }, // Ruby Rose
            { bg: "#FFC94A", glow: "rgba(255, 201, 74, 0.75)" }, // Holiday Gold
            { bg: "#10B981", glow: "rgba(16, 185, 129, 0.75)" }, // Pine Emerald
            { bg: "#38B6FF", glow: "rgba(56, 182, 255, 0.75)" }, // Cyan Sky
            { bg: "#F59E0B", glow: "rgba(245, 158, 11, 0.75)" }, // Amber
          ];
          const c = colors[i % colors.length]!;

          return (
            <div key={i} className={`flex flex-col items-center ${i % 2 !== 0 ? "hidden sm:flex" : "flex"}`}>
              {/* Wire socket */}
              <span className="w-1 h-1 bg-slate-700/80 rounded-xs" />
              {/* Glowing Bulb */}
              <span
                className="h-2 w-1.5 sm:h-2.5 sm:w-2 rounded-full animate-pulse transition-all duration-300"
                style={{
                  backgroundColor: c.bg,
                  boxShadow: `0 0 8px ${c.glow}`,
                  animationDelay: `${(i % 5) * 0.35}s`,
                  animationDuration: "2.1s",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Santa's Flying Sleigh with Rudolph and Reindeer Team */}
      <div
        className="absolute top-14 sm:top-18 flex items-center gap-1.5 transition-transform will-change-transform opacity-95 pointer-events-none transform-gpu"
        style={{
          transform: `translate3d(${sleighProgress}px, ${Math.sin(sleighProgress / 65) * 16}px, 0)`,
        }}
      >
        <div className="flex items-center gap-1.5 drop-shadow-[0_0_16px_rgba(255,201,74,0.9)]">
          {/* Rudolph in the Lead with glowing Red Nose */}
          <div className="relative flex items-center">
            <svg className="w-6 h-6 fill-amber-300" viewBox="0 0 24 24">
              <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
            </svg>
            {/* Rudolph's Glowing Ruby Nose Beacon */}
            <span className="absolute top-[8px] right-[2px] h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping" />
            <span className="absolute top-[8px] right-[2px] h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          </div>

          {/* Reindeers 2, 3 & 4 in convoy */}
          <svg className="w-5 h-5 fill-amber-300 -ml-1.5 opacity-90" viewBox="0 0 24 24">
            <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
          </svg>
          <svg className="w-5 h-5 fill-amber-300 -ml-1.5 opacity-85" viewBox="0 0 24 24">
            <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
          </svg>
          <svg className="w-5 h-5 fill-amber-300 -ml-1.5 opacity-80" viewBox="0 0 24 24">
            <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
          </svg>

          {/* Golden Reins Line */}
          <svg className="w-5 h-3 text-amber-300/80 -ml-1" viewBox="0 0 24 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M0 5 Q 12 9 24 4" />
          </svg>

          {/* Santa Claus in his Festive Sleigh */}
          <div className="relative -ml-1">
            <svg className="w-8 h-8 sm:w-9 sm:h-9 fill-amber-400" viewBox="0 0 32 32">
              <path d="M4 22c2 0 4-1.3 5.5-3.3l7 .7c2.5 0 5-2 5.8-4.5l1.2-6H21l-.7 3.3c-.4 1.3-1.6 2-2.7 2H11l-2-3c-.7-1.3-2-2-3.3-2H3v2.7h3.3c.4 0 1 .3 1.1.7l1.9 3.7c-2 2.7-4 4-5.3 4v2zm1.3 2.7c4.7 0 8.7-2.7 10.7-6l8 .7c2 0 4-1.1 5.1-2.7l-2.1-1.2c-.7 1.1-1.7 1.9-3 1.9l-8.3-.7C14 21.3 10 24 5.3 24v2.7H4.7c-1.1 0-2-.9-2-2s.9-2 2-2H6.7v2.7h-1.4z" />
              {/* Santa Figure with Red Cap */}
              <circle cx="16" cy="11" r="2.8" fill="#E11D48" />
              <circle cx="17.5" cy="9.5" r="1.2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* Shimmering Golden Cometary Trail & Sparkles */}
        <div className="flex items-center -ml-2">
          <span className="h-1.5 w-32 sm:w-48 bg-gradient-to-l from-amber-400/90 via-amber-300/40 to-transparent blur-[1.5px] rounded-full" />
          <span className="h-1 w-16 -ml-8 bg-gradient-to-l from-white/90 to-transparent blur-[0.5px] rounded-full" />
        </div>
      </div>

      {/* Decorative frosted pine branches in bottom corners (SVG paths, zero emojis) */}
      <div className="absolute bottom-2 left-2 pointer-events-none opacity-40 hover:opacity-75 transition-opacity">
        <svg className="w-16 h-16 text-emerald-500/50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 90 Q 30 70 50 40 M20 80 Q 40 75 55 60 M25 65 Q 45 55 60 35 M15 75 Q 35 60 45 45" strokeLinecap="round" />
          <circle cx="52" cy="38" r="3" fill="#FFC94A" />
          <circle cx="57" cy="58" r="2.5" fill="#E11D48" />
          <circle cx="47" cy="43" r="2.5" fill="#FFC94A" />
        </svg>
      </div>

      <div className="absolute bottom-2 right-2 pointer-events-none opacity-40 hover:opacity-75 transition-opacity transform -scale-x-100">
        <svg className="w-16 h-16 text-emerald-500/50" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 90 Q 30 70 50 40 M20 80 Q 40 75 55 60 M25 65 Q 45 55 60 35 M15 75 Q 35 60 45 45" strokeLinecap="round" />
          <circle cx="52" cy="38" r="3" fill="#FFC94A" />
          <circle cx="57" cy="58" r="2.5" fill="#E11D48" />
          <circle cx="47" cy="43" r="2.5" fill="#FFC94A" />
        </svg>
      </div>
    </div>
  );
}
