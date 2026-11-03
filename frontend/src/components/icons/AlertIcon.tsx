import { IconBase, type IconProps } from "./IconBase";

export function AlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5" /><path d="M12 16.5h.01" />
    </IconBase>
  );
}
