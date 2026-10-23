"use client";

import React, { useState } from "react";
import { BusinessIntelligenceEngine } from "@/lib/domains/business-agent";
import { BarChart3, TrendingUp, DollarSign, Droplets, HardHat, FileSpreadsheet, Check } from "lucide-react";

export default function BusinessIntelligenceDomainView() {
  const esg = BusinessIntelligenceEngine.generateESGReport();

  const [industry, setIndustry] = useState<"construction" | "delivery_logistics" | "manufacturing" | "agriculture">("construction");
  const [workforceCount, setWorkforceCount] = useState<number>(250);
  const [apparentTemp, setApparentTemp] = useState<number>(38);
  const [exported, setExported] = useState<boolean>(false);

  const workforceImpact = BusinessIntelligenceEngine.calculateWorkforceImpact(
    industry,
    workforceCount,
    apparentTemp
  );

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-aura-card to-aura-darkest backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>Corporate ESG Intelligence & Supply-Chain Climate Liability</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Real-Time Scope 3 Carbon Accounting & Economic Loss Prevention
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Translates environmental and food diversion data into auditable corporate ESG metrics, tax deduction ledgers, and OSHA occupational heat risk mitigation models.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-400/40 bg-cyan-950/60 hover:bg-cyan-900/60 text-xs font-mono text-cyan-300 font-bold transition-all shadow-glow shrink-0"
        >
          {exported ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>{exported ? "ESG REPORT GENERATED" : "EXPORT AUDITABLE ESG CSV"}</span>
        </button>
      </div>

      {/* Primary ESG Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-aura-border bg-aura-card">
          <span className="text-[10px] font-mono text-gray-400 uppercase">GHG AVOIDED</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {esg.co2eAvertedTons} <span className="text-xs font-normal text-gray-400">Tons CO2e</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            {esg.methaneAvertedKg} kg anaerobic methane halted
          </p>
        </div>

        <div className="p-4 rounded-xl border border-aura-border bg-aura-card">
          <span className="text-[10px] font-mono text-gray-400 uppercase">ECONOMIC VALUE PRESERVED</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            ${esg.economicValuePreservedUsd.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            {esg.totalMealsDistributed.toLocaleString()} meals distributed
          </p>
        </div>

        <div className="p-4 rounded-xl border border-aura-border bg-aura-card">
          <span className="text-[10px] font-mono text-gray-400 uppercase">WATER CONSERVATION</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {(esg.waterSavedLiters / 1000000).toFixed(2)}M <span className="text-xs font-normal text-gray-400">Liters</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            Embedded agricultural water saved
          </p>
        </div>

        <div className="p-4 rounded-xl border border-aura-border bg-aura-card">
          <span className="text-[10px] font-mono text-gray-400 uppercase">CORPORATE TAX BENEFIT</span>
          <div className="text-2xl font-black text-teal-300 mt-1">
            ${esg.corporateTaxIncentiveEligibleUsd.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            IRS 170(e)(3) deduction eligible
          </p>
        </div>
      </div>

      {/* Workforce Climate Stress & Liability Calculator */}
      <div className="p-6 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aura-border gap-2">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white font-mono">
              OCCUPATIONAL WORKFORCE CLIMATE LIABILITY SIMULATOR
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">
            OSHA / NIOSH Heat Index Guidelines
          </span>
        </div>

        {/* Controls: Industry + Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1.5">INDUSTRY SECTOR:</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-aura-border bg-aura-surface text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="construction">Civil Construction & Infrastructure</option>
              <option value="delivery_logistics">Last-Mile Delivery & Logistics</option>
              <option value="manufacturing">Heavy Industrial Manufacturing</option>
              <option value="agriculture">Commercial Agriculture & Harvesting</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
              <span>WORKFORCE COUNT:</span>
              <span className="text-white font-bold">{workforceCount} workers</span>
            </div>
            <input
              type="range"
              min="20"
              max="1500"
              step="10"
              value={workforceCount}
              onChange={(e) => setWorkforceCount(parseInt(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
              <span>SIMULATED APPARENT TEMP:</span>
              <span className={apparentTemp >= 38 ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                {apparentTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="26"
              max="48"
              step="1"
              value={apparentTemp}
              onChange={(e) => setApparentTemp(parseInt(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>

        {/* Dynamic Simulation Output Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">HEAT THREAT:</span>
            <span className={`font-bold ${
              workforceImpact.currentRiskLevel === "SEVERE"
                ? "text-red-400 font-black"
                : workforceImpact.currentRiskLevel === "HIGH"
                ? "text-amber-400 font-black"
                : "text-emerald-400"
            }`}>
              {workforceImpact.currentRiskLevel} RISK
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">REST PROTOCOL:</span>
            <span className="text-white font-bold">
              {workforceImpact.recommendedRestCycleMinutes} min / hour in shade
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">HYDRATION TARGET:</span>
            <span className="text-cyan-400 font-bold">
              {workforceImpact.hydrationRequirementLitersPerWorker} L / worker / hr
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">PREVENTED LABOR LOSS:</span>
            <span className="text-emerald-400 font-bold">
              +{workforceImpact.preventedLostLaborHours} hours saved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
