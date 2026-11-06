import { useState, useEffect } from "react";
import { WorldRadioLogo } from "@/components/common/WorldRadioLogo";
import { SparklesIcon, RadioTowerIcon } from "@/components/icons";

export function StartupSplashLoader() {
  const [progress, setProgress] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1900;
    let animId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const nextProgress = Math.min(100, Math.round(eased * 100));

      setProgress(nextProgress);

      if (t < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => {
            setIsFinished(true);
          }, 700);
        }, 300);
      }
    };

    animId = requestAnimationFrame(update);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  if (isFinished) {
    return null;
  }

  const getStatusText = (val: number) => {
    if (val < 32) return "Iniciando red satelital y frecuencias...";
    if (val < 68) return "Sintonizando 174 naciones en tiempo real...";
    if (val < 94) return "Optimizando atmósfera festiva y audio HD...";
    return "¡Todo listo! Conectado al mundo.";
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030816] select-none overflow-hidden transition-all duration-700 ease-out ${
        isClosing ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.14)_0%,rgba(14,165,233,0.08)_40%,transparent_75%)]" />

      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-[90%] max-w-md p-7 sm:p-9 rounded-3xl bg-slate-950/75 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl flex flex-col items-center text-center">
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="relative flex items-center justify-center my-2">
          <div className="absolute w-28 h-28 rounded-full border border-amber-400/25 animate-ping opacity-25" />
          <div className="absolute w-24 h-24 rounded-full border border-sky-400/30 animate-pulse" />
          <WorldRadioLogo size="xl" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-4">
          World<span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Radio</span>
        </h1>

        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.25)]">
          <SparklesIcon size={14} className="text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-black tracking-wide text-amber-300">
            Elaborada Por Juan Ducuara
          </span>
          <SparklesIcon size={14} className="text-amber-400 shrink-0" />
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <RadioTowerIcon size={13} className="text-amber-400" />
          <span>34.900+ Emisoras</span>
          <span className="text-amber-400/60">·</span>
          <span>174 Naciones</span>
        </div>

        <div className="w-full mt-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5 px-0.5">
            <span className="text-slate-400 text-[11px] truncate max-w-[80%] text-left">
              {getStatusText(progress)}
            </span>
            <span className="text-amber-400 font-bold font-mono text-[11px]">
              {progress}%
            </span>
          </div>

          <div className="w-full bg-slate-900/90 rounded-full h-2 p-0.5 border border-white/10 relative overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-[width] duration-150 ease-out shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => setIsFinished(true), 500);
          }}
          className="mt-6 text-[11px] font-semibold text-slate-500 hover:text-amber-300 transition-colors uppercase tracking-wider"
        >
          Saltar intro ›
        </button>
      </div>
    </div>
  );
}
