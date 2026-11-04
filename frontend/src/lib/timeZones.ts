import type { Station } from "@/types/radio";

export interface StationTimeInfo {
  timeString: string;
  period: "morning" | "afternoon" | "evening" | "night";
  isDay: boolean;
  label: string;
  utcOffsetString: string;
}

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

  let utcOffsetHours = Math.round(station.lng / 15);

  const code = station.countryCode?.toUpperCase();
  if (code === "ES" || code === "FR" || code === "DE" || code === "IT" || code === "NL" || code === "CH") {
    utcOffsetHours = 1;
  } else if (code === "GB") {
    utcOffsetHours = 0;
  } else if (code === "CO") {
    utcOffsetHours = -5;
  } else if (code === "AR") {
    utcOffsetHours = -3;
  } else if (code === "BR") {
    utcOffsetHours = -3;
  } else if (code === "MX") {
    utcOffsetHours = -6;
  } else if (code === "JP") {
    utcOffsetHours = 9;
  } else if (code === "US") {
    if (station.lng < -115) utcOffsetHours = -8;
    else if (station.lng < -100) utcOffsetHours = -7;
    else if (station.lng < -85) utcOffsetHours = -6;
    else utcOffsetHours = -5;
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
