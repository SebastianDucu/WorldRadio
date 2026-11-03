import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { RadioTowerIcon } from "@/components/icons";

export function SnapshotBanner() {
  const { directoryStatus, directoryProgress, directoryCount } = usePlayerStore();
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after 6 seconds once done
  useEffect(() => {
    if (directoryStatus === "done") {
      const timer = setTimeout(() => {
        setDismissed(true);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [directoryStatus]);

  if (dismissed || directoryStatus === "idle") {
    return null;
  }

  const isDone = directoryStatus === "done";
  const displayCount = directoryCount > 0 ? directoryCount.toLocaleString("es-ES") : "34.971";

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => isDone && setDismissed(true)}
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-3 sm:left-6 z-40 flex pointer-events-none transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="pointer-events-auto flex items-center gap-3.5 rounded-2xl liquid-glass px-4 py-2.5 shadow-2xl border border-amber-400/35 backdrop-blur-2xl max-w-xs sm:max-w-sm w-full transition-all duration-300 hover:scale-[1.02]">
        {/* Glowing Planet / Satellite Tower Emblem */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 shadow-md shadow-amber-400/40">
          <RadioTowerIcon size={20} className={isDone ? "" : "animate-pulse"} />
          {!isDone && (
            <span className="absolute inset-0 rounded-full border border-amber-400/60 animate-ping opacity-75" />
          )}
        </div>

        {/* Text & Dynamic Progress Line */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate tracking-tight">
            {isDone ? `¡Listo! ${displayCount} emisoras más en el mapa` : `Sintonizando red mundial (${displayCount})`}
          </p>

          {/* Liquid Progress Bar */}
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-300 transition-all duration-300 ease-out"
              style={{
                width: isDone ? "100%" : `${Math.max(5, directoryProgress * 100)}%`,
                boxShadow: "0 0 10px rgba(255, 201, 74, 0.7)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

