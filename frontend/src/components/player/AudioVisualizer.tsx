import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { useUiStore } from "@/store/ui";

interface AudioVisualizerProps {
  barCount?: number;
  className?: string;
}

export function AudioVisualizer({ barCount = 18, className = "" }: AudioVisualizerProps) {
  const { isPlaying, isLoading } = usePlayerStore();
  const { motionOff } = useUiStore();
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(15));

  useEffect(() => {
    if (!isPlaying || motionOff) {
      setBars(Array(barCount).fill(12));
      return;
    }

    const interval = setInterval(() => {
      setBars(
        Array.from({ length: barCount }, (_, i) => {

          const base = 20 + Math.sin(Date.now() / 200 + i) * 15;
          const noise = Math.random() * 60;
          return Math.max(10, Math.min(100, Math.round(base + noise)));
        }),
      );
    }, 110);

    return () => clearInterval(interval);
  }, [isPlaying, barCount, motionOff]);

  return (
    <div
      className={`flex items-end justify-center gap-[3px] h-7 px-2 select-none ${className}`}
      aria-hidden="true"
    >
      {bars.map((height, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full transition-all duration-100"
          style={{
            height: isLoading ? "25%" : `${height}%`,
            background: isPlaying
              ? "linear-gradient(to top, rgb(var(--color-accent-2)), rgb(var(--color-accent)))"
              : "rgb(var(--color-muted) / 0.3)",
            opacity: isPlaying ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
