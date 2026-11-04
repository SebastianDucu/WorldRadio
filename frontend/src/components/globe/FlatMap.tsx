import { STATIONS } from "@/data/stations";
import { usePlayerStore } from "@/store/player";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { RadioTowerIcon } from "@/components/icons";

export function FlatMap() {
  const { currentStation, playStation } = usePlayerStore();
  const isChristmas = useChristmasActive();

  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-glass-border bg-surface/40 p-4 shadow-glass backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <RadioTowerIcon size={16} className="text-accent" />
            <span>MAPA MUNDIAL PLANO · {STATIONS.length} EMISORAS ACTIVAS</span>
          </div>
          {currentStation && (
            <span className="text-xs font-semibold text-accent">
              {currentStation.name} · {currentStation.city}
            </span>
          )}
        </div>

        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-bg/80">
          <svg
            viewBox="0 0 1000 500"
            className="h-full w-full select-none"
            aria-label="Mapa mundial de emisoras de radio"
          >
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted/15" />
              </pattern>
              <radialGradient id="beaconGlow">
                <stop offset="0%" stopColor="rgb(var(--color-accent))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="rgb(var(--color-accent))" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="1000" height="500" fill="url(#grid)" />

            <line x1="0" y1="250" x2="1000" y2="250" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" className="text-muted/30" />
            <line x1="500" y1="0" x2="500" y2="500" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" className="text-muted/30" />

            <path
              d="M 120 70 Q 180 60 260 70 Q 320 100 280 180 Q 240 220 200 240 Q 140 180 120 120 Z"
              fill="currentColor"
              className="text-muted/10 transition-colors"
            />

            <path
              d="M 230 250 Q 340 260 320 360 Q 290 440 250 480 Q 210 400 220 300 Z"
              fill="currentColor"
              className="text-muted/10 transition-colors"
            />

            <path
              d="M 460 80 Q 550 70 580 140 Q 530 180 470 170 Q 450 120 460 80 Z"
              fill="currentColor"
              className="text-muted/10 transition-colors"
            />

            <path
              d="M 460 180 Q 580 190 560 300 Q 530 400 480 410 Q 420 320 440 220 Z"
              fill="currentColor"
              className="text-muted/10 transition-colors"
            />

            <path
              d="M 580 80 Q 820 60 860 160 Q 820 260 700 260 Q 600 200 580 120 Z"
              fill="currentColor"
              className="text-muted/10 transition-colors"
            />

            <path
              d="M 760 320 Q 890 320 880 400 Q 810 440 760 410 Q 740 360 760 320 Z"
              fill="currentColor"
              className="text-muted/10 transition-colors"
            />

            {STATIONS.map((station) => {
              const { x, y } = project(station.lat, station.lng);
              const isCurrent = station.id === currentStation?.id;

              return (
                <g
                  key={station.id}
                  className="cursor-pointer transition-transform duration-200 hover:scale-125"
                  onClick={() => playStation(station)}
                >
                  {isCurrent && (
                    <>
                      <circle cx={x} cy={y} r="18" fill="url(#beaconGlow)">
                        <animate attributeName="r" values="8;24;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={x} cy={y} r="8" fill="none" stroke="rgb(var(--color-accent))" strokeWidth="1.5" />
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isCurrent ? 5 : 3.5}
                    fill={
                      isCurrent
                        ? "rgb(var(--color-accent))"
                        : isChristmas
                        ? "rgb(var(--color-xmas-gold))"
                        : "rgb(var(--color-fg))"
                    }
                    className="transition-colors hover:fill-accent"
                  />
                  <title>{`${station.name} (${station.city}, ${station.country})`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
