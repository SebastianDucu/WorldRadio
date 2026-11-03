import { IconBase, type IconProps } from "./IconBase";

export function RadioIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.9 19h14.2c1 0 1.9-.9 1.9-2V9c0-1.1-.9-2-1.9-2H4.9C3.9 7 3 7.9 3 9v8c0 1.1.9 2 1.9 2Z" />
      <path d="m16.5 7-7.7-4.2" />
      <circle cx="8" cy="13" r="2" />
      <line x1="13" x2="17" y1="11" y2="11" />
      <line x1="13" x2="17" y1="15" y2="15" />
    </IconBase>
  );
}

