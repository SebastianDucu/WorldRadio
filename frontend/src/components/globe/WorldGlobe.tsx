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

// Curated Landmark Broadcasting Nations & Metropolitan Radio Capitals
const SATELLITE_FEATURES: SatelliteFeature[] = [
  // North Pole Christmas Landmark
  { name: "Polo Norte · Taller de Santa", lat: 88.5, lng: 0, type: "city", countryCode: "XMAS" },

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

// Convert geographic latitude and longitude to 3D Cartesian coordinates matching Three.js Sphere UVs
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

  const [autoRotate, setAutoRotate] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [telemetryCoords, setTelemetryCoords] = useState("LAT 04.7°N · LNG 74.1°W");

  // Inertia and Rotation State
  const rotationYRef = useRef(0);
  const rotationXRef = useRef(0.2);
  const velocityYRef = useRef(0);
  const velocityXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);

  // Target Camera Lerping for flyTo
  const targetRotYRef = useRef<number | null>(null);
  const targetRotXRef = useRef<number | null>(null);
  const visibleLabelsRef = useRef<ProjectedScreenLabel[]>([]);
  const santaScreenPosRef = useRef<{ x: number; y: number; visible: boolean } | null>(null);

  // Smooth camera centering on active coordinates
  useEffect(() => {
    if (targetLocation) {
      const [lat, lng] = targetLocation;
      targetRotYRef.current = -(lng + 90) * (Math.PI / 180);
      targetRotXRef.current = Math.max(-0.85, Math.min(0.85, (lat * Math.PI) / 180));
    }
  }, [targetLocation]);

  // Station Sample Pool for 3D Surface Pins
  const stationPins = useMemo(() => {
    const list = allStations && allStations.length > 0 ? allStations : STATIONS;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const maxPins = isMobile ? 800 : 1500;
    const sampled =
      list.length <= maxPins ? list : list.filter((_, i) => i % Math.ceil(list.length / maxPins) === 0);
    const hasCurrent = sampled.some((s) => s.id === currentStation?.id);
    return hasCurrent || !currentStation ? sampled : [currentStation, ...sampled];
  }, [allStations, currentStation]);

  // Three.js Photorealistic 3D Satellite Earth Engine
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!container || !canvas || !overlayCanvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const isMobile = width < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.85 / zoomLevel);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Earth Group (Rotates with inertia/touch)
    const earthGroup = new THREE.Group();
    earthGroup.rotation.order = "YXZ";
    earthGroup.rotation.y = rotationYRef.current;
    earthGroup.rotation.x = rotationXRef.current;
    scene.add(earthGroup);

    // 3. Texture Loading (NASA Satellite Blue Marble, Specular & Night Lights)
    const baseUrl = import.meta.env.BASE_URL || "./";
    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load(`${baseUrl}textures/earth_atmos_2048.jpg`);
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    const specularTexture = textureLoader.load(`${baseUrl}textures/earth_specular_2048.jpg`);
    const lightsTexture = textureLoader.load(`${baseUrl}textures/earth_lights_2048.png`);
    const cloudsTexture = textureLoader.load(`${baseUrl}textures/earth_clouds_1024.png`);

    // 4. Satellite Earth Mesh with enhanced ocean glints and night lights
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: specularTexture,
      specular: isChristmas ? new THREE.Color(0x446699) : new THREE.Color(0x335577),
      shininess: isChristmas ? 32 : 25,
      emissiveMap: lightsTexture,
      emissive: isChristmas ? new THREE.Color(0xffe899) : new THREE.Color(0xffddaa),
      emissiveIntensity: isChristmas ? 0.65 : 0.5,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 5. Atmospheric Cloud Layer
    const cloudsGeo = new THREE.SphereGeometry(1.012, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(cloudsMesh);

    // 6. North Pole Star Beacon (Christmas Landmark)
    let northPoleBeacon: THREE.Mesh | null = null;
    if (isChristmas) {
      const beaconGeo = new THREE.CylinderGeometry(0.003, 0.008, 0.12, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffc94a });
      northPoleBeacon = new THREE.Mesh(beaconGeo, beaconMat);
      northPoleBeacon.position.set(0, 1.06, 0);
      earthGroup.add(northPoleBeacon);
    }

    // 7. Luminous Rayleigh Scattering Atmosphere Rim
    const atmosphereGeo = new THREE.SphereGeometry(1.038, 48, 48);
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
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(glowColor, intensity * 0.75);
        }
      `,
      uniforms: {
        glowColor: {
          value: isChristmas ? new THREE.Color(0xffc94a) : new THREE.Color(0x38b6ff),
        },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // 8. 3D Santa Orbital Trajectory & Vessel in Low Earth Orbit
    const santaOrbitRadius = 1.24;
    const santaOrbitGroup = new THREE.Group();
    santaOrbitGroup.rotation.z = (28 * Math.PI) / 180;
    santaOrbitGroup.rotation.x = (14 * Math.PI) / 180;

    let santaRudolphBeacon: THREE.Mesh | null = null;
    let santaSleighVessel: THREE.Mesh | null = null;

    if (isChristmas) {
      // Golden orbit trajectory line
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const th = (i / 64) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(santaOrbitRadius * Math.cos(th), 0, santaOrbitRadius * Math.sin(th)));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0xffc94a,
        transparent: true,
        opacity: 0.38,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      santaOrbitGroup.add(orbitLine);

      // Rudolph Glowing Ruby Nose Beacon
      const rudolphGeo = new THREE.SphereGeometry(0.016, 8, 8);
      const rudolphMat = new THREE.MeshBasicMaterial({ color: 0xff1e56 });
      santaRudolphBeacon = new THREE.Mesh(rudolphGeo, rudolphMat);
      santaOrbitGroup.add(santaRudolphBeacon);

      // Golden Sleigh Vessel
      const sleighGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const sleighMat = new THREE.MeshBasicMaterial({ color: 0xffc94a });
      santaSleighVessel = new THREE.Mesh(sleighGeo, sleighMat);
      santaOrbitGroup.add(santaSleighVessel);

      scene.add(santaOrbitGroup);
    }

    // 9. Celestial Starfield & 3D Space Snow Crystals
    const starsCount = isMobile ? 600 : 1200;
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
      size: 0.08,
      color: isChristmas ? 0xfff0aa : 0xddeeff,
      transparent: true,
      opacity: 0.7,
    });
    const starsField = new THREE.Points(starsGeo, starsMat);
    scene.add(starsField);

    // 3D Space Snow Crystals drifting around Earth
    let spaceSnowField: THREE.Points | null = null;
    if (isChristmas) {
      const snowCrystalsCount = isMobile ? 250 : 450;
      const snowGeo = new THREE.BufferGeometry();
      const snowPos = new Float32Array(snowCrystalsCount * 3);
      for (let i = 0; i < snowCrystalsCount * 3; i += 3) {
        const rad = 1.08 + Math.random() * 2.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        snowPos[i] = rad * Math.sin(phi) * Math.cos(theta);
        snowPos[i + 1] = rad * Math.sin(phi) * Math.sin(theta);
        snowPos[i + 2] = rad * Math.cos(phi);
      }
      snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
      const spaceSnowMat = new THREE.PointsMaterial({
        size: 0.045,
        color: 0xfff8e7,
        transparent: true,
        opacity: 0.65,
      });
      spaceSnowField = new THREE.Points(snowGeo, spaceSnowMat);
      scene.add(spaceSnowField);
    }

    // 10. 3D Broadcast Station Markers on Surface
    const pinsGeo = new THREE.SphereGeometry(0.007, 8, 8);
    const pinsMat = new THREE.MeshBasicMaterial({
      color: isChristmas ? 0xffc94a : 0x38b6ff,
    });
    const pinsInstanced = new THREE.InstancedMesh(pinsGeo, pinsMat, stationPins.length);
    const dummy = new THREE.Object3D();
    stationPins.forEach((st, i) => {
      const vec = latLngToVector3(st.lat, st.lng, 1.002);
      dummy.position.copy(vec);
      dummy.updateMatrix();
      pinsInstanced.setMatrixAt(i, dummy.matrix);
    });
    pinsInstanced.instanceMatrix.needsUpdate = true;
    earthGroup.add(pinsInstanced);

    // 11. Lighting Setup
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.85);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x223355, 0.7);
    scene.add(ambientLight);

    // 12. Broadcast Arcs from current station
    const arcsGroup = new THREE.Group();
    earthGroup.add(arcsGroup);

    if (currentStation && isPlaying) {
      const hubs: [number, number][] = [
        [51.5074, -0.1278], // London
        [40.7128, -74.006], // New York
        [35.6762, 139.6503], // Tokyo
        [48.8566, 2.3522], // Paris
        [-34.6037, -58.3816], // Buenos Aires
        [4.711, -74.0721], // Bogotá
        [-23.5505, -46.6333], // São Paulo
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
          arcsGroup.add(arcLine);
        });
    }

    // 13. Synchronize 2D Overlay Canvas
    overlayCanvas.width = width * dpr;
    overlayCanvas.height = height * dpr;
    const ctx2d = overlayCanvas.getContext("2d");

    let animationId: number;
    let lastTime = performance.now();
    let telemetryCounter = 0;

    // Render Loop (120 FPS hardware accelerated)
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Inertia Physics
      if (!isDraggingRef.current) {
        rotationYRef.current += velocityYRef.current;
        rotationXRef.current += velocityXRef.current;
        velocityYRef.current *= 0.94;
        velocityXRef.current *= 0.94;

        if (Math.abs(velocityYRef.current) < 0.00005) velocityYRef.current = 0;
        if (Math.abs(velocityXRef.current) < 0.00005) velocityXRef.current = 0;
      }

      // Camera FlyTo Interpolation
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
      } else if (autoRotate && !isDraggingRef.current && !motionOff && velocityYRef.current === 0) {
        rotationYRef.current += dt * 0.09;
      }

      // Clamp X tilt
      rotationXRef.current = Math.max(-0.85, Math.min(0.85, rotationXRef.current));

      earthGroup.rotation.y = rotationYRef.current;
      earthGroup.rotation.x = rotationXRef.current;

      // Independent slow atmospheric cloud drift
      cloudsMesh.rotation.y += dt * 0.025;

      // 3D Santa Orbit Position Update
      if (isChristmas && santaRudolphBeacon && santaSleighVessel) {
        const santaAngle = now * 0.00045;
        santaRudolphBeacon.position.set(
          santaOrbitRadius * Math.cos(santaAngle),
          0,
          santaOrbitRadius * Math.sin(santaAngle)
        );
        santaSleighVessel.position.set(
          santaOrbitRadius * Math.cos(santaAngle - 0.05),
          0,
          santaOrbitRadius * Math.sin(santaAngle - 0.05)
        );

        // Calculate Santa's projected screen position
        const santaWorld = santaRudolphBeacon.getWorldPosition(new THREE.Vector3());
        const normal = santaWorld.clone().normalize();
        const viewDir = camera.position.clone().sub(santaWorld).normalize();
        const dot = normal.dot(viewDir);

        if (dot > 0.05) {
          const screenPos = santaWorld.clone().project(camera);
          santaScreenPosRef.current = {
            x: ((screenPos.x * 0.5 + 0.5) * width) * dpr,
            y: ((-screenPos.y * 0.5 + 0.5) * height) * dpr,
            visible: true,
          };
        } else {
          santaScreenPosRef.current = null;
        }
      }

      // Space Snow Drifting
      if (spaceSnowField) {
        spaceSnowField.rotation.y -= dt * 0.015;
        spaceSnowField.rotation.x += dt * 0.008;
      }

      // Update camera distance smoothly based on zoomLevel
      camera.position.z = 2.85 / zoomLevel;

      // Render Three.js Scene
      renderer.render(scene, camera);

      // 14. Render 2D Projected Satellite Labels (Countries, Cities, Radio Beacon, Santa)
      if (ctx2d) {
        ctx2d.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        const currentLabels: ProjectedScreenLabel[] = [];

        // Project Country & City Satellite Names
        for (const item of SATELLITE_FEATURES) {
          const localVec = latLngToVector3(item.lat, item.lng, 1.004);
          const worldPos = localVec.clone().applyEuler(earthGroup.rotation);

          // Horizon culling via dot product
          const normal = worldPos.clone().normalize();
          const viewDir = camera.position.clone().sub(worldPos).normalize();
          const dot = normal.dot(viewDir);

          if (dot > 0.08) {
            const screenPos = worldPos.clone().project(camera);
            const x = ((screenPos.x * 0.5 + 0.5) * width) * dpr;
            const y = ((-screenPos.y * 0.5 + 0.5) * height) * dpr;
            const opacity = Math.min(1, Math.max(0, dot * 3.0));

            currentLabels.push({
              ...item,
              x,
              y,
              opacity,
            });

            const isCountry = item.type === "country";
            const isNorthPole = item.countryCode === "XMAS";

            // Glowing satellite node dot
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

            // Text Typography
            ctx2d.font = isNorthPole
              ? `bold ${Math.round(11.5 * dpr)}px -apple-system, system-ui, sans-serif`
              : isCountry
              ? `bold ${Math.round(11 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
              : `600 ${Math.round(9 * dpr)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

            ctx2d.shadowColor = "rgba(0, 0, 0, 0.9)";
            ctx2d.shadowBlur = 5 * dpr;

            ctx2d.fillStyle = isNorthPole
              ? "#FFD670"
              : isCountry
              ? isChristmas
                ? `rgba(255, 235, 175, ${opacity})`
                : `rgba(240, 249, 255, ${opacity})`
              : `rgba(186, 230, 253, ${opacity * 0.85})`;

            ctx2d.fillText(item.name, x + 6 * dpr, y + (isCountry ? 3.5 : 3.0) * dpr);
            ctx2d.shadowBlur = 0;
          }
        }

        // Active Station Pulsing Beacon & Satellite Callout
        if (currentStation) {
          const stLocal = latLngToVector3(currentStation.lat, currentStation.lng, 1.004);
          const stWorld = stLocal.clone().applyEuler(earthGroup.rotation);
          const stNormal = stWorld.clone().normalize();
          const stView = camera.position.clone().sub(stWorld).normalize();
          const stDot = stNormal.dot(stView);

          if (stDot > 0.06) {
            const screenPos = stWorld.clone().project(camera);
            const x = ((screenPos.x * 0.5 + 0.5) * width) * dpr;
            const y = ((-screenPos.y * 0.5 + 0.5) * height) * dpr;
            const opacity = Math.min(1, Math.max(0, stDot * 3.0));
            const pulse = (now % 1600) / 1600;

            // Radar ripple ring
            ctx2d.beginPath();
            ctx2d.arc(x, y, (5 + pulse * 24) * dpr, 0, Math.PI * 2);
            ctx2d.strokeStyle = isChristmas
              ? `rgba(255, 201, 74, ${(1 - pulse) * opacity * 0.85})`
              : `rgba(52, 211, 153, ${(1 - pulse) * opacity * 0.85})`;
            ctx2d.lineWidth = 1.5 * dpr;
            ctx2d.stroke();

            // Core beacon dot
            ctx2d.beginPath();
            ctx2d.arc(x, y, 4.5 * dpr, 0, Math.PI * 2);
            ctx2d.fillStyle = isChristmas ? `rgba(225, 29, 72, ${opacity})` : `rgba(16, 185, 129, ${opacity})`;
            ctx2d.fill();

            // Satellite live callout tag
            const flagX = x + 14 * dpr;
            const flagY = y - 12 * dpr;

            ctx2d.beginPath();
            ctx2d.moveTo(x, y);
            ctx2d.lineTo(x + 8 * dpr, y - 8 * dpr);
            ctx2d.lineTo(flagX, flagY);
            ctx2d.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx2d.lineWidth = 1 * dpr;
            ctx2d.stroke();

            const labelText = `EN VIVO · ${currentStation.name} (${currentStation.frequency || "FM"})`;
            ctx2d.font = `bold ${Math.round(9 * dpr)}px -apple-system, system-ui, sans-serif`;
            const textMetrics = ctx2d.measureText(labelText);
            const tagW = textMetrics.width + 12 * dpr;
            const tagH = 17 * dpr;

            ctx2d.fillStyle = "rgba(3, 8, 22, 0.85)";
            ctx2d.strokeStyle = isChristmas ? "rgba(255, 201, 74, 0.6)" : "rgba(52, 211, 153, 0.6)";
            ctx2d.lineWidth = 1 * dpr;

            ctx2d.beginPath();
            ctx2d.roundRect(flagX, flagY - tagH / 2, tagW, tagH, 4 * dpr);
            ctx2d.fill();
            ctx2d.stroke();

            ctx2d.fillStyle = isChristmas ? "#FFC94A" : "#34D399";
            ctx2d.fillText(labelText, flagX + 6 * dpr, flagY + 3.5 * dpr);
          }
        }

        // 3D Orbital Santa Vessel Callout Tag on Screen
        if (isChristmas && santaScreenPosRef.current) {
          const sx = santaScreenPosRef.current.x;
          const sy = santaScreenPosRef.current.y;

          ctx2d.beginPath();
          ctx2d.arc(sx, sy, 3.5 * dpr, 0, Math.PI * 2);
          ctx2d.fillStyle = "#FF1E56";
          ctx2d.fill();

          const santaTag = "TRINEO DE SANTA // EN ÓRBITA";
          ctx2d.font = `bold ${Math.round(8.5 * dpr)}px -apple-system, system-ui, sans-serif`;
          ctx2d.fillStyle = "rgba(3, 8, 22, 0.85)";
          ctx2d.strokeStyle = "rgba(255, 201, 74, 0.7)";
          ctx2d.lineWidth = 1 * dpr;

          const sMetrics = ctx2d.measureText(santaTag);
          ctx2d.beginPath();
          ctx2d.roundRect(sx + 8 * dpr, sy - 8 * dpr, sMetrics.width + 10 * dpr, 16 * dpr, 4 * dpr);
          ctx2d.fill();
          ctx2d.stroke();

          ctx2d.fillStyle = "#FFC94A";
          ctx2d.fillText(santaTag, sx + 13 * dpr, sy + 3 * dpr);
        }

        visibleLabelsRef.current = currentLabels;
      }

      // 15. Telemetry HUD Coordinates update
      telemetryCounter++;
      if (telemetryCounter % 8 === 0) {
        const centerLat = (rotationXRef.current * 180) / Math.PI;
        const centerLng = (-rotationYRef.current * 180) / Math.PI - 90;
        const normLng = (((centerLng % 360) + 540) % 360) - 180;
        const latStr = `${Math.abs(centerLat).toFixed(1)}°${centerLat >= 0 ? "N" : "S"}`;
        const lngStr = `${Math.abs(normLng).toFixed(1)}°${normLng >= 0 ? "E" : "W"}`;
        setTelemetryCoords(`LAT ${latStr} · LNG ${lngStr}`);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      const currentDpr = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2);

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
      cloudsGeo.dispose();
      cloudsMat.dispose();
      atmosphereGeo.dispose();
      atmosphereMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      pinsGeo.dispose();
      pinsMat.dispose();
    };
  }, [isChristmas, motionOff, zoomLevel, stationPins, autoRotate, currentStation, isPlaying]);

  // Pointer & Gesture Engine (240 FPS Inertia + Tap to Select)
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
      } catch {
        // Fallback
      }

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

      // Two-Finger Pinch to Zoom (iOS Safari & Android)
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

      // Single-Finger Globe Rotation Drag
      if (!isDraggingRef.current || !lastPointerPos.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      const factor = 0.0035 / zoomLevel;
      rotationYRef.current += dx * factor;
      rotationXRef.current += dy * factor;

      velocityYRef.current = dx * factor * 0.75;
      velocityXRef.current = dy * factor * 0.75;
    };

    const onPointerUp = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
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
  }, [zoomLevel, allStations, flyTo, playStation, setSelectedCountryCode, setSelectedCity]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
    >
      {/* 1. Atmospheric Space Backdrop Glow */}
      <div
        className="pointer-events-none absolute rounded-full transition-transform duration-300 will-change-transform"
        style={{
          width: "min(88vw, 840px)",
          height: "min(88vw, 840px)",
          background: isChristmas
            ? "radial-gradient(circle, rgba(255, 201, 74, 0.22) 0%, rgba(16, 185, 129, 0.10) 45%, transparent 72%)"
            : "radial-gradient(circle, rgba(56, 182, 255, 0.22) 0%, rgba(30, 107, 255, 0.08) 45%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      {/* 2. Concentric Holographic Celestial Orbit Rings around the Satellite Globe */}
      <div
        className="pointer-events-none absolute flex items-center justify-center will-change-transform"
        style={{
          width: "min(106vw, 960px)",
          height: "min(106vw, 960px)",
          transform: "rotateX(68deg) translateZ(0)",
          opacity: 0.38,
        }}
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-[#ffc94a]/35 animate-[spin_80s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-[#ffc94a]/20" />
        <div className="absolute inset-20 rounded-full border border-dotted border-[#ffd670]/30 animate-[spin_50s_linear_infinite_reverse]" />
      </div>

      {/* 3. Three.js High-Performance 3D Satellite Earth Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full outline-none"
        style={{ width: "100%", height: "100%", contain: "strict" }}
      />

      {/* 4. 2D Projected Satellite Labels Overlay (Countries & Cities) */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* 5. Satellite HUD Telemetry Badges */}
      <div className="pointer-events-none absolute top-14 left-4 z-20 hidden md:flex flex-col gap-1 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold">SAT-NAV LEO</span>
          <span>// ORBIT: 780 KM // INCL: 51.6°</span>
        </span>
        <span className="bg-black/40 backdrop-blur-md border border-white/5 px-2.5 py-0.5 rounded-md text-[10px] text-amber-300">
          MAPA SATELITAL 3D · 174 NACIONES // HQ {isChristmas ? "· EDICIÓN NAVIDAD" : ""}
        </span>
      </div>

      {/* Live Viewport Coordinates HUD Telemetry */}
      <div className="pointer-events-none absolute top-14 right-4 z-20 hidden md:flex">
        <span className="bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold text-slate-300 shadow-lg">
          {telemetryCoords}
        </span>
      </div>

      {/* 6. Sleek Floating Zoom & Rotate controls at bottom right */}
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
          onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
        />
        <IconButton
          size="sm"
          label="Alejar globo 3D"
          icon={<span className="text-lg font-bold leading-none">−</span>}
          onClick={() => setZoomLevel((z) => Math.max(0.65, z - 0.15))}
        />
      </div>

      {/* 7. Technical details modal */}
      <StationDetailsModal
        station={currentStation}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
}
