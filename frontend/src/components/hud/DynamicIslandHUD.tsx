import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/player";
import { getStationTimeInfo } from "@/lib/timeZones";
import { useLiveListeners } from "@/hooks/useLiveListeners";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { SnowCap } from "@/components/snow/SnowCap";
import {
  PlayIcon,
  PauseIcon,
  SpinnerIcon,
  SunIcon,
  MoonIcon,
  TimerIcon,
  CompassIcon,
  UsersIcon,
  RadioTowerIcon,
} from "@/components/icons";

export function DynamicIslandHUD() {
  const isChristmas = useChristmasActive();
  const {
    currentStation,
    isPlaying,
    isLoading,
    togglePlay,
    toggleSidebar,
    countries,
    sleepTimerRemaining,
    decrementSleepTimer,
    setSleepTimerModalOpen,
    isTourActive,
    tourCountdown,
    tickTour,
  } = usePlayerStore();

  const liveListeners = useLiveListeners(currentStation);
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

  const totalCountries = countries && countries.length > 0 ? countries.length : 174;

  return (
    <div className="fixed top-[max(0.6rem,env(safe-area-inset-top,0px))] inset-x-0 z-30 flex justify-center pointer-events-none px-2 sm:px-4">
      <div className="relative liquid-glass-pill pointer-events-auto flex items-center justify-between gap-1.5 sm:gap-3 rounded-full px-2 sm:px-3.5 py-1.5 sm:py-2 max-w-full overflow-hidden transition-all duration-300 border border-amber-400/25 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(255,201,74,0.18)]">
        {/* Soft Winter Snow Blanket atop the Dynamic Island */}
        {isChristmas && <SnowCap className="-top-2.5 inset-x-6" />}

        {/* 1. Integrated Explorar Button */}
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 active:scale-95 transition-all text-amber-400 border border-amber-400/30 shrink-0 shadow-sm"
          aria-label="Abrir explorador de emisoras y países"
          title={`Explorar red de emisoras en ${totalCountries} países`}
        >
          <RadioTowerIcon size={15} className="text-amber-400 shrink-0" />
          <span className="text-xs font-bold tracking-tight text-white hidden sm:inline">Explorar</span>
          <span className="rounded-full bg-amber-400/25 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-amber-300 whitespace-nowrap">
            {totalCountries} Países
          </span>
        </button>

        <span className="h-4 w-px bg-white/15 shrink-0 hidden sm:block" />

        {/* 2. Station Identity (Frequency Badge + Name) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="relative shrink-0">
            {isChristmas && (
              <div className="absolute -top-2.5 -left-1.5 z-10 pointer-events-none drop-shadow-sm select-none transform -rotate-12 animate-[bounce_5s_infinite]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16C5.5 10 9 6 14 5c2.5 1 4.5 5 5 11" fill="#E11D48" stroke="#991B1B" strokeWidth="1" />
                  <rect x="2.5" y="15" width="18" height="4" rx="2" fill="#FFFFFF" />
                  <circle cx="15.5" cy="4.5" r="2.5" fill="#FFFFFF" />
                </svg>
              </div>
            )}
            <div
              className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-[11px] font-bold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, hsl(${currentStation?.hue || 200}, 85%, 45%), hsl(${(currentStation?.hue || 200) + 30}, 90%, 30%))`,
              }}
            >
              {currentStation?.frequency || "FM"}
            </div>
          </div>

          <div className="min-w-0 truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[170px]">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {currentStation?.name || "WorldRadio"}
            </p>
            <p className="text-[10px] sm:text-[11px] font-normal text-slate-400 truncate leading-tight mt-0.5">
              {currentStation?.city ? `${currentStation.city}, ` : ""}{currentStation?.country || "Mundial"}
            </p>
          </div>
        </div>

        {/* 3. Center: City Local Time & Live Listeners */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 border-x border-white/10 text-xs font-semibold text-slate-300 whitespace-nowrap">
          {/* Local Time with Sun/Moon indicator */}
          <span className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5" title={`Hora local en ${currentStation?.city || currentStation?.country || 'origen'}`}>
            {timeInfo.isDay ? (
              <SunIcon size={12} className="text-amber-400 shrink-0" />
            ) : (
              <MoonIcon size={12} className="text-sky-300 shrink-0" />
            )}
            <span className="font-mono text-xs sm:text-sm font-semibold text-white">{timeInfo.timeString}</span>
            <span className="text-[11px] text-slate-400 font-normal hidden md:inline">{timeInfo.label}</span>
          </span>

          {/* Live Listeners Badge */}
          <span
            className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"
            title={`${liveListeners.fullString} personas escuchando en directo`}
          >
            <UsersIcon size={12} className="text-emerald-400 shrink-0" />
            <span>{liveListeners.formatted}</span>
          </span>

          {/* Satellite HQ Signal Indicator (desktop only) */}
          <span className="hidden lg:flex items-center gap-1.5" title="Señal satelital HQ">
            <span className="flex items-end gap-[2px] h-3">
              <span className="w-1 h-1.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-2.5 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-400 rounded-xs" />
              <span className="w-1 h-3 bg-emerald-400/50 rounded-xs" />
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">HQ {currentStation?.bitrate || 128}k</span>
          </span>
        </div>

        {/* 4. Right: Tour/Timer Badges & Primary Play Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isTourActive && (
            <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse">
              <CompassIcon size={13} />
              <span className="font-mono text-[11px]">{tourCountdown}s</span>
            </span>
          )}

          {sleepTimerRemaining !== null && (
            <button
              onClick={() => setSleepTimerModalOpen(true)}
              className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-2 py-0.5 text-xs font-semibold hover:bg-amber-400/30 transition-colors"
              title="Temporizador de apagado activo"
            >
              <TimerIcon size={13} />
              <span className="font-mono text-[11px]">{formatTimer(sleepTimerRemaining)}</span>
            </button>
          )}

          {/* Primary Play / Pause Button */}
          <button
            onClick={togglePlay}
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
              isPlaying
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-400/50 hover:brightness-110"
                : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
            }`}
            title={isPlaying ? "Pausar emisión" : "Reproducir emisión"}
          >
            {isLoading ? (
              <SpinnerIcon size={14} className="animate-spin text-white" />
            ) : isPlaying ? (
              <PauseIcon size={14} />
            ) : (
              <PlayIcon size={14} className="translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
