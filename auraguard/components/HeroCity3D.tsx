"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EnvironmentalData, RiskLevel } from "@/lib/types";

interface HeroCity3DProps {
  data: EnvironmentalData;
  riskLevel: RiskLevel;
}

export default function HeroCity3D({ data, riskLevel }: HeroCity3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);

    // Color themes based on Risk Level
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
    const edgeLinesMaterial = new THREE.LineBasicMaterial({
      color: primaryGlowColor,
      transparent: true,
      opacity: 0.6,
    });

    const matrix = new THREE.Matrix4();
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

    // 8. Particulate & Smog Particles (Drifting atmospheric particles)
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

    // 9. Floating Celestial Sun with Heat Flare
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

    // 10. Mouse Parallax & Interaction
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

      // Camera gentle orbit + mouse parallax
      targetX += (mouseX * 12 - targetX) * 0.04;
      targetY += (-mouseY * 8 - targetY) * 0.04;

      const angle = elapsed * 0.08;
      const baseRadius = 40;
      camera.position.x = Math.sin(angle) * baseRadius + targetX;
      camera.position.z = Math.cos(angle) * baseRadius;
      camera.position.y = 20 + Math.sin(elapsed * 0.3) * 2 + targetY;
      camera.lookAt(0, 3, 0);

      // Pulse shield dome
      const pulseRate = riskLevel === "SEVERE" ? 4.0 : riskLevel === "HIGH" ? 2.5 : 1.2;
      const pulseScale = 1.0 + Math.sin(elapsed * pulseRate) * 0.02;
      shieldDome.scale.set(pulseScale, pulseScale, pulseScale);
      shieldDome.rotation.y = elapsed * 0.04;

      // Animate drifting particulate smog
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleVelocities[i * 3];
        positions[i * 3 + 1] += Math.sin(elapsed + i) * 0.01;
        positions[i * 3 + 2] += particleVelocities[i * 3 + 2];

        // Wrap around bounds
        if (Math.abs(positions[i * 3]) > 25) positions[i * 3] *= -0.95;
        if (positions[i * 3 + 1] < 0 || positions[i * 3 + 1] > 22) positions[i * 3 + 1] = Math.random() * 15;
        if (Math.abs(positions[i * 3 + 2]) > 25) positions[i * 3 + 2] *= -0.95;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Rotate sun
      sunMesh.rotation.y = elapsed * 0.2;
      sunMesh.rotation.x = elapsed * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 12. Handle Resize
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
  }, [data, riskLevel]);

  return (
    <div className="relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden border border-aura-border bg-gradient-to-b from-[#061014] to-aura-darkest shadow-2xl">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Atmospheric HUD Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-aura-surface/80 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>3D PROCEDURAL METROPOLIS</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-gray-300">
          DATA-DRIVEN SHADER & FOG
        </div>
      </div>

      {/* Telemetry quick bar on bottom of 3D Canvas */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-aura-darkest/75 backdrop-blur-md border border-aura-border text-xs font-mono">
        <div className="flex items-center gap-4 text-gray-300">
          <div>
            <span className="text-gray-500">CITY: </span>
            <span className="text-white font-bold">{data.city}</span>
          </div>
          <div>
            <span className="text-gray-500">TEMP: </span>
            <span className={data.temperature > 35 ? "text-orange-400 font-bold" : "text-emerald-400"}>
              {data.temperature}°C
            </span>
          </div>
          <div>
            <span className="text-gray-500">AQI: </span>
            <span className={data.aqi > 100 ? "text-amber-400 font-bold" : "text-cyan-400"}>
              {data.aqi}
            </span>
          </div>
          <div>
            <span className="text-gray-500">UV: </span>
            <span className={data.uvIndex > 7 ? "text-purple-400 font-bold" : "text-yellow-400"}>
              {data.uvIndex}
            </span>
          </div>
        </div>
        <div className="text-right text-gray-400 hidden sm:block">
          Interactive Parallax • 60 FPS Low-Poly Instancing
        </div>
      </div>
    </div>
  );
}
