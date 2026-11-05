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
      <div
        className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full opacity-10 transition-colors duration-1000 transform-gpu pointer-events-none"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, rgba(255, 201, 74, 0.4) 0%, rgba(217, 119, 6, 0.1) 60%, transparent 100%)"
            : `radial-gradient(circle, hsla(${stationHue}, 90%, 55%, 0.35) 0%, hsla(${stationHue + 25}, 85%, 35%, 0.08) 60%, transparent 100%)`,
        }}
      />

      <div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-10 transition-all duration-1000 transform-gpu pointer-events-none"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, rgba(225, 29, 72, 0.35) 0%, rgba(136, 19, 55, 0.08) 60%, transparent 100%)"
            : isPlaying
            ? "radial-gradient(circle, rgba(56, 182, 255, 0.35) 0%, rgba(30, 58, 138, 0.08) 60%, transparent 100%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(30, 27, 75, 0.08) 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
