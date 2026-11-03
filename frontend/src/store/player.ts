import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STATIONS } from "@/data/stations";
import type { Station, CountryInfo } from "@/types/radio";

export type PlaybackStatus = "idle" | "connecting" | "playing" | "error";
export type ViewMode = "globe" | "map";
export type SidebarTab = "explore" | "search" | "favorites" | "tuner" | "more" | "stations" | "countries";
export type EqualizerPreset = "flat" | "bass" | "vocal" | "spatial" | "analog";
export type VisualizerMode = "wave" | "bars" | "pulse";

interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  playbackStatus: PlaybackStatus;
  audioError: string | null;
  volume: number;
  muted: boolean;
  favorites: string[];
  history: string[];

  // Navigation & View State
  viewMode: ViewMode;
  activeTab: SidebarTab;
  searchQuery: string;
  selectedGenre: string;
  selectedCountryCode: string | null;
  sidebarOpen: boolean;
  driveMode: boolean;
  liteMode: boolean;
  keepCentered: boolean;

  // Globe Coordinates target [lat, lng]
  targetLocation: [number, number] | null;

  // Liquid Glass & Innovative Audio Additions
  sleepTimerRemaining: number | null; // Seconds remaining, or null if off
  sleepTimerInitial: number | null; // Initial duration in seconds
  sleepTimerModalOpen: boolean;
  equalizerModalOpen: boolean;
  recorderModalOpen: boolean;
  tunerDialModalOpen: boolean;

  isTourActive: boolean;
  tourCountdown: number;

  equalizerPreset: EqualizerPreset;
  visualizerMode: VisualizerMode;
  tunerFrequency: number;

  // 174 countries and full world directory snapshot state
  countries: CountryInfo[];
  allStations: Station[];
  directoryStatus: "idle" | "loading" | "done" | "error";
  directoryProgress: number;
  directoryCount: number;

  // Actions
  playStation: (station: Station) => void;
  togglePlay: () => void;
  pause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setAudioError: (err: string | null) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  nextStation: () => void;
  prevStation: () => void;
  randomStation: () => void;
  toggleFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;

  flyTo: (lat: number, lng: number) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setSearchQuery: (q: string) => void;
  setSelectedGenre: (genre: string) => void;
  setSelectedCountryCode: (code: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDriveMode: (val: boolean) => void;
  setLiteMode: (val: boolean) => void;
  toggleKeepCentered: () => void;

  // Liquid Audio actions
  setSleepTimer: (minutes: number | null) => void;
  decrementSleepTimer: () => void;
  cancelSleepTimer: () => void;
  setSleepTimerModalOpen: (open: boolean) => void;
  setEqualizerModalOpen: (open: boolean) => void;
  setRecorderModalOpen: (open: boolean) => void;
  setTunerDialModalOpen: (open: boolean) => void;
  setTourActive: (active: boolean) => void;
  setTourCountdown: (c: number) => void;
  tickTour: () => void;
  setEqualizerPreset: (preset: EqualizerPreset) => void;
  setVisualizerMode: (mode: VisualizerMode) => void;
  setTunerFrequency: (freq: number) => void;

  setCountries: (countries: CountryInfo[]) => void;
  setAllStations: (stations: Station[]) => void;
  setDirectoryStatus: (status: "idle" | "loading" | "done" | "error", progress?: number, count?: number) => void;
}

const defaultStation: Station = STATIONS.find((s) => s.id === "us-kexp") ?? STATIONS[0] ?? {
  id: "default",
  name: "WorldRadio",
  country: "Global",
  countryCode: "UN",
  city: "Tierra",
  lat: 47.6062,
  lng: -122.3321,
  streamUrl: "https://kexp.streamguys1.com/kexp128.mp3",
  genre: "Indie / Rock",
  tags: [],
  bitrate: 128,
  codec: "MP3",
  frequency: "90.3",
  hue: 200,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentStation: defaultStation,
      isPlaying: false,
      isLoading: false,
      playbackStatus: "idle",
      audioError: null,
      volume: 0.8,
      muted: false,
      favorites: ["us-kexp", "fr-fip", "uk-capital", "es-los40", "xmas-absolut"],
      history: [defaultStation.id],

      viewMode: "globe",
      activeTab: "explore",
      searchQuery: "",
      selectedGenre: "Todas",
      selectedCountryCode: null,
      sidebarOpen: false,
      driveMode: false,
      liteMode: false,
      keepCentered: true,

      targetLocation: [defaultStation.lat, defaultStation.lng],

      // Innovative liquid additions initial states
      sleepTimerRemaining: null,
      sleepTimerInitial: null,
      sleepTimerModalOpen: false,
      equalizerModalOpen: false,
      recorderModalOpen: false,
      tunerDialModalOpen: false,

      isTourActive: false,
      tourCountdown: 15,

      equalizerPreset: "flat",
      visualizerMode: "wave",
      tunerFrequency: 90.3,

      countries: [],
      allStations: STATIONS,
      directoryStatus: "idle",
      directoryProgress: 0,
      directoryCount: 0,

      playStation: (station: Station) => {
        const current = get().currentStation;
        if (current?.id === station.id && get().isPlaying) {
          return;
        }

        // Parse numerical frequency if present
        let parsedFreq = 95.0;
        if (station.frequency) {
          const match = station.frequency.match(/([0-9]+\.?[0-9]*)/);
          if (match && match[1]) {
            parsedFreq = parseFloat(match[1]);
          }
        }

        set((state) => ({
          currentStation: station,
          isPlaying: true,
          isLoading: true,
          playbackStatus: "connecting",
          audioError: null,
          targetLocation: [station.lat, station.lng],
          tunerFrequency: parsedFreq,
          history: [station.id, ...state.history.filter((id) => id !== station.id)].slice(0, 20),
        }));
      },

      togglePlay: () => {
        const { currentStation, isPlaying } = get();
        if (!currentStation) {
          const first = STATIONS[0];
          if (first) {
            get().playStation(first);
          }
          return;
        }
        if (isPlaying) {
          set({ isPlaying: false, playbackStatus: "idle", isLoading: false });
        } else {
          set({ isPlaying: true, isLoading: true, playbackStatus: "connecting", audioError: null });
        }
      },

      pause: () => {
        set({ isPlaying: false, playbackStatus: "idle", isLoading: false });
      },

      setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setPlaybackStatus: (status: PlaybackStatus) => set({ playbackStatus: status }),
      setAudioError: (err: string | null) => set({ audioError: err }),

      setVolume: (v: number) => set({ volume: Math.max(0, Math.min(1, v)), muted: false }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),

      nextStation: () => {
        const { currentStation, favorites, activeTab } = get();
        let pool = STATIONS;
        if (activeTab === "favorites" && favorites.length > 0) {
          pool = STATIONS.filter((s) => favorites.includes(s.id));
        }
        if (pool.length === 0) pool = STATIONS;
        const index = pool.findIndex((s) => s.id === currentStation?.id);
        const nextIndex = (index + 1) % pool.length;
        const next = pool[nextIndex];
        if (next) get().playStation(next);
      },

      prevStation: () => {
        const { currentStation, favorites, activeTab } = get();
        let pool = STATIONS;
        if (activeTab === "favorites" && favorites.length > 0) {
          pool = STATIONS.filter((s) => favorites.includes(s.id));
        }
        if (pool.length === 0) pool = STATIONS;
        const index = pool.findIndex((s) => s.id === currentStation?.id);
        const prevIndex = (index - 1 + pool.length) % pool.length;
        const prev = pool[prevIndex];
        if (prev) get().playStation(prev);
      },

      randomStation: () => {
        const { currentStation } = get();
        const available = STATIONS.filter((s) => s.id !== currentStation?.id);
        if (available.length === 0) return;
        const random = available[Math.floor(Math.random() * available.length)];
        if (random) get().playStation(random);
      },

      toggleFavorite: (stationId: string) => {
        set((state) => {
          const exists = state.favorites.includes(stationId);
          const next = exists
            ? state.favorites.filter((id) => id !== stationId)
            : [...state.favorites, stationId];
          return { favorites: next };
        });
      },

      isFavorite: (stationId: string) => {
        return get().favorites.includes(stationId);
      },

      flyTo: (lat: number, lng: number) => {
        set({ targetLocation: [lat, lng] });
      },

      setViewMode: (viewMode: ViewMode) => set({ viewMode }),
      setActiveTab: (activeTab: SidebarTab) => set({ activeTab }),
      setSearchQuery: (searchQuery: string) => set({ searchQuery }),
      setSelectedGenre: (selectedGenre: string) => set({ selectedGenre, selectedCountryCode: null }),
      setSelectedCountryCode: (code: string | null) => set({ selectedCountryCode: code, activeTab: "explore" }),
      setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setDriveMode: (driveMode: boolean) => set({ driveMode }),
      setLiteMode: (liteMode: boolean) => set({ liteMode }),
      toggleKeepCentered: () => set((state) => ({ keepCentered: !state.keepCentered })),

      // Liquid Audio Action Implementations
      setSleepTimer: (minutes: number | null) => {
        if (!minutes || minutes <= 0) {
          set({ sleepTimerRemaining: null, sleepTimerInitial: null });
        } else {
          const totalSeconds = Math.round(minutes * 60);
          set({
            sleepTimerRemaining: totalSeconds,
            sleepTimerInitial: totalSeconds,
            sleepTimerModalOpen: false,
          });
        }
      },

      decrementSleepTimer: () => {
        const { sleepTimerRemaining, pause } = get();
        if (sleepTimerRemaining === null) return;
        if (sleepTimerRemaining <= 1) {
          pause();
          set({ sleepTimerRemaining: null, sleepTimerInitial: null });
        } else {
          set({ sleepTimerRemaining: sleepTimerRemaining - 1 });
        }
      },

      cancelSleepTimer: () => {
        set({ sleepTimerRemaining: null, sleepTimerInitial: null });
      },

      setSleepTimerModalOpen: (open: boolean) => set({ sleepTimerModalOpen: open }),
      setEqualizerModalOpen: (open: boolean) => set({ equalizerModalOpen: open }),
      setRecorderModalOpen: (open: boolean) => set({ recorderModalOpen: open }),
      setTunerDialModalOpen: (open: boolean) => set({ tunerDialModalOpen: open }),

      setTourActive: (active: boolean) => {
        set({ isTourActive: active, tourCountdown: 15 });
        if (active && !get().isPlaying) {
          get().togglePlay();
        }
      },

      setTourCountdown: (c: number) => set({ tourCountdown: c }),

      tickTour: () => {
        const { isTourActive, tourCountdown, randomStation } = get();
        if (!isTourActive) return;

        if (tourCountdown <= 1) {
          randomStation();
          set({ tourCountdown: 15 });
        } else {
          set({ tourCountdown: tourCountdown - 1 });
        }
      },

      setEqualizerPreset: (preset: EqualizerPreset) => set({ equalizerPreset: preset }),
      setVisualizerMode: (mode: VisualizerMode) => set({ visualizerMode: mode }),
      setTunerFrequency: (freq: number) => set({ tunerFrequency: freq }),

      setCountries: (countries: CountryInfo[]) => set({ countries }),
      setAllStations: (stations: Station[]) => set({ allStations: stations }),
      setDirectoryStatus: (status, progress = 0, count = 0) =>
        set((state) => ({
          directoryStatus: status,
          directoryProgress: progress !== undefined ? progress : state.directoryProgress,
          directoryCount: count !== undefined ? count : state.directoryCount,
        })),
    }),
    {
      name: "worldradio:player",
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        favorites: state.favorites,
        history: state.history,
        liteMode: state.liteMode,
        keepCentered: state.keepCentered,
        equalizerPreset: state.equalizerPreset,
        visualizerMode: state.visualizerMode,
      }),
    },
  ),
);
