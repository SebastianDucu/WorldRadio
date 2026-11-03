import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tooltip } from "./Tooltip";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Obligatorio: nombre accesible y texto del tooltip. */
  label: string;
  icon: ReactNode;
  size?: "sm" | "md" | "lg";
  active?: boolean;
  /** Muestra el tooltip (desactívalo si el botón ya tiene texto cerca). */
  tooltip?: boolean;
}

const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" } as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, size = "md", active = false, tooltip = true, className, type = "button", ...rest },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={rest["aria-pressed"] ?? (active ? true : undefined)}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-fg transition",
        "hover:bg-fg/10 active:scale-90 disabled:pointer-events-none disabled:opacity-50",
        active && "bg-accent/15 text-accent",
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
  return tooltip ? <Tooltip label={label}>{button}</Tooltip> : button;
});
