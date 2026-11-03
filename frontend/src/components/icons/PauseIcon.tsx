import { IconBase, type IconProps } from "./IconBase";

export function PauseIcon({ filled = true, ...props }: IconProps) {
  return (
    <IconBase filled={filled} {...props}>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" /><rect x="14" y="4.5" width="4" height="15" rx="1.2" />
    </IconBase>
  );
}
