"use client";

import React, { useState } from "react";
import {
  SAMPLE_FOOD_DONATIONS,
  FoodRescueEngine,
} from "@/lib/domains/food-agent";
import { FoodDonationItem, FoodRescueMission } from "@/lib/types";
import { Utensils, ShieldCheck, AlertOctagon, CheckCircle2, Truck, Sparkles, Navigation } from "lucide-react";

export default function FoodRescueDomainView() {
  const [selectedDonation, setSelectedDonation] = useState<FoodDonationItem>(
    SAMPLE_FOOD_DONATIONS[0]
  );
  const [activeMission, setActiveMission] = useState<FoodRescueMission>(
    FoodRescueEngine.processDonation(SAMPLE_FOOD_DONATIONS[0])
  );
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleSelectDonation = (item: FoodDonationItem) => {
    setSelectedDonation(item);
    const mission = FoodRescueEngine.processDonation(item);
    setActiveMission(mission);
    setDispatchStatus(null);
  };

  const handleDispatch = () => {
    setDispatchStatus("Autonomous Rider Assigned (Drone / EV Cargo Bike in Transit)");
  };

  const haccp = activeMission.verification;
  const isAccepted = haccp.decision === "ACCEPTED";
  const isRejected = haccp.decision === "REJECTED_BIOHAZARD";

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-aura-card to-aura-darkest backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
            <Utensils className="w-4 h-4" />
            <span>Autonomous Food Rescue & Perishable Safety Grid</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Bio-Safety HACCP Verification & Dynamic Shelter Logistics
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Turns edible surplus reports into safe, temperature-verified distributions. Autonomous agents check microbial danger zones and dispatch volunteers to high-need shelters.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs">
          <div>
            <span className="text-gray-500 block text-[10px]">CARBON DIVERTED:</span>
            <span className="text-emerald-400 font-bold text-sm">+{activeMission.carbonOffsetKg} kg CO2e</span>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-gray-500 block text-[10px]">MEALS SERVED:</span>
            <span className="text-white font-bold text-sm">{activeMission.mealsServed} portions</span>
          </div>
        </div>
      </div>

      {/* Preset Surplus Food Reports Selector */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-emerald-400">
          Select Surplus Food Report Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_FOOD_DONATIONS.map((item) => {
            const isSelected = selectedDonation.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectDonation(item)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-400 text-white shadow-safe"
                    : "bg-aura-card border-aura-border text-gray-300 hover:border-emerald-500/30 hover:bg-aura-surface"
                }`}
              >
                <div className="font-bold text-xs truncate">{item.foodName}</div>
                <div className="text-[11px] text-gray-400 mt-1">{item.donorName}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-emerald-300">
                  <span>{item.quantityKg} kg ({item.portions} portions)</span>
                  <span>{item.storageTempCelsius}°C</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Details: HACCP Verification + Shelter Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: HACCP Bio-Safety Evaluation Card */}
        <div className={`p-5 rounded-2xl border backdrop-blur-md space-y-4 ${
          isAccepted
            ? "bg-emerald-950/20 border-emerald-500/40"
            : isRejected
            ? "bg-red-950/20 border-red-500/40 shadow-hazard"
            : "bg-amber-950/20 border-amber-500/40"
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {isAccepted ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : isRejected ? (
                <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              )}
              <h3 className="font-bold text-sm text-white font-mono">
                HACCP BIO-SAFETY DECISION
              </h3>
            </div>

            <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-black ${
              isAccepted
                ? "bg-emerald-500 text-black"
                : isRejected
                ? "bg-red-500 text-white"
                : "bg-amber-500 text-black"
            }`}>
              {haccp.decision}
            </span>
          </div>

          <div className="text-xs text-gray-200 leading-relaxed">
            <strong className="text-white block mb-1 font-mono uppercase text-[11px]">
              Microbiological Inspector Rationale:
            </strong>
            {haccp.haccpReason}
          </div>

          {/* Pathogen Risk Meter */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>Pathogen Growth Risk Index:</span>
              <span className={haccp.pathogenGrowthScore > 0.5 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {Math.round(haccp.pathogenGrowthScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  haccp.pathogenGrowthScore > 0.5
                    ? "bg-gradient-to-r from-amber-500 to-red-500"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${haccp.pathogenGrowthScore * 100}%` }}
              />
            </div>
          </div>

          {/* Thermal Danger Zone Alert */}
          {haccp.thermalDangerZoneViolated && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs font-mono text-red-300">
              ⚠️ <strong>FDA THERMAL DANGER ZONE VIOLATION:</strong> Food sat between 4°C and 60°C for {selectedDonation.hoursSincePrepared} hours.
            </div>
          )}

          {/* Active Allergen Warning */}
          {selectedDonation.hasAllergens.length > 0 && (
            <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
              <span>Identified Allergens:</span>
              <span className="text-amber-300 font-bold uppercase">
                {selectedDonation.hasAllergens.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Right: Shelter Matching & Dispatch Card */}
        <div className="p-5 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white font-mono">
                OPTIMAL RECIPIENT MATCH
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Priority Ranking
            </span>
          </div>

          <div className="p-4 rounded-xl bg-aura-surface border border-aura-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">
                {activeMission.matchedShelter.shelterName}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                {activeMission.matchedShelter.urgency} NEED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono text-gray-300">
              <div>
                <span className="text-gray-500 block text-[10px]">DISTANCE:</span>
                <span className="font-bold text-white">{activeMission.matchedShelter.distanceKm} km</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">TRANSIT TIME:</span>
                <span className="font-bold text-cyan-400">{activeMission.matchedShelter.transitMinutes} mins</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">REFRIGERATION:</span>
                <span className={activeMission.matchedShelter.hasRefrigeration ? "text-emerald-400" : "text-gray-500"}>
                  {activeMission.matchedShelter.hasRefrigeration ? "Available" : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Dispatch Action Button */}
          {isAccepted && (
            <div className="pt-2">
              <button
                onClick={handleDispatch}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-safe transition-all"
              >
                <Truck className="w-4 h-4" />
                <span>DISPATCH AUTONOMOUS VOLUNTEER RESCUE ROUTE</span>
              </button>
            </div>
          )}

          {isRejected && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 text-center">
              🚫 Dispatch halted: Microbiological pathogen risk exceeds human safety limits.
            </div>
          )}

          {dispatchStatus && (
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-400/40 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{dispatchStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
