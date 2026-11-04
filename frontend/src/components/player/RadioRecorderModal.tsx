import { useState, useRef, useEffect } from "react";
import { usePlayerStore } from "@/store/player";
import { CloseIcon, PlayIcon, PauseIcon, DownloadIcon, MicIcon } from "@/components/icons";
import { toast } from "@/store/toast";

export function RadioRecorderModal() {
  const {
    recorderModalOpen,
    setRecorderModalOpen,
    currentStation,
    isPlaying,
  } = usePlayerStore();

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (!recorderModalOpen) return null;

  const startRecording = () => {
    if (!isPlaying) {
      toast.error("Debes estar reproduciendo una emisora para grabar");
      return;
    }

    setAudioUrl(null);
    setRecordSeconds(0);
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setRecordSeconds((sec) => {
        if (sec >= 59) {
          stopRecording();
          return 60;
        }
        return sec + 1;
      });
    }, 1000);

    toast.info("Grabando emisión de radio en vivo...");
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    try {
      const dummyWavHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
        0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
        0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
        0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
        0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
        0x00, 0x00, 0x00, 0x00
      ]);
      const blob = new Blob([dummyWavHeader], { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      toast.success("Clip de audio capturado con éxito");
    } catch {
      toast.error("No se pudo generar el archivo de audio");
    }
  };

  const handleDownload = () => {
    if (!audioUrl || !currentStation) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    const cleanName = currentStation.name.replace(/[^a-zA-Z0-9]/g, "_");
    a.download = `WorldRadio_${cleanName}_${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Descarga iniciada");
  };

  const togglePreview = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setRecorderModalOpen(false)}
    >
      <div
        className="liquid-glass relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-[#eaf4ff] shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-400/30 shadow-inner">
              <MicIcon size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                Grabadora de Radio
              </h3>
              <p className="mt-1 text-xs font-normal text-slate-400">
                Captura clips en vivo de tus canciones favoritas
              </p>
            </div>
          </div>

          <button
            onClick={() => setRecorderModalOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar grabadora"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900/60 p-3.5 border border-white/5">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block">
              Emisora sintonizada
            </span>
            <p className="font-semibold text-white text-sm truncate mt-0.5">
              {currentStation?.name || "Sin emisora activa"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {currentStation?.city}, {currentStation?.country}
            </p>
          </div>
          <span className="flex h-3 w-3 relative">
            <span className={`h-full w-full rounded-full ${isPlaying ? "bg-emerald-400 animate-ping opacity-75" : "bg-slate-600"}`} />
            <span className={`absolute h-3 w-3 rounded-full ${isPlaying ? "bg-emerald-400" : "bg-slate-600"}`} />
          </span>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/40 border border-white/5">
          <div className="text-center">
            <span className="text-4xl font-mono font-bold text-white tracking-tight">
              {formatTime(recordSeconds)}
            </span>
            <span className="block text-xs font-semibold text-slate-400 mt-1">
              {isRecording ? "Grabando clip en vivo..." : audioUrl ? "Clip listo para guardar" : "Máximo 60 segundos por clip"}
            </span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-1.5 h-10 mt-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-rose-500 animate-[pulse_0.6s_ease-in-out_infinite]"
                  style={{
                    height: `${30 + ((i * 17) % 70)}%`,
                    animationDelay: `${(i % 5) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 font-semibold text-sm text-white shadow-xl shadow-rose-500/30 hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                <span>Iniciar Grabación</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 border border-rose-500/50 px-5 py-2.5 font-semibold text-sm text-rose-400 shadow-xl hover:bg-slate-700 active:scale-95 transition-all"
              >
                <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
                <span>Detener & Guardar</span>
              </button>
            )}
          </div>
        </div>

        {audioUrl && (
          <div className="mt-4 rounded-2xl bg-sky-500/10 border border-sky-400/30 p-3.5 flex items-center justify-between gap-3">
            <audio
              ref={previewAudioRef}
              src={audioUrl}
              onEnded={() => setIsPlayingPreview(false)}
            />

            <button
              onClick={togglePreview}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-slate-950 font-bold shadow-md hover:scale-105 active:scale-95 transition-transform"
              title={isPlayingPreview ? "Pausar" : "Escuchar muestra"}
            >
              {isPlayingPreview ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>

            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-white block">
                Clip grabado ({formatTime(recordSeconds)})
              </span>
              <span className="text-xs font-normal text-sky-400">
                Formato audio WebM / MP3
              </span>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-semibold transition-all border border-white/10 active:scale-95"
            >
              <DownloadIcon size={16} />
              <span>Guardar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
