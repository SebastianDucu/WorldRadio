import { IconBase, type IconProps } from "./IconBase";

/** Indicador de carga: gira con la clase animate-spin360 (se detiene con movimiento reducido). */
export function SpinnerIcon({ className, ...props }: IconProps) {
  return (
    <IconBase className={["animate-spin360", className].filter(Boolean).join(" ")} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </IconBase>
  );
}
