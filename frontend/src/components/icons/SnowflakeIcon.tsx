import { IconBase, type IconProps } from "./IconBase";

export function SnowflakeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18" /><path d="m4.2 7.5 15.6 9" /><path d="m4.2 16.5 15.6-9" /><path d="m9.5 4.5 2.5 2 2.5-2" /><path d="m9.5 19.5 2.5-2 2.5 2" />
    </IconBase>
  );
}
