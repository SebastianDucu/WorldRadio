import { useState, useMemo, useEffect, useRef } from "react";
import {
  GlobeIcon,
  SearchIcon,
  HeartIcon,
  PlayIcon,
  PauseIcon,
  CloseIcon,
  ShuffleIcon,
  SpinnerIcon,
  CarIcon,
  RadioIcon,
  EqualizerIcon,
  TimerIcon,
  MicIcon,
  BoltIcon,
  SparklesIcon,
  UsersIcon,
  LocationIcon,
  ChevronDownIcon,
  PrevIcon,
  NextIcon,
  VolumeIcon,
  MuteIcon,
  CompassIcon,
  ShareIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { STATIONS, COUNTRIES } from "@/data/stations";
import { usePlayerStore } from "@/store/player";
import { searchOnlineStations } from "@/services/radioApi";
import { ChangelogModal } from "@/components/modals/ChangelogModal";
import { StationDetailsModal } from "@/components/player/StationDetailsModal";
import { WorldRadioLogo } from "@/components/common/WorldRadioLogo";
import { getStationBaseListeners, formatListenerCount, useLiveListeners } from "@/hooks/useLiveListeners";
import { getStationTimeInfo } from "@/lib/timeZones";
import { toast } from "@/store/toast";
import type { Station } from "@/types/radio";

const MOOD_FILTERS = [
  { label: "Todas", value: "Todas" },
  { label: "Navidad", value: "Navideña" },
  { label: "Chill & Lo-Fi", value: "Chillout / Ambient" },
  { label: "Electrónica", value: "Electrónica" },
  { label: "Jazz & Soul", value: "Jazz / Blues" },
  { label: "Rock", value: "Indie / Rock" },
  { label: "Pop & Hits", value: "Pop / Hits" },
  { label: "Noticias", value: "Noticias" },
  { label: "Clásica", value: "Clásica" },
];

export function StationSidebar() {
  const {
    currentStation,
    isPlaying,
    isLoading,
    playStation,
    togglePlay,
    nextStation,
    prevStation,
    volume,
    setVolume,
    muted,
    toggleMute,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedCountryCode,
    setSelectedCountryCode,
    selectedCity,
    setSelectedCity,
    favorites,
    toggleFavorite,
    isFavorite,
    randomStation,
    flyTo,
    sidebarOpen,
    toggleSidebar,
    setDriveMode,
    liteMode,
    setLiteMode,
    setSleepTimerModalOpen,
    setEqualizerModalOpen,
    setRecorderModalOpen,
    setTunerDialModalOpen,
    countries,
    allStations,
    isTourActive,
    setTourActive,
    tourCountdown,
    sleepTimerRemaining,
  } = usePlayerStore();

  const [onlineResults, setOnlineResults] = useState<Station[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isCityPickerExpanded, setIsCityPickerExpanded] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingCity, setIsDraggingCity] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const liveListeners = useLiveListeners(currentStation);
  const [timeInfo, setTimeInfo] = useState(() => getStationTimeInfo(currentStation));

  useEffect(() => {
    setTimeInfo(getStationTimeInfo(currentStation));
  }, [currentStation]);

  const handleCityMouseDown = (e: React.MouseEvent) => {
    if (!cityScrollRef.current) return;
    setIsDraggingCity(true);
    dragStartX.current = e.pageX - cityScrollRef.current.offsetLeft;
    dragScrollLeft.current = cityScrollRef.current.scrollLeft;
  };

  const handleCityMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCity || !cityScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - cityScrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    cityScrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleCityMouseUpOrLeave = () => {
    setIsDraggingCity(false);
  };

  const scrollCityLeft = () => {
    cityScrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollCityRight = () => {
    cityScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const countryList = countries && countries.length > 0 ? countries : COUNTRIES;

  const matchedCountry = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q.length < 2) return null;
    return countryList.find(
      (c) => c.name.toLowerCase().startsWith(q) || c.name.toLowerCase().includes(q),
    );
  }, [countryList, searchQuery]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      const res = await searchOnlineStations(searchQuery);
      setOnlineResults(res);
      setIsSearchingOnline(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const availableCities = useMemo(() => {
    if (!selectedCountryCode) return [];
    const pool = (allStations && allStations.length > 0 ? allStations : STATIONS).filter(
      (s) => s.countryCode === selectedCountryCode,
    );
    const cityMap = new Map<string, number>();
    for (const s of pool) {
      const city = s.city?.trim() || "";
      if (city) {
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      }
    }
    return Array.from(cityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
  }, [allStations, selectedCountryCode]);

  const filteredCities = useMemo(() => {
    if (!citySearchQuery.trim()) return availableCities;
    const q = citySearchQuery.toLowerCase().trim();
    return availableCities.filter((c) => c.name.toLowerCase().includes(q));
  }, [availableCities, citySearchQuery]);

  const filteredStations = useMemo(() => {
    let list = allStations && allStations.length > 0 ? allStations : STATIONS;

    if (activeTab === "favorites") {
      list = list.filter((s) => favorites.includes(s.id));
    }

    if (selectedCountryCode) {
      list = list.filter((s) => s.countryCode === selectedCountryCode);
    }

    if (selectedCity) {
      list = list.filter((s) => s.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (selectedGenre !== "Todas") {
      if (selectedGenre === "Navideña") {
        list = list.filter(
          (s) =>
            s.genre.includes("Navideña") ||
            s.tags.some((t) => t.toLowerCase().includes("navidad") || t.toLowerCase().includes("christmas")),
        );
      } else {
        list = list.filter(
          (s) =>
            s.genre.toLowerCase().includes(selectedGenre.toLowerCase()) ||
            s.tags.some((t) => t.toLowerCase().includes(selectedGenre.toLowerCase())),
        );
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );

      if (onlineResults.length > 0) {
        const ids = new Set(list.map((s) => s.id));
        const extra = onlineResults.filter((s) => !ids.has(s.id));
        return [...list, ...extra];
      }
    }

    return list;
  }, [allStations, activeTab, favorites, selectedCountryCode, selectedCity, selectedGenre, searchQuery, onlineResults]);

  const getStationBadge = (station: Station) => {
    if (station.frequency && station.frequency.length <= 5) return station.frequency;
    const parts = station.name.trim().split(/\s+/);
    const first = parts[0];
    const second = parts[1];
    if (first && second && first[0] && second[0]) {
      return (first[0] + second[0]).toUpperCase();
    }
    return station.name.slice(0, 2).toUpperCase();
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          let closest = countryList[0];
          let minDistance = Infinity;
          for (const c of countryList) {
            const dist = Math.hypot(c.lat - latitude, c.lng - longitude);
            if (dist < minDistance) {
              minDistance = dist;
              closest = c;
            }
          }
          if (closest) {
            setSelectedCountryCode(closest.code);
            setSelectedCity(null);
            flyTo(closest.lat, closest.lng);
            setActiveTab("explore");
            toast.info(`Cerca de ti: Sintonizando ${closest.name}`);
          }
        },
        () => {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
          const found = countryList.find((c) => tz.toLowerCase().includes(c.name.toLowerCase()));
          if (found) {
            setSelectedCountryCode(found.code);
            flyTo(found.lat, found.lng);
            setActiveTab("explore");
            toast.info(`Región detectada: ${found.name}`);
          } else {
            toast.info("Activa la ubicación para sintonizar emisoras cercanas");
          }
        },
        { timeout: 4000 }
      );
    }
  };

  const handleSurprise = () => {
    randomStation();
    toast.info("¡Sorpresa! Sintonizando emisora mundial");
  };

  const handleTour = () => {
    setTourActive(!isTourActive);
    if (!isTourActive) {
      toast.info("Tour Mundial activado: cambiando de frecuencia cada 15s");
    } else {
      toast.info("Tour Mundial pausado");
    }
  };

  const handleShare = (station: Station) => {
    if (navigator.share) {
      navigator.share({
        title: `${station.name} · WorldRadio`,
        text: `Escuchando ${station.name} (${station.city ? `${station.city}, ` : ""}${station.country}) en vivo en WorldRadio`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-30 liquid-glass-pill px-3.5 py-2 flex items-center gap-2.5 rounded-full border border-amber-400/30 text-white shadow-xl hover:scale-105 active:scale-95 transition-all pointer-events-auto"
          aria-label="Abrir explorador de emisoras"
          title="Abrir explorador de emisoras"
        >
          <WorldRadioLogo size="sm" />
          <span className="text-xs font-bold text-white">Explorar</span>
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            {countryList.length} Países
          </span>
        </button>
      )}

      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-2 sm:top-3 bottom-2 sm:bottom-3 left-2 sm:left-3 z-30 flex flex-col rounded-3xl liquid-glass shadow-2xl transition-transform duration-300 w-[calc(100vw-1rem)] sm:w-[380px] lg:w-[410px] border border-amber-400/20 overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
        }`}
        aria-label="Consola de exploración y sintonización"
      >
        <div className="w-12 h-1 rounded-full bg-white/25 mx-auto mt-2.5 shrink-0" />

        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <WorldRadioLogo size="md" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold tracking-tight text-white leading-none">
                  World<span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">Radio</span>
                </h2>
                <span className="flex items-center gap-1 rounded-md bg-emerald-400/15 border border-emerald-400/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>EN VIVO</span>
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                34.900+ emisoras · {countryList.length} naciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              size="sm"
              label="Modo Conducción"
              className="text-slate-300 hover:text-amber-400 hover:bg-amber-400/15 transition-all duration-200 active:scale-90"
              icon={<CarIcon size={18} />}
              onClick={() => setDriveMode(true)}
            />

            <IconButton
              size="sm"
              label="Sintonizar aleatorio"
              className="text-slate-300 hover:text-amber-400 hover:bg-amber-400/15 transition-all duration-200 active:scale-90"
              icon={<ShuffleIcon size={18} />}
              onClick={handleSurprise}
            />

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "more" ? "explore" : "more")}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
                activeTab === "more"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title="Herramientas y opciones de audio"
              aria-label="Más opciones"
            >
              <span className="text-sm font-black tracking-widest leading-none">•••</span>
            </button>

            <IconButton
              size="sm"
              label="Minimizar panel"
              className="text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-90"
              icon={<CloseIcon size={18} />}
              onClick={toggleSidebar}
            />
          </div>
        </header>

        <div className="p-3 pb-2 border-b border-white/5 shrink-0">
          <div className="relative flex items-center">
            <SearchIcon size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar emisora, país, ciudad o género..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2 pl-9 pr-8 text-xs font-semibold placeholder:text-slate-500 focus:border-amber-400 focus:outline-none transition-all shadow-inner"
            />
            {isSearchingOnline ? (
              <SpinnerIcon size={14} className="absolute right-3 animate-spin text-amber-400" />
            ) : searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-slate-400 hover:text-white"
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {(activeTab === "explore" || activeTab === "stations") && (
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none border-b border-white/5 shrink-0">
            {MOOD_FILTERS.map((cat) => {
              const isSelected = selectedGenre === cat.value;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedGenre(cat.value)}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/35 scale-105"
                      : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 px-3 py-2 border-b border-white/5 shrink-0">
          <button
            onClick={handleNearMe}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-slate-900/60 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-center group"
            title="Sintonizar emisoras cercanas a tu ubicación"
          >
            <LocationIcon size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-200">Cerca de mí</span>
          </button>

          <button
            onClick={handleSurprise}
            className="flex flex-col items-center justify-center gap-1 p-2 rounded-2xl bg-slate-900/60 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-center group"
            title="Sintonizar una frecuencia aleatoria del planeta"
          >
            <SparklesIcon size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-200">Sorpréndeme</span>
          </button>

          <button
            onClick={handleTour}
            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl border active:scale-95 transition-all text-center group ${
              isTourActive
                ? "bg-amber-400/25 border-amber-400/70 text-amber-300 shadow-md shadow-amber-400/25"
                : "bg-slate-900/60 hover:bg-white/10 border-white/10 text-slate-200"
            }`}
            title={isTourActive ? "Pausar tour mundial" : "Iniciar viaje automático por las capitales"}
          >
            <CompassIcon
              size={18}
              className={`${isTourActive ? "text-amber-400 animate-spin" : "text-amber-400"} group-hover:scale-110 transition-transform`}
            />
            <span className="text-[11px] font-bold">
              {isTourActive ? `Viaje (${tourCountdown}s)` : "Viaje"}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === "more" ? (
            <div className="space-y-2.5 p-1">
              <button
                onClick={() => setTunerDialModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-400/30 transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    <RadioIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Dial FM Analógico</span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      Sintoniza por frecuencia de radio con dial interactivo
                    </span>
                  </div>
                </div>
                <span className="text-amber-400 font-bold text-lg group-hover:translate-x-1 transition-transform">›</span>
              </button>

              <button
                onClick={() => setEqualizerModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-sky-400/30 transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-400 border border-sky-400/30">
                    <EqualizerIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Ecualizador & Audio FX</span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      Mega Bass, Claridad Vocal, Espacial 3D y Vintage
                    </span>
                  </div>
                </div>
                <span className="text-sky-400 font-bold text-lg group-hover:translate-x-1 transition-transform">›</span>
              </button>

              <button
                onClick={() => setSleepTimerModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-indigo-400/30 transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/15 text-indigo-400 border border-indigo-400/30">
                    <TimerIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Temporizador de Apagado</span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      Apaga la radio automáticamente con cuenta regresiva
                    </span>
                  </div>
                </div>
                <span className="text-indigo-400 font-bold text-lg group-hover:translate-x-1 transition-transform">›</span>
              </button>

              <button
                onClick={() => setRecorderModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-rose-400/30 transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-400/15 text-rose-400 border border-rose-400/30">
                    <MicIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Grabadora de Clips</span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      Graba canciones en vivo y descarga el archivo de audio
                    </span>
                  </div>
                </div>
                <span className="text-rose-400 font-bold text-lg group-hover:translate-x-1 transition-transform">›</span>
              </button>

              <button
                onClick={() => setLiteMode(!liteMode)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98 ${
                  liteMode
                    ? "bg-amber-400/20 border-amber-400 text-white"
                    : "bg-slate-900/80 hover:bg-slate-800/90 border-white/10 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      liteMode ? "bg-amber-400 text-slate-950" : "bg-white/5 text-amber-400 border border-white/10"
                    }`}
                  >
                    <BoltIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Modo Lite {liteMode ? "(Activado)" : "(Desactivado)"}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      Pausa el globo 3D para ahorro extremo de batería
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    liteMode ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-400"
                  }`}
                >
                  {liteMode ? "ON" : "OFF"}
                </span>
              </button>

              <button
                onClick={() => setChangelogOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white border border-white/10">
                    <SparklesIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Novedades Liquid Glass</span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      Historial y mejoras de la versión
                    </span>
                  </div>
                </div>
                <span className="text-amber-400 font-bold text-lg">›</span>
              </button>
            </div>
          ) : activeTab === "countries" ? (
            <div className="space-y-2 p-1">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Directorio Mundial ({countryList.length} Países)
                </span>
                {selectedCountryCode && (
                  <button
                    onClick={() => setSelectedCountryCode(null)}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    Ver todos
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {countryList
                  .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((country) => {
                    const isSelected = selectedCountryCode === country.code;
                    return (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountryCode(isSelected ? null : country.code);
                          flyTo(country.lat, country.lng);
                          setActiveTab("explore");
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-sm font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-amber-400/20 border-amber-400 text-white shadow-md shadow-amber-400/20"
                            : "bg-slate-900/70 hover:bg-slate-800 border-white/5 text-slate-200 hover:border-white/20"
                        }`}
                      >
                        <span className="truncate text-xs font-semibold">{country.name}</span>
                        <span className="text-xs text-amber-400 font-bold ml-1">
                          {country.stationCount.toLocaleString("es-ES")}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : (
            <>
              {matchedCountry && selectedCountryCode !== matchedCountry.code && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCountryCode(matchedCountry.code);
                    setSelectedCity(null);
                    flyTo(matchedCountry.lat, matchedCountry.lng);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 text-xs font-semibold transition-all group shadow-sm mb-2"
                >
                  <span className="flex items-center gap-2 truncate">
                    <GlobeIcon size={14} className="text-amber-400 shrink-0" />
                    <span>
                      Explorar país: <strong className="text-white font-bold">{matchedCountry.name}</strong> ({matchedCountry.stationCount} emisoras)
                    </span>
                  </span>
                  <span className="text-amber-400 text-xs font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                    <span>Ver ciudades</span>
                    <span>›</span>
                  </span>
                </button>
              )}

              {selectedCountryCode && (
                <div className="space-y-1.5 mb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1.5 p-1.5 px-3 rounded-xl bg-amber-400/15 border border-amber-400/35 text-xs font-semibold text-amber-300 shadow-sm">
                      <GlobeIcon size={14} className="text-amber-400 shrink-0" />
                      <span className="text-amber-400 font-bold">País:</span>
                      <span className="text-white font-semibold">
                        {countryList.find((c) => c.code === selectedCountryCode)?.name || selectedCountryCode}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCountryCode(null);
                          setSelectedCity(null);
                        }}
                        className="ml-1 text-amber-400 hover:text-white p-0.5 rounded-full hover:bg-white/10"
                        title="Quitar filtro de país"
                        aria-label="Quitar filtro de país"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>

                    {selectedCity && (
                      <div className="flex items-center gap-1.5 p-1.5 px-3 rounded-xl bg-amber-400/25 border border-amber-400/50 text-xs font-semibold text-white shadow-sm">
                        <LocationIcon size={14} className="text-amber-400 shrink-0" />
                        <span className="text-amber-400 font-bold">Ciudad:</span>
                        <span>{selectedCity}</span>
                        <button
                          onClick={() => setSelectedCity(null)}
                          className="ml-1 text-amber-400 hover:text-white p-0.5 rounded-full hover:bg-white/10"
                          title="Quitar filtro de ciudad"
                          aria-label="Quitar filtro de ciudad"
                        >
                          <CloseIcon size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {availableCities.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-2 shadow-inner">
                      <div className="flex items-center justify-between pb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                          <LocationIcon size={12} className="text-amber-400" />
                          <span>Filtro de Ciudades ({availableCities.length}):</span>
                        </span>
                        <button
                          onClick={() => setIsCityPickerExpanded(!isCityPickerExpanded)}
                          className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>{isCityPickerExpanded ? "Ver carrusel" : "Ver cuadrícula"}</span>
                          <ChevronDownIcon
                            size={12}
                            className={`transition-transform duration-200 ${isCityPickerExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      {isCityPickerExpanded ? (
                        <div className="space-y-2 mt-1">
                          <div className="relative">
                            <SearchIcon size={13} className="absolute left-2.5 top-2 text-slate-400" />
                            <input
                              type="text"
                              value={citySearchQuery}
                              onChange={(e) => setCitySearchQuery(e.target.value)}
                              placeholder="Buscar ciudad..."
                              className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-1 pl-7 pr-3 text-xs placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            <button
                              onClick={() => setSelectedCity(null)}
                              className={`rounded-xl p-2 text-left text-xs font-semibold transition-all border ${
                                !selectedCity
                                  ? "bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm"
                                  : "bg-slate-900/80 text-slate-300 hover:text-white border-white/5 hover:border-white/20"
                              }`}
                            >
                              <div className="truncate">Todas las ciudades</div>
                              <div className={`text-[10px] font-mono mt-0.5 ${!selectedCity ? "text-slate-950/80" : "text-amber-400"}`}>
                                {availableCities.reduce((acc, c) => acc + c.count, 0)} emisoras
                              </div>
                            </button>
                            {filteredCities.map((c) => {
                              const isCityActive = selectedCity?.toLowerCase() === c.name.toLowerCase();
                              return (
                                <button
                                  key={c.name}
                                  onClick={() => setSelectedCity(isCityActive ? null : c.name)}
                                  className={`rounded-xl p-2 text-left text-xs font-semibold transition-all border flex flex-col justify-between ${
                                    isCityActive
                                      ? "bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-sm"
                                      : "bg-slate-900/80 text-slate-300 hover:text-white border-white/5 hover:border-white/20"
                                  }`}
                                >
                                  <span className="truncate">{c.name}</span>
                                  <span
                                    className={`text-[10px] font-mono mt-0.5 ${
                                      isCityActive ? "text-slate-950/80" : "text-amber-400 font-bold"
                                    }`}
                                  >
                                    {c.count} {c.count === 1 ? "emisora" : "emisoras"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex items-center group">
                          <button
                            onClick={scrollCityLeft}
                            className="absolute left-0 z-10 flex h-7 w-5 items-center justify-center rounded-l-xl bg-slate-950/85 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border-y border-l border-white/10 shadow-md backdrop-blur-xs transition-opacity"
                            aria-label="Deslizar a la izquierda"
                          >
                            ‹
                          </button>

                          <div
                            ref={cityScrollRef}
                            onMouseDown={handleCityMouseDown}
                            onMouseMove={handleCityMouseMove}
                            onMouseUp={handleCityMouseUpOrLeave}
                            onMouseLeave={handleCityMouseUpOrLeave}
                            onWheel={(e) => {
                              if (e.deltaY !== 0) {
                                e.currentTarget.scrollLeft += e.deltaY;
                              }
                            }}
                            className="flex gap-1.5 overflow-x-auto py-1 px-6 scrollbar-none select-none cursor-grab active:cursor-grabbing w-full"
                          >
                            <button
                              onClick={() => setSelectedCity(null)}
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                !selectedCity
                                  ? "bg-amber-400 text-slate-950 font-bold shadow-xs shadow-amber-400/30 scale-105"
                                  : "bg-slate-900/80 text-slate-300 hover:text-white border border-white/10"
                              }`}
                            >
                              Todas las ciudades ({availableCities.reduce((acc, c) => acc + c.count, 0)})
                            </button>
                            {availableCities.map((c) => {
                              const isCityActive = selectedCity?.toLowerCase() === c.name.toLowerCase();
                              return (
                                <button
                                  key={c.name}
                                  onClick={() => setSelectedCity(isCityActive ? null : c.name)}
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all flex items-center gap-1 ${
                                    isCityActive
                                      ? "bg-amber-400 text-slate-950 font-bold shadow-xs shadow-amber-400/30 scale-105"
                                      : "bg-slate-900/80 text-slate-300 hover:text-white border border-white/10"
                                  }`}
                                >
                                  <span>{c.name}</span>
                                  <span
                                    className={`text-[10px] ${
                                      isCityActive ? "text-slate-950/80 font-bold" : "text-amber-400 font-bold"
                                    }`}
                                  >
                                    ({c.count})
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={scrollCityRight}
                            className="absolute right-0 z-10 flex h-7 w-5 items-center justify-center rounded-r-xl bg-slate-950/85 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border-y border-r border-white/10 shadow-md backdrop-blur-xs transition-opacity"
                            aria-label="Deslizar a la derecha"
                          >
                            ›
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between px-1 py-1 text-xs font-bold text-slate-300">
                <span>
                  {selectedCity
                    ? `Emisoras de ${selectedCity}`
                    : selectedCountryCode
                    ? `Emisoras de ${countryList.find((c) => c.code === selectedCountryCode)?.name || selectedCountryCode}`
                    : activeTab === "favorites"
                    ? "Mis Favoritas"
                    : "Populares en el mundo"}
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {filteredStations.length.toLocaleString("es-ES")} emisoras
                </span>
              </div>

              {filteredStations.slice(0, 120).map((station) => {
                const isCurrent = station.id === currentStation?.id;
                const isCurrentPlaying = isCurrent && isPlaying;
                const isFav = isFavorite(station.id);
                const badgeText = getStationBadge(station);

                return (
                  <div
                    key={station.id}
                    onClick={() => playStation(station)}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-2xl p-2.5 transition-all duration-200 ${
                      isCurrent
                        ? "liquid-glass-pill bg-amber-400/15 border-amber-400/50 shadow-lg shadow-amber-400/20"
                        : "liquid-glass-card hover:border-white/20"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs text-white shadow-sm"
                        style={{
                          background: isCurrent
                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                            : `linear-gradient(135deg, hsl(${station.hue || 200}, 75%, 45%), hsl(${(station.hue || 200) + 30}, 80%, 25%))`,
                          boxShadow: isCurrent ? "0 0 12px rgba(255, 201, 74, 0.4)" : undefined,
                        }}
                      >
                        {badgeText}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold tracking-tight ${
                            isCurrent ? "text-amber-400 font-bold" : "text-white"
                          }`}
                        >
                          {station.name}
                        </p>
                        <p className="truncate text-xs font-semibold text-slate-400 mt-0.5 flex items-center gap-1.5">
                          {station.city ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (station.countryCode && station.countryCode !== selectedCountryCode) {
                                  setSelectedCountryCode(station.countryCode);
                                }
                                setSelectedCity(station.city);
                              }}
                              className="truncate text-slate-300 hover:text-amber-300 hover:underline flex items-center gap-0.5 transition-colors"
                              title={`Filtrar emisoras de ${station.city}`}
                            >
                              <LocationIcon size={11} className="text-amber-400/80 shrink-0" />
                              <span className="truncate">{station.city}</span>
                            </button>
                          ) : null}
                          {station.city && station.country ? <span>·</span> : null}
                          <span className="truncate">{station.country}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold shrink-0 flex items-center gap-0.5">
                            <UsersIcon size={11} className="text-emerald-400" />
                            <span>{formatListenerCount(getStationBaseListeners(station))}</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) {
                            togglePlay();
                          } else {
                            playStation(station);
                          }
                        }}
                        className={`liquid-glass-action-circle ${
                          isCurrentPlaying
                            ? "!bg-amber-400 !text-slate-950 !border-amber-300 shadow-md shadow-amber-400/40"
                            : ""
                        }`}
                        aria-label={isCurrentPlaying ? "Pausar" : "Reproducir"}
                      >
                        {isCurrentPlaying ? (
                          <PauseIcon size={14} />
                        ) : (
                          <PlayIcon size={14} className="translate-x-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(station.id);
                        }}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        aria-label="Guardar favorita"
                      >
                        <HeartIcon
                          size={17}
                          className={isFav ? "fill-rose-500 text-rose-500" : ""}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredStations.length > 120 && (
                <div className="py-2.5 text-center text-xs font-semibold text-slate-400">
                  Mostrando 120 de {filteredStations.length.toLocaleString("es-ES")} emisoras
                </div>
              )}
            </>
          )}
        </div>

        <nav className="flex items-center justify-around border-t border-white/10 bg-slate-950/70 p-1.5 shrink-0">
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === "explore" || activeTab === "stations"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CompassIcon size={18} />
            <span className="text-[10px] font-semibold">Explorar</span>
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
              activeTab === "favorites"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <HeartIcon size={18} className={activeTab === "favorites" ? "fill-amber-400 text-amber-400" : ""} />
            <span className="text-[10px] font-semibold">Favoritas</span>
            {favorites.length > 0 && (
              <span className="absolute top-0.5 right-2 h-3.5 w-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("countries")}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === "countries"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <GlobeIcon size={18} />
            <span className="text-[10px] font-semibold">Países</span>
          </button>

          <button
            onClick={() => setActiveTab("more")}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeTab === "more"
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <EqualizerIcon size={18} />
            <span className="text-[10px] font-semibold">Más</span>
          </button>
        </nav>

        <div className="p-3 border-t border-white/10 bg-slate-950/85 backdrop-blur-2xl shrink-0">
          <div className="flex items-center justify-between gap-2.5">
            <div
              onClick={() => setDetailsModalOpen(true)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl font-bold text-xs text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : `linear-gradient(135deg, hsl(${currentStation?.hue || 200}, 75%, 45%), hsl(${(currentStation?.hue || 200) + 30}, 80%, 25%))`,
                boxShadow: isPlaying ? "0 0 14px rgba(255, 201, 74, 0.45)" : undefined,
              }}
              title="Ficha técnica"
            >
              {currentStation ? getStationBadge(currentStation) : "RAD"}
            </div>

            <div className="min-w-0 flex-1">
              <p
                onClick={() => setDetailsModalOpen(true)}
                className="truncate text-xs font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
              >
                {currentStation?.name || "Selecciona una emisora"}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 truncate mt-0.5">
                {currentStation ? (
                  <>
                    <span className="flex items-center gap-1 truncate">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                      <span className="truncate">{currentStation.city ? `${currentStation.city}, ` : ""}{currentStation.country}</span>
                    </span>
                    <span>·</span>
                    <span className="text-amber-400 font-mono font-bold shrink-0">{currentStation.bitrate}k</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-mono font-bold shrink-0 flex items-center gap-0.5">
                      <UsersIcon size={10} />
                      <span>{liveListeners.formatted}</span>
                    </span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-amber-300 font-mono">
                      {timeInfo.isDay ? <SunIcon size={10} className="text-amber-400" /> : <MoonIcon size={10} className="text-sky-300" />}
                      <span>{timeInfo.timeString}</span>
                    </span>
                  </>
                ) : (
                  <span>34.900+ emisoras mundiales</span>
                )}
              </div>
            </div>

            {currentStation && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleFavorite(currentStation.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label={isFavorite(currentStation.id) ? "Quitar de favoritas" : "Añadir a favoritas"}
                >
                  <HeartIcon
                    size={16}
                    className={isFavorite(currentStation.id) ? "fill-rose-500 text-rose-500" : ""}
                  />
                </button>
                <button
                  onClick={() => handleShare(currentStation)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Compartir emisora"
                  aria-label="Compartir emisora"
                >
                  <ShareIcon size={15} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevStation}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                aria-label="Emisora anterior"
              >
                <PrevIcon size={15} />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={!currentStation}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 active:scale-95 shadow-md ${
                  isPlaying
                    ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-amber-400/50 hover:brightness-110"
                    : "liquid-glass-action-circle !h-9 !w-9"
                }`}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isLoading ? (
                  <SpinnerIcon size={15} className="animate-spin text-white" />
                ) : isPlaying ? (
                  <PauseIcon size={15} />
                ) : (
                  <PlayIcon size={15} className="translate-x-0.5" />
                )}
              </button>

              <button
                onClick={nextStation}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                aria-label="Siguiente emisora"
              >
                <NextIcon size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {sleepTimerRemaining !== null && (
                <button
                  onClick={() => setSleepTimerModalOpen(true)}
                  className="flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  title="Temporizador de apagado activo"
                >
                  <TimerIcon size={11} />
                  <span className="font-mono">{formatTimer(sleepTimerRemaining)}</span>
                </button>
              )}

              <button
                onClick={toggleMute}
                className="text-slate-300 hover:text-white transition-colors"
                title={muted ? "Activar sonido" : "Silenciar"}
              >
                {muted || volume === 0 ? <MuteIcon size={16} /> : <VolumeIcon size={16} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="liquid-slider w-16 sm:w-20"
                style={{ "--fill": `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                aria-label="Control de volumen"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-2 pt-1.5 border-t border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <WorldRadioLogo size="sm" />
            <span>WORLDRADIO</span>
            <span>·</span>
            <span className="text-amber-400 font-mono">174 NACIONES</span>
          </div>
        </div>
      </aside>

      <ChangelogModal
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />

      <StationDetailsModal
        station={currentStation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </>
  );
}
