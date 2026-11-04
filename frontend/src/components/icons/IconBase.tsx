import type { ReactNode, SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {

  size?: number | string;

  title?: string;

  filled?: boolean;
}

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
