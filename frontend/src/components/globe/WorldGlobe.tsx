import { useEffect, useRef, useState, useMemo } from "react";
import createGlobe, { type Arc } from "cobe";
import { STATIONS } from "@/data/stations";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { usePlayerStore } from "@/store/player";
import { useUiStore } from "@/store/ui";
import { RadioTowerIcon, ShuffleIcon, TargetIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { StationDetailsModal } from "@/components/player/StationDetailsModal";

interface SatelliteFeature {
  name: string;
  lat: number;
  lng: number;
  type: "country" | "city";
  countryCode?: string;
}

// Landmark world broadcasting nations and metropolitan radio capitals
const SATELLITE_FEATURES: SatelliteFeature[] = [
  // Países de América
  { name: "Colombia", lat: 4.57, lng: -74.29, type: "country", countryCode: "CO" },
  { name: "España", lat: 40.46, lng: -3.74, type: "country", countryCode: "ES" },
  { name: "México", lat: 23.63, lng: -102.55, type: "country", countryCode: "MX" },
  { name: "Argentina", lat: -38.41, lng: -63.61, type: "country", countryCode: "AR" },
  { name: "Estados Unidos", lat: 37.09, lng: -95.71, type: "country", countryCode: "US" },
  { name: "Brasil", lat: -14.23, lng: -51.92, type: "country", countryCode: "BR" },
  { name: "Chile", lat: -35.67, lng: -71.54, type: "country", countryCode: "CL" },
  { name: "Perú", lat: -9.19, lng: -75.01, type: "country", countryCode: "PE" },
  { name: "Canadá", lat: 56.13, lng: -106.34, type: "country", countryCode: "CA" },
  { name: "Ecuador", lat: -1.83, lng: -78.18, type: "country", countryCode: "EC" },
  { name: "Venezuela", lat: 6.42, lng: -66.58, type: "country", countryCode: "VE" },
  { name: "Uruguay", lat: -32.52, lng: -55.76, type: "country", countryCode: "UY" },

  // Países de Europa
  { name: "Reino Unido", lat: 55.37, lng: -3.43, type: "country", countryCode: "GB" },
  { name: "Francia", lat: 46.22, lng: 2.21, type: "country", countryCode: "FR" },
  { name: "Alemania", lat: 51.16, lng: 10.45, type: "country", countryCode: "DE" },
  { name: "Italia", lat: 41.87, lng: 12.56, type: "country", countryCode: "IT" },
  { name: "Países Bajos", lat: 52.13, lng: 5.29, type: "country", countryCode: "NL" },
  { name: "Portugal", lat: 39.39, lng: -8.22, type: "country", countryCode: "PT" },
  { name: "Suiza", lat: 46.81, lng: 8.22, type: "country", countryCode: "CH" },
  { name: "Suecia", lat: 60.12, lng: 18.64, type: "country", countryCode: "SE" },
  { name: "Noruega", lat: 60.47, lng: 8.46, type: "country", countryCode: "NO" },
  { name: "Grecia", lat: 39.07, lng: 21.82, type: "country", countryCode: "GR" },
  { name: "Turquía", lat: 38.96, lng: 35.24, type: "country", countryCode: "TR" },

  // Países de Asia, África y Oceanía
  { name: "Japón", lat: 36.20, lng: 138.25, type: "country", countryCode: "JP" },
  { name: "Australia", lat: -25.27, lng: 133.77, type: "country", countryCode: "AU" },
  { name: "India", lat: 20.59, lng: 78.96, type: "country", countryCode: "IN" },
  { name: "Corea del Sur", lat: 35.90, lng: 127.76, type: "country", countryCode: "KR" },
  { name: "Sudáfrica", lat: -30.55, lng: 22.93, type: "country", countryCode: "ZA" },
  { name: "Egipto", lat: 26.82, lng: 30.80, type: "country", countryCode: "EG" },
  { name: "Nueva Zelanda", lat: -40.90, lng: 174.88, type: "country", countryCode: "NZ" },

  // Ciudades emisoras clave
  { name: "Bogotá", lat: 4.71, lng: -74.07, type: "city", countryCode: "CO" },
  { name: "Madrid", lat: 40.41, lng: -3.70, type: "city", countryCode: "ES" },
  { name: "Buenos Aires", lat: -34.60, lng: -58.38, type: "city", countryCode: "AR" },
  { name: "Ciudad de México", lat: 19.43, lng: -99.13, type: "city", countryCode: "MX" },
  { name: "Nueva York", lat: 40.71, lng: -74.00, type: "city", countryCode: "US" },
  { name: "Londres", lat: 51.50, lng: -0.12, type: "city", countryCode: "GB" },
  { name: "París", lat: 48.85, lng: 2.35, type: "city", countryCode: "FR" },
  { name: "Tokio", lat: 35.67, lng: 139.65, type: "city", countryCode: "JP" },
  { name: "Berlín", lat: 52.52, lng: 13.40, type: "city", countryCode: "DE" },
  { name: "Roma", lat: 41.90, lng: 12.49, type: "city", countryCode: "IT" },
  { name: "São Paulo", lat: -23.55, lng: -46.63, type: "city", countryCode: "BR" },
  { name: "Sídney", lat: -33.86, lng: 151.20, type: "city", countryCode: "AU" },
  { name: "Santiago", lat: -33.44, lng: -70.66, type: "city", countryCode: "CL" },
  { name: "Lima", lat: -12.04, lng: -77.04, type: "city", countryCode: "PE" },
  { name: "El Cairo", lat: 30.04, lng: 31.23, type: "city", countryCode: "EG" },
  { name: "Seúl", lat: 37.56, lng: 126.97, type: "city", countryCode: "KR" },
  { name: "Dubái", lat: 25.20, lng: 55.27, type: "city", countryCode: "AE" },
  { name: "Ámsterdam", lat: 52.36, lng: 4.90, type: "city", countryCode: "NL" },
  { name: "Los Ángeles", lat: 34.05, lng: -118.24, type: "city", countryCode: "US" },
  { name: "Miami", lat: 25.76, lng: -80.19, type: "city", countryCode: "US" },
  { name: "Medellín", lat: 6.24, lng: -75.58, type: "city", countryCode: "CO" },
  { name: "Barcelona", lat: 41.38, lng: 2.17, type: "city", countryCode: "ES" },
];

interface ProjectedLabel extends SatelliteFeature {
  x: number;
  y: number;
  depth: number;
  opacity: number;
}

// Mathematical 3D-to-2D projection mapping matching cobe WebGL shaders
function projectToGlobe(lat: number, lng: number, phi: number, theta: number, size: number) {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(r);
  const px = -cosLat * Math.cos(a) * 0.8;
  const py = Math.sin(r) * 0.8;
  const pz = cosLat * Math.sin(a) * 0.8;

  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const c = cosPhi * px + sinPhi * pz;
  const s = sinPhi * sinTheta * px + cosTheta * py - cosPhi * sinTheta * pz;
  const depth = -sinPhi * cosTheta * px + sinTheta * py + cosPhi * cosTheta * pz;

  const x = ((c + 1) / 2) * size;
  const y = ((-s + 1) / 2) * size;

  // depth < -0.15 is visible on the front face of the Earth towards the camera
  const visible = depth < -0.15;
  const opacity = Math.max(0, Math.min(1, (-depth - 0.15) / 0.35));

  return { x, y, depth, visible, opacity };
}

export function WorldGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { theme, motionOff } = useUiStore();
  const isChristmas = useChristmasActive();
  const {
    currentStation,
    isPlaying,
    targetLocation,
    randomStation,
    flyTo,
    allStations,
    setSelectedCountryCode,
    playStation,
  } = usePlayerStore();

  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [telemetryCoords, setTelemetryCoords] = useState("LAT 04.6°N · LNG 74.1°W");

  // High-Performance 240 FPS Physics & Inertia Engine
  const phiRef = useRef(0);
  const thetaRef = useRef(0.22);
  const velocityPhiRef = useRef(0);
  const velocityThetaRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);

  const targetPhiRef = useRef<number | null>(null);
  const targetThetaRef = useRef<number | null>(null);
  const visibleLabelsRef = useRef<ProjectedLabel[]>([]);

  // Smooth camera centering on active coordinates
  useEffect(() => {
    if (targetLocation) {
      const [lat, lng] = targetLocation;
      const targetPhi = (-lng * Math.PI) / 180 + Math.PI / 2;
      const targetTheta = (lat * Math.PI) / 180;
      targetPhiRef.current = targetPhi;
      targetThetaRef.current = Math.max(-0.85, Math.min(0.85, targetTheta));
    }
  }, [targetLocation]);

  // Planetary broadcast markers across all countries
  const markers = useMemo(() => {
    const list = allStations && allStations.length > 0 ? allStations : STATIONS;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxMarkers = isMobile ? 1100 : 1850;
    const sampled =
      list.length <= maxMarkers ? list : list.filter((_, i) => i % Math.ceil(list.length / maxMarkers) === 0);
    const hasCurrent = sampled.some((s) => s.id === currentStation?.id);
    const pool = hasCurrent || !currentStation ? sampled : [currentStation, ...sampled];

    return pool.map((station) => {
      const isCurrent = station.id === currentStation?.id;
      return {
        location: [station.lat, station.lng] as [number, number],
        size: isCurrent ? 0.058 : 0.022,
      };
    });
  }, [allStations, currentStation]);

  // Planetary broadcast arcs
  const arcs = useMemo((): Arc[] => {
    if (!currentStation || !isPlaying) return [];
    const fromCoord: [number, number] = [currentStation.lat, currentStation.lng];

    const hubs: [number, number][] = [
      [51.5074, -0.1278], // London
      [40.7128, -74.006], // New York
      [35.6762, 139.6503], // Tokyo
      [48.8566, 2.3522], // Paris
      [-34.6037, -58.3816], // Buenos Aires
      [4.711, -74.0721], // Bogotá
      [50.9375, 6.9603], // Cologne
    ];

    return hubs
      .filter(([hLat, hLng]) => Math.abs(hLat - currentStation.lat) > 3 || Math.abs(hLng - currentStation.lng) > 3)
      .slice(0, 5)
      .map((toCoord, i) => ({
        from: fromCoord,
        to: toCoord,
        color: isChristmas
          ? ([1.0, 0.79, 0.29] as [number, number, number]) // Warm Holiday Gold
          : ([0.22, 0.71, 1.0] as [number, number, number]), // Electric Cyan
        id: `arc-${i}`,
      }));
  }, [currentStation, isPlaying, isChristmas]);

  // 120+ FPS Hardware-Accelerated WebGL Engine + 2D Satellite Overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    let width = canvas.offsetWidth;
    const isDark = theme === "dark";
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const globeSize = Math.round(width * dpr);

    // Synchronize 2D overlay canvas buffer
    overlayCanvas.width = globeSize;
    overlayCanvas.height = globeSize;
    const ctx2d = overlayCanvas.getContext("2d");

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: globeSize,
      height: globeSize,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: isDark ? 1 : 0.75,
      diffuse: 1.5,
      mapSamples: isMobile ? 13000 : 18500,
      mapBrightness: isDark ? 7.8 : 9.0,
      baseColor: isDark
        ? isChristmas
          ? [0.03, 0.06, 0.14]
          : [0.02, 0.05, 0.12]
        : [0.93, 0.95, 0.98],
      markerColor: isChristmas ? [1.0, 0.82, 0.35] : [0.22, 0.71, 1.0],
      glowColor: isChristmas ? [0.65, 0.45, 0.12] : [0.12, 0.35, 0.72],
      markers,
      arcs,
      arcColor: isChristmas ? [1.0, 0.82, 0.35] : [0.22, 0.71, 1.0],
      arcWidth: 0.85,
      arcHeight: 0.34,
    });

    let animationId: number;
    let lastTime = performance.now();
    let telemetryFrame = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // 1. Inertia / Momentum physics
      if (!isDraggingRef.current) {
        phiRef.current += velocityPhiRef.current;
        thetaRef.current += velocityThetaRef.current;
        velocityPhiRef.current *= 0.94;
        velocityThetaRef.current *= 0.94;

        if (Math.abs(velocityPhiRef.current) < 0.00005) velocityPhiRef.current = 0;
        if (Math.abs(velocityThetaRef.current) < 0.00005) velocityThetaRef.current = 0;
      }

      // 2. Camera tracking to active station
      if (targetPhiRef.current !== null && targetThetaRef.current !== null) {
        let diffPhi = targetPhiRef.current - phiRef.current;
        diffPhi = Math.atan2(Math.sin(diffPhi), Math.cos(diffPhi));

        const diffTheta = targetThetaRef.current - thetaRef.current;
        const lerpFactor = Math.min(dt * 7.5, 0.2);
        phiRef.current += diffPhi * lerpFactor;
        thetaRef.current += diffTheta * lerpFactor;

        if (Math.abs(diffPhi) < 0.002 && Math.abs(diffTheta) < 0.002) {
          targetPhiRef.current = null;
          targetThetaRef.current = null;
        }
      } else if (autoRotate && !isDraggingRef.current && !motionOff && velocityPhiRef.current === 0) {
        phiRef.current += dt * 0.11;
      }

      // Keep theta within visible bounds
      thetaRef.current = Math.max(-0.85, Math.min(0.85, thetaRef.current));

      // Update WebGL globe
      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        markers,
        arcs,
      });

      // 3. Render 3D Projected Satellite Labels & Broadcast Beacon
      if (ctx2d) {
        ctx2d.clearRect(0, 0, globeSize, globeSize);
        const currentLabels: ProjectedLabel[] = [];

        // Project Country & City Satellite Names
        for (const item of SATELLITE_FEATURES) {
          const proj = projectToGlobe(item.lat, item.lng, phiRef.current, thetaRef.current, globeSize);

          if (proj.visible && proj.opacity > 0.04) {
            currentLabels.push({
              ...item,
              x: proj.x,
              y: proj.y,
              depth: proj.depth,
              opacity: proj.opacity,
            });

            const isCountry = item.type === "country";
            const alpha = proj.opacity;

            // Satellite node point
            ctx2d.beginPath();
            ctx2d.arc(proj.x, proj.y, isCountry ? 3.0 * dpr : 2.0 * dpr, 0, Math.PI * 2);
            if (isChristmas) {
              ctx2d.fillStyle = isCountry
                ? `rgba(255, 201, 74, ${alpha * 0.95})`
                : `rgba(255, 230, 150, ${alpha * 0.8})`;
            } else {
              ctx2d.fillStyle = isCountry
                ? `rgba(56, 182, 255, ${alpha * 0.95})`
                : `rgba(186, 230, 253, ${alpha * 0.8})`;
            }
            ctx2d.fill();

            // Satellite text label with shadow
            ctx2d.font = isCountry
              ? `bold ${Math.round(10.5 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
              : `600 ${Math.round(8.5 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

            ctx2d.shadowColor = "rgba(0, 0, 0, 0.85)";
            ctx2d.shadowBlur = 4 * dpr;

            if (isCountry) {
              ctx2d.fillStyle = isChristmas
                ? `rgba(255, 235, 175, ${alpha * 0.95})`
                : `rgba(240, 249, 255, ${alpha * 0.95})`;
            } else {
              ctx2d.fillStyle = `rgba(186, 230, 253, ${alpha * 0.75})`;
            }

            ctx2d.fillText(item.name, proj.x + 5 * dpr, proj.y + (isCountry ? 3.5 : 3.0) * dpr);
            ctx2d.shadowBlur = 0;
          }
        }

        // Active Playing Station Live Radar Beacon Callout
        if (currentStation) {
          const stProj = projectToGlobe(
            currentStation.lat,
            currentStation.lng,
            phiRef.current,
            thetaRef.current,
            globeSize,
          );

          if (stProj.visible && stProj.opacity > 0.05) {
            const alpha = stProj.opacity;
            const pulse = (now % 1600) / 1600;

            // Radar ripple ring
            ctx2d.beginPath();
            ctx2d.arc(stProj.x, stProj.y, (5 + pulse * 22) * dpr, 0, Math.PI * 2);
            ctx2d.strokeStyle = isChristmas
              ? `rgba(255, 201, 74, ${(1 - pulse) * alpha * 0.8})`
              : `rgba(52, 211, 153, ${(1 - pulse) * alpha * 0.8})`;
            ctx2d.lineWidth = 1.5 * dpr;
            ctx2d.stroke();

            // Core beacon dot
            ctx2d.beginPath();
            ctx2d.arc(stProj.x, stProj.y, 4.5 * dpr, 0, Math.PI * 2);
            ctx2d.fillStyle = isChristmas ? `rgba(225, 29, 72, ${alpha})` : `rgba(16, 185, 129, ${alpha})`;
            ctx2d.fill();

            // Live Station Callout Flag
            const flagX = stProj.x + 14 * dpr;
            const flagY = stProj.y - 12 * dpr;

            // Connecting angled vector line
            ctx2d.beginPath();
            ctx2d.moveTo(stProj.x, stProj.y);
            ctx2d.lineTo(stProj.x + 8 * dpr, stProj.y - 8 * dpr);
            ctx2d.lineTo(flagX, flagY);
            ctx2d.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx2d.lineWidth = 1 * dpr;
            ctx2d.stroke();

            // Pill tag
            const labelText = `EN VIVO · ${currentStation.name} (${currentStation.frequency || "FM"})`;
            ctx2d.font = `bold ${Math.round(9 * dpr)}px -apple-system, system-ui, sans-serif`;
            const textMetrics = ctx2d.measureText(labelText);
            const tagW = textMetrics.width + 12 * dpr;
            const tagH = 16 * dpr;

            ctx2d.fillStyle = "rgba(3, 8, 22, 0.85)";
            ctx2d.strokeStyle = isChristmas ? "rgba(255, 201, 74, 0.5)" : "rgba(52, 211, 153, 0.5)";
            ctx2d.lineWidth = 1 * dpr;

            ctx2d.beginPath();
            ctx2d.roundRect(flagX, flagY - tagH / 2, tagW, tagH, 4 * dpr);
            ctx2d.fill();
            ctx2d.stroke();

            ctx2d.fillStyle = isChristmas ? "#FFC94A" : "#34D399";
            ctx2d.fillText(labelText, flagX + 6 * dpr, flagY + 3.5 * dpr);
          }
        }

        visibleLabelsRef.current = currentLabels;
      }

      // 4. Update HUD Telemetry coordinates every 8 frames (~15 updates/sec)
      telemetryFrame++;
      if (telemetryFrame % 8 === 0) {
        const centerLat = (thetaRef.current * 180) / Math.PI;
        const centerLng = ((-phiRef.current + Math.PI / 2) * 180) / Math.PI;
        const normLng = (((centerLng % 360) + 540) % 360) - 180;
        const latStr = `${Math.abs(centerLat).toFixed(1)}°${centerLat >= 0 ? "N" : "S"}`;
        const lngStr = `${Math.abs(normLng).toFixed(1)}°${normLng >= 0 ? "E" : "W"}`;
        setTelemetryCoords(`LAT ${latStr} · LNG ${lngStr}`);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    const onResize = () => {
      if (canvas && overlayCanvas) {
        width = canvas.offsetWidth;
        const newDpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
        const newSize = Math.round(width * newDpr);
        overlayCanvas.width = newSize;
        overlayCanvas.height = newSize;
      }
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [theme, isChristmas, markers, arcs, autoRotate, motionOff, currentStation]);

  // Native Passive Pointer Listeners with 240 FPS Inertia & Interactive Satellite Tap
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      targetPhiRef.current = null;
      targetThetaRef.current = null;
      pointerDownPos.current = { x: e.clientX, y: e.clientY };

      try {
        container.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture fallback
      }

      if (activePointersRef.current.size === 1) {
        isDraggingRef.current = true;
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
        velocityPhiRef.current = 0;
        velocityThetaRef.current = 0;
        pinchDistRef.current = null;
      } else if (activePointersRef.current.size === 2) {
        isDraggingRef.current = false;
        velocityPhiRef.current = 0;
        velocityThetaRef.current = 0;
        const pts = Array.from(activePointersRef.current.values());
        if (pts.length >= 2 && pts[0] && pts[1]) {
          pinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Two-finger pinch-to-zoom on iOS & Android
      if (activePointersRef.current.size >= 2) {
        const pts = Array.from(activePointersRef.current.values());
        if (pts.length >= 2 && pts[0] && pts[1]) {
          const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

          if (pinchDistRef.current !== null && pinchDistRef.current > 0) {
            const delta = currentDist - pinchDistRef.current;
            const zoomDelta = delta * 0.0035;
            setZoomLevel((z) => Math.max(0.65, Math.min(1.5, z + zoomDelta)));
          }
          pinchDistRef.current = currentDist;
        }
        return;
      }

      // Single-finger rotation drag
      if (!isDraggingRef.current || !lastPointerPos.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      const factor = 0.0035 / zoomLevel;
      phiRef.current += dx * factor;
      thetaRef.current -= dy * factor;

      velocityPhiRef.current = dx * factor * 0.8;
      velocityThetaRef.current = -dy * factor * 0.8;
    };

    const onPointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer was already released
      }

      // Interactive Click/Tap Detection for Satellite Labels
      if (pointerDownPos.current) {
        const moveDist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y);

        if (moveDist < 7 && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
          const clickX = (e.clientX - rect.left) * dpr;
          const clickY = (e.clientY - rect.top) * dpr;

          // Check if any visible country or city label was tapped
          for (const item of visibleLabelsRef.current) {
            const dist = Math.hypot(clickX - item.x, clickY - item.y);
            if (dist < 28 * dpr) {
              flyTo(item.lat, item.lng);

              const stationsList = allStations && allStations.length > 0 ? allStations : STATIONS;
              if (item.type === "country" && item.countryCode) {
                setSelectedCountryCode(item.countryCode);
                const match = stationsList.find((s) => s.countryCode === item.countryCode);
                if (match) playStation(match);
              } else if (item.type === "city") {
                const match = stationsList.find((s) => s.city.toLowerCase().includes(item.name.toLowerCase()));
                if (match) playStation(match);
              }
              break;
            }
          }
        }
      }

      pointerDownPos.current = null;

      if (activePointersRef.current.size === 0) {
        isDraggingRef.current = false;
        lastPointerPos.current = null;
        pinchDistRef.current = null;
      } else if (activePointersRef.current.size === 1) {
        pinchDistRef.current = null;
        const pts = Array.from(activePointersRef.current.values());
        lastPointerPos.current = pts[0] || null;
        isDraggingRef.current = true;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0012;
      setZoomLevel((z) => Math.max(0.65, Math.min(1.5, z + delta)));
    };

    container.addEventListener("pointerdown", onPointerDown, { passive: true });
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerup", onPointerUp, { passive: true });
    container.addEventListener("pointercancel", onPointerUp, { passive: true });
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      container.removeEventListener("wheel", onWheel);
    };
  }, [zoomLevel, allStations, flyTo, playStation, setSelectedCountryCode]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    >
      {/* 1. Atmospheric Rayleigh Scattering Glow (Earth from satellite view) */}
      <div
        className="pointer-events-none absolute rounded-full transition-transform duration-300 will-change-transform"
        style={{
          width: "min(88vw, 840px)",
          height: "min(88vw, 840px)",
          transform: `scale(${zoomLevel}) translateZ(0)`,
          background: isChristmas
            ? "radial-gradient(circle, rgba(255, 201, 74, 0.18) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 72%)"
            : "radial-gradient(circle, rgba(56, 182, 255, 0.22) 0%, rgba(30, 107, 255, 0.08) 45%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      {/* 2. Concentric Holographic Celestial Orbit Rings around the Satellite Globe */}
      <div
        className="pointer-events-none absolute flex items-center justify-center will-change-transform"
        style={{
          width: "min(108vw, 980px)",
          height: "min(108vw, 980px)",
          transform: `scale(${zoomLevel}) rotateX(68deg) translateZ(0)`,
          opacity: 0.35,
        }}
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-[#ffc94a]/30 animate-[spin_80s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-[#ffc94a]/15" />
        <div className="absolute inset-20 rounded-full border border-dotted border-[#ffd670]/25 animate-[spin_50s_linear_infinite_reverse]" />
      </div>

      {/* 3. High-Performance WebGL Canvas + 2D Satellite Labels Overlay */}
      <div
        className="relative flex items-center justify-center will-change-transform"
        style={{
          width: "min(92vw, 860px)",
          height: "min(92vw, 860px)",
          transform: `scale(${zoomLevel}) translateZ(0)`,
        }}
      >
        {/* WebGL Globe */}
        <canvas
          ref={canvasRef}
          className="h-full w-full outline-none"
          style={{ width: "100%", height: "100%", contain: "layout paint size" }}
        />

        {/* 2D Satellite Overlays (Country/City Names & Radio Pulse) */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* 4. Satellite HUD Telemetry Badges */}
      <div className="pointer-events-none absolute top-14 left-4 z-20 hidden md:flex flex-col gap-1 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold">SAT-NAV</span>
          <span>// ORBIT: 780 KM LEO // INCL: 51.6°</span>
        </span>
        <span className="bg-black/30 backdrop-blur-md border border-white/5 px-2.5 py-0.5 rounded-md text-[10px] text-amber-300">
          RED SATELITAL 174 NACIONES // HQ BITRATE
        </span>
      </div>

      {/* Live Viewport Coordinates HUD Telemetry */}
      <div className="pointer-events-none absolute top-14 right-4 z-20 hidden md:flex">
        <span className="bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold text-slate-300">
          {telemetryCoords}
        </span>
      </div>

      {/* 5. Sleek Floating Zoom & Rotate controls at bottom right */}
      <div className="absolute right-5 bottom-24 z-20 hidden sm:flex flex-col gap-2 p-1.5 rounded-2xl liquid-glass border border-white/10 shadow-xl">
        <IconButton
          size="sm"
          label={autoRotate ? "Detener rotación" : "Girar automáticamente"}
          active={autoRotate}
          icon={<RadioTowerIcon size={18} />}
          onClick={() => setAutoRotate(!autoRotate)}
        />
        <IconButton
          size="sm"
          label="Sintonizar emisora al azar"
          icon={<ShuffleIcon size={18} />}
          onClick={randomStation}
        />
        {currentStation && (
          <IconButton
            size="sm"
            label="Centrar en emisora actual"
            icon={<TargetIcon size={17} />}
            onClick={() => flyTo(currentStation.lat, currentStation.lng)}
          />
        )}
        <div className="h-px w-full bg-white/10 my-0.5" />
        <IconButton
          size="sm"
          label="Acercar globo 3D"
          icon={<span className="text-lg font-bold leading-none">+</span>}
          onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.12))}
        />
        <IconButton
          size="sm"
          label="Alejar globo 3D"
          icon={<span className="text-lg font-bold leading-none">−</span>}
          onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.12))}
        />
      </div>

      {/* 6. Technical details modal */}
      <StationDetailsModal
        station={currentStation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
}
