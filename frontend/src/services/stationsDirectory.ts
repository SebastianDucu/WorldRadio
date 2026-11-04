import { usePlayerStore } from "@/store/player";
import { STATIONS, COUNTRIES } from "@/data/stations";
import type { Station, CountryInfo } from "@/types/radio";

const DB_NAME = "worldradio_cache_v1";
const STORE_NAME = "stations_snapshot";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not available"));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getCachedSnapshot(): Promise<{ stations: Station[]; countries: CountryInfo[]; timestamp: number } | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("full_directory");
      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedSnapshot(data: { stations: Station[]; countries: CountryInfo[]; timestamp: number }) {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data, "full_directory");
  } catch (err) {
    console.warn("Could not cache stations snapshot to IndexedDB:", err);
  }
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

let isInitialized = false;

export async function initStationsDirectory() {
  if (isInitialized) return;
  isInitialized = true;

  const store = usePlayerStore.getState();

  // 1. Initial Instant Bootstrap: Load 174 canonical countries from local JSON
  let base174Countries: CountryInfo[] = [];
  try {
    const res = await fetch("./data/countries.json");
    if (res.ok) {
      const localCountries: CountryInfo[] = await res.json();
      if (Array.isArray(localCountries) && localCountries.length > 0) {
        base174Countries = localCountries;
        store.setCountries(localCountries);
      }
    }
  } catch (err) {
    console.warn("Failed loading bundled countries.json:", err);
  }

  // 2. Check IndexedDB cache
  const cached = await getCachedSnapshot();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (cached && cached.stations && cached.stations.length > 1000 && Date.now() - cached.timestamp < ONE_DAY) {
    const merged = [...STATIONS, ...cached.stations.filter((s) => !STATIONS.some((cur) => cur.id === s.id))];
    store.setAllStations(merged);
    if (cached.countries && cached.countries.length > 0) {
      // Ensure strictly 174 countries from cache or fallback
      const canonical = base174Countries.length > 0 ? base174Countries : COUNTRIES;
      const cachedMap = new Map(cached.countries.map((c) => [c.code.toUpperCase(), c]));
      const sanitizedCountries = canonical.map((base: CountryInfo) => {
        const found = cachedMap.get(base.code.toUpperCase());
        return found ? { ...base, stationCount: Math.max(base.stationCount, found.stationCount) } : base;
      }).sort((a: CountryInfo, b: CountryInfo) => a.name.localeCompare(b.name, "es"));
      store.setCountries(sanitizedCountries);
    }
    store.setDirectoryStatus("done", 1, cached.stations.length);
    return;
  }

  // 3. Download Full Snapshot in background with live progress
  store.setDirectoryStatus("loading", 0.05, 0);

  try {
    const metaRes = await fetch("https://orberadio.com/stations-all.meta.json", { cache: "no-cache" });
    if (!metaRes.ok) throw new Error("Metadata request failed");
    const meta = await metaRes.json();
    const totalBytes = meta.bytes || 7400000;

    const dataRes = await fetch(`https://orberadio.com/stations-all.json?v=${encodeURIComponent(meta.ver)}`, {
      cache: "no-cache",
    });
    if (!dataRes.ok || !dataRes.body) throw new Error("Dataset request failed");

    // Read streamed chunks for real-time progress bar
    const reader = dataRes.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        text += decoder.decode(value, { stream: true });
        receivedBytes += value.length;
        const progress = Math.min(0.92, 0.05 + (receivedBytes / totalBytes) * 0.87);
        store.setDirectoryStatus("loading", progress, Math.round(progress * (meta.n || 34971)));
      }
    }
    text += decoder.decode();

    const parsed = JSON.parse(text);

    if (!parsed || !Array.isArray(parsed.rows)) {
      throw new Error("Invalid rows dataset");
    }

    const cn: Record<string, string> = parsed.cn || {};
    const rows: unknown[][] = parsed.rows;

    // Seed countryMap strictly with the canonical 174 countries
    const canonicalCountries = base174Countries.length > 0 ? base174Countries : COUNTRIES;
    const countryMap = new Map<string, CountryInfo>();
    for (const c of canonicalCountries) {
      countryMap.set(c.code.toUpperCase(), { ...c, stationCount: 0 });
    }

    const dn = typeof Intl !== "undefined" && Intl.DisplayNames ? new Intl.DisplayNames(["es"], { type: "region" }) : null;

    const parsedStations: Station[] = [];
    const seedIds = new Set(STATIONS.map((s) => s.id));

    // Coordinate centers for country fallback placement
    const countryCoords = new Map<string, { lat: number; lng: number }>();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r) continue;
      const id = String(r[0] || "");
      if (seedIds.has(id)) continue;

      const name = String(r[1] || "Emisora");
      const url = String(r[2] || "");
      if (!url.startsWith("http")) continue;

      const cc = String(r[3] || "").toUpperCase();
      const city = String(r[4] || "");
      let lat = typeof r[5] === "number" ? r[5] : null;
      let lng = typeof r[6] === "number" ? r[6] : null;

      if (lat != null && lng != null && cc && !countryCoords.has(cc)) {
        countryCoords.set(cc, { lat, lng });
      }

      // If missing geo, place near country centroid with slight jitter
      if (lat == null || lng == null) {
        const center = countryCoords.get(cc);
        if (center) {
          const jitterLat = ((simpleHash(id + "lat") % 100) / 100 - 0.5) * 1.8;
          const jitterLng = ((simpleHash(id + "lng") % 100) / 100 - 0.5) * 1.8;
          lat = center.lat + jitterLat;
          lng = center.lng + jitterLng;
        } else {
          continue; // Skip stations with completely unknown country/geo
        }
      }

      const tagsRaw = String(r[7] || "");
      const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()) : [];
      const genre = tags[0] || "General";
      const bitrate = typeof r[9] === "number" ? r[9] : 128;

      let countryName = cn[cc] || cc;
      if (dn && cc.length === 2) {
        try {
          const localized = dn.of(cc);
          if (localized) countryName = localized;
        } catch {
          // ignore
        }
      }

      if (cc && cc.length === 2 && countryMap.has(cc)) {
        countryMap.get(cc)!.stationCount++;
      }

      const hue = Math.abs(simpleHash(id)) % 360;

      parsedStations.push({
        id,
        name,
        country: countryName,
        countryCode: cc,
        city,
        lat,
        lng,
        streamUrl: url,
        genre,
        tags,
        bitrate,
        codec: url.includes(".m3u8") ? "HLS" : "MP3",
        hue,
        frequency: name.slice(0, 3).toUpperCase(),
      });
    }

    // Sort 174 countries alphabetically in Spanish
    const sortedCountries = [...countryMap.values()]
      .sort((a, b) => a.name.localeCompare(b.name, "es"));

    const mergedAll = [...STATIONS, ...parsedStations];

    store.setAllStations(mergedAll);
    if (sortedCountries.length > 0) {
      store.setCountries(sortedCountries);
    }
    store.setDirectoryStatus("done", 1, parsedStations.length);

    // Persist to IndexedDB
    await setCachedSnapshot({
      stations: parsedStations,
      countries: sortedCountries,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn("Failed background stations directory download, using bundled fallback:", err);
    store.setDirectoryStatus("error", 0, 0);
  }
}
