import { useEffect, useState } from "react";
import type { Station } from "@/types/radio";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getStationBaseListeners(station: Station | null): number {
  if (!station) return 0;
  if (station.listeners && station.listeners > 0) return station.listeners;

  const h = hashString(station.id || station.name);

  const isMajor = station.bitrate >= 192 || station.name.length < 12;
  const base = isMajor ? 2800 + (h % 6200) : 340 + (h % 1800);
  return base;
}

export function formatListenerCount(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toLocaleString("es-ES");
}

export function useLiveListeners(station: Station | null) {
  const [listeners, setListeners] = useState(() => getStationBaseListeners(station));

  useEffect(() => {
    const base = getStationBaseListeners(station);
    setListeners(base);

    if (!station) return;

    const interval = setInterval(() => {
      setListeners((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3; 
        const updated = prev + delta;
        const min = Math.floor(base * 0.85);
        const max = Math.ceil(base * 1.15);
        return Math.max(min, Math.min(max, updated));
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [station?.id, station?.name]);

  return {
    listeners,
    formatted: formatListenerCount(listeners),
    fullString: listeners.toLocaleString("es-ES"),
  };
}
