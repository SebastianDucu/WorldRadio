import { IconBase, type IconProps } from "./IconBase";

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" />
    </IconBase>
  );
}
