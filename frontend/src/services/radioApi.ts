import type { Station } from "@/types/radio";

const SERVERS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

export async function searchOnlineStations(query: string): Promise<Station[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim().toLowerCase();
  const server = SERVERS[Math.floor(Math.random() * SERVERS.length)];
  const url = `${server}/json/stations/search?name=${encodeURIComponent(
    trimmed,
  )}&limit=25&order=clickcount&reverse=true&hidebroken=true`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return [];

    const data = await res.json();
    return (data || [])
      .filter((item: any) => item.url_resolved && item.name)
      .map((item: any): Station => {
        const lat = parseFloat(item.geo_lat) || 40.4168 + (Math.random() * 20 - 10);
        const lng = parseFloat(item.geo_long) || -3.7038 + (Math.random() * 40 - 20);

        return {
          id: `rb-${item.stationuuid}`,
          name: item.name.trim(),
          country: item.country || "Mundial",
          countryCode: item.countrycode || "UN",
          city: item.state || item.country || "Mundo",
          lat,
          lng,
          streamUrl: item.url_resolved,
          genre: (item.tags || "").split(",")[0] || "Variedad",
          tags: (item.tags || "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
            .slice(0, 4),
          bitrate: item.bitrate || 128,
          codec: item.codec || "MP3",
          description: `Emisora transmitiendo desde ${item.country || "el mundo"}`,
        };
      });
  } catch (err) {
    console.warn("Radio Browser search failed:", err);
    return [];
  }
}
