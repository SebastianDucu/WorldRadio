import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Eleva ligeramente la tarjeta al pasar el cursor (para tarjetas pulsables). */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "glass p-4",
        interactive && "transition hover:-translate-y-0.5 hover:border-accent/40",
        className,
      )}
      {...rest}
    />
  );
}
