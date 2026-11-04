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

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
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
    const flakeCount = isMobile ? Math.min(50, Math.floor(width / 14)) : Math.min(100, Math.floor(width / 11));
    const flakes: SnowFlake[] = Array.from({ length: flakeCount }, () => {
      const typeRoll = Math.random();
      const type: "soft" | "crystal" = typeRoll < 0.35 ? "crystal" : "soft";
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: type === "soft" ? Math.random() * 2.2 + 0.8 : Math.random() * 1.8 + 1.0,
        speed: type === "soft" ? Math.random() * 0.85 + 0.3 : Math.random() * 0.7 + 0.25,
        wind: Math.random() * 0.4 - 0.2,
        alpha: Math.random() * 0.35 + 0.35,
        oscillation: Math.random() * Math.PI * 2,
        type,
      };
    });

    let flightX = -320;
    let flightY = height * 0.16;
    let flightSpeed = isMobile ? 1.4 : 1.7;
    let flightProgress = 0;
    const stardustList: Stardust[] = [];

    const lightColors = [
      { core: "#ff3366", glow: "rgba(255, 51, 102, 0.45)" },
      { core: "#ffc107", glow: "rgba(255, 193, 7, 0.5)" },
      { core: "#00e676", glow: "rgba(0, 230, 118, 0.45)" },
      { core: "#00e5ff", glow: "rgba(0, 229, 255, 0.45)" },
      { core: "#e040fb", glow: "rgba(224, 64, 251, 0.4)" },
      { core: "#ff9100", glow: "rgba(255, 145, 0, 0.45)" },
    ];

    const bulbSpacing = isMobile ? 32 : 44;
    const bulbCount = Math.ceil(width / bulbSpacing) + 1;

    function drawFairyLights(time: number) {
      if (!ctx) return;
      ctx.save();

      ctx.beginPath();
      ctx.strokeStyle = "rgba(40, 70, 50, 0.45)";
      ctx.lineWidth = 1.2;

      for (let i = 0; i < bulbCount; i++) {
        const x1 = i * bulbSpacing;
        const x2 = (i + 1) * bulbSpacing;
        const midX = (x1 + x2) / 2;
        const sag = 8 + Math.sin(time * 0.001 + i) * 1.5;

        if (i === 0) ctx.moveTo(x1, 0);
        ctx.quadraticCurveTo(midX, sag, x2, 0);
      }
      ctx.stroke();

      for (let i = 0; i < bulbCount; i++) {
        const x = i * bulbSpacing;
        const sag = 7 + Math.sin(time * 0.001 + i) * 1.5;
        const color = lightColors[i % lightColors.length]!;
        const pulse = Math.sin(time * 0.003 + i * 0.8) * 0.25 + 0.75;

        ctx.fillStyle = "#334155";
        ctx.fillRect(x - 1.5, sag - 2, 3, 3);

        const glowGrad = ctx.createRadialGradient(x, sag + 4, 1, x, sag + 4, 14);
        glowGrad.addColorStop(0, color.glow);
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, sag + 4, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color.core;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.ellipse(x, sag + 4, 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = pulse * 0.8;
        ctx.beginPath();
        ctx.arc(x - 0.8, sag + 2.5, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    function drawReindeer(x: number, y: number, legPhase: number, isLead: boolean) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);

      const leap = Math.sin(legPhase) * 3;
      ctx.translate(0, leap);

      ctx.fillStyle = "rgba(255, 235, 190, 0.95)";
      ctx.shadowColor = "rgba(255, 201, 74, 0.6)";
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 5, -0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(7, -2);
      ctx.lineTo(13, -10);
      ctx.lineTo(16, -9);
      ctx.lineTo(10, 1);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(15, -11, 4.5, 3, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 230, 170, 0.9)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(14, -13);
      ctx.lineTo(11, -19);
      ctx.lineTo(9, -20);
      ctx.moveTo(11, -19);
      ctx.lineTo(15, -23);
      ctx.moveTo(13, -21);
      ctx.lineTo(16, -19);
      ctx.stroke();

      const frontLeg1 = Math.sin(legPhase) * 6;
      const hindLeg1 = -Math.sin(legPhase) * 5;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255, 235, 190, 0.95)";
      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(12 + frontLeg1, 9);
      ctx.moveTo(6, 2);
      ctx.lineTo(10 - frontLeg1, 8);
      ctx.moveTo(-7, 2);
      ctx.lineTo(-11 + hindLeg1, 8);
      ctx.moveTo(-9, 2);
      ctx.lineTo(-14 - hindLeg1, 9);
      ctx.stroke();

      if (isLead) {
        ctx.fillStyle = "#ff1744";
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(19, -11, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawSleigh(x: number, y: number, time: number) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(x, y);

      const tilt = Math.sin(time * 0.002) * 0.05;
      ctx.rotate(tilt);

      ctx.shadowColor = "rgba(255, 201, 74, 0.7)";
      ctx.shadowBlur = 10;

      ctx.strokeStyle = "#ffd54f";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-18, 7);
      ctx.lineTo(14, 7);
      ctx.quadraticCurveTo(21, 6, 23, 1);
      ctx.stroke();

      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, 7);
      ctx.lineTo(-9, 2);
      ctx.moveTo(8, 7);
      ctx.lineTo(6, 2);
      ctx.stroke();

      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.moveTo(-16, 2);
      ctx.lineTo(12, 2);
      ctx.quadraticCurveTo(15, -2, 11, -5);
      ctx.lineTo(-4, -5);
      ctx.quadraticCurveTo(-14, -5, -17, 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#ffc107";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#991b1b";
      ctx.beginPath();
      ctx.ellipse(-10, -6, 6, 5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(0, -9, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.ellipse(2, -7, 3, 2.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.moveTo(-2, -12);
      ctx.lineTo(2, -12);
      ctx.lineTo(5, -16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(6, -16.5, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 215, 0, 0.75)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(2, -7);
      ctx.quadraticCurveTo(35, -2, 70, -6);
      ctx.stroke();

      ctx.restore();
    }

    function drawStardust() {
      if (!ctx) return;
      for (let i = stardustList.length - 1; i >= 0; i--) {
        const p = stardustList[i]!;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          stardustList.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;

        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(p.x, p.y - s);
        ctx.quadraticCurveTo(p.x, p.y, p.x + s, p.y);
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s);
        ctx.quadraticCurveTo(p.x, p.y, p.x - s, p.y);
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s);
        ctx.fill();

        ctx.restore();
      }
    }

    const render = (time: number) => {

      ctx.clearRect(0, 0, width, height);

      drawFairyLights(time);

      flightX += flightSpeed;
      flightProgress += 0.003;
      flightY = (height * 0.16) + Math.sin(flightProgress * 2.8) * 22;

      if (flightX > width + 280) {
        flightX = -320;
        flightY = height * (0.12 + Math.random() * 0.12);
        flightSpeed = isMobile ? 1.3 + Math.random() * 0.3 : 1.6 + Math.random() * 0.4;
      }

      if (flightX > -260 && flightX < width + 260) {
        const legPhase = time * 0.007;

        drawSleigh(flightX, flightY, time);
        drawReindeer(flightX + 46, flightY - 2, legPhase, false);
        drawReindeer(flightX + 88, flightY - 5, legPhase + 0.8, false);
        drawReindeer(flightX + 130, flightY - 8, legPhase + 1.6, true);

        if (Math.random() < 0.65) {
          const goldHues = ["#ffe082", "#ffd54f", "#fff59d", "#ffffff", "#ff80ab"];
          stardustList.push({
            x: flightX - 10 + (Math.random() * 8 - 4),
            y: flightY + 6 + (Math.random() * 4 - 2),
            vx: -flightSpeed * 0.7 - Math.random() * 0.6,
            vy: Math.random() * 0.6 - 0.1,
            size: Math.random() * 2.4 + 1.2,
            alpha: 0.9,
            decay: Math.random() * 0.018 + 0.012,
            color: goldHues[Math.floor(Math.random() * goldHues.length)]!,
          });

          stardustList.push({
            x: flightX + 46 + (Math.random() * 80),
            y: flightY + 6 + (Math.random() * 6),
            vx: -flightSpeed * 0.4 - Math.random() * 0.5,
            vy: Math.random() * 0.5 + 0.1,
            size: Math.random() * 2.0 + 1.0,
            alpha: 0.8,
            decay: Math.random() * 0.02 + 0.014,
            color: goldHues[Math.floor(Math.random() * goldHues.length)]!,
          });
        }
      }

      drawStardust();

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

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [isChristmas, motionOff]);

  if (!isChristmas) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden select-none" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
