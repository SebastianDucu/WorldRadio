import type { Station } from "@/types/radio";

export interface StationTimeInfo {
  timeString: string;
  period: "morning" | "afternoon" | "evening" | "night";
  isDay: boolean;
  label: string;
  utcOffsetString: string;
}

/**
 * Calculates the real-time local time and solar status of a radio station's city
 * based on coordinates and country timezone mappings.
 */
export function getStationTimeInfo(station: Station | null): StationTimeInfo {
  if (!station) {
    return {
      timeString: "--:--",
      period: "afternoon",
      isDay: true,
      label: "En vivo",
      utcOffsetString: "UTC",
    };
  }

  // Calculate approximate UTC offset from longitude (15 degrees = 1 hour)
  // or refined country specific defaults
  let utcOffsetHours = Math.round(station.lng / 15);

  const code = station.countryCode?.toUpperCase();
  if (code === "ES" || code === "FR" || code === "DE" || code === "IT" || code === "NL" || code === "CH") {
    utcOffsetHours = 1; // CET (standard) or CEST
  } else if (code === "GB") {
    utcOffsetHours = 0; // GMT/BST
  } else if (code === "CO") {
    utcOffsetHours = -5; // COT
  } else if (code === "AR") {
    utcOffsetHours = -3; // ART
  } else if (code === "BR") {
    utcOffsetHours = -3; // BRT
  } else if (code === "MX") {
    utcOffsetHours = -6; // CST
  } else if (code === "JP") {
    utcOffsetHours = 9; // JST
  } else if (code === "US") {
    if (station.lng < -115) utcOffsetHours = -8; // PST
    else if (station.lng < -100) utcOffsetHours = -7; // MST
    else if (station.lng < -85) utcOffsetHours = -6; // CST
    else utcOffsetHours = -5; // EST
  }

  const now = new Date();
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const localDate = new Date(utcMillis + utcOffsetHours * 3600000);

  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

  let period: "morning" | "afternoon" | "evening" | "night";
  let isDay: boolean;
  let label: string;

  if (hours >= 6 && hours < 12) {
    period = "morning";
    isDay = true;
    label = "Mañana";
  } else if (hours >= 12 && hours < 18) {
    period = "afternoon";
    isDay = true;
    label = "Tarde";
  } else if (hours >= 18 && hours < 22) {
    period = "evening";
    isDay = false;
    label = "Atardecer";
  } else {
    period = "night";
    isDay = false;
    label = "Noche";
  }

  const sign = utcOffsetHours >= 0 ? "+" : "";
  const utcOffsetString = `UTC${sign}${utcOffsetHours}`;

  return {
    timeString,
    period,
    isDay,
    label,
    utcOffsetString,
  };
}
