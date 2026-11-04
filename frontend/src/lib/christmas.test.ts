import { isChristmasSeason } from "./christmas";

describe("isChristmasSeason", () => {
  it("se activa en temporada navideña (noviembre a mediados de enero)", () => {
    expect(isChristmasSeason(new Date(2026, 10, 15))).toBe(true);
    expect(isChristmasSeason(new Date(2026, 11, 25))).toBe(true);
    expect(isChristmasSeason(new Date(2027, 0, 6))).toBe(true);
  });
  it("no se activa fuera de temporada", () => {
    expect(isChristmasSeason(new Date(2027, 0, 16))).toBe(false);
    expect(isChristmasSeason(new Date(2026, 5, 15))).toBe(false);
  });
});
