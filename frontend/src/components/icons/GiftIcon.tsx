import { IconBase, type IconProps } from "./IconBase";

export function GiftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="9" width="17" height="4" rx="1" /><path d="M5 13v7h14v-7" /><path d="M12 9v11" /><path d="M12 9C10 9 7.5 8.3 7.5 6.3 7.5 4.8 9 4 10.2 4.6 11.5 5.3 12 7 12 9Z" /><path d="M12 9c2 0 4.5-.7 4.5-2.7 0-1.5-1.5-2.3-2.7-1.7C12.5 5.3 12 7 12 9Z" />
    </IconBase>
  );
}
