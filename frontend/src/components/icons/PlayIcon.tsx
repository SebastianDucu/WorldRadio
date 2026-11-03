import { IconBase, type IconProps } from "./IconBase";

export function PlayIcon({ filled = true, ...props }: IconProps) {
  return (
    <IconBase filled={filled} {...props}>
      <path d="M7.5 5v14l11-7-11-7Z" />
    </IconBase>
  );
}
