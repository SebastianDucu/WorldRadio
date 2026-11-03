import { getStationTimeInfo } from "./timeZones";
import type { Station } from "@/types/radio";

describe("getStationTimeInfo", () => {
  it("retorna objeto por defecto si la estación es nula", () => {
    const info = getStationTimeInfo(null);
    expect(info.timeString).toBe("--:--");
    expect(info.label).toBe("En vivo");
  });

  it("calcula información horaria válida para una estación", () => {
    const mockStation: Station = {
      id: "test-paris",
      name: "Radio Paris",
      country: "Francia",
      countryCode: "FR",
      city: "París",
      lat: 48.8566,
      lng: 2.3522,
      streamUrl: "https://example.com/stream",
      genre: "Electro",
      tags: [],
      bitrate: 128,
      codec: "MP3",
      frequency: "105.5",
      hue: 210,
    };

    const info = getStationTimeInfo(mockStation);
    expect(info.timeString).toMatch(/^[0-9]{2}:[0-9]{2}$/);
    expect(["morning", "afternoon", "evening", "night"]).toContain(info.period);
    expect(typeof info.isDay).toBe("boolean");
    expect(info.utcOffsetString).toContain("UTC");
  });
});
