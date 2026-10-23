"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CITIES, CityConfig } from "@/lib/cities";
import { VulnerabilityProfile, AgentPipelineResponse, ImpactDomain } from "@/lib/types";
import HeroCity3D from "@/components/HeroCity3D";
import CitySelector from "@/components/CitySelector";
import ProfileSelector from "@/components/ProfileSelector";
import EnvironmentalHud from "@/components/EnvironmentalHud";
import RiskBadge from "@/components/RiskBadge";
import AgentTracePanel from "@/components/AgentTracePanel";
import ActionPlanCard from "@/components/ActionPlanCard";
import InteractiveChecklist from "@/components/InteractiveChecklist";
import TimeWindowPlanner from "@/components/TimeWindowPlanner";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import DomainNavigator from "@/components/DomainNavigator";
import FoodRescueDomainView from "@/components/domains/FoodRescueDomainView";
import BusinessIntelligenceDomainView from "@/components/domains/BusinessIntelligenceDomainView";
import EducationDomainView from "@/components/domains/EducationDomainView";
import OpenInnovationDomainView from "@/components/domains/OpenInnovationDomainView";
import { Shield, RefreshCw, Activity, Layers } from "lucide-react";

export default function HomePage() {
  const [activeDomain, setActiveDomain] = useState<ImpactDomain>("health");
  const [selectedCity, setSelectedCity] = useState<CityConfig>(CITIES[0]); // Default Delhi
  const [selectedProfile, setSelectedProfile] = useState<VulnerabilityProfile>("asthma");
  const [pipelineData, setPipelineData] = useState<AgentPipelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = useCallback(async (city: CityConfig, profile: VulnerabilityProfile) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: city.id, profile }),
      });

      if (!res.ok) {
        throw new Error(`Pipeline API returned ${res.status}`);
      }

      const data: AgentPipelineResponse = await res.json();
      setPipelineData(data);
    } catch (err: any) {
      console.error("Pipeline fetch error:", err);
      setError("Failed to execute agent pipeline. Retrying with deterministic engine...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    runPipeline(selectedCity, selectedProfile);
  }, [selectedCity, selectedProfile, runPipeline]);

  return (
    <div className="min-h-screen bg-aura-darkest text-slate-100 flex flex-col font-sans">
      {/* ---------------------------------------------------------------------
          TOP NAVIGATION BAR
          --------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-aura-border bg-aura-darkest/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-400 to-emerald-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="w-full h-full bg-aura-darkest rounded-[10px] flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  DEMANDED <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  5-DOMAIN AGENTIC GRID
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block font-mono">
                AuraGuard Unified Multi-Agent Autonomous Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-aura-surface border border-aura-border text-xs font-mono text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HEALTH • FOOD • BUSINESS • EDUCATION • INNOVATION</span>
            </div>

            <button
              onClick={() => runPipeline(selectedCity, selectedProfile)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-xs font-mono text-cyan-300 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden sm:inline">{isLoading ? "SENSING..." : "LIVE TELEMETRY"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------
          MAIN CONTENT VIEWPORT
          --------------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-7">
        {/* Error Notification if any */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 font-mono flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => runPipeline(selectedCity, selectedProfile)}
              className="underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. FIVE-DOMAIN SELECTION CONTROLLER */}
        <section className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Real-World Impact Domain</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              Autonomous Multi-Agent Systems
            </span>
          </div>
          <DomainNavigator
            activeDomain={activeDomain}
            onSelectDomain={setActiveDomain}
          />
        </section>

        {/* 2. DYNAMIC DOMAIN RENDERING */}

        {/* DOMAIN A: HEALTHCARE & CLIMATE DEFENSE */}
        {activeDomain === "health" && (
          <div className="space-y-7 animate-fadeIn">
            {/* 3D Living Metropolis */}
            <section id="hero-3d-section" className="w-full">
              {pipelineData ? (
                <HeroCity3D
                  data={pipelineData.environmentalData}
                  riskLevel={pipelineData.assessment.overallRisk}
                />
              ) : (
                <div className="w-full h-[420px] rounded-2xl border border-aura-border bg-aura-surface flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-cyan-400 font-mono text-xs">
                    <Activity className="w-6 h-6 animate-spin" />
                    <span>Initializing 3D Procedural Metropolis & Open-Meteo Ingestion...</span>
                  </div>
                </div>
              )}
            </section>

            {/* City & Profile Selection */}
            <section id="city-profile-controls" className="w-full space-y-5 p-5 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md">
              <CitySelector
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
                isLoading={isLoading}
              />
              <div className="border-t border-white/5 pt-4">
                <ProfileSelector
                  selectedProfile={selectedProfile}
                  onSelectProfile={setSelectedProfile}
                  isLoading={isLoading}
                />
              </div>
            </section>

            {/* Environmental Sensor HUD */}
            {pipelineData && (
              <section className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <span>Environmental Sensor Array</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-emerald-400 font-bold">Open-Meteo Realtime Feed</span>
                  </h2>
                  <span className="text-[11px] font-mono text-gray-500">
                    Updated: {new Date(pipelineData.environmentalData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <EnvironmentalHud data={pipelineData.environmentalData} />
              </section>
            )}

            {/* Risk Badge */}
            {pipelineData && (
              <section className="w-full">
                <RiskBadge
                  assessment={pipelineData.assessment}
                  verification={pipelineData.verification}
                />
              </section>
            )}

            {/* Agent Trace Panel */}
            {pipelineData && (
              <section className="w-full">
                <AgentTracePanel
                  traces={pipelineData.traces}
                  totalDurationMs={pipelineData.totalPipelineDurationMs}
                  modelUsed={pipelineData.modelUsed}
                />
              </section>
            )}

            {/* Action Plan & Checklist */}
            {pipelineData && (
              <section className="w-full space-y-6">
                <TimeWindowPlanner bestWindow={pipelineData.bestThreeHourWindow} />

                <div id="printable-action-card">
                  <ActionPlanCard
                    plan={pipelineData.verification.finalPlan}
                    cityName={pipelineData.city}
                    profile={pipelineData.profile}
                    riskLevel={pipelineData.verification.verifiedRiskLevel}
                  />
                </div>

                <InteractiveChecklist
                  checklist={pipelineData.verification.finalPlan.checklist}
                />
              </section>
            )}
          </div>
        )}

        {/* DOMAIN B: FOOD SECURITY & BIO-RESCUE */}
        {activeDomain === "food" && (
          <div className="animate-fadeIn">
            <FoodRescueDomainView />
          </div>
        )}

        {/* DOMAIN C: BUSINESS INTELLIGENCE & ESG */}
        {activeDomain === "business" && (
          <div className="animate-fadeIn">
            <BusinessIntelligenceDomainView />
          </div>
        )}

        {/* DOMAIN D: EDUCATION & SCENARIO SIMULATION */}
        {activeDomain === "education" && (
          <div className="animate-fadeIn">
            <EducationDomainView />
          </div>
        )}

        {/* DOMAIN E: OPEN INNOVATION & SWARM PROTOCOL */}
        {activeDomain === "innovation" && (
          <div className="animate-fadeIn">
            <OpenInnovationDomainView />
          </div>
        )}

        {/* 3. MANDATORY CLINICAL & SAFETY DISCLAIMER */}
        <section className="w-full">
          <MedicalDisclaimer />
        </section>
      </main>

      {/* ---------------------------------------------------------------------
          FOOTER WITH ALL 5 COMPETITION DOMAINS
          --------------------------------------------------------------------- */}
      <footer className="border-t border-aura-border bg-black/60 py-8 px-4 sm:px-6 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">DEMANDED AI (AuraGuard Platform)</span>
            <span>•</span>
            <span>Built for "Build Beyond AI: Engineer Secure, Intelligent and Autonomous Applications"</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-cyan-400">
            <span>Healthcare</span>
            <span>•</span>
            <span>Food Security</span>
            <span>•</span>
            <span>Business ESG</span>
            <span>•</span>
            <span>Education</span>
            <span>•</span>
            <span>Open Innovation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
