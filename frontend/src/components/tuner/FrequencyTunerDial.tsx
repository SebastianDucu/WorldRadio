import { useState, useMemo } from "react";
import { usePlayerStore } from "@/store/player";
import { STATIONS } from "@/data/stations";
import { CloseIcon, PlayIcon, ShuffleIcon, RadioIcon } from "@/components/icons";
import { toast } from "@/store/toast";
import type { Station } from "@/types/radio";

export function FrequencyTunerDial() {
  const {
    tunerDialModalOpen,
    setTunerDialModalOpen,
    tunerFrequency,
    setTunerFrequency,
    currentStation,
    playStation,
    randomStation,
  } = usePlayerStore();

  const [sliderVal, setSliderVal] = useState(tunerFrequency || 98.5);

  if (!tunerDialModalOpen) return null;

  const nearbyStations = useMemo(() => {
    return STATIONS.filter((s) => {
      if (!s.frequency) return false;
      const num = parseFloat(s.frequency);
      if (isNaN(num)) return false;
      return Math.abs(num - sliderVal) <= 3.5;
    }).slice(0, 5);
  }, [sliderVal]);

  const handleTune = (station: Station) => {
    playStation(station);
    if (station.frequency) {
      const f = parseFloat(station.frequency);
      if (!isNaN(f)) setSliderVal(f);
    }
    toast.success(`Sintonizado en ${station.name}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setTunerDialModalOpen(false)}
    >
      <div
        className="liquid-glass relative w-full max-w-lg overflow-hidden rounded-3xl p-6 text-[#eaf4ff] shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-inner">
              <RadioIcon size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                Dial FM Analógico
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Sintonizador manual de frecuencias mundiales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={randomStation}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="Sintonizar frecuencia aleatoria"
            >
              <ShuffleIcon size={16} />
            </button>
            <button
              onClick={() => setTunerDialModalOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar sintonizador"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 p-5 border border-amber-400/20 shadow-inner">
          <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
            Banda FM Comercial
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-bold font-mono tracking-tight text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              {sliderVal.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-amber-500">MHz</span>
          </div>

          {currentStation?.frequency && (
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Sintonizada: <span className="text-white font-semibold">{currentStation.name}</span>
            </p>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-mono font-semibold text-slate-400 px-1">
            <span>87.5 FM</span>
            <span>93.0</span>
            <span>98.0</span>
            <span>103.0</span>
            <span>108.0 FM</span>
          </div>

          <div className="relative py-2">
            <input
              type="range"
              min="87.5"
              max="108.0"
              step="0.1"
              value={sliderVal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSliderVal(val);
                setTunerFrequency(val);
              }}
              className="liquid-slider w-full"
              style={{
                "--fill": `${((sliderVal - 87.5) / (108.0 - 87.5)) * 100}%`,
              } as React.CSSProperties}
            />

            <div className="flex justify-between px-2 mt-2 h-2 pointer-events-none opacity-40">
              {Array.from({ length: 41 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-0.5 bg-slate-400 rounded-full ${i % 5 === 0 ? "h-3" : "h-1.5"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Emisoras detectadas en esta frecuencia:
          </label>

          {nearbyStations.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/40 p-4 text-center text-xs text-slate-500 border border-white/5">
              <span>Gira el dial para encontrar emisoras cercanas en la banda FM</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {nearbyStations.map((station) => {
                const isCur = station.id === currentStation?.id;
                return (
                  <div
                    key={station.id}
                    onClick={() => handleTune(station)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                      isCur
                        ? "bg-amber-400/15 border-amber-400/50 shadow-md shadow-amber-400/10 text-white"
                        : "bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 font-mono font-bold text-xs">
                        {station.frequency || "FM"}
                      </span>
                      <div className="min-w-0 truncate">
                        <p className="text-sm font-semibold text-white truncate">{station.name}</p>
                        <p className="text-xs font-semibold text-slate-400 truncate">
                          {station.city}, {station.country} · {station.genre}
                        </p>
                      </div>
                    </div>

                    <button
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 transition-colors"
                      title="Sintonizar"
                    >
                      <PlayIcon size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
