interface SnowCapProps {
  className?: string;
}

export function SnowCap({ className = "" }: SnowCapProps) {
  return (
    <div
      className={`pointer-events-none absolute -top-2 inset-x-2 sm:inset-x-4 h-3.5 z-20 overflow-visible opacity-90 select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
        viewBox="0 0 1000 24"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,12 Q40,2 80,10 T160,10 T240,6 T320,13 T400,8 T480,14 T560,7 T640,12 T720,6 T800,11 T880,7 T960,12 T1000,9 L1000,24 L0,24 Z" />
      </svg>
      <span className="absolute top-0.5 left-[15%] h-1 w-1 rounded-full bg-white animate-pulse" />
      <span className="absolute top-1 left-[45%] h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_4px_#fde68a] animate-pulse" style={{ animationDelay: "1.2s" }} />
      <span className="absolute top-0.5 left-[75%] h-1 w-1 rounded-full bg-sky-200 animate-pulse" style={{ animationDelay: "0.7s" }} />
    </div>
  );
}
