import {
  GlobeIcon,
  SearchIcon,
  CloseIcon,
  RadioTowerIcon,
  SnowflakeIcon,
  SantaHatIcon,
  SunIcon,
  MoonIcon,
  ShuffleIcon,
  MapIcon,
} from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { usePlayerStore } from "@/store/player";
import { useUiStore } from "@/store/ui";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { GENRE_CATEGORIES } from "@/data/stations";

export function TopNavBar() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    randomStation,
    sidebarOpen,
    toggleSidebar,
    setActiveTab,
  } = usePlayerStore();

  const { theme, setTheme, setChristmas } = useUiStore();
  const isChristmas = useChristmasActive();

  return (
    <header className="fixed top-0 inset-x-0 z-30 p-2.5 sm:p-4 pointer-events-none">
      <div className="glass pointer-events-auto mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border border-white/10 bg-surface/85 px-4 py-2.5 shadow-2xl backdrop-blur-2xl">
        {/* Left: Branding & Station Counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/25 shadow-sm transition-all hover:scale-105 active:scale-95"
            aria-label="Abrir sintonizador"
          >
            <GlobeIcon size={22} />
            {isChristmas && (
              <SantaHatIcon size={16} className="absolute -top-2 -right-1.5 rotate-12 text-xmas-red" />
            )}
            <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-fg leading-none">
                WorldRadio
              </h1>
              <span className="hidden sm:inline-block rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold text-accent">
                ORBE 3D
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-bold text-muted flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span>Emisiones en Vivo Globales</span>
            </p>
          </div>
        </div>

        {/* Center: Search & Quick Genre Filters */}
        <div className="flex flex-1 max-w-lg items-center gap-2 order-last md:order-none w-full md:w-auto">
          <div className="relative flex-1 flex items-center">
            <SearchIcon size={16} className="absolute left-3 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar emisora, país, ciudad o género..."
              className="w-full rounded-xl border border-white/10 bg-surface/90 py-2 pl-9 pr-8 text-xs font-semibold placeholder:text-muted/70 focus:border-accent focus:bg-surface focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-muted hover:text-fg transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* Quick Christmas Pill Shortcut */}
          <button
            onClick={() => {
              setSelectedGenre("Navideña");
              setActiveTab("stations");
            }}
            className={`hidden lg:flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              selectedGenre === "Navideña"
                ? "bg-xmas-gold text-bg shadow-md shadow-xmas-gold/30 scale-105"
                : "bg-surface/80 text-xmas-gold hover:bg-surface border border-xmas-gold/30"
            }`}
          >
            <SnowflakeIcon size={14} className="text-amber-400" />
            <span>Navidad</span>
          </button>
        </div>

        {/* Right: Actions & Theme Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Random Station */}
          <IconButton
            size="sm"
            label="Sintonizar radio al azar"
            icon={<ShuffleIcon size={18} />}
            onClick={randomStation}
          />

          {/* 3D / 2D View Switch */}
          <IconButton
            size="sm"
            label={viewMode === "globe" ? "Cambiar a Mapa 2D" : "Cambiar a Globo 3D"}
            icon={viewMode === "globe" ? <MapIcon size={18} /> : <GlobeIcon size={18} />}
            onClick={() => setViewMode(viewMode === "globe" ? "map" : "globe")}
          />

          {/* Christmas Atmosphere Toggle */}
          <IconButton
            size="sm"
            label={isChristmas ? "Desactivar aura navideña" : "Activar ambiente navideño"}
            active={isChristmas}
            icon={<SnowflakeIcon size={18} className={isChristmas ? "text-xmas-gold" : ""} />}
            onClick={() => setChristmas(isChristmas ? "off" : "on")}
          />

          {/* Dark / Light Theme Toggle */}
          <IconButton
            size="sm"
            label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            icon={theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Toggle Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all active:scale-95 border ${
              sidebarOpen
                ? "bg-accent text-bg border-accent shadow-sm"
                : "bg-surface/80 hover:bg-surface text-fg border-white/10"
            }`}
          >
            <RadioTowerIcon size={16} />
            <span className="hidden sm:inline">Sintonizador</span>
          </button>
        </div>
      </div>

      {/* Floating Category Pills below top bar for rapid exploration */}
      <div className="pointer-events-auto mx-auto mt-2 flex max-w-7xl gap-1.5 overflow-x-auto px-1 py-1 scrollbar-none">
        {GENRE_CATEGORIES.map((genre) => {
          const isSelected = selectedGenre === genre;
          const isXmasGenre = genre === "Navideña";
          return (
            <button
              key={genre}
              onClick={() => {
                setSelectedGenre(genre);
                setActiveTab("stations");
              }}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-all backdrop-blur-md ${
                isSelected
                  ? isXmasGenre
                    ? "bg-xmas-gold text-bg shadow-md shadow-xmas-gold/30 scale-105"
                    : "bg-accent text-bg shadow-md shadow-accent/30 scale-105"
                  : isXmasGenre
                  ? "bg-surface/70 text-xmas-gold border border-xmas-gold/30 hover:bg-surface"
                  : "bg-surface/70 text-muted hover:text-fg hover:bg-surface border border-white/5"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </header>
  );
}
