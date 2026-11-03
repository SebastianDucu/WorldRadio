import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Chip, IconButton, VolumeSlider } from "./index";

describe("componentes de UI", () => {
  it("IconButton expone su etiqueta como nombre accesible", () => {
    render(<IconButton label="Compartir" icon={<span />} />);
    expect(screen.getByRole("button", { name: "Compartir" })).toBeInTheDocument();
  });

  it("Button en carga queda deshabilitado y marcado aria-busy", () => {
    render(<Button loading>Guardar</Button>);
    const btn = screen.getByRole("button", { name: /guardar/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("Chip alterna aria-pressed", async () => {
    const onClick = vi.fn();
    render(<Chip selected onClick={onClick}>Jazz</Chip>);
    const chip = screen.getByRole("button", { name: "Jazz" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("VolumeSlider notifica el cambio en escala 0–1 y muestra 0 si está silenciado", () => {
    const { rerender } = render(<VolumeSlider value={0.5} muted={false} onChange={() => {}} onToggleMute={() => {}} />);
    expect(screen.getByRole("slider", { name: "Volumen" })).toHaveValue("50");
    rerender(<VolumeSlider value={0.5} muted onChange={() => {}} onToggleMute={() => {}} />);
    expect(screen.getByRole("slider", { name: "Volumen" })).toHaveValue("0");
  });
});
