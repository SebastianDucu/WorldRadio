import { MuteIcon, VolumeIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

interface VolumeSliderProps {

  value: number;
  muted: boolean;
  onChange: (value: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export function VolumeSlider({ value, muted, onChange, onToggleMute, className }: VolumeSliderProps) {
  const shown = muted ? 0 : value;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <IconButton
        size="sm"
        label={muted ? "Activar sonido" : "Silenciar"}
        aria-pressed={muted}
        icon={muted || value === 0 ? <MuteIcon size={20} /> : <VolumeIcon size={20} />}
        onClick={onToggleMute}
      />
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(shown * 100)}
        aria-label="Volumen"
        aria-valuetext={`${Math.round(shown * 100)} por ciento`}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="volume-range w-24"
        style={{ ["--fill" as string]: `${shown * 100}%` }}
      />
    </div>
  );
}
