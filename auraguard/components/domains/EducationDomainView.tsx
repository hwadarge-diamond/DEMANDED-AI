"use client";

import React, { useState } from "react";
import {
  EDUCATIONAL_MODULES,
  EducationSimulationEngine,
} from "@/lib/domains/education-agent";
import { GraduationCap, Sliders, AlertTriangle, Lightbulb, BookOpen, School, HeartHandshake } from "lucide-react";

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
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-aura-card to-aura-darkest backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase font-bold">
            <GraduationCap className="w-4 h-4" />
            <span>Education, Scenario Modeling & Citizen Science</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Interactive Climate-Health Disaster Simulator & Community Curriculum
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Democratizes public health literacy. Enables students, municipal planners, and citizens to simulate compound heat-air pollution crises and learn life-saving physiological countermeasures.
          </p>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <div>
            <span className="text-gray-400 block text-[10px]">OPEN CURRICULUM:</span>
            <span className="text-white font-bold">4 Clinical Modules Active</span>
          </div>
        </div>
      </div>

      {/* Interactive Climate Disaster Simulator */}
      <div className="p-6 rounded-2xl border border-purple-500/25 bg-aura-card backdrop-blur-md space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-aura-border">
          <Sliders className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-sm text-white font-mono">
            WHAT-IF COMPOUND CRISIS SIMULATOR (REAL-TIME MODELING)
          </h3>
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
              <span>METROPOLITAN POPULATION:</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">HEATSTROKE THREAT:</span>
            <span className={simulation.heatStrokeRiskIndex > 70 ? "text-red-400 font-black text-sm" : "text-purple-300 font-bold"}>
              {simulation.heatStrokeRiskIndex}/100 INDEX
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">PULMONARY SURGE:</span>
            <span className={simulation.pulmonaryEmergencyIndex > 70 ? "text-red-400 font-black text-sm" : "text-amber-300 font-bold"}>
              {simulation.pulmonaryEmergencyIndex}/100 INDEX
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">PROJECTED ER VISITS:</span>
            <span className="text-red-400 font-black text-sm">
              ~{simulation.projectedERVisitsPerHour} / hour
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">SCHOOL DIRECTIVE:</span>
            <span className={`font-bold ${
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
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">
            Autonomous Civic Directives Triggered:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {simulation.recommendedCitizenGuidance.map((rec, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-gray-300 flex items-start gap-2">
                <span className="text-purple-400 font-bold">›</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Educational Modules & Myth vs Fact */}
      <div className="space-y-4">
        <label className="text-xs font-mono uppercase tracking-wider text-purple-400">
          Community Health Literacy Curriculum:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {EDUCATIONAL_MODULES.map((mod) => {
            const isSelected = mod.id === selectedModuleId;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModuleId(mod.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
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
        <div className="p-6 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border">
            <h4 className="font-bold text-base text-white">
              {activeModule.title}
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30 uppercase">
              {activeModule.domain} Domain
            </span>
          </div>

          <p className="text-xs text-gray-200 leading-relaxed">
            {activeModule.keyTakeaway}
          </p>

          {/* Action Checklist & Myth vs Fact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-aura-surface border border-aura-border space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" /> Recommended Protocols:
              </span>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {activeModule.actionChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Myth vs. Scientific Fact:
              </span>
              <div className="text-xs space-y-1.5">
                <div className="text-red-300">
                  <strong>Myth: </strong>"{activeModule.mythVsFact.myth}"
                </div>
                <div className="text-emerald-300">
                  <strong>Fact: </strong>{activeModule.mythVsFact.fact}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
