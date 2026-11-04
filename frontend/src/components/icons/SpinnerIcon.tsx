import { IconBase, type IconProps } from "./IconBase";

export function SpinnerIcon({ className, ...props }: IconProps) {
  return (
    <IconBase className={["animate-spin360", className].filter(Boolean).join(" ")} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </IconBase>
  );
}
