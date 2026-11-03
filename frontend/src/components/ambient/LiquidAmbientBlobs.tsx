import { useUiStore } from "@/store/ui";
import { usePlayerStore } from "@/store/player";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";

export function LiquidAmbientBlobs() {
  const { motionOff } = useUiStore();
  const { currentStation, isPlaying } = usePlayerStore();
  const isChristmas = useChristmasActive();

  if (motionOff) return null;

  const stationHue = currentStation?.hue ?? 205;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* Liquid Blob 1: Cyan / Station Hue (Top Left) */}
      <div
        className="liquid-blob-1 absolute -top-24 -left-24 h-96 w-96 rounded-full opacity-20 sm:opacity-25 blur-[100px] transition-colors duration-1000"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, #ffc94a 0%, #d97706 70%, transparent 100%)"
            : `radial-gradient(circle, hsl(${stationHue}, 90%, 60%) 0%, hsl(${stationHue + 25}, 85%, 45%) 70%, transparent 100%)`,
        }}
      />

      {/* Liquid Blob 2: Deep Neon Indigo (Bottom Right) */}
      <div
        className="liquid-blob-2 absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full opacity-15 sm:opacity-20 blur-[120px] transition-all duration-1000"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, #d7263d 0%, #881337 70%, transparent 100%)"
            : isPlaying
            ? "radial-gradient(circle, #38b6ff 0%, #1e3a8a 70%, transparent 100%)"
            : "radial-gradient(circle, #6366f1 0%, #1e1b4b 70%, transparent 100%)",
        }}
      />

      {/* Liquid Blob 3: Center Ambient Glow behind Globe */}
      <div
        className="liquid-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full opacity-10 sm:opacity-15 blur-[140px] pointer-events-none"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, #10b981 0%, #064e3b 60%, transparent 100%)"
            : "radial-gradient(circle, #0284c7 0%, #0c4a6e 60%, transparent 100%)",
        }}
      />
    </div>
  );
}

