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
  type: "soft" | "crystal" | "gold";
}

export function ChristmasAura() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isChristmas = useChristmasActive();
  const { motionOff } = useUiStore();
  const [sleighProgress, setSleighProgress] = useState(-340);
  const [sleighFlightCount, setSleighFlightCount] = useState(1);

  // Santa's sleigh flight across the sky (recurring smooth flight cycles)
  useEffect(() => {
    if (!isChristmas || motionOff) return;

    let timeoutId: number;
    let animFrame: number;

    const triggerSleigh = () => {
      setSleighProgress(-380);
      const startTime = performance.now();
      const duration = 15000; // 15 seconds to glide across the celestial sky

      const animateSleigh = (now: number) => {
        const elapsed = now - startTime;
        const p = (elapsed / duration) * (window.innerWidth + 760) - 380;
        setSleighProgress(p);

        if (elapsed < duration) {
          animFrame = requestAnimationFrame(animateSleigh);
        } else {
          setSleighFlightCount((prev) => prev + 1);
          // Trigger next flight after 10-18 seconds for lively Christmas ambiance
          timeoutId = window.setTimeout(triggerSleigh, 10000 + Math.random() * 8000);
        }
      };

      animFrame = requestAnimationFrame(animateSleigh);
    };

    // First appearance shortly after loading
    timeoutId = window.setTimeout(triggerSleigh, 1800);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animFrame);
    };
  }, [isChristmas, motionOff]);

  // Snowfall, Crystalline Flakes, Golden Stardust & Aurora Canvas
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
    window.addEventListener("resize", onResize, { passive: true });

    // Multi-layer snow & golden stardust particles (optimized per device)
    const isMobile = width < 768;
    const flakeCount = isMobile ? Math.min(52, Math.floor(width / 14)) : Math.min(115, Math.floor(width / 11));
    const flakes: SnowFlake[] = Array.from({ length: flakeCount }, () => {
      const typeRoll = Math.random();
      const type: "soft" | "crystal" | "gold" =
        typeRoll < 0.22 ? "gold" : typeRoll < 0.48 ? "crystal" : "soft";

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: type === "soft" ? Math.random() * 2.8 + 1.2 : type === "crystal" ? Math.random() * 2.2 + 1.5 : Math.random() * 1.8 + 0.8,
        speed: type === "soft" ? Math.random() * 1.1 + 0.4 : type === "crystal" ? Math.random() * 0.9 + 0.35 : Math.random() * 0.7 + 0.25,
        wind: Math.random() * 0.6 - 0.3,
        alpha: Math.random() * 0.55 + 0.4,
        oscillation: Math.random() * Math.PI * 2,
        type,
      };
    });

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Shimmering Aurora Borealis curtains across the top sky
      const auroraGrad = ctx.createLinearGradient(0, 0, width, height * 0.52);
      const pulseGreen = Math.sin(time * 0.6) * 0.05 + 0.09;
      const pulseViolet = Math.cos(time * 0.4) * 0.04 + 0.07;
      const pulseGold = Math.sin(time * 0.8) * 0.03 + 0.05;

      auroraGrad.addColorStop(0, `rgba(16, 185, 129, ${pulseGreen * 1.5})`); // Pine Green
      auroraGrad.addColorStop(0.35, `rgba(139, 92, 246, ${pulseViolet * 0.9})`); // Cosmic Violet
      auroraGrad.addColorStop(0.68, `rgba(255, 201, 74, ${pulseGold * 0.8})`); // Warm Golden Radiance
      auroraGrad.addColorStop(1, "rgba(3, 8, 22, 0)");
      ctx.fillStyle = auroraGrad;
      ctx.fillRect(0, 0, width, height * 0.55);

      // 2. High-performance Multi-layer Snowflakes (Soft, Crystalline & Golden Stardust)
      for (const flake of flakes) {
        flake.oscillation += 0.022;
        const currentWind = flake.wind + Math.sin(flake.oscillation) * 0.45;

        if (flake.type === "gold") {
          const goldTwinkle = Math.sin(flake.oscillation * 2.5) * 0.35 + 0.65;

          // Outer aura ring
          ctx.fillStyle = `rgba(255, 201, 74, ${flake.alpha * goldTwinkle * 0.35})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius * 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Crisp core
          ctx.fillStyle = `rgba(255, 235, 160, ${flake.alpha * goldTwinkle})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();

          // 4-point star glint for larger golden stardust
          if (flake.radius > 1.4) {
            ctx.strokeStyle = `rgba(255, 240, 180, ${flake.alpha * 0.8})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(flake.x - 3.5, flake.y);
            ctx.lineTo(flake.x + 3.5, flake.y);
            ctx.moveTo(flake.x, flake.y - 3.5);
            ctx.lineTo(flake.x, flake.y + 3.5);
            ctx.stroke();
          }
        } else if (flake.type === "crystal") {
          // Geometric 6-point snowflake crystal
          const rot = flake.oscillation * 0.5;
          ctx.save();
          ctx.translate(flake.x, flake.y);
          ctx.rotate(rot);
          ctx.strokeStyle = `rgba(240, 249, 255, ${flake.alpha * 0.85})`;
          ctx.lineWidth = 0.9;

          // 3 crossed axes = 6 arms
          for (let a = 0; a < 3; a++) {
            ctx.beginPath();
            ctx.moveTo(-flake.radius * 1.6, 0);
            ctx.lineTo(flake.radius * 1.6, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
          }
          ctx.restore();
        } else {
          // Soft fluffy snowflake with soft gradient edge
          ctx.fillStyle = `rgba(248, 250, 252, ${flake.alpha})`;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        flake.y += flake.speed;
        flake.x += currentWind;

        if (flake.y > height) {
          flake.y = -10;
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
      {/* 1. Canvas for Aurora Borealis, Parallax Snow & Golden Stardust */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* 2. Hanging Swinging Christmas Glass Ornaments in Top Corners */}
      {/* Left Ruby Bauble with Golden Snowflake pattern */}
      <div className="absolute top-0 left-6 sm:left-12 pointer-events-auto group">
        <div className="flex flex-col items-center origin-top animate-[spin_8s_ease-in-out_infinite_alternate] [animation-duration:4s]">
          {/* Golden Cord */}
          <span className="w-0.5 h-10 sm:h-16 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-sm" />
          {/* Bauble Cap */}
          <span className="w-2.5 h-1.5 bg-amber-400 rounded-xs shadow-xs" />
          {/* Glass Sphere */}
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-400 shadow-[0_4px_14px_rgba(225,29,72,0.6),inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center transition-transform group-hover:scale-110">
            {/* Golden Star Pattern */}
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 opacity-90" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 6.9h7.3l-5.9 4.3 2.3 7-6.1-4.4-6.1 4.4 2.3-7-5.9-4.3h7.3z" />
            </svg>
            {/* Glass Glint */}
            <span className="absolute top-1 left-1.5 h-2 w-2 rounded-full bg-white/70 blur-[0.5px]" />
          </div>
        </div>
      </div>

      {/* Right Emerald Bauble with Holiday Gold Ribbon */}
      <div className="absolute top-0 right-6 sm:right-12 pointer-events-auto group">
        <div className="flex flex-col items-center origin-top animate-[spin_8s_ease-in-out_infinite_alternate] [animation-duration:5s] [animation-delay:0.7s]">
          {/* Golden Cord */}
          <span className="w-0.5 h-8 sm:h-12 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-sm" />
          {/* Bauble Cap */}
          <span className="w-2.5 h-1.5 bg-amber-400 rounded-xs shadow-xs" />
          {/* Glass Sphere */}
          <div className="relative h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-600 to-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.6),inset_0_2px_4px_rgba(255,255,255,0.6)] flex items-center justify-center transition-transform group-hover:scale-110">
            {/* Golden Ring Pattern */}
            <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border border-dashed border-amber-300/80 animate-[spin_30s_linear_infinite]" />
            {/* Glass Glint */}
            <span className="absolute top-1 left-1.5 h-1.5 w-1.5 rounded-full bg-white/70 blur-[0.5px]" />
          </div>
        </div>
      </div>

      {/* 3. Decorative overhead garland of glowing festive lights */}
      <div className="absolute top-0 inset-x-0 flex justify-around px-3 sm:px-6 py-1 opacity-90">
        {Array.from({ length: 22 }).map((_, i) => {
          const colors = [
            { bg: "#E11D48", glow: "rgba(225, 29, 72, 0.85)" }, // Ruby Rose
            { bg: "#FFC94A", glow: "rgba(255, 201, 74, 0.85)" }, // Holiday Gold
            { bg: "#10B981", glow: "rgba(16, 185, 129, 0.85)" }, // Pine Emerald
            { bg: "#38B6FF", glow: "rgba(56, 182, 255, 0.85)" }, // Cyan Sky
            { bg: "#F59E0B", glow: "rgba(245, 158, 11, 0.85)" }, // Amber
          ];
          const c = colors[i % colors.length]!;

          return (
            <div key={i} className={`flex flex-col items-center ${i % 2 !== 0 ? "hidden sm:flex" : "flex"}`}>
              {/* Wire socket */}
              <span className="w-1 h-1 bg-slate-700/80 rounded-xs" />
              {/* Glowing Bulb with Holiday Flicker */}
              <span
                className="h-2 w-1.5 sm:h-2.5 sm:w-2 rounded-full animate-pulse transition-all duration-300"
                style={{
                  backgroundColor: c.bg,
                  boxShadow: `0 0 10px ${c.glow}`,
                  animationDelay: `${(i % 5) * 0.35}s`,
                  animationDuration: "2.1s",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* 4. Santa's Flying Sleigh with Rudolph and 4 Tandem Reindeers (Animated Gallop & Cometary Dust) */}
      <div
        className="absolute top-14 sm:top-20 flex items-center gap-1.5 transition-transform will-change-transform opacity-95 pointer-events-none transform-gpu scale-85 sm:scale-100 origin-left"
        style={{
          transform: `translate3d(${sleighProgress}px, ${Math.sin(sleighProgress / 60) * 18}px, 0)`,
        }}
      >
        <div className="flex items-center gap-1.5 drop-shadow-[0_0_18px_rgba(255,201,74,0.9)]">
          {/* Rudolph in the Lead with Radiant Pulsing Red Nose Beacon */}
          <div className="relative flex items-center animate-[bounce_1.4s_infinite]">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-300" viewBox="0 0 24 24">
              <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
            </svg>
            {/* Rudolph's Glowing Ruby Nose Beacon & Lens Flare */}
            <span className="absolute top-[6px] sm:top-[8px] right-[1px] sm:right-[2px] h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e,0_0_24px_#e11d48] animate-ping" />
            <span className="absolute top-[6px] sm:top-[8px] right-[1px] sm:right-[2px] h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
          </div>

          {/* Reindeers 2, 3 & 4 in convoy with galloping stagger */}
          <div className="animate-[bounce_1.4s_infinite] [animation-delay:0.18s]">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 -ml-1 sm:-ml-1.5 opacity-90" viewBox="0 0 24 24">
              <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
            </svg>
          </div>
          <div className="animate-[bounce_1.4s_infinite] [animation-delay:0.35s]">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 -ml-1 sm:-ml-1.5 opacity-85" viewBox="0 0 24 24">
              <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
            </svg>
          </div>
          <div className="animate-[bounce_1.4s_infinite] [animation-delay:0.52s]">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 -ml-1 sm:-ml-1.5 opacity-80" viewBox="0 0 24 24">
              <path d="M19 3l-1.5 2h-2L14 3h-1l.5 3-1.5 1.5L9 7v2l2 1v3l-2 2-1 4h2l1-3 2-1v-2l2-1.5 3-1 2-3.5L21 4l-2-1z" />
            </svg>
          </div>

          {/* Golden Reins Line */}
          <svg className="w-5 h-3 sm:w-6 sm:h-3 text-amber-300/80 -ml-1" viewBox="0 0 24 10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M0 5 Q 12 9 24 4" />
          </svg>

          {/* Santa Claus in his Festive Sleigh with Gift Sack */}
          <div className="relative -ml-1">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-amber-400" viewBox="0 0 32 32">
              <path d="M4 22c2 0 4-1.3 5.5-3.3l7 .7c2.5 0 5-2 5.8-4.5l1.2-6H21l-.7 3.3c-.4 1.3-1.6 2-2.7 2H11l-2-3c-.7-1.3-2-2-3.3-2H3v2.7h3.3c.4 0 1 .3 1.1.7l1.9 3.7c-2 2.7-4 4-5.3 4v2zm1.3 2.7c4.7 0 8.7-2.7 10.7-6l8 .7c2 0 4-1.1 5.1-2.7l-2.1-1.2c-.7 1.1-1.7 1.9-3 1.9l-8.3-.7C14 21.3 10 24 5.3 24v2.7H4.7c-1.1 0-2-.9-2-2s.9-2 2-2H6.7v2.7h-1.4z" />
              {/* Santa Figure in Red Velvet Suit */}
              <circle cx="16" cy="11" r="3.2" fill="#E11D48" />
              {/* White Beard and Cap Pom-pom */}
              <circle cx="18" cy="9.2" r="1.3" fill="#FFFFFF" />
              <path d="M15 12 Q 17 15 19 12" fill="#FFFFFF" />
              {/* Golden Sack of Gifts */}
              <circle cx="11.5" cy="13.5" r="2.8" fill="#F59E0B" />
              <circle cx="11" cy="11.5" r="1.2" fill="#FCD34D" />
            </svg>
          </div>
        </div>

        {/* Shimmering Golden Cometary Stardust Stream */}
        <div className="flex items-center -ml-2">
          <span className="h-1.5 w-28 sm:w-56 bg-gradient-to-l from-amber-400/95 via-amber-300/40 to-transparent blur-[1.5px] rounded-full" />
          <span className="h-1 w-14 sm:w-20 -ml-7 sm:-ml-10 bg-gradient-to-l from-white/95 to-transparent blur-[0.5px] rounded-full" />
        </div>
      </div>

      {/* 5. Live Santa Flight Tracker Telemetry Badge (Top Right Sub-HUD) */}
      <div className="absolute top-14 right-4 pointer-events-none hidden lg:flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-amber-400/30 rounded-full px-3 py-1 shadow-lg">
        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
        <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
          SANTA TRACKER LIVE // CIRCUITO #{sleighFlightCount} · POLO NORTE
        </span>
      </div>

      {/* 6. Decorative Frosted Pine Branches in Bottom Corners */}
      <div className="absolute bottom-20 sm:bottom-24 left-2 sm:left-4 pointer-events-none opacity-50 hover:opacity-85 transition-opacity">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500/60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 90 Q 30 70 50 40 M20 80 Q 40 75 55 60 M25 65 Q 45 55 60 35 M15 75 Q 35 60 45 45" strokeLinecap="round" />
          <circle cx="52" cy="38" r="3.5" fill="#FFC94A" />
          <circle cx="57" cy="58" r="3" fill="#E11D48" />
          <circle cx="47" cy="43" r="3" fill="#FFC94A" />
        </svg>
      </div>

      <div className="absolute bottom-20 sm:bottom-24 right-2 sm:right-4 pointer-events-none opacity-50 hover:opacity-85 transition-opacity transform -scale-x-100">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500/60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 90 Q 30 70 50 40 M20 80 Q 40 75 55 60 M25 65 Q 45 55 60 35 M15 75 Q 35 60 45 45" strokeLinecap="round" />
          <circle cx="52" cy="38" r="3.5" fill="#FFC94A" />
          <circle cx="57" cy="58" r="3" fill="#E11D48" />
          <circle cx="47" cy="43" r="3" fill="#FFC94A" />
        </svg>
      </div>
    </div>
  );
}
