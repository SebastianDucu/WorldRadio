import { CloseIcon } from "@/components/icons";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="liquid-glass relative w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden rounded-3xl p-6 text-[#eaf4ff] border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Novedades & Versiones</span>
              <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-black text-sky-400">
                v24 · Liquid Glass
              </span>
            </h2>
            <p className="text-xs font-semibold text-slate-400">
              Historial de mejoras del sintonizador mundial
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Cerrar novedades"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs pr-1">
          {/* Liquid Glass Highlight Card */}
          <div className="rounded-2xl bg-gradient-to-r from-sky-500/20 via-blue-600/10 to-indigo-600/20 p-4 border border-sky-400/30">
            <h3 className="text-sm font-semibold text-sky-300 mb-1.5 flex items-center gap-1.5">
              <span>Liquid Glass Ultra-Fluido Activo</span>
            </h3>
            <p className="text-slate-300 text-[11.5px] leading-relaxed">
              Nueva interfaz hiperfluida con efecto cristal líquido, iluminación difusa orgánica, telepresencia horaria en tiempo real para cada ciudad, ecualizador de audio con 5 perfiles, temporizador de apagado progresivo, grabadora de clips en vivo y sintonizador Dial FM analógico.
            </p>
          </div>

          {/* Versions list */}
          <div className="space-y-4">
            <article className="border-l-2 border-sky-400 pl-3.5">
              <h4 className="text-sm font-black text-white">v24 · Liquid Glass & Next-Gen Audio (3 nov 2026)</h4>
              <ul className="mt-1.5 text-slate-300 leading-relaxed text-[11.5px] space-y-1 list-disc list-inside">
                <li><strong>Dynamic Island HUD</strong>: Cápsula flotante superior con hora solar de cada ciudad, indicador de señal satelital en vivo y controles rápidos.</li>
                <li><strong>Visualizador Líquido 60 FPS</strong>: 3 modos dinámicos (Ondas sinusoidales de neón, Espectro EQ elástico y Pulso Orbital).</li>
                <li><strong>Temporizador de Apagado (Sleep Timer)</strong>: Cuenta regresiva radial con apagado progresivo suave para dormir con la radio.</li>
                <li><strong>Ecualizador & Audio FX</strong>: Perfiles Mega Bass, Claridad Vocal, Espacial 3D y Radio Vintage a válvulas.</li>
                <li><strong>Grabadora de Clips en Vivo</strong>: Captura hasta 60s de cualquier emisión y descárgala en tu dispositivo.</li>
                <li><strong>Dial FM Analógico</strong>: Sintonizador manual con display LED y búsqueda por frecuencia exacta (87.5 - 108.0 MHz).</li>
                <li><strong>Tour Mundial Planetario</strong>: Salta automáticamente entre continentes cada 15s con rotación de cámara cinematográfica.</li>
              </ul>
            </article>

            <article className="border-l-2 border-slate-700 pl-3.5">
              <h4 className="text-sm font-black text-white">v23 · 2 nov 2026</h4>
              <p className="mt-1 text-slate-300 leading-relaxed text-[11.5px]">
                Geolocalización predictiva de precisión: las emisoras sin coordenadas exactas se ubican en su ciudad o estado reconocido.
              </p>
            </article>

            <article className="border-l-2 border-slate-700 pl-3.5">
              <h4 className="text-sm font-black text-white">v21 · 30 oct 2026</h4>
              <p className="mt-1 text-slate-300 leading-relaxed text-[11.5px]">
                <strong>Modo Lite</strong>: apertura en modo ligero sin globo 3D, ahorrando hasta un 80% de batería y datos en equipos o conexiones lentas.
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
