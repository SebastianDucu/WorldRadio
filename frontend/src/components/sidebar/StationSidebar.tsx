import { useState, useMemo, useEffect } from "react";
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
} from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { STATIONS, COUNTRIES } from "@/data/stations";
import { usePlayerStore } from "@/store/player";
import { searchOnlineStations } from "@/services/radioApi";
import { ChangelogModal } from "@/components/modals/ChangelogModal";
import { getStationBaseListeners, formatListenerCount } from "@/hooks/useLiveListeners";
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
    playStation,
    togglePlay,
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
  } = usePlayerStore();

  const [onlineResults, setOnlineResults] = useState<Station[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);

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

  return (
    <>

      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-[max(0.75rem,env(safe-area-inset-top,0px))] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] left-2 right-2 sm:right-auto sm:left-4 z-30 flex flex-col rounded-3xl liquid-glass shadow-2xl transition-transform duration-300 sm:w-[360px] border border-amber-400/20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
        }`}
        aria-label="Explorador de emisoras"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-inner">
              <GlobeIcon size={20} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold tracking-tight text-white leading-none">
                  WorldRadio
                </h2>
                <span className="flex items-center gap-1 rounded-md bg-emerald-400/15 border border-emerald-400/25 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>EN VIVO</span>
                </span>
              </div>
              <p className="mt-1 text-xs font-normal text-slate-400">
                34.900+ emisoras mundiales
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
              onClick={randomStation}
            />

            <IconButton
              size="sm"
              label="Ocultar panel"
              className="text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 active:scale-90"
              icon={<CloseIcon size={18} />}
              onClick={toggleSidebar}
            />
          </div>
        </header>

        <nav className="flex border-b border-white/10 bg-slate-900/50 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab("explore")}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all duration-200 ${
              activeTab === "explore" || activeTab === "stations"
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-400/35"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Explorar
          </button>
          <button
            onClick={() => setActiveTab("countries")}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all duration-200 ${
              activeTab === "countries"
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-400/35"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Países ({countryList.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all duration-200 ${
              activeTab === "favorites"
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-400/35"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Favoritas ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab("more")}
            className={`flex-1 rounded-xl py-2 text-center text-xs font-bold transition-all duration-200 ${
              activeTab === "more"
                ? "bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-400/35"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Herramientas
          </button>
        </nav>

        <div className="p-2.5 pb-1.5 border-b border-white/5">
          <div className="relative flex items-center">
            <SearchIcon size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar emisora, artista o lugar..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-1.5 pl-9 pr-8 text-xs font-semibold placeholder:text-slate-500 focus:border-amber-400 focus:outline-none transition-all"
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
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none border-b border-white/5">
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
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
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
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
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
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
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
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
                      Graba canciones en vivo y descarga el archivo de audio
                    </span>
                  </div>
                </div>
                <span className="text-rose-400 font-bold text-lg group-hover:translate-x-1 transition-transform">›</span>
              </button>

              <button
                onClick={() => setDriveMode(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-400/30 transition-all duration-200 text-left shadow-lg group hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400 border border-emerald-400/30">
                    <CarIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Modo Conducción</span>
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
                      Interfaz simplificada con controles seguros
                    </span>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold text-lg group-hover:translate-x-1 transition-transform">›</span>
              </button>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    <BoltIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Modo Lite (Ahorro)</span>
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
                      Pausa el globo 3D para máximo rendimiento
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setLiteMode(!liteMode)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    liteMode
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-white/10"
                  }`}
                >
                  {liteMode ? "Activo" : "Inactivo"}
                </button>
              </div>

              <button
                onClick={() => setChangelogOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    <SparklesIcon size={20} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Novedades Liquid Glass</span>
                    <span className="text-xs font-normal text-slate-400 block mt-0.5">
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
                        className="ml-1 p-0.5 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                        title="Quitar filtro de país"
                        aria-label="Quitar filtro de país"
                      >
                        <CloseIcon size={12} />
                      </button>
                    </div>

                    {selectedCity && (
                      <div className="flex items-center gap-1.5 p-1.5 px-3 rounded-xl bg-emerald-400/15 border border-emerald-400/35 text-xs font-semibold text-emerald-300 shadow-sm animate-fadeIn">
                        <LocationIcon size={13} className="text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 font-bold">Ciudad:</span>
                        <span className="text-white font-semibold">{selectedCity}</span>
                        <button
                          onClick={() => setSelectedCity(null)}
                          className="ml-1 p-0.5 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                          title="Quitar filtro de ciudad"
                          aria-label="Quitar filtro de ciudad"
                        >
                          <CloseIcon size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {availableCities.length > 0 && (
                    <div className="rounded-xl bg-slate-900/60 border border-white/5 p-2 space-y-1.5">
                      <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <LocationIcon size={12} className="text-amber-400" />
                          <span>Filtro de Ciudades ({availableCities.length}):</span>
                        </span>
                        {selectedCity && (
                          <button
                            onClick={() => setSelectedCity(null)}
                            className="text-amber-400 hover:text-amber-300 text-[10px] font-bold"
                          >
                            Ver todas
                          </button>
                        )}
                      </div>

                      <div className="flex gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
                        <button
                          onClick={() => setSelectedCity(null)}
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                            !selectedCity
                              ? "bg-amber-400 text-slate-950 font-bold shadow-xs shadow-amber-400/30 scale-105"
                              : "bg-slate-800 text-slate-300 hover:text-white border border-white/10"
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
                                  : "bg-slate-800 text-slate-300 hover:text-white border border-white/10"
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
                    </div>
                  )}
                </div>
              )}
              {filteredStations.slice(0, 120).map((station) => {
                const isCurrent = station.id === currentStation?.id;
                const isCurrentPlaying = isCurrent && isPlaying;
                const isFav = isFavorite(station.id);

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
                            : `linear-gradient(135deg, hsl(${station.hue || 200}, 70%, 42%), hsl(${(station.hue || 200) + 30}, 75%, 22%))`,
                          boxShadow: isCurrent ? "0 0 12px rgba(255, 201, 74, 0.4)" : undefined,
                        }}
                      >
                        {station.frequency || station.name.slice(0, 3).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold tracking-tight ${
                            isCurrent ? "text-amber-400 font-bold" : "text-white"
                          }`}
                        >
                          {station.name}
                        </p>
                        <p className="truncate text-xs font-normal text-slate-400 mt-0.5 flex items-center gap-1.5">
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
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90 ${
                          isCurrentPlaying
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40"
                            : "bg-slate-800 text-slate-300 hover:text-white"
                        }`}
                        aria-label={isCurrentPlaying ? "Pausar" : "Reproducir"}
                      >
                        {isCurrentPlaying ? (
                          <PauseIcon size={16} />
                        ) : (
                          <PlayIcon size={16} className="translate-x-0.5" />
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
      </aside>

      <ChangelogModal
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />
    </>
  );
}
