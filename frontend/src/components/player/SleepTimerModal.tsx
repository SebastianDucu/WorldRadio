import { useState } from "react";
import { usePlayerStore } from "@/store/player";
import { CloseIcon, TimerIcon } from "@/components/icons";
import { toast } from "@/store/toast";

export function SleepTimerModal() {
  const {
    sleepTimerModalOpen,
    setSleepTimerModalOpen,
    sleepTimerRemaining,
    sleepTimerInitial,
    setSleepTimer,
    cancelSleepTimer,
  } = usePlayerStore();

  const [customMinutes, setCustomMinutes] = useState(30);

  if (!sleepTimerModalOpen) return null;

  const presets = [15, 30, 45, 60, 90];

  const handleSelectPreset = (mins: number) => {
    setSleepTimer(mins);
    toast.success(`Temporizador de apagado activado: ${mins} minutos`);
  };

  const handleCustomStart = () => {
    setSleepTimer(customMinutes);
    toast.success(`Temporizador de apagado activado: ${customMinutes} minutos`);
  };

  const handleAddFiveMinutes = () => {
    if (sleepTimerRemaining !== null) {
      const added = Math.round((sleepTimerRemaining + 300) / 60);
      setSleepTimer(added);
      toast.info("+5 minutos añadidos al temporizador");
    }
  };

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent =
    sleepTimerRemaining !== null && sleepTimerInitial !== null && sleepTimerInitial > 0
      ? Math.max(0, Math.min(100, (sleepTimerRemaining / sleepTimerInitial) * 100))
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setSleepTimerModalOpen(false)}
    >
      <div
        className="liquid-glass relative w-full max-w-sm overflow-hidden rounded-3xl p-6 text-[#eaf4ff] shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with TimerIcon SVG */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-inner">
              <TimerIcon size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                Temporizador
              </h3>
              <p className="mt-1 text-xs font-normal text-slate-400">
                Apagado automático de radio
              </p>
            </div>
          </div>

          <button
            onClick={() => setSleepTimerModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          {sleepTimerRemaining !== null ? (
            /* Active Countdown View */
            <div className="flex flex-col items-center text-center py-2">
              <div className="relative flex h-32 w-32 items-center justify-center">
                {/* Radial progress ring */}
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="url(#timerGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38b6ff" />
                      <stop offset="100%" stopColor="#7fe3ff" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold tracking-tight text-white font-mono">
                    {formatRemaining(sleepTimerRemaining)}
                  </span>
                  <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                    Restante
                  </span>
                </div>
              </div>

              <div className="mt-4 flex w-full gap-2">
                <button
                  onClick={handleAddFiveMinutes}
                  className="flex-1 rounded-xl bg-sky-500/20 py-2.5 text-sm font-semibold text-sky-300 border border-sky-400/30 hover:bg-sky-500/30 transition-all active:scale-95"
                >
                  +5 Minutos
                </button>
                <button
                  onClick={() => {
                    cancelSleepTimer();
                    toast.info("Temporizador cancelado");
                  }}
                  className="flex-1 rounded-xl bg-rose-500/20 py-2.5 text-sm font-semibold text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 transition-all active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Configure Presets View */
            <>
              <p className="text-sm font-semibold text-slate-300">
                Selecciona en cuántos minutos pausar la reproducción:
              </p>

              <div className="grid grid-cols-5 gap-1.5">
                {presets.map((min) => (
                  <button
                    key={min}
                    onClick={() => handleSelectPreset(min)}
                    className="liquid-glass-pill flex flex-col items-center justify-center rounded-2xl py-2.5 hover:scale-105 active:scale-95 transition-all text-center"
                  >
                    <span className="text-sm font-bold text-white">{min}</span>
                    <span className="text-[10px] font-semibold text-sky-400">min</span>
                  </button>
                ))}
              </div>

              {/* Custom minute slider */}
              <div className="rounded-2xl bg-slate-900/60 p-3.5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-300">Personalizado:</span>
                  <span className="font-bold text-sky-400 font-mono">{customMinutes} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(parseInt(e.target.value))}
                  className="liquid-slider w-full"
                  style={{ "--fill": `${(customMinutes / 180) * 100}%` } as React.CSSProperties}
                />
                <button
                  onClick={handleCustomStart}
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 hover:brightness-110 active:scale-95 transition-all"
                >
                  Iniciar con {customMinutes} min
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
