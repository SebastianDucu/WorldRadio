import { IconBase, type IconProps } from "./IconBase";

export function LocationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s6.5-5.7 6.5-11a6.5 6.5 0 0 0-13 0c0 5.3 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.3" />
    </IconBase>
  );
}
