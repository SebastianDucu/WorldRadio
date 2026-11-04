import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const id = useId();
  return (
    <span className={cn("group relative inline-flex", className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1",
          "glass text-xs text-fg opacity-0 transition-opacity duration-150",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        {label}
      </span>
    </span>
  );
}
