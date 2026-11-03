import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { SpinnerIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variants = {
  primary: "bg-accent text-bg hover:brightness-110 shadow-glow",
  secondary: "glass hover:bg-fg/10 text-fg",
  ghost: "text-fg hover:bg-fg/10",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, leftIcon, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-xl font-medium transition",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <SpinnerIcon size={16} /> : leftIcon}
      {children}
    </button>
  );
});
