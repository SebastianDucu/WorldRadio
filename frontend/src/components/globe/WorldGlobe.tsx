import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
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

const SATELLITE_FEATURES: SatelliteFeature[] = [

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

  { name: "Japón", lat: 36.20, lng: 138.25, type: "country", countryCode: "JP" },
  { name: "Australia", lat: -25.27, lng: 133.77, type: "country", countryCode: "AU" },
  { name: "India", lat: 20.59, lng: 78.96, type: "country", countryCode: "IN" },
  { name: "Corea del Sur", lat: 35.90, lng: 127.76, type: "country", countryCode: "KR" },
  { name: "Sudáfrica", lat: -30.55, lng: 22.93, type: "country", countryCode: "ZA" },
  { name: "Egipto", lat: 26.82, lng: 30.80, type: "country", countryCode: "EG" },
  { name: "Nueva Zelanda", lat: -40.90, lng: 174.88, type: "country", countryCode: "NZ" },

  { name: "Bogotá", lat: 4.71, lng: -74.07, type: "city", countryCode: "CO" },
  { name: "Medellín", lat: 6.25, lng: -75.56, type: "city", countryCode: "CO" },
  { name: "Cali", lat: 3.45, lng: -76.53, type: "city", countryCode: "CO" },
  { name: "Barranquilla", lat: 10.97, lng: -74.78, type: "city", countryCode: "CO" },
  { name: "Cartagena", lat: 10.39, lng: -75.48, type: "city", countryCode: "CO" },
  { name: "Madrid", lat: 40.41, lng: -3.70, type: "city", countryCode: "ES" },
  { name: "Barcelona", lat: 41.38, lng: 2.17, type: "city", countryCode: "ES" },
  { name: "Buenos Aires", lat: -34.60, lng: -58.38, type: "city", countryCode: "AR" },
  { name: "Ciudad de México", lat: 19.43, lng: -99.13, type: "city", countryCode: "MX" },
  { name: "Nueva York", lat: 40.71, lng: -74.00, type: "city", countryCode: "US" },
  { name: "Los Ángeles", lat: 34.05, lng: -118.24, type: "city", countryCode: "US" },
  { name: "Miami", lat: 25.76, lng: -80.19, type: "city", countryCode: "US" },
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
];

interface ProjectedScreenLabel extends SatelliteFeature {
  x: number;
  y: number;
  opacity: number;
}

function latLngToVector3(lat: number, lng: number, radius = 1.0): THREE.Vector3 {
  const theta = (90 - lat) * (Math.PI / 180);
  const phi = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.cos(phi) * Math.sin(theta);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

export function WorldGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const { motionOff } = useUiStore();
  const isChristmas = useChristmasActive();
  const {
    currentStation,
    isPlaying,
    targetLocation,
    randomStation,
    flyTo,
    allStations,
    setSelectedCountryCode,
    setSelectedCity,
    playStation,
  } = usePlayerStore();

  type RadioPointTuple = [number, number, string, string, string, string, string];
  const radioPointsRef = useRef<RadioPointTuple[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [globeTheme, setGlobeTheme] = useState<"sapphire" | "obsidian" | "classic">("sapphire");

  const earthMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const borderMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const atmosphereMatRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const earthMat = earthMatRef.current;
    const borderMat = borderMatRef.current;
    const atmoMat = atmosphereMatRef.current;
    if (!earthMat || !borderMat || !atmoMat) return;

    const glow = atmoMat.uniforms.glowColor?.value;
    if (globeTheme === "sapphire") {
      earthMat.color.setHex(0xffffff);
      earthMat.specular.setHex(0x1a2e4a);
      earthMat.shininess = 90;
      earthMat.emissive.setHex(0xffb84d);
      earthMat.emissiveIntensity = 0.85;
      borderMat.color.setHex(0x38bdf8);
      borderMat.opacity = 0.35;
      if (glow) glow.setHex(0x38bdf8);
    } else if (globeTheme === "obsidian") {
      earthMat.color.setHex(0x708090);
      earthMat.specular.setHex(0x332211);
      earthMat.shininess = 90;
      earthMat.emissive.setHex(0xf59e0b);
      earthMat.emissiveIntensity = 0.95;
      borderMat.color.setHex(0xfbbf24);
      borderMat.opacity = 0.45;
      if (glow) glow.setHex(0xfbbf24);
    } else {
      earthMat.color.setHex(0xffffff);
      earthMat.specular.setHex(0x1a2e4a);
      earthMat.shininess = 90;
      earthMat.emissive.setHex(0xffd54f);
      earthMat.emissiveIntensity = 0.4;
      borderMat.color.setHex(0x94a3b8);
      borderMat.opacity = 0.25;
      if (glow) glow.setHex(0x7dd3fc);
    }
  }, [globeTheme]);

  const rotationYRef = useRef(0);
  const rotationXRef = useRef(0.2);
  const velocityYRef = useRef(0);
  const velocityXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);

  const targetRotYRef = useRef<number | null>(null);
  const targetRotXRef = useRef<number | null>(null);
  const visibleLabelsRef = useRef<ProjectedScreenLabel[]>([]);

  useEffect(() => {
    if (targetLocation) {
      const [lat, lng] = targetLocation;
      targetRotYRef.current = -(lng + 90) * (Math.PI / 180);
      targetRotXRef.current = Math.max(-0.85, Math.min(0.85, (lat * Math.PI) / 180));
    }
  }, [targetLocation]);

  const zoomLevelRef = useRef(zoomLevel);
  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const currentStationRef = useRef(currentStation);
  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const arcsGroupRef = useRef<THREE.Group | null>(null);

  const stationPins = useMemo(() => {
    const list = allStations && allStations.length > 0 ? allStations : STATIONS;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxPins = isMobile ? 800 : 1500;
    const sampled =
      list.length <= maxPins ? list : list.filter((_, i) => i % Math.ceil(list.length / maxPins) === 0);
    return sampled;
  }, [allStations?.length]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !canvas || !overlayCanvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.25);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.85 / zoomLevel);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const earthGroup = new THREE.Group();
    earthGroup.rotation.order = "YXZ";
    earthGroup.rotation.y = rotationYRef.current;
    earthGroup.rotation.x = rotationXRef.current;
    earthGroupRef.current = earthGroup;
    scene.add(earthGroup);

    const baseUrl = import.meta.env.BASE_URL || "./";
    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load(`${baseUrl}textures/earth_day_2048.jpg`);
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const specularTexture = textureLoader.load(`${baseUrl}textures/earth_specular_2048.jpg`);
    const lightsTexture = textureLoader.load(`${baseUrl}textures/earth_night_2048.jpg`);

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: specularTexture,
      specular: new THREE.Color(0x1a2e4a),
      shininess: 90,
      emissiveMap: lightsTexture,
      emissive: new THREE.Color(0xffb84d),
      emissiveIntensity: 0.85,
    });
    earthMatRef.current = earthMat;
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    const borderMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    borderMatRef.current = borderMat;

    fetch(`${baseUrl}data/world_borders.json`)
      .then((res) => res.json())
      .then((borders: [number, number][][]) => {
        const coords: number[] = [];
        for (const ring of borders) {
          for (let i = 0; i < ring.length - 1; i++) {
            const p1 = ring[i];
            const p2 = ring[i + 1];
            if (!p1 || !p2) continue;
            const v1 = latLngToVector3(p1[0], p1[1], 1.0025);
            const v2 = latLngToVector3(p2[0], p2[1], 1.0025);
            coords.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          }
        }
        const borderGeo = new THREE.BufferGeometry();
        borderGeo.setAttribute("position", new THREE.Float32BufferAttribute(coords, 3));
        const borderLines = new THREE.LineSegments(borderGeo, borderMat);
        earthGroup.add(borderLines);
      })
      .catch(() => {});

    const atmosphereGeo = new THREE.SphereGeometry(1.018, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        void main() {
          float intensity = pow(0.60 - dot(vNormal, vec3(0, 0, 1.0)), 2.8);
          gl_FragColor = vec4(glowColor, intensity * 0.9);
        }
      `,
      uniforms: {
        glowColor: {
          value: new THREE.Color(0x38bdf8),
        },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    atmosphereMatRef.current = atmosphereMat;
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    const starsCount = isMobile ? 800 : 1600;
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      const radius = 18 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.75,
    });
    const starsField = new THREE.Points(starsGeo, starsMat);
    scene.add(starsField);

    const pinsGeo = new THREE.SphereGeometry(0.0055, 6, 6);
    const pinsMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Luminous electric cyan matching Radio Garden exactly
    });

    let pinsInstanced: THREE.InstancedMesh | null = null;
    const dummy = new THREE.Object3D();

    const applyRadioPoints = (pts: RadioPointTuple[]) => {
      if (pinsInstanced) {
        earthGroup.remove(pinsInstanced);
        pinsInstanced.geometry.dispose();
      }
      pinsInstanced = new THREE.InstancedMesh(pinsGeo, pinsMat, pts.length);
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        if (!pt) continue;
        const [lat, lng] = pt;
        const vec = latLngToVector3(lat, lng, 1.002);
        dummy.position.copy(vec);
        dummy.updateMatrix();
        pinsInstanced.setMatrixAt(i, dummy.matrix);
      }
      pinsInstanced.instanceMatrix.needsUpdate = true;
      earthGroup.add(pinsInstanced);
    };

    if (radioPointsRef.current.length > 0) {
      applyRadioPoints(radioPointsRef.current);
    } else {
      fetch(`${baseUrl}data/radio_points.json`)
        .then((res) => res.json())
        .then((pts: RadioPointTuple[]) => {
          radioPointsRef.current = pts;
          applyRadioPoints(pts);
        })
        .catch(() => {
          const fallback = stationPins.map(
            (s) => [s.lat, s.lng, s.name, s.city, s.countryCode, s.id, s.streamUrl] as RadioPointTuple,
          );
          radioPointsRef.current = fallback;
          applyRadioPoints(fallback);
        });
    }

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(4, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.1);
    scene.add(ambientLight);

    const arcsGroup = new THREE.Group();
    arcsGroupRef.current = arcsGroup;
    earthGroup.add(arcsGroup);

    overlayCanvas.width = width * dpr;
    overlayCanvas.height = height * dpr;
    const ctx2d = overlayCanvas.getContext("2d");

    const precalculatedFeatures = SATELLITE_FEATURES.map((item) => ({
      ...item,
      localPos: latLngToVector3(item.lat, item.lng, 1.004),
    }));
    const _scratchWorld = new THREE.Vector3();
    const _scratchNorm = new THREE.Vector3();
    const _scratchView = new THREE.Vector3();

    let animationId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!isDraggingRef.current) {
        if (autoRotateRef.current && targetRotYRef.current === null) {
          rotationYRef.current += 0.0012;
        }
        rotationYRef.current += velocityYRef.current;
        rotationXRef.current += velocityXRef.current;
        velocityYRef.current *= 0.94;
        velocityXRef.current *= 0.94;

        if (Math.abs(velocityYRef.current) < 0.00005) velocityYRef.current = 0;
        if (Math.abs(velocityXRef.current) < 0.00005) velocityXRef.current = 0;
      }

      if (targetRotYRef.current !== null && targetRotXRef.current !== null) {
        let diffY = targetRotYRef.current - rotationYRef.current;
        diffY = Math.atan2(Math.sin(diffY), Math.cos(diffY));

        const diffX = targetRotXRef.current - rotationXRef.current;
        const lerpFactor = Math.min(dt * 7.5, 0.2);
        rotationYRef.current += diffY * lerpFactor;
        rotationXRef.current += diffX * lerpFactor;

        if (Math.abs(diffY) < 0.002 && Math.abs(diffX) < 0.002) {
          targetRotYRef.current = null;
          targetRotXRef.current = null;
        }
      }

      rotationXRef.current = Math.max(-0.85, Math.min(0.85, rotationXRef.current));

      earthGroup.rotation.y = rotationYRef.current;
      earthGroup.rotation.x = rotationXRef.current;

      const targetZ = 2.85 / zoomLevelRef.current;
      camera.position.z += (targetZ - camera.position.z) * 0.12;

      renderer.render(scene, camera);

      if (ctx2d) {
        ctx2d.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        const currentLabels: ProjectedScreenLabel[] = [];

        for (const item of precalculatedFeatures) {
          _scratchWorld.copy(item.localPos).applyEuler(earthGroup.rotation);
          _scratchNorm.copy(_scratchWorld).normalize();
          _scratchView.copy(camera.position).sub(_scratchWorld).normalize();
          const dot = _scratchNorm.dot(_scratchView);

          if (dot > 0.08) {
            _scratchWorld.project(camera);
            const x = ((_scratchWorld.x * 0.5 + 0.5) * width) * dpr;
            const y = ((-_scratchWorld.y * 0.5 + 0.5) * height) * dpr;
            const opacity = Math.min(1, Math.max(0, dot * 3.0));

            currentLabels.push({
              ...item,
              x,
              y,
              opacity,
            });

            const isCountry = item.type === "country";
            const isNorthPole = item.countryCode === "XMAS";

            ctx2d.beginPath();
            ctx2d.arc(x, y, (isNorthPole ? 3.8 : isCountry ? 3.0 : 2.0) * dpr, 0, Math.PI * 2);
            ctx2d.fillStyle = isNorthPole
              ? "#FFC94A"
              : isCountry
              ? isChristmas
                ? `rgba(255, 201, 74, ${opacity * 0.95})`
                : `rgba(56, 182, 255, ${opacity * 0.95})`
              : `rgba(186, 230, 253, ${opacity * 0.8})`;
            ctx2d.fill();

            ctx2d.font = isNorthPole
              ? `bold ${Math.round(11.5 * dpr)}px sans-serif`
              : isCountry
              ? `bold ${Math.round(11 * dpr)}px sans-serif`
              : `600 ${Math.round(9 * dpr)}px sans-serif`;

            const textX = x + 6 * dpr;
            const textY = y + (isCountry ? 3.5 : 3.0) * dpr;

            ctx2d.lineWidth = 2.5 * dpr;
            ctx2d.strokeStyle = "rgba(0, 0, 0, 0.85)";
            ctx2d.strokeText(item.name, textX, textY);

            ctx2d.fillStyle = isNorthPole
              ? "#FFD670"
              : isCountry
              ? isChristmas
                ? `rgba(255, 235, 175, ${opacity})`
                : `rgba(240, 249, 255, ${opacity})`
              : `rgba(186, 230, 253, ${opacity * 0.85})`;
            ctx2d.fillText(item.name, textX, textY);
          }
        }

        const activeSt = currentStationRef.current;
        if (activeSt) {
          const stLocal = latLngToVector3(activeSt.lat, activeSt.lng, 1.004);
          _scratchWorld.copy(stLocal).applyEuler(earthGroup.rotation);
          _scratchNorm.copy(_scratchWorld).normalize();
          _scratchView.copy(camera.position).sub(_scratchWorld).normalize();
          const stDot = _scratchNorm.dot(_scratchView);

          if (stDot > 0.06) {
            _scratchWorld.project(camera);
            const x = ((_scratchWorld.x * 0.5 + 0.5) * width) * dpr;
            const y = ((-_scratchWorld.y * 0.5 + 0.5) * height) * dpr;
            const opacity = Math.min(1, Math.max(0, stDot * 3.0));
            const pulse = (now % 1600) / 1600;

            ctx2d.beginPath();
            ctx2d.arc(x, y, (5 + pulse * 24) * dpr, 0, Math.PI * 2);
            ctx2d.strokeStyle = isChristmas
              ? `rgba(255, 201, 74, ${(1 - pulse) * opacity * 0.85})`
              : `rgba(52, 211, 153, ${(1 - pulse) * opacity * 0.85})`;
            ctx2d.lineWidth = 1.5 * dpr;
            ctx2d.stroke();

            ctx2d.beginPath();
            ctx2d.arc(x, y, 4.5 * dpr, 0, Math.PI * 2);
            ctx2d.fillStyle = isChristmas ? `rgba(225, 29, 72, ${opacity})` : `rgba(16, 185, 129, ${opacity})`;
            ctx2d.fill();

            const locationTitle = activeSt.city
              ? `${activeSt.city}, ${activeSt.country || activeSt.countryCode}`
              : activeSt.country || activeSt.name;

            ctx2d.font = `bold ${Math.round(10.5 * dpr)}px sans-serif`;
            const textMetrics = ctx2d.measureText(locationTitle);
            const tagW = textMetrics.width + 18 * dpr;
            const tagH = 22 * dpr;
            const tagX = x - tagW / 2;
            const tagY = y - 28 * dpr;

            ctx2d.fillStyle = "rgba(7, 13, 29, 0.92)";
            ctx2d.strokeStyle = isChristmas ? "rgba(255, 201, 74, 0.85)" : "rgba(56, 189, 248, 0.85)";
            ctx2d.lineWidth = 1.2 * dpr;

            ctx2d.beginPath();
            ctx2d.roundRect(tagX, tagY, tagW, tagH, tagH / 2);
            ctx2d.fill();
            ctx2d.stroke();

            ctx2d.fillStyle = "#FFFFFF";
            ctx2d.fillText(locationTitle, tagX + 9 * dpr, tagY + 15 * dpr);
          }
        }

        visibleLabelsRef.current = currentLabels;
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      const currentDpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 1.25);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(currentDpr);
      renderer.setSize(width, height);

      overlayCanvas.width = width * currentDpr;
      overlayCanvas.height = height * currentDpr;
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      pinsGeo.dispose();
      pinsMat.dispose();
    };
  }, [isChristmas, motionOff, stationPins]);

  useEffect(() => {
    const group = arcsGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Line;
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }
    if (!currentStation || !isPlaying) return;
    const hubs: [number, number][] = [
      [51.5074, -0.1278],
      [40.7128, -74.006],
      [35.6762, 139.6503],
      [48.8566, 2.3522],
      [-34.6037, -58.3816],
      [4.711, -74.0721],
      [-23.5505, -46.6333],
    ];

    const start = latLngToVector3(currentStation.lat, currentStation.lng, 1.005);
    hubs
      .filter(([hLat, hLng]) => Math.hypot(hLat - currentStation.lat, hLng - currentStation.lng) > 8)
      .slice(0, 5)
      .forEach(([hLat, hLng]) => {
        const end = latLngToVector3(hLat, hLng, 1.005);
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const distance = start.distanceTo(end);
        mid.normalize().multiplyScalar(1.0 + distance * 0.28);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(36);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
        const arcMat = new THREE.LineBasicMaterial({
          color: isChristmas ? 0xffc94a : 0x38b6ff,
          transparent: true,
          opacity: 0.65,
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        group.add(arcLine);
      });
  }, [currentStation, isPlaying, isChristmas]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      targetRotYRef.current = null;
      targetRotXRef.current = null;
      pointerDownPos.current = { x: e.clientX, y: e.clientY };

      try {
        container.setPointerCapture(e.pointerId);
      } catch {}

      if (activePointersRef.current.size === 1) {
        isDraggingRef.current = true;
        lastPointerPos.current = { x: e.clientX, y: e.clientY };
        velocityYRef.current = 0;
        velocityXRef.current = 0;
        pinchDistRef.current = null;
      } else if (activePointersRef.current.size === 2) {
        isDraggingRef.current = false;
        velocityYRef.current = 0;
        velocityXRef.current = 0;
        const pts = Array.from(activePointersRef.current.values());
        if (pts.length >= 2 && pts[0] && pts[1]) {
          pinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointersRef.current.size >= 2) {
        const pts = Array.from(activePointersRef.current.values());
        if (pts.length >= 2 && pts[0] && pts[1]) {
          const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          if (pinchDistRef.current !== null && pinchDistRef.current > 0) {
            const delta = currentDist - pinchDistRef.current;
            const zoomDelta = delta * 0.0035;
            setZoomLevel((z) => Math.max(0.65, Math.min(1.6, z + zoomDelta)));
          }
          pinchDistRef.current = currentDist;
        }
        return;
      }

      if (!isDraggingRef.current || !lastPointerPos.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      const factor = 0.0035 / zoomLevelRef.current;
      rotationYRef.current += dx * factor;
      rotationXRef.current += dy * factor;

      velocityYRef.current = dx * factor * 0.75;
      velocityXRef.current = dy * factor * 0.75;
    };

    const onPointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {}

      if (pointerDownPos.current) {
        const moveDist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y);

        if (moveDist < 7 && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
          const clickX = (e.clientX - rect.left) * dpr;
          const clickY = (e.clientY - rect.top) * dpr;

          let tappedLabel = false;
          for (const item of visibleLabelsRef.current) {
            const dist = Math.hypot(clickX - item.x, clickY - item.y);
            if (dist < 28 * dpr) {
              tappedLabel = true;
              flyTo(item.lat, item.lng);

              const stationsList = allStations && allStations.length > 0 ? allStations : STATIONS;
              if (item.type === "country" && item.countryCode) {
                setSelectedCountryCode(item.countryCode);
                setSelectedCity(null);
                const match = stationsList.find((s) => s.countryCode === item.countryCode);
                if (match) playStation(match);
              } else if (item.type === "city") {
                if (item.countryCode && item.countryCode !== "XMAS") {
                  setSelectedCountryCode(item.countryCode);
                }
                setSelectedCity(item.name);
                const match = stationsList.find((s) => s.city.toLowerCase().includes(item.name.toLowerCase()));
                if (match) playStation(match);
              }
              break;
            }
          }

          const activeCam = cameraRef.current;
          const activeEarth = earthGroupRef.current;
          const cWidth = canvasRef.current.clientWidth || window.innerWidth;
          const cHeight = canvasRef.current.clientHeight || window.innerHeight;

          if (!tappedLabel && activeCam && activeEarth && radioPointsRef.current.length > 0) {
            let closestPt: RadioPointTuple | null = null;
            let minPtDist = 24 * dpr;

            for (let i = 0; i < radioPointsRef.current.length; i++) {
              const pt = radioPointsRef.current[i];
              if (!pt) continue;
              const ptLocal = latLngToVector3(pt[0], pt[1], 1.002);
              const ptWorld = ptLocal.applyEuler(activeEarth.rotation);
              const normal = ptWorld.clone().normalize();
              const viewDir = activeCam.position.clone().sub(ptWorld).normalize();

              if (normal.dot(viewDir) > 0.08) {
                const scr = ptWorld.project(activeCam);
                const px = ((scr.x * 0.5 + 0.5) * cWidth) * dpr;
                const py = ((-scr.y * 0.5 + 0.5) * cHeight) * dpr;
                const d = Math.hypot(clickX - px, clickY - py);
                if (d < minPtDist) {
                  minPtDist = d;
                  closestPt = pt;
                }
              }
            }

            if (closestPt) {
              const [lat, lng, name, city, cc, id, streamUrl] = closestPt;
              flyTo(lat, lng);
              if (cc) setSelectedCountryCode(cc);
              if (city) setSelectedCity(city);
              playStation({
                id,
                name: name || "Emisora Local",
                city: city || "",
                country: cc || "",
                countryCode: cc || "",
                streamUrl,
                lat,
                lng,
                genre: "General",
                tags: [],
                bitrate: 128,
                codec: "MP3",
                frequency: "LIVE",
                hue: Math.floor(Math.random() * 360),
                description: `Emisora transmitiendo en vivo desde ${city || cc}`,
              });
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
      setZoomLevel((z) => Math.max(0.65, Math.min(1.6, z + delta)));
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
  }, [allStations, flyTo, playStation, setSelectedCountryCode, setSelectedCity]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    >
      <div
        className="pointer-events-none absolute rounded-full transition-transform duration-300 will-change-transform"
        style={{
          width: "min(88vw, 840px)",
          height: "min(88vw, 840px)",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(2, 132, 199, 0.04) 50%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full outline-none"
        style={{ width: "100%", height: "100%", contain: "strict" }}
      />

      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      <div className="absolute right-3.5 bottom-6 z-20 flex flex-col gap-1.5 p-1 rounded-2xl liquid-glass border border-white/10 shadow-lg">
        <IconButton
          size="sm"
          label={
            globeTheme === "sapphire"
              ? "Estilo: Zafiro Satelital HD (Pulsar para Obsidiana)"
              : globeTheme === "obsidian"
              ? "Estilo: Obsidiana & Oro Cyber (Pulsar para NASA Clásico)"
              : "Estilo: NASA Fotorrealista (Pulsar para Zafiro)"
          }
          icon={
            <span className="text-[10px] font-black font-mono tracking-tighter text-amber-400">
              {globeTheme === "sapphire" ? "HD" : globeTheme === "obsidian" ? "CY" : "NA"}
            </span>
          }
          onClick={() => {
            setGlobeTheme((prev) =>
              prev === "sapphire" ? "obsidian" : prev === "obsidian" ? "classic" : "sapphire",
            );
          }}
        />
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
          onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
        />
        <IconButton
          size="sm"
          label="Alejar globo 3D"
          icon={<span className="text-lg font-bold leading-none">−</span>}
          onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.15))}
        />
      </div>

      <StationDetailsModal
        station={currentStation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
}
