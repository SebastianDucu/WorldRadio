import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Etiqueta pulsable para filtros (género, idioma). Es un interruptor accesible (aria-pressed). */
export function Chip({ selected = false, className, children, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition",
        selected
          ? "border-accent/60 bg-accent/15 text-accent"
          : "border-fg/10 bg-fg/5 text-muted hover:bg-fg/10 hover:text-fg",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
