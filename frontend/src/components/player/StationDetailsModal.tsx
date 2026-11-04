import { useState } from "react";
import type { Station } from "@/types/radio";
import { CloseIcon, RadioTowerIcon, GlobeIcon, HeartIcon, UsersIcon } from "@/components/icons";
import { usePlayerStore } from "@/store/player";
import { toast } from "@/store/toast";
import { useLiveListeners } from "@/hooks/useLiveListeners";

interface StationDetailsModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StationDetailsModal({ station, isOpen, onClose }: StationDetailsModalProps) {
  const { flyTo, toggleFavorite, isFavorite, setViewMode } = usePlayerStore();
  const [copied, setCopied] = useState(false);
  const liveListeners = useLiveListeners(station);

  if (!isOpen || !station) return null;

  const isFav = isFavorite(station.id);

  const handleCopyStream = async () => {
    try {
      await navigator.clipboard.writeText(station.streamUrl);
      setCopied(true);
      toast.success("Enlace de transmisión copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handleCenterGlobe = () => {
    setViewMode("globe");
    flyTo(station.lat, station.lng);
    onClose();
    toast.info(`Cámara centrada en ${station.city}, ${station.country}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass relative w-full max-w-lg overflow-hidden border border-white/15 bg-surface/95 p-6 shadow-2xl backdrop-blur-2xl text-fg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent border border-accent/30 shadow-inner">
              <RadioTowerIcon size={26} />
            </div>
            <div>
              <span className="rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-accent">
                {station.genre}
              </span>
              <h3 className="mt-1 text-lg font-extrabold tracking-tight text-fg">
                {station.name}
              </h3>
              <p className="text-xs font-semibold text-muted">
                {station.city}, {station.country}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted hover:bg-surface hover:text-fg transition-colors"
            aria-label="Cerrar detalles"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {station.description && (
          <p className="mt-4 text-xs font-medium leading-relaxed text-muted/90 bg-surface/60 p-3.5 rounded-xl border border-white/5">
            {station.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-surface/70 p-3 border border-white/5">
            <span className="text-[11px] font-bold text-muted block">Calidad de Audio</span>
            <span className="font-extrabold text-accent text-sm mt-0.5 block">
              {station.bitrate} kbps · {station.codec}
            </span>
          </div>

          <div className="rounded-xl bg-surface/70 p-3 border border-white/5">
            <span className="text-[11px] font-bold text-muted block">Audiencia en Directo</span>
            <span className="font-extrabold text-emerald-400 text-sm mt-0.5 flex items-center gap-1.5">
              <UsersIcon size={14} className="text-emerald-400" />
              <span>{liveListeners.fullString} oyentes</span>
            </span>
          </div>

          <div className="rounded-xl bg-surface/70 p-3 border border-white/5">
            <span className="text-[11px] font-bold text-muted block">Coordenadas GPS</span>
            <span className="font-extrabold text-fg text-sm mt-0.5 block">
              {station.lat.toFixed(2)}°, {station.lng.toFixed(2)}°
            </span>
          </div>

          <div className="rounded-xl bg-surface/70 p-3 border border-white/5">
            <span className="text-[11px] font-bold text-muted block">Estado de Señal</span>
            <span className="font-extrabold text-sky-400 text-sm mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span>Emisión Satelital HQ</span>
            </span>
          </div>

          <div className="rounded-xl bg-surface/70 p-3 border border-white/5 col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted">URL de Transmisión Directa</span>
              <button
                onClick={handleCopyStream}
                className="text-[11px] font-bold text-accent hover:underline"
              >
                {copied ? "¡Copiado!" : "Copiar Enlace"}
              </button>
            </div>
            <p className="mt-1 truncate font-mono text-[11px] text-muted/80 selection:bg-accent/30">
              {station.streamUrl}
            </p>
          </div>
        </div>

        {station.tags && station.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {station.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button
            onClick={() => toggleFavorite(station.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
              isFav
                ? "bg-danger/20 border-danger/40 text-danger"
                : "bg-surface hover:bg-surface/80 border-white/10 text-fg"
            }`}
          >
            <HeartIcon size={16} className={isFav ? "fill-danger" : ""} />
            <span>{isFav ? "En Favoritas" : "Guardar en Favoritas"}</span>
          </button>

          <button
            onClick={handleCenterGlobe}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-extrabold text-bg shadow-md shadow-accent/30 transition-all hover:scale-105 active:scale-95"
          >
            <GlobeIcon size={16} />
            <span>Centrar en Globo 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
}
