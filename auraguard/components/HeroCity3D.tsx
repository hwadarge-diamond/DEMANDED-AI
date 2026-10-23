"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EnvironmentalData, RiskLevel } from "@/lib/types";
import { Eye, Layers, ShieldCheck, Sparkles, Orbit } from "lucide-react";

interface HeroCity3DProps {
  data: EnvironmentalData;
  riskLevel: RiskLevel;
}

export default function HeroCity3D({ data, riskLevel }: HeroCity3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"cinematic" | "3d">("cinematic");

  useEffect(() => {
    if (viewMode !== "3d") return;
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(28, 22, 34);
    camera.lookAt(0, 4, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Dynamic Fog & Sky based on AQI and Temperature
    const fogColor = new THREE.Color(
      riskLevel === "SEVERE"
        ? 0x2a0c0c
        : riskLevel === "HIGH"
        ? 0x221606
        : data.apparentTemperature > 32
        ? 0x1f170e
        : 0x050c12
    );
    scene.background = fogColor;
    const fogDensity = data.pm25 > 50 ? 0.022 : data.pm25 > 25 ? 0.016 : 0.009;
    scene.fog = new THREE.FogExp2(fogColor, fogDensity);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunColor = data.apparentTemperature > 35 ? 0xff7722 : data.uvIndex > 8 ? 0xffea88 : 0x00f0ff;
    const sunLight = new THREE.DirectionalLight(sunColor, data.uvIndex > 7 ? 2.5 : 1.6);
    sunLight.position.set(30, 50, 20);
    scene.add(sunLight);

    // 5. Procedural City Grid (InstancedMesh for maximum 60FPS performance)
    const gridSize = 14;
    const count = gridSize * gridSize;
    const boxGeometry = new THREE.BoxGeometry(1.8, 1, 1.8);

    const primaryGlowColor =
      riskLevel === "SEVERE"
        ? 0xef4444
        : riskLevel === "HIGH"
        ? 0xf59e0b
        : riskLevel === "MODERATE"
        ? 0x06b6d4
        : 0x10b981;

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x081318,
      roughness: 0.25,
      metalness: 0.85,
    });

    const instancedMesh = new THREE.InstancedMesh(boxGeometry, buildingMaterial, count);
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const dummy = new THREE.Object3D();

    let idx = 0;
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        const distFromCenter = Math.sqrt(x * x + z * z);
        const maxHeight = Math.max(1.5, 14 - distFromCenter * 1.4);
        const heightMultiplier = Math.sin(x * 12.5) * Math.cos(z * 8.3);
        const bHeight = Math.max(1.2, maxHeight + heightMultiplier * 3.5);

        position.set(x * 2.8, bHeight / 2, z * 2.8);
        scale.set(1, bHeight, 1);

        dummy.position.copy(position);
        dummy.scale.copy(scale);
        dummy.updateMatrix();

        instancedMesh.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    // 6. Holographic Ground Grid
    const gridHelper = new THREE.GridHelper(70, 35, primaryGlowColor, 0x112228);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 7. Dynamic Climate Shield / Alert Bio-Dome
    const domeRadius = 26;
    const domeGeo = new THREE.SphereGeometry(domeRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: primaryGlowColor,
      wireframe: true,
      transparent: true,
      opacity: riskLevel === "SEVERE" ? 0.35 : riskLevel === "HIGH" ? 0.22 : 0.12,
    });
    const shieldDome = new THREE.Mesh(domeGeo, domeMat);
    shieldDome.position.y = 0;
    scene.add(shieldDome);

    // 8. Particulate & Smog Particles
    const particleCount = data.pm25 > 50 ? 500 : 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 1] = Math.random() * 20;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.03;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015;
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: data.pm25 > 50 ? 0xd97706 : primaryGlowColor,
      size: data.pm25 > 50 ? 0.35 : 0.22,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 9. Floating Celestial Sun
    const sunCoreGeo = new THREE.SphereGeometry(data.uvIndex > 8 ? 4.2 : 2.8, 16, 16);
    const sunCoreMat = new THREE.MeshBasicMaterial({
      color: sunColor,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const sunMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunMesh.position.set(30, 42, -20);
    scene.add(sunMesh);

    // 10. Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    container.addEventListener("mousemove", onMouseMove);

    // 11. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      targetX += (mouseX * 12 - targetX) * 0.04;
      targetY += (-mouseY * 8 - targetY) * 0.04;

      const angle = elapsed * 0.08;
      const baseRadius = 40;
      camera.position.x = Math.sin(angle) * baseRadius + targetX;
      camera.position.z = Math.cos(angle) * baseRadius;
      camera.position.y = 20 + Math.sin(elapsed * 0.3) * 2 + targetY;
      camera.lookAt(0, 3, 0);

      const pulseRate = riskLevel === "SEVERE" ? 4.0 : riskLevel === "HIGH" ? 2.5 : 1.2;
      const pulseScale = 1.0 + Math.sin(elapsed * pulseRate) * 0.02;
      shieldDome.scale.set(pulseScale, pulseScale, pulseScale);
      shieldDome.rotation.y = elapsed * 0.04;

      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i * 3];
        positions[i * 3 + 1] += Math.sin(elapsed + i) * 0.01;
        positions[i * 3 + 2] += particleVelocities[i * 3 + 2];

        if (Math.abs(positions[i * 3]) > 25) positions[i * 3] *= -0.95;
        if (positions[i * 3 + 1] < 0 || positions[i * 3 + 1] > 22) positions[i * 3 + 1] = Math.random() * 15;
        if (Math.abs(positions[i * 3 + 2]) > 25) positions[i * 3 + 2] *= -0.95;
      }
      particleGeo.attributes.position.needsUpdate = true;

      sunMesh.rotation.y = elapsed * 0.2;
      sunMesh.rotation.x = elapsed * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", onMouseMove);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [data, riskLevel, viewMode]);

  return (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden border border-aura-border bg-gradient-to-b from-[#061014] to-aura-darkest shadow-2xl group">
      {/* View Mode 1: Photorealistic Cinematic 8K Metropolis with Live HUD */}
      {viewMode === "cinematic" ? (
        <div className="relative w-full h-full overflow-hidden">
          <img
            src="/images/futuristic_eco_city.jpg"
            alt="Futuristic Eco-Tech Metropolis Climate Shield"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105 scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle Ambient Vignette & Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-aura-darkest via-black/30 to-black/50 pointer-events-none" />

          {/* Holographic Hexagonal Grid Ambient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        /* View Mode 2: Interactive Three.js 60FPS WebGL Canvas */
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      )}

      {/* Top Left: HUD Status Badges */}
      <div className="absolute top-5 left-5 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-cyan-400/30 text-xs font-mono text-cyan-300 shadow-glow">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">AUTONOMOUS CLIMATE-SHIELD GRID</span>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STATUS: ACTIVE DEFENSE</span>
        </div>
      </div>

      {/* Top Right: Mode Switcher (Cinematic vs Interactive 3D) */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-1 p-1 rounded-full bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl">
        <button
          onClick={() => setViewMode("cinematic")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
            viewMode === "cinematic"
              ? "bg-cyan-500 text-black shadow-glow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>8K CINEMATIC</span>
        </button>
        <button
          onClick={() => setViewMode("3d")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
            viewMode === "3d"
              ? "bg-cyan-500 text-black shadow-glow"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Orbit className="w-3.5 h-3.5" />
          <span>3D WEBGL</span>
        </button>
      </div>

      {/* Bottom Telemetry Bar Overlay */}
      <div className="absolute bottom-5 left-5 right-5 z-20 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 text-xs font-mono shadow-2xl">
        <div className="flex flex-wrap items-center gap-5 text-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">CITY:</span>
            <span className="text-white font-black tracking-wide text-sm">{data.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">TEMP:</span>
            <span className={data.temperature > 35 ? "text-orange-400 font-bold" : "text-emerald-400 font-bold"}>
              {data.temperature}°C
            </span>
            <span className="text-gray-500 text-[10px]">({data.apparentTemperature}°C Heat Index)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">AIR PURITY:</span>
            <span className={data.aqi > 100 ? "text-amber-400 font-bold" : "text-cyan-400 font-bold"}>
              {data.aqi} AQI
            </span>
            <span className="text-gray-500 text-[10px]">({data.pm25} µg/m³ PM2.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">SOLAR UV:</span>
            <span className={data.uvIndex > 7 ? "text-purple-400 font-bold" : "text-yellow-400 font-bold"}>
              UV {data.uvIndex}
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-gray-400 hidden lg:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME OPEN-METEO INGESTION ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
