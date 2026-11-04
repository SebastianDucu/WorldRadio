import { IconBase, type IconProps } from "./IconBase";

export function TargetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </IconBase>
  );
}
