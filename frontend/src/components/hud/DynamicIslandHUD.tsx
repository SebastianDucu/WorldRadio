import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { getStationTimeInfo } from "@/lib/timeZones";
import {
  PlayIcon,
  PauseIcon,
  SpinnerIcon,
  SunIcon,
  MoonIcon,
  TimerIcon,
  CompassIcon,
} from "@/components/icons";

export function DynamicIslandHUD() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    togglePlay,
    sleepTimerRemaining,
    decrementSleepTimer,
    setSleepTimerModalOpen,
    isTourActive,
    tourCountdown,
    tickTour,
  } = usePlayerStore();

  const [timeInfo, setTimeInfo] = useState(() => getStationTimeInfo(currentStation));

  // Update city local time every 10 seconds
  useEffect(() => {
    setTimeInfo(getStationTimeInfo(currentStation));
    const timer = setInterval(() => {
      setTimeInfo(getStationTimeInfo(currentStation));
    }, 10000);
    return () => clearInterval(timer);
  }, [currentStation]);

  // Handle sleep timer countdown tick
  useEffect(() => {
    if (sleepTimerRemaining === null) return;
    const interval = setInterval(() => {
      decrementSleepTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerRemaining, decrementSleepTimer]);

  // Handle world tour countdown tick
  useEffect(() => {
    if (!isTourActive) return;
    const interval = setInterval(() => {
      tickTour();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTourActive, tickTour]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed top-[max(0.6rem,env(safe-area-inset-top,0px))] inset-x-0 z-30 flex justify-center pointer-events-none px-2 sm:px-3">
      <div className="liquid-glass-pill pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 max-w-full overflow-hidden transition-all duration-300 border border-amber-400/25 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(255,201,74,0.18)]">
        
        {/* Left: Station Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div
            className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-[11px] font-bold text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, hsl(${currentStation?.hue || 200}, 85%, 45%), hsl(${(currentStation?.hue || 200) + 30}, 90%, 30%))`,
            }}
          >
            {currentStation?.frequency || "FM"}
          </div>

          <div className="min-w-0 truncate max-w-[100px] sm:max-w-[170px]">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {currentStation?.name || "WorldRadio"}
            </p>
            <p className="text-[10px] sm:text-[11px] font-normal text-slate-400 truncate leading-tight mt-0.5">
              {currentStation?.city ? `${currentStation.city}, ` : ""}{currentStation?.country}
            </p>
          </div>
        </div>

        {/* Center: City Telepresence Local Time & Signal */}
        <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 border-x border-white/10 text-xs font-semibold text-slate-300 whitespace-nowrap">
          {/* Local Time with Sun/Moon SVG indicator */}
          <span className="flex items-center gap-1 sm:gap-1.5 bg-white/5 rounded-full px-2 sm:px-2.5 py-0.5" title={`Hora local en ${currentStation?.city}`}>
            {timeInfo.isDay ? (
              <SunIcon size={12} className="text-amber-400 shrink-0" />
            ) : (
              <MoonIcon size={12} className="text-sky-300 shrink-0" />
            )}
            <span className="font-mono text-xs sm:text-sm font-semibold text-white">{timeInfo.timeString}</span>
            <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">{timeInfo.label}</span>
          </span>

          {/* 5-bar Signal Strength Indicator */}
          <span className="hidden sm:flex items-center gap-1.5" title="Calidad de señal satelital: 98% HQ">
            <span className="flex items-end gap-[2px] h-3">
              <span className="w-1 h-1.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-400/50 rounded-xs" />
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">HQ {currentStation?.bitrate || 128}k</span>
          </span>
        </div>

        {/* Right: Active Status Badges (if any) & Primary Play Button */}
        <div className="flex items-center gap-2">
          {/* Active Tour Badge (only appears when Tour is running) */}
          {isTourActive && (
            <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse">
              <CompassIcon size={13} />
              <span className="font-mono text-[11px]">{tourCountdown}s</span>
            </span>
          )}

          {/* Active Sleep Timer Badge (only appears when Timer is running) */}
          {sleepTimerRemaining !== null && (
            <button
              onClick={() => setSleepTimerModalOpen(true)}
              className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-2.5 py-0.5 text-xs font-semibold hover:bg-amber-400/30 transition-colors"
              title="Temporizador de apagado activo"
            >
              <TimerIcon size={13} />
              <span className="font-mono text-[11px]">{formatTimer(sleepTimerRemaining)}</span>
            </button>
          )}

          {/* Clean Primary Play / Pause Button */}
          <button
            onClick={togglePlay}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
              isPlaying
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-400/50 hover:brightness-110"
                : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
            }`}
            title={isPlaying ? "Pausar emisión" : "Reproducir emisión"}
          >
            {isLoading ? (
              <SpinnerIcon size={16} className="animate-spin text-white" />
            ) : isPlaying ? (
              <PauseIcon size={16} />
            ) : (
              <PlayIcon size={16} className="translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
