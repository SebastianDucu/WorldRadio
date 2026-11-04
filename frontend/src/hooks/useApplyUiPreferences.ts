import { useEffect } from "react";
import { useUiStore } from "@/store/ui";

export function useChristmasActive(): boolean {
  const mode = useUiStore((s) => s.christmas);

  if (mode === "off") return false;
  return true;
}

export function useApplyUiPreferences(): void {
  const theme = useUiStore((s) => s.theme);
  const motionOff = useUiStore((s) => s.motionOff);
  const christmas = useChristmasActive();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.christmas = christmas ? "on" : "off";
    root.dataset.motion = motionOff ? "off" : "on";
  }, [theme, christmas, motionOff]);
}
