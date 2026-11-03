import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";
/** "auto" = activo solo en temporada; "on"/"off" = elección manual del usuario. */
export type ChristmasMode = "auto" | "on" | "off";

interface UiState {
  theme: ThemeMode;
  christmas: ChristmasMode;
  /** Interruptor global: apaga todas las animaciones con un solo botón. */
  motionOff: boolean;
  setTheme: (theme: ThemeMode) => void;
  setChristmas: (mode: ChristmasMode) => void;
  setMotionOff: (off: boolean) => void;
}

/** Preferencias de interfaz. Solo viven en localStorage; nada sale del navegador. */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "dark",
      christmas: "on",
      motionOff: false,
      setTheme: (theme) => set({ theme }),
      setChristmas: (christmas) => set({ christmas }),
      setMotionOff: (motionOff) => set({ motionOff }),
    }),
    { name: "worldradio:ui" },
  ),
);
