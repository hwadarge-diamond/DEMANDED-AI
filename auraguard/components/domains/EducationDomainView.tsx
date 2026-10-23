"use client";

import React, { useState } from "react";
import {
  EDUCATIONAL_MODULES,
  EducationSimulationEngine,
} from "@/lib/domains/education-agent";
import { GraduationCap, Sliders, AlertTriangle, Lightbulb, BookOpen, School, HeartHandshake, Sparkles, Users } from "lucide-react";

export default function EducationDomainView() {
  const [ambientTemp, setAmbientTemp] = useState<number>(39);
  const [aqiValue, setAqiValue] = useState<number>(210);
  const [populationScale, setPopulationScale] = useState<number>(250000);
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod-01");

  const simulation = EducationSimulationEngine.runSimulation({
    ambientTempCelsius: ambientTemp,
    aqiValue,
    uvIndexValue: 8.5,
    populationScale,
    vulnerabilitySplit: {
      childrenPct: 22,
      elderlyPct: 18,
      asthmaPct: 14,
      generalPct: 46,
    },
  });

  const activeModule =
    EDUCATIONAL_MODULES.find((m) => m.id === selectedModuleId) ||
    EDUCATIONAL_MODULES[0];

  return (
    <div className="w-full space-y-7">
      {/* 1. Cinematic Education & Citizen Science Visual Banner */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl group">
        <img
          src="/images/climate_education_lab.jpg"
          alt="Interactive Climate Education & Citizen Science Center"
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aura-darkest via-black/40 to-black/60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-purple-400/40 text-xs font-mono text-purple-300 shadow-glow">
            <Users className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="font-bold">CITIZEN SCIENCE & DISASTER LAB</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-xs font-mono text-cyan-300">
            HOLOGRAPHIC CLIMATE SIMULATION
          </div>
        </div>

        {/* Bottom Banner Content Overlay */}
        <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>Public Health Democratization</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Interactive Climate Disaster Modeler & Community Curriculum
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-xl font-sans">
              Enables schools, researchers, and citizen volunteers to model compound heat-air pollution scenarios and master life-saving biological countermeasures.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-purple-950/50 p-3 rounded-2xl border border-purple-500/30 font-mono text-xs shrink-0">
            <BookOpen className="w-4 h-4 text-purple-300" />
            <div>
              <span className="text-gray-400 block text-[10px]">CURRICULUM:</span>
              <span className="text-white font-bold text-xs">4 Modules Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Climate Disaster Simulator */}
      <div className="p-6 sm:p-7 rounded-3xl border border-purple-500/25 bg-aura-card backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-aura-border">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white font-mono">
              WHAT-IF COMPOUND CRISIS SIMULATOR (LIVE SCENARIO ENGINE)
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Real-Time Mathematical Projection
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>AMBIENT TEMPERATURE:</span>
              <span className={ambientTemp >= 38 ? "text-red-400 font-bold" : "text-purple-300 font-bold"}>
                {ambientTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              step="1"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(parseInt(e.target.value))}
              className="w-full accent-purple-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>AIR QUALITY INDEX (AQI):</span>
              <span className={aqiValue >= 200 ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                {aqiValue} AQI
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="450"
              step="5"
              value={aqiValue}
              onChange={(e) => setAqiValue(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>POPULATION SCALE:</span>
              <span className="text-white font-bold font-mono">
                {(populationScale / 1000).toLocaleString()}k residents
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="25000"
              value={populationScale}
              onChange={(e) => setPopulationScale(parseInt(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        {/* Projected Impact Findings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">HEATSTROKE THREAT:</span>
            <span className={simulation.heatStrokeRiskIndex > 70 ? "text-red-400 font-black text-sm" : "text-purple-300 font-bold text-sm"}>
              {simulation.heatStrokeRiskIndex}/100 INDEX
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">PULMONARY SURGE:</span>
            <span className={simulation.pulmonaryEmergencyIndex > 70 ? "text-red-400 font-black text-sm" : "text-amber-300 font-bold text-sm"}>
              {simulation.pulmonaryEmergencyIndex}/100 INDEX
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">PROJECTED ER VISITS:</span>
            <span className="text-red-400 font-black text-sm">
              ~{simulation.projectedERVisitsPerHour} / hour
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">SCHOOL DIRECTIVE:</span>
            <span className={`font-bold text-xs ${
              simulation.schoolOutdoorStatus === "STRICT_INDOOR_CLOSURE"
                ? "text-red-400"
                : simulation.schoolOutdoorStatus === "RESTRICTED_RECESS"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}>
              {simulation.schoolOutdoorStatus}
            </span>
          </div>
        </div>

        {/* Simulated Emergency Advisories */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
            Autonomous Civic Directives Triggered:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {simulation.recommendedCitizenGuidance.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 font-bold">›</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Educational Modules & Myth vs Fact */}
      <div className="space-y-4">
        <label className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Health Literacy Curriculum:</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {EDUCATIONAL_MODULES.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModuleId(mod.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-purple-950/40 border-purple-400 text-white shadow-glow"
                    : "bg-aura-card border-aura-border text-gray-300 hover:border-purple-500/30"
                }`}
              >
                <div className="font-bold text-xs truncate">{mod.title}</div>
                <div className="text-[10px] text-purple-300 font-mono mt-1 uppercase">
                  Audience: {mod.targetAudience}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Module Details */}
        <div className="p-6 sm:p-7 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border">
            <h4 className="font-bold text-base text-white">
              {activeModule.title}
            </h4>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30 uppercase font-bold">
              {activeModule.domain} Domain
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
            {activeModule.keyTakeaway}
          </p>

          {/* Action Checklist & Myth vs Fact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-aura-surface border border-aura-border space-y-2.5">
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" /> Recommended Protocols:
              </span>
              <ul className="space-y-2 text-xs text-gray-300">
                {activeModule.actionChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Myth vs. Scientific Fact:
              </span>
              <div className="text-xs space-y-2">
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300">
                  <strong className="block text-red-400 mb-0.5">MYTH:</strong>"{activeModule.mythVsFact.myth}"
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                  <strong className="block text-emerald-400 mb-0.5">FACT:</strong>{activeModule.mythVsFact.fact}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
