import { IconBase, type IconProps } from "./IconBase";

export function MuteIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4H4Z" /><path d="m16 9.5 5 5" /><path d="m21 9.5-5 5" />
    </IconBase>
  );
}
