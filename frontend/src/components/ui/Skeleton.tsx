import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Bloque «esqueleto» con brillo animado. Decorativo: se oculta a lectores de pantalla. */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden rounded-lg bg-fg/10", className)}
      {...rest}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-fg/10 to-transparent" />
    </div>
  );
}
