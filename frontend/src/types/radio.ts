export interface Station {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
  streamUrl: string;
  homepage?: string;
  favicon?: string;
  genre: string;
  tags: string[];
  bitrate: number;
  codec: string;
  description?: string;
  frequency?: string;
  hue?: number;
  listeners?: number;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  stationCount: number;
}
