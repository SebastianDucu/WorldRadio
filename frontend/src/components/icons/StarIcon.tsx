import { IconBase, type IconProps } from "./IconBase";

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8L12 3.5Z" />
    </IconBase>
  );
}
