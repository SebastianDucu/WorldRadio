import { IconBase, type IconProps } from "./IconBase";

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12" /><path d="m18 6-12 12" />
    </IconBase>
  );
}
