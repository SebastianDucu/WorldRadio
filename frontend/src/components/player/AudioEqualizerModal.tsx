import { useState } from "react";
import { usePlayerStore, type EqualizerPreset, type VisualizerMode } from "@/store/player";
import {
  CloseIcon,
  EqualizerIcon,
  BoltIcon,
  VolumeIcon,
  MicIcon,
  CompassIcon,
  RadioIcon,
} from "@/components/icons";
import { toast } from "@/store/toast";

export function AudioEqualizerModal() {
  const {
    equalizerModalOpen,
    setEqualizerModalOpen,
    equalizerPreset,
    setEqualizerPreset,
    visualizerMode,
    setVisualizerMode,
  } = usePlayerStore();

  const defaultBands: Record<EqualizerPreset, number[]> = {
    flat: [0, 0, 0, 0, 0],
    bass: [8, 5, 1, 0, -1],
    vocal: [-2, 1, 6, 4, 1],
    spatial: [4, -1, 2, 5, 7],
    analog: [3, 4, 2, -2, -4],
  };

  const [customBands, setCustomBands] = useState<number[]>(defaultBands[equalizerPreset]);

  if (!equalizerModalOpen) return null;

  const presets = [
    {
      id: "flat" as EqualizerPreset,
      name: "Estudio Puro",
      icon: <BoltIcon size={18} className="text-amber-400" />,
      desc: "Sonido original sin colorear",
    },
    {
      id: "bass" as EqualizerPreset,
      name: "Mega Bass",
      icon: <VolumeIcon size={18} className="text-sky-400" />,
      desc: "Graves potentes y profundos",
    },
    {
      id: "vocal" as EqualizerPreset,
      name: "Voz Nítida",
      icon: <MicIcon size={18} className="text-rose-400" />,
      desc: "Podcast, noticias y diálogos",
    },
    {
      id: "spatial" as EqualizerPreset,
      name: "Espacial 3D",
      icon: <CompassIcon size={18} className="text-indigo-400" />,
      desc: "Inmersión y amplitud estéreo",
    },
    {
      id: "analog" as EqualizerPreset,
      name: "Radio Vintage",
      icon: <RadioIcon size={18} className="text-emerald-400" />,
      desc: "Calidez analógica a válvulas",
    },
  ];

  const handleSelectPreset = (p: EqualizerPreset) => {
    setEqualizerPreset(p);
    setCustomBands(defaultBands[p]);
    toast.success(`Ecualizador ajustado a: ${presets.find((x) => x.id === p)?.name}`);
  };

  const bandFrequencies = ["60 Hz", "250 Hz", "1 kHz", "4 kHz", "16 kHz"];

  const handleBandChange = (index: number, val: number) => {
    const updated = [...customBands];
    updated[index] = val;
    setCustomBands(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setEqualizerModalOpen(false)}
    >
      <div
        className="liquid-glass relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-[#eaf4ff] shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-inner">
              <EqualizerIcon size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                Ecualizador & Audio FX
              </h3>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Procesador de sonido de alta fidelidad
              </p>
            </div>
          </div>

          <button
            onClick={() => setEqualizerModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Perfiles de audio predefinidos:
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {presets.map((p) => {
              const active = equalizerPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`flex flex-col items-start p-3 rounded-2xl transition-all duration-200 border text-left ${
                    active
                      ? "bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/20 scale-[1.02]"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <div className="mb-1.5">{p.icon}</div>
                  <span className="text-sm font-semibold text-white leading-tight">{p.name}</span>
                  <span className="text-[11px] font-semibold text-slate-400 leading-tight mt-0.5 line-clamp-1">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="font-semibold text-white">Bandas de Frecuencia</span>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              {equalizerPreset.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 h-32 px-2">
            {bandFrequencies.map((freq, i) => {
              const gain = customBands[i] ?? 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between flex-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    {gain > 0 ? `+${gain}` : gain}dB
                  </span>

                  <div className="relative flex items-center justify-center h-20 w-4">
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={gain}
                      onChange={(e) => handleBandChange(i, parseInt(e.target.value))}
                      className="liquid-slider w-20 origin-center -rotate-90 absolute cursor-pointer"
                      style={{ "--fill": `${((gain + 10) / 20) * 100}%` } as React.CSSProperties}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-300">{freq}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900/50 p-3 border border-white/5">
          <span className="text-sm font-semibold text-slate-300">Estilo de Visualizador:</span>
          <div className="flex gap-1">
            {(["wave", "bars", "pulse"] as VisualizerMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setVisualizerMode(mode)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold capitalize transition-all duration-200 ${
                  visualizerMode === mode
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {mode === "wave" ? "Ondas" : mode === "bars" ? "Barras" : "Pulso"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
