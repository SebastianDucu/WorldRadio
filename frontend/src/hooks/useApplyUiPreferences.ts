import { useEffect } from "react";
import { useUiStore } from "@/store/ui";

/** Calcula si el modo Navidad está activo según la preferencia y la fecha. */
export function useChristmasActive(): boolean {
  const mode = useUiStore((s) => s.christmas);
  // Siempre activo por defecto a menos que el usuario lo desactive explícitamente en configuración
  if (mode === "off") return false;
  return true;
}

/** Refleja tema, Navidad y movimiento en atributos de <html> para que el CSS reaccione. */
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
