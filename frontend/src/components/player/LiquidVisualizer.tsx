import { useEffect, useRef } from "react";
import { usePlayerStore, type VisualizerMode } from "@/store/player";
import { useUiStore } from "@/store/ui";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { toast } from "@/store/toast";

interface LiquidVisualizerProps {
  className?: string;
  height?: number;
  width?: number;
  interactive?: boolean;
}

export function LiquidVisualizer({
  className = "",
  height = 36,
  width = 160,
  interactive = true,
}: LiquidVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isPlaying, isLoading, visualizerMode, setVisualizerMode, currentStation } = usePlayerStore();
  const { motionOff } = useUiStore();
  const isChristmas = useChristmasActive();

  const handleCycleMode = () => {
    if (!interactive) return;
    const modes: VisualizerMode[] = ["wave", "bars", "pulse"];
    const nextIdx = (modes.indexOf(visualizerMode) + 1) % modes.length;
    const next: VisualizerMode = modes[nextIdx] ?? "wave";
    setVisualizerMode(next);
    const labels: Record<VisualizerMode, string> = {
      wave: "Ondas Líquidas",
      bars: "Espectro EQ",
      pulse: "Pulso Orbital",
    };
    toast.info(`Visualizador: ${labels[next]}`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const stationHue = currentStation?.hue ?? 200;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isPlaying || motionOff) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(140, 180, 240, 0.25)";
        ctx.lineWidth = 2;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(140, 180, 240, 0.4)";
        ctx.fill();
        return;
      }

      phase += isLoading ? 0.04 : 0.07;

      if (visualizerMode === "wave") {
        const numWaves = 3;
        for (let w = 0; w < numWaves; w++) {
          ctx.beginPath();
          const wavePhase = phase + w * 0.8;
          const amp = isLoading ? 4 : 8 + w * 3;
          const freq = 0.035 + w * 0.015;

          ctx.moveTo(0, height / 2);
          for (let x = 0; x <= width; x += 4) {
            const envelope = Math.sin((x / width) * Math.PI); 
            const y = height / 2 + Math.sin(x * freq + wavePhase) * amp * envelope;
            ctx.lineTo(x, y);
          }

          if (w === numWaves - 1) {
            const grad = ctx.createLinearGradient(0, 0, width, 0);
            if (isChristmas) {
              grad.addColorStop(0, "rgba(255, 201, 74, 0.4)");
              grad.addColorStop(0.5, "#ffd670");
              grad.addColorStop(1, "#e11d48");
              ctx.strokeStyle = grad;
              ctx.lineWidth = 2.5;
              ctx.shadowColor = "#ffc94a";
            } else {
              grad.addColorStop(0, `hsla(${stationHue}, 100%, 70%, 0.4)`);
              grad.addColorStop(0.5, "#7fe3ff");
              grad.addColorStop(1, `hsla(${stationHue + 40}, 100%, 65%, 0.8)`);
              ctx.strokeStyle = grad;
              ctx.lineWidth = 2.5;
              ctx.shadowColor = "#38b6ff";
            }
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            ctx.strokeStyle = isChristmas
              ? `rgba(255, 201, 74, ${0.28 - w * 0.08})`
              : `hsla(${stationHue + w * 20}, 90%, 60%, ${0.25 - w * 0.08})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      } else if (visualizerMode === "bars") {
        const barCount = 16;
        const barWidth = 4;
        const spacing = (width - barCount * barWidth) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const x = spacing + i * (barWidth + spacing);
          const t = phase * 2 + i * 0.45;
          const norm = Math.abs(Math.sin(t) * 0.65 + Math.cos(t * 1.5) * 0.35);
          const barHeight = Math.max(4, norm * (height - 6));
          const y = (height - barHeight) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          if (isChristmas) {
            grad.addColorStop(0, "#ffd670");
            grad.addColorStop(0.6, "#ffc94a");
            grad.addColorStop(1, "#e11d48");
          } else {
            grad.addColorStop(0, "#7fe3ff");
            grad.addColorStop(0.6, `hsl(${stationHue}, 90%, 55%)`);
            grad.addColorStop(1, "#1e6bff");
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        const cx = width / 2;
        const cy = height / 2;
        const maxR = Math.min(width, height) / 2 - 2;

        for (let r = 0; r < 3; r++) {
          const currentR = ((phase * 15 + r * 12) % maxR);
          const alpha = Math.max(0, 1 - currentR / maxR) * 0.7;

          ctx.beginPath();
          ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = isChristmas
            ? `rgba(255, 201, 74, ${alpha})`
            : `hsla(${stationHue + r * 15}, 95%, 65%, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = isChristmas ? "#ffc94a" : "#38b6ff";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isLoading, visualizerMode, width, height, currentStation?.hue, motionOff]);

  return (
    <div
      onClick={handleCycleMode}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none group transition-transform active:scale-95 ${className}`}
      title={interactive ? `Visualizador: Clic para alternar modo (${visualizerMode})` : undefined}
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="rounded-xl drop-shadow-[0_0_8px_rgba(56,182,255,0.35)]"
      />
    </div>
  );
}
