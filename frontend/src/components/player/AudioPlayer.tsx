import { useEffect, useRef, useState } from "react";
import {
  PlayIcon,
  PauseIcon,
  NextIcon,
  PrevIcon,
  HeartIcon,
  GlobeIcon,
  MapIcon,
  SpinnerIcon,
  VolumeIcon,
  MuteIcon,
  SunIcon,
  MoonIcon,
  TargetIcon,
  TimerIcon,
  UsersIcon,
} from "@/components/icons";
import { toast } from "@/store/toast";
import { usePlayerStore } from "@/store/player";
import { getStationTimeInfo } from "@/lib/timeZones";
import { useLiveListeners } from "@/hooks/useLiveListeners";
import { LiquidVisualizer } from "./LiquidVisualizer";
import { StationDetailsModal } from "./StationDetailsModal";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    muted,
    viewMode,
    togglePlay,
    setIsPlaying,
    setIsLoading,
    setPlaybackStatus,
    setAudioError,
    setVolume,
    toggleMute,
    nextStation,
    prevStation,
    toggleFavorite,
    isFavorite,
    setViewMode,
    keepCentered,
    toggleKeepCentered,
    flyTo,
    setSleepTimerModalOpen,
    sleepTimerRemaining,
  } = usePlayerStore();

  const liveListeners = useLiveListeners(currentStation);
  const [timeInfo, setTimeInfo] = useState(() => getStationTimeInfo(currentStation));

  useEffect(() => {
    setTimeInfo(getStationTimeInfo(currentStation));
  }, [currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (currentStation) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: `${currentStation.city ? `${currentStation.city}, ` : ""}${currentStation.country} · ${currentStation.bitrate} kbps`,
        album: "WorldRadio · 174 Países",
        artwork: [
          {
            src: "./pwa-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    navigator.mediaSession.setActionHandler("play", () => {
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      prevStation();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      nextStation();
    });

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    };
  }, [currentStation, isPlaying, setIsPlaying, prevStation, nextStation]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentStation?.streamUrl) {
      if (audio.src !== currentStation.streamUrl) {
        audio.src = currentStation.streamUrl;
        audio.load();
      }

      setIsLoading(true);
      setPlaybackStatus("connecting");
      setAudioError(null);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
            setPlaybackStatus("playing");
            if (keepCentered && currentStation) {
              flyTo(currentStation.lat, currentStation.lng);
            }
          })
          .catch((err) => {
            console.warn("Audio stream playback interrupted:", err);
            setIsLoading(false);
            setPlaybackStatus("error");
            setAudioError("Conexión en curso...");
          });
      }
    } else {
      audio.pause();
      setIsLoading(false);
      setPlaybackStatus("idle");
    }
  }, [isPlaying, currentStation?.streamUrl, keepCentered, flyTo]);

  const handleAudioError = () => {
    console.warn("Audio element reported stream error for:", currentStation?.name);
    setIsLoading(false);
    setIsPlaying(false);
    setPlaybackStatus("error");
    setAudioError("Sintonizando frecuencia alternativa...");
    toast.info(`Señal de "${currentStation?.name || "emisora"}" no responde. Sintonizando siguiente.`);
    setTimeout(() => {
      nextStation();
    }, 1500);
  };

  const isFav = currentStation ? isFavorite(currentStation.id) : false;

  return (
    <>
      <footer
        role="region"
        aria-label="Reproductor de radio"
        className="fixed inset-x-0 bottom-0 z-40 p-2 sm:p-3 pb-[max(0.65rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))]"
      >
        <audio
          ref={audioRef}
          preload="none"
          onWaiting={() => {
            setIsLoading(true);
            setPlaybackStatus("connecting");
          }}
          onPlaying={() => {
            setIsLoading(false);
            setPlaybackStatus("playing");
          }}
          onCanPlay={() => {
            setIsLoading(false);
          }}
          onError={handleAudioError}
        />

        <div className="relative mx-auto max-w-4xl">
          <div className="liquid-glass flex items-center justify-between gap-2.5 sm:gap-3 rounded-2xl sm:rounded-3xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl border border-amber-400/25">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <div className="relative shrink-0">
                <div
                  onClick={() => setDetailsOpen(true)}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 cursor-pointer items-center justify-center rounded-xl font-bold text-xs text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: isPlaying
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : `linear-gradient(135deg, hsl(${currentStation?.hue || 200}, 75%, 45%), hsl(${(currentStation?.hue || 200) + 30}, 80%, 25%))`,
                    boxShadow: isPlaying ? "0 0 16px rgba(255, 201, 74, 0.45)" : undefined,
                  }}
                  title="Ver ficha técnica"
                >
                  {currentStation?.frequency || currentStation?.name.slice(0, 3).toUpperCase() || "RAD"}
                </div>
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    onClick={() => setDetailsOpen(true)}
                    className="cursor-pointer truncate text-xs sm:text-sm font-semibold tracking-tight text-white hover:text-amber-400 transition-colors"
                  >
                    {currentStation ? currentStation.name : "Elige una emisora en el mapa"}
                  </div>

                  {currentStation && (
                    <button
                      onClick={() => toggleFavorite(currentStation.id)}
                      className="p-1 text-slate-400 hover:text-white transition-colors shrink-0"
                      aria-label={isFav ? "Quitar de favoritas" : "Añadir a favoritas"}
                    >
                      <HeartIcon
                        size={16}
                        className={isFav ? "fill-rose-500 text-rose-500" : ""}
                      />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-300 truncate mt-0.5">
                  {currentStation ? (
                    <>
                      <span className="flex items-center gap-1.5 truncate">
                        <span
                          className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                            isPlaying ? "bg-emerald-400 shadow-[0_0_8px_#3df59a] animate-pulse" : "bg-slate-600"
                          }`}
                        />
                        <span className="truncate">{currentStation.city}, {currentStation.country}</span>
                      </span>
                      <span>·</span>
                      <span className="text-amber-400 font-semibold shrink-0">{currentStation.bitrate}k</span>
                      <span>·</span>
                      <span
                        className="flex items-center gap-1 text-emerald-400 font-mono font-semibold shrink-0"
                        title={`${liveListeners.fullString} personas escuchando esta emisora en vivo`}
                      >
                        <UsersIcon size={12} className="text-emerald-400 shrink-0" />
                        <span>{liveListeners.formatted}</span>
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-amber-300 font-mono font-semibold">
                        {timeInfo.isDay ? (
                          <SunIcon size={12} className="text-amber-400" />
                        ) : (
                          <MoonIcon size={12} className="text-sky-300" />
                        )}
                        <span>{timeInfo.timeString}</span>
                      </span>
                    </>
                  ) : (
                    <span>Toca un punto brillante del globo</span>
                  )}
                </div>
              </div>
            </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={prevStation}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
              aria-label="Emisora anterior"
            >
              <PrevIcon size={18} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              disabled={!currentStation}
              className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-white transition-all duration-200 active:scale-95 shadow-xl ${
                isPlaying
                  ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_28px_rgba(255,201,74,0.7)] animate-[pulse_2.8s_ease-out_infinite] text-slate-950 font-bold"
                  : "bg-slate-800 hover:bg-slate-700 border border-white/10"
              }`}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isLoading ? (
                <SpinnerIcon size={18} className="animate-spin text-white" />
              ) : isPlaying ? (
                <PauseIcon size={18} />
              ) : (
                <PlayIcon size={18} className="translate-x-0.5" />
              )}
            </button>

            <button
              onClick={nextStation}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
              aria-label="Siguiente emisora"
            >
              <NextIcon size={18} />
            </button>

            <button
              onClick={toggleKeepCentered}
              className={`hidden md:flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90 ${
                keepCentered
                  ? "text-amber-400 bg-amber-400/15 border border-amber-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title={keepCentered ? "Centrado automático activado" : "Centrado automático desactivado"}
            >
              <TargetIcon size={17} />
            </button>

            <button
              onClick={toggleMute}
              className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90 ${
                muted
                  ? "text-rose-400 bg-rose-500/15 border border-rose-500/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
              title={muted ? "Activar sonido" : "Silenciar"}
            >
              {muted ? <MuteIcon size={18} /> : <VolumeIcon size={18} />}
            </button>

            <button
              onClick={() => setSleepTimerModalOpen(true)}
              className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90 ${
                sleepTimerRemaining !== null
                  ? "text-amber-400 bg-amber-400/15 border border-amber-400/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title={sleepTimerRemaining !== null ? `Temporizador: ${Math.ceil(sleepTimerRemaining / 60)} min` : "Temporizador de apagado"}
            >
              <TimerIcon size={17} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex flex-col justify-center w-28">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="liquid-slider w-full"
                style={{ "--fill": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                aria-label="Volumen"
              />

              <div className="mt-1 h-3 flex items-center justify-center overflow-hidden">
                <LiquidVisualizer width={110} height={12} interactive={false} />
              </div>
            </div>

            <button
              onClick={() => setViewMode(viewMode === "globe" ? "map" : "globe")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 border border-white/5"
              title={viewMode === "globe" ? "Ver mapa plano" : "Ver globo 3D"}
            >
              {viewMode === "globe" ? <MapIcon size={18} /> : <GlobeIcon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </footer>

      <StationDetailsModal
        station={currentStation}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}
