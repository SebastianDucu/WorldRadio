import { useEffect, useRef } from "react";
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
  type: "soft" | "crystal";
}

export function ChristmasAura() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isChristmas = useChristmasActive();
  const { motionOff } = useUiStore();

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

    const isMobile = width < 768;
    const flakeCount = isMobile ? Math.min(60, Math.floor(width / 12)) : Math.min(120, Math.floor(width / 10));
    const flakes: SnowFlake[] = Array.from({ length: flakeCount }, () => {
      const typeRoll = Math.random();
      const type: "soft" | "crystal" = typeRoll < 0.4 ? "crystal" : "soft";

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: type === "soft" ? Math.random() * 2.2 + 0.8 : Math.random() * 1.8 + 1.0,
        speed: type === "soft" ? Math.random() * 0.9 + 0.35 : Math.random() * 0.75 + 0.3,
        wind: Math.random() * 0.4 - 0.2,
        alpha: Math.random() * 0.35 + 0.35,
        oscillation: Math.random() * Math.PI * 2,
        type,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const flake of flakes) {
        flake.oscillation += 0.018;
        const currentWind = flake.wind + Math.sin(flake.oscillation) * 0.3;

        if (flake.type === "crystal") {
          const rot = flake.oscillation * 0.4;
          ctx.save();
          ctx.translate(flake.x, flake.y);
          ctx.rotate(rot);
          ctx.strokeStyle = `rgba(224, 242, 254, ${flake.alpha * 0.85})`;
          ctx.lineWidth = 0.8;

          for (let a = 0; a < 3; a++) {
            ctx.beginPath();
            ctx.moveTo(-flake.radius * 1.4, 0);
            ctx.lineTo(flake.radius * 1.4, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
          }
          ctx.restore();
        } else {
          ctx.fillStyle = `rgba(240, 249, 255, ${flake.alpha})`;
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
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden select-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
    </div>
  );
}
