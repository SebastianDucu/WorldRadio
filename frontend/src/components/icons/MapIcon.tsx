import { IconBase, type IconProps } from "./IconBase";

export function MapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" /><path d="M9 4v14" /><path d="M15 6v14" />
    </IconBase>
  );
}
