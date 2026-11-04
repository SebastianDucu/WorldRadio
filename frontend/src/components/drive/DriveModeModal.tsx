import { useEffect } from "react";
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PrevIcon,
  CloseIcon,
  CarIcon,
} from "@/components/icons";
import { usePlayerStore } from "@/store/player";
import { STATIONS } from "@/data/stations";

export function DriveModeModal() {
  const {
    driveMode,
    setDriveMode,
    currentStation,
    isPlaying,
    togglePlay,
    nextStation,
    prevStation,
    playStation,
    favorites,
  } = usePlayerStore();

  useEffect(() => {
    if (!driveMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDriveMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [driveMode, setDriveMode]);

  if (!driveMode) return null;

  const driveStations = favorites.length >= 4
    ? STATIONS.filter((s) => favorites.includes(s.id)).slice(0, 6)
    : STATIONS.slice(0, 6);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modo conducción"
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-[#030816] text-[#eaf4ff] select-none animate-in fade-in duration-200"
      style={{
        backgroundImage:
          "radial-gradient(120% 70% at 50% 0%, rgba(30, 107, 255, 0.28), transparent 60%), radial-gradient(90% 60% at 50% 110%, rgba(56, 182, 255, 0.16), transparent 60%)",
      }}
    >

      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/40 shadow-lg">
            <CarIcon size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Modo Conducción</span>
              <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                En marcha
              </span>
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              Botones amplios y seguros para cambiar de emisora sin distracciones
            </p>
          </div>
        </div>

        <button
          onClick={() => setDriveMode(false)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 border border-white/10"
          aria-label="Salir del modo conducción"
        >
          <CloseIcon size={22} />
        </button>
      </header>

      <main className="my-auto grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5 py-4 max-w-5xl mx-auto w-full">
        {driveStations.map((station) => {
          const isCurrent = station.id === currentStation?.id;
          const isCurrentPlaying = isCurrent && isPlaying;

          return (
            <button
              key={station.id}
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playStation(station);
                }
              }}
              className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-200 active:scale-95 border ${
                isCurrent
                  ? "bg-slate-800/90 border-amber-400 shadow-[0_0_30px_rgba(255,201,74,0.35)] scale-[1.02]"
                  : "bg-slate-900/70 hover:bg-slate-800/80 border-white/10 hover:border-white/25"
              }`}
            >
              <div
                className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl shadow-md transition-transform group-hover:scale-105"
                style={{
                  background: isCurrent
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : `linear-gradient(135deg, hsl(${station.hue || 200}, 70%, 45%), hsl(${(station.hue || 200) + 30}, 75%, 25%))`,
                }}
              >
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {station.frequency || station.name.slice(0, 3).toUpperCase()}
                </span>
              </div>

              <span className="mt-3 text-sm sm:text-base font-semibold text-white text-center line-clamp-1">
                {station.name}
              </span>
              <span className="text-xs font-semibold text-slate-400 text-center line-clamp-1">
                {station.city}, {station.country}
              </span>

              {isCurrentPlaying && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="h-4 w-1 rounded-full bg-amber-400 animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <span className="h-6 w-1 rounded-full bg-amber-400 animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
                  <span className="h-3 w-1 rounded-full bg-amber-400 animate-[pulse_0.5s_ease-in-out_infinite_0.4s]" />
                </div>
              )}
            </button>
          );
        })}
      </main>

      <footer className="flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-4 max-w-xl mx-auto w-full">
        {currentStation && (
          <div className="text-center">
            <h3 className="text-base font-semibold text-amber-400">
              {currentStation.name}
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              {currentStation.city}, {currentStation.country} · {currentStation.bitrate} kbps · {isPlaying ? "En directo" : "Pausado"}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <button
            onClick={prevStation}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-white border border-white/15 hover:bg-slate-700 transition-all active:scale-90 shadow-lg"
            aria-label="Emisora anterior"
          >
            <PrevIcon size={28} />
          </button>

          <button
            onClick={togglePlay}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-[0_0_28px_rgba(56,182,255,0.5)] transition-all hover:scale-105 active:scale-95"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <PauseIcon size={34} /> : <PlayIcon size={34} className="translate-x-1" />}
          </button>

          <button
            onClick={nextStation}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-white border border-white/15 hover:bg-slate-700 transition-all active:scale-90 shadow-lg"
            aria-label="Siguiente emisora"
          >
            <NextIcon size={28} />
          </button>
        </div>
      </footer>
    </div>
  );
}
