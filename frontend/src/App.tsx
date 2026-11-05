import { useEffect } from "react";
import { useApplyUiPreferences } from "@/hooks/useApplyUiPreferences";
import { usePlayerStore } from "@/store/player";
import { WorldGlobe } from "@/components/globe/WorldGlobe";
import { FlatMap } from "@/components/globe/FlatMap";
import { StationSidebar } from "@/components/sidebar/StationSidebar";
import { AudioPlayer } from "@/components/player/AudioPlayer";
import { ChristmasAura } from "@/components/snow/ChristmasAura";
import { DriveModeModal } from "@/components/drive/DriveModeModal";
import { ToastViewport } from "@/components/ui";
import { BoltIcon } from "@/components/icons";

import { LiquidAmbientBlobs } from "@/components/ambient/LiquidAmbientBlobs";
import { DynamicIslandHUD } from "@/components/hud/DynamicIslandHUD";
import { SleepTimerModal } from "@/components/player/SleepTimerModal";
import { AudioEqualizerModal } from "@/components/player/AudioEqualizerModal";
import { RadioRecorderModal } from "@/components/player/RadioRecorderModal";
import { FrequencyTunerDial } from "@/components/tuner/FrequencyTunerDial";
import { initStationsDirectory } from "@/services/stationsDirectory";

export default function App() {
  useApplyUiPreferences();
  const {
    viewMode,
    togglePlay,
    nextStation,
    prevStation,
    toggleMute,
    randomStation,
    liteMode,
  } = usePlayerStore();

  useEffect(() => {
    initStationsDirectory();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyN" || e.code === "ArrowRight") {
        e.preventDefault();
        nextStation();
      } else if (e.code === "KeyP" || e.code === "ArrowLeft") {
        e.preventDefault();
        prevStation();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        randomStation();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, nextStation, prevStation, toggleMute, randomStation]);

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#030816] text-[#eaf4ff] select-none">

      <LiquidAmbientBlobs />

      <ChristmasAura />

      <DynamicIslandHUD />

      <main className="absolute inset-0 flex items-center justify-center">
        {liteMode ? (
          <div className="liquid-glass flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-white/20 text-slate-300 max-w-md mx-4 shadow-2xl">
            <BoltIcon size={44} className="text-amber-400 mb-3" />
            <h3 className="text-sm font-bold text-white">Modo Lite Ahorro Activo</h3>
            <p className="text-xs max-w-sm mt-2 leading-relaxed text-slate-400 font-semibold">
              Globo 3D pausado para ahorro máximo de batería y datos móviles. Puedes seleccionar emisoras y usar todas las funciones desde el panel lateral y el reproductor.
            </p>
          </div>
        ) : viewMode === "globe" ? (
          <WorldGlobe />
        ) : (
          <FlatMap />
        )}
      </main>

      <StationSidebar />

      <AudioPlayer />

      <DriveModeModal />

      <SleepTimerModal />
      <AudioEqualizerModal />
      <RadioRecorderModal />
      <FrequencyTunerDial />

      <ToastViewport />
    </div>
  );
}
