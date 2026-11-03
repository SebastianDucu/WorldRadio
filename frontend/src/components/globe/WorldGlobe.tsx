import { useEffect, useRef, useState, useMemo } from "react";
import createGlobe, { type Arc } from "cobe";
import { STATIONS } from "@/data/stations";
import { useChristmasActive } from "@/hooks/useApplyUiPreferences";
import { usePlayerStore } from "@/store/player";
import { useUiStore } from "@/store/ui";
import { RadioTowerIcon, ShuffleIcon, TargetIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { StationDetailsModal } from "@/components/player/StationDetailsModal";

export function WorldGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { theme, motionOff } = useUiStore();
  const isChristmas = useChristmasActive();
  const { currentStation, isPlaying, targetLocation, randomStation, flyTo, allStations } = usePlayerStore();

  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // 240 FPS Physics & Inertia Engine
  const phiRef = useRef(0);
  const thetaRef = useRef(0.22);
  const velocityPhiRef = useRef(0);
  const velocityThetaRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);

  const targetPhiRef = useRef<number | null>(null);
  const targetThetaRef = useRef<number | null>(null);

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
    const sampled = list.length <= 2200 ? list : list.filter((_, i) => i % Math.ceil(list.length / 2200) === 0);
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
          : ([0.22, 0.71, 1.0] as [number, number, number]), // Orbe Electric Cyan
        id: `arc-${i}`,
      }));
  }, [currentStation, isPlaying, isChristmas]);

  // High-Refresh-Rate 240 FPS WebGL Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth;
    const isDark = theme === "dark";

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: width * 2,
      height: width * 2,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: isDark ? 1 : 0.75,
      diffuse: 1.4,
      mapSamples: 24000, // Ultra-high resolution continent mapping
      mapBrightness: isDark ? 7.6 : 9.0,
      baseColor: isDark
        ? isChristmas
          ? [0.03, 0.06, 0.14]
          : [0.02, 0.05, 0.12]
        : [0.93, 0.95, 0.98],
      markerColor: isChristmas
        ? [1.0, 0.82, 0.35] // Warm Holiday Radiance Gold
        : [0.22, 0.71, 1.0], // Electric Cyan
      glowColor: isChristmas
        ? [0.65, 0.45, 0.12] // Luminous Champagne Glow
        : [0.12, 0.32, 0.62],
      markers,
      arcs,
      arcColor: isChristmas ? [1.0, 0.82, 0.35] : [0.22, 0.71, 1.0],
      arcWidth: 0.85,
      arcHeight: 0.34,
    });

    let animationId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // Delta-time in seconds
      lastTime = now;

      // 1. Inertia / Momentum physics
      if (!isDraggingRef.current) {
        phiRef.current += velocityPhiRef.current;
        thetaRef.current += velocityThetaRef.current;
        velocityPhiRef.current *= 0.94; // Damping
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
        phiRef.current += dt * 0.12; // Smooth 240 FPS auto-rotation
      }

      // Keep theta within visible bounds
      thetaRef.current = Math.max(-0.85, Math.min(0.85, thetaRef.current));

      globe.update({
        phi: phiRef.current,
        theta: thetaRef.current,
        markers,
        arcs,
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [theme, isChristmas, markers, arcs, autoRotate, motionOff]);

  // Native Passive Pointer Listeners with 240 FPS Touch/Mouse Inertia & Multi-touch Pinch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      targetPhiRef.current = null;
      targetThetaRef.current = null;

      try {
        container.setPointerCapture(e.pointerId);
      } catch {
        // Pointer capture fallback
      }

      if (activePointersRef.current.size === 1) {
        // Single finger/cursor drag
        isDraggingRef.current = true;
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
        velocityPhiRef.current = 0;
        velocityThetaRef.current = 0;
        pinchDistRef.current = null;
      } else if (activePointersRef.current.size === 2) {
        // Two-finger pinch gesture on Android / iOS
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

      // 1. Two-finger pinch-to-zoom on iOS Safari & Android
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

      // 2. Single-finger rotation drag
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

      if (activePointersRef.current.size === 0) {
        isDraggingRef.current = false;
        lastPointerPos.current = null;
        pinchDistRef.current = null;
      } else if (activePointersRef.current.size === 1) {
        // Seamlessly return to single touch drag if one finger is lifted
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
  }, [zoomLevel]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    >
      {/* 1. Planetary Celestial Atmosphere Corona (Earth from space glow) */}
      <div
        className="pointer-events-none absolute rounded-full transition-transform duration-300 will-change-transform"
        style={{
          width: "min(88vw, 840px)",
          height: "min(88vw, 840px)",
          transform: `scale(${zoomLevel}) translateZ(0)`,
          background: isChristmas
            ? "radial-gradient(circle, rgba(255, 201, 74, 0.18) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 72%)"
            : "radial-gradient(circle, rgba(56, 182, 255, 0.20) 0%, rgba(30, 107, 255, 0.08) 45%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      {/* 2. Concentric Holographic Celestial Orbit Rings around the Globe */}
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

      {/* 3. High-Performance 240 FPS WebGL Canvas */}
      <div
        className="relative flex items-center justify-center will-change-transform"
        style={{
          width: "min(92vw, 860px)",
          height: "min(92vw, 860px)",
          transform: `scale(${zoomLevel}) translateZ(0)`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full outline-none"
          style={{ width: "100%", height: "100%", contain: "layout paint size" }}
        />
      </div>

      {/* 4. Sleek Floating Zoom & Rotate controls at bottom right */}
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

      {/* 5. Technical details modal */}
      <StationDetailsModal
        station={currentStation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
}
