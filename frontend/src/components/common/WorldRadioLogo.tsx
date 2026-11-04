interface WorldRadioLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  className?: string;
}

export function WorldRadioLogo({
  size = "md",
  withText = false,
  className = "",
}: WorldRadioLogoProps) {
  const pixelSize = size === "sm" ? 26 : size === "md" ? 36 : size === "lg" ? 48 : 64;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 rounded-2xl liquid-glass-morphism shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        style={{
          width: pixelSize,
          height: pixelSize,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <defs>
            <linearGradient id="wrGlobeGrad" x1="15%" y1="15%" x2="85%" y2="85%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <linearGradient id="wrGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <radialGradient id="wrCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="38" fill="#04091c" stroke="url(#wrGlobeGrad)" strokeWidth="1.8" strokeOpacity="0.4" />

          <ellipse cx="50" cy="50" rx="38" ry="14" stroke="url(#wrGlobeGrad)" strokeWidth="1.5" strokeOpacity="0.35" />
          <ellipse cx="50" cy="50" rx="15" ry="38" stroke="url(#wrGlobeGrad)" strokeWidth="1.5" strokeOpacity="0.35" />

          <path
            d="M26 38 A32 32 0 0 1 74 38"
            stroke="url(#wrGoldGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
          <path
            d="M34 46 A20 20 0 0 1 66 46"
            stroke="url(#wrGoldGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          <path
            d="M50 48 L43 76 L57 76 Z"
            fill="none"
            stroke="url(#wrGoldGrad)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <line x1="45" y1="64" x2="55" y2="64" stroke="url(#wrGoldGrad)" strokeWidth="2" strokeLinecap="round" />

          <circle cx="50" cy="48" r="8" fill="url(#wrCoreGlow)" />
          <circle cx="50" cy="48" r="3.5" fill="#ffffff" />

          <path
            d="M74 20 L76 25 L81 27 L76 29 L74 34 L72 29 L67 27 L72 25 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              World<span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Radio</span>
            </span>
            <span className="flex items-center gap-1 rounded-md bg-emerald-400/15 border border-emerald-400/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wide mt-0.5">
            174 Países · Red Satelital
          </span>
        </div>
      )}
    </div>
  );
}
