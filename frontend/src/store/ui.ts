import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";

export type ChristmasMode = "auto" | "on" | "off";

interface UiState {
  theme: ThemeMode;
  christmas: ChristmasMode;

  motionOff: boolean;
  setTheme: (theme: ThemeMode) => void;
  setChristmas: (mode: ChristmasMode) => void;
  setMotionOff: (off: boolean) => void;
}

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
