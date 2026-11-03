import { IconBase, type IconProps } from "./IconBase";

export function ShareIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6" /><path d="m8.2 13.2 7.6 3.6" />
    </IconBase>
  );
}
