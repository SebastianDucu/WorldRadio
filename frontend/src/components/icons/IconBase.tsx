import type { ReactNode, SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** Tamaño en px (o cualquier unidad CSS). Por defecto 24. */
  size?: number | string;
  /** Si se pasa, el icono es informativo (role="img"); si no, es decorativo (aria-hidden). */
  title?: string;
  /** Relleno sólido con currentColor (corazón lleno, play, etc.). */
  filled?: boolean;
}

/**
 * Base común de todos los iconos: viewBox 24×24, trazo 1.75 px, extremos redondeados
 * y color heredado con currentColor.
 */
export function IconBase({ size = 24, title, filled = false, children, ...rest }: IconProps & { children: ReactNode }) {
  const labelled = Boolean(title) || Boolean(rest["aria-label"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
