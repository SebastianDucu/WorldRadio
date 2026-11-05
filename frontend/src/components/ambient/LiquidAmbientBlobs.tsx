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
        className="liquid-blob-1 absolute -top-24 -left-20 h-80 sm:h-[420px] w-80 sm:w-[420px] rounded-full opacity-20 sm:opacity-30 blur-[60px] sm:blur-[100px] transition-colors duration-1000 transform-gpu will-change-transform"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, #ffc94a 0%, #ea580c 60%, transparent 100%)"
            : `radial-gradient(circle, hsl(${stationHue}, 95%, 60%) 0%, hsl(${stationHue + 30}, 90%, 42%) 65%, transparent 100%)`,
        }}
      />

      <div
        className="liquid-blob-2 absolute -bottom-32 -right-20 h-96 sm:h-[520px] w-96 sm:w-[520px] rounded-full opacity-20 sm:opacity-28 blur-[70px] sm:blur-[120px] transition-all duration-1000 transform-gpu will-change-transform"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, #e11d48 0%, #881337 65%, transparent 100%)"
            : isPlaying
            ? "radial-gradient(circle, #38bdf8 0%, #1e3a8a 65%, transparent 100%)"
            : "radial-gradient(circle, #6366f1 0%, #1e1b4b 65%, transparent 100%)",
        }}
      />

      <div
        className="liquid-blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] sm:h-[620px] w-[420px] sm:w-[620px] rounded-full opacity-10 sm:opacity-15 blur-[80px] sm:blur-[140px] pointer-events-none transform-gpu will-change-transform"
        style={{
          background: isChristmas
            ? "radial-gradient(circle, #10b981 0%, #064e3b 65%, transparent 100%)"
            : "radial-gradient(circle, #0284c7 0%, #0c4a6e 65%, transparent 100%)",
        }}
      />

      <div
        className="absolute -top-6 -left-6 sm:top-8 sm:left-10 w-44 h-44 sm:w-64 sm:h-64 rounded-full opacity-85 sm:opacity-95 transform-gpu will-change-transform transition-all duration-700"
        style={{
          animation: "orb-float-smooth 22s ease-in-out infinite alternate",
          background: isChristmas
            ? "radial-gradient(circle at 35% 30%, #fde047 0%, #ea580c 50%, #9a3412 80%, #431407 100%)"
            : "radial-gradient(circle at 35% 30%, #ff8c42 0%, #ea580c 45%, #9a3412 80%, #431407 100%)",
          boxShadow: "0 24px 60px -10px rgba(234, 88, 12, 0.45), inset -8px -8px 24px rgba(0,0,0,0.45)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 26%)",
          }}
        />
      </div>

      <div
        className="absolute -bottom-10 -right-8 sm:bottom-10 sm:right-16 w-52 h-52 sm:w-72 sm:h-72 rounded-full opacity-80 sm:opacity-90 transform-gpu will-change-transform transition-all duration-700"
        style={{
          animation: "orb-float-smooth 26s ease-in-out infinite alternate-reverse",
          background: isChristmas
            ? "radial-gradient(circle at 35% 30%, #f43f5e 0%, #be123c 45%, #881337 75%, #4c0519 100%)"
            : "radial-gradient(circle at 35% 30%, #a5b4fc 0%, #6366f1 35%, #4338ca 70%, #1e1b4b 100%)",
          boxShadow: isChristmas
            ? "0 28px 70px -10px rgba(225, 29, 72, 0.45), inset -10px -10px 30px rgba(0,0,0,0.5)"
            : "0 28px 70px -10px rgba(99, 102, 241, 0.45), inset -10px -10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 24%)",
          }}
        />
      </div>

      <div
        className="absolute top-10 right-28 sm:right-64 w-16 h-16 sm:w-24 sm:h-24 rounded-full opacity-75 sm:opacity-85 transform-gpu will-change-transform"
        style={{
          animation: "orb-float-smooth 18s ease-in-out infinite alternate",
          background: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 40%, #1d4ed8 75%, #0f172a 100%)",
          boxShadow: "0 12px 35px -5px rgba(59, 130, 246, 0.4), inset -5px -5px 15px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 24%)",
          }}
        />
      </div>

      <div
        className="absolute bottom-32 left-1/4 sm:left-1/3 w-12 h-12 sm:w-16 sm:h-16 rounded-full opacity-80 transform-gpu will-change-transform"
        style={{
          animation: "orb-float-smooth 16s ease-in-out infinite alternate-reverse",
          background: "radial-gradient(circle at 35% 30%, #fdba74 0%, #f97316 45%, #c2410c 80%, #431407 100%)",
          boxShadow: "0 8px 24px -3px rgba(249, 115, 22, 0.4), inset -3px -3px 10px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 24%)",
          }}
        />
      </div>

      <div
        className="absolute top-28 left-4 sm:left-16 w-20 h-20 sm:w-28 sm:h-28 opacity-80 sm:opacity-95 transform-gpu will-change-transform"
        style={{
          animation: "gold-ring-float-1 20s ease-in-out infinite alternate",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)]">
          <defs>
            <linearGradient id="goldRing3D1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="16%" stopColor="#fef08a" />
              <stop offset="38%" stopColor="#eab308" />
              <stop offset="62%" stopColor="#a16207" />
              <stop offset="84%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <radialGradient id="goldRingGlint1" cx="28%" cy="26%" r="35%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#fde047" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="37" fill="none" stroke="url(#goldRing3D1)" strokeWidth="13" />
          <ellipse cx="50" cy="50" rx="37" ry="37" fill="none" stroke="url(#goldRingGlint1)" strokeWidth="2.5" opacity="0.85" />
        </svg>
      </div>

      <div
        className="absolute bottom-36 right-6 sm:right-28 w-16 h-16 sm:w-24 sm:h-24 opacity-75 sm:opacity-90 transform-gpu will-change-transform"
        style={{
          animation: "gold-ring-float-2 24s ease-in-out infinite alternate",
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_22px_rgba(0,0,0,0.55)]">
          <defs>
            <linearGradient id="goldRing3D2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="18%" stopColor="#fde047" />
              <stop offset="42%" stopColor="#ca8a04" />
              <stop offset="65%" stopColor="#854d0e" />
              <stop offset="85%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <radialGradient id="goldRingGlint2" cx="30%" cy="30%" r="40%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fde047" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="37" fill="none" stroke="url(#goldRing3D2)" strokeWidth="13" />
          <ellipse cx="50" cy="50" rx="37" ry="37" fill="none" stroke="url(#goldRingGlint2)" strokeWidth="2.5" opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}
