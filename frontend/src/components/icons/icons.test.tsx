import { render } from "@testing-library/react";
import { HeartIcon, PlayIcon } from "./index";

describe("iconos", () => {
  it("son decorativos por defecto (aria-hidden)", () => {
    const { container } = render(<PlayIcon />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("stroke-width", "1.75");
  });
  it("con title pasan a ser informativos", () => {
    const { getByRole } = render(<HeartIcon title="Favorita" />);
    expect(getByRole("img", { name: "Favorita" })).toBeInTheDocument();
  });
  it("respeta size y filled", () => {
    const { container } = render(<HeartIcon size={32} filled />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });
});
