"use client";

import React, { useState } from "react";
import {
  SAMPLE_FOOD_DONATIONS,
  FoodRescueEngine,
} from "@/lib/domains/food-agent";
import { FoodDonationItem, FoodRescueMission } from "@/lib/types";
import { Utensils, ShieldCheck, AlertOctagon, Truck, Sparkles, Navigation, Droplets, ThermometerSnowflake, Plane } from "lucide-react";

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
    setDispatchStatus("Autonomous EV Drone Dispatch #FRU-817 Cleared • ETA: 12 Minutes");
  };

  const haccp = activeMission.verification;
  const isAccepted = haccp.decision === "ACCEPTED";
  const isRejected = haccp.decision === "REJECTED_BIOHAZARD";

  return (
    <div className="w-full space-y-7">
      {/* 1. Futuristic Hero Cinematic Visual Banner */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl group">
        <img
          src="/images/food_rescue_drone.jpg"
          alt="Autonomous Food Rescue Electric Drone Logistics"
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aura-darkest via-black/40 to-black/60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-5 left-5 z-10 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-emerald-400/40 text-xs font-mono text-emerald-300 shadow-safe">
            <Plane className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold">AERODYNAMIC RESCUE FLEET ACTIVE</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-xs font-mono text-cyan-300">
            BIOMETRIC COLD-CHAIN LOCK
          </div>
        </div>

        {/* Bottom Banner Content Overlay */}
        <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
              <Utensils className="w-4 h-4" />
              <span>Bio-Safety Cold-Chain Transport</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Autonomous Surplus-Food Rescue & HACCP Verification Grid
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-xl font-sans">
              Instant microbiological pathogen classification, temperature danger zone auditing, and autonomous last-mile drone dispatch to high-priority community shelters.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 font-mono text-xs shrink-0">
            <div>
              <span className="text-gray-400 block text-[10px]">CARBON DIVERTED:</span>
              <span className="text-emerald-400 font-bold text-sm">+{activeMission.carbonOffsetKg} kg CO2e</span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-gray-400 block text-[10px]">NUTRITION DELIVERED:</span>
              <span className="text-white font-bold text-sm">{activeMission.mealsServed} Meals</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Preset Surplus Food Reports Selector */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Select Commercial Food Surplus Submission:</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_FOOD_DONATIONS.map((item) => {
            const isSelected = selectedDonation.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectDonation(item)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-400 text-white shadow-safe"
                    : "bg-aura-card border-aura-border text-gray-300 hover:border-emerald-500/30 hover:bg-aura-surface"
                }`}
              >
                <div className="font-bold text-xs truncate">{item.foodName}</div>
                <div className="text-[11px] text-gray-400 mt-1">{item.donorName}</div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-emerald-300 pt-2 border-t border-white/5">
                  <span>{item.quantityKg} kg ({item.portions} portions)</span>
                  <span className="flex items-center gap-1">
                    <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />
                    {item.storageTempCelsius}°C
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Two-Column Details: HACCP Verification + Shelter Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: HACCP Bio-Safety Evaluation Card */}
        <div className={`p-6 rounded-3xl border backdrop-blur-md space-y-4 ${
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

            <span className={`px-3 py-1 rounded-full text-xs font-mono font-black ${
              isAccepted
                ? "bg-emerald-500 text-black shadow-safe"
                : isRejected
                ? "bg-red-500 text-white shadow-hazard"
                : "bg-amber-500 text-black"
            }`}>
              {haccp.decision}
            </span>
          </div>

          <div className="text-xs text-gray-200 leading-relaxed font-sans">
            <strong className="text-white block mb-1 font-mono uppercase text-[11px]">
              Microbiological Inspector Rationale:
            </strong>
            {haccp.haccpReason}
          </div>

          {/* Pathogen Risk Meter */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>Bacterial Pathogen Proliferation Risk:</span>
              <span className={haccp.pathogenGrowthScore > 0.5 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {Math.round(haccp.pathogenGrowthScore * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
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
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-300">
              ⚠️ <strong>FDA THERMAL DANGER ZONE VIOLATION:</strong> Stored between 4°C and 60°C for {selectedDonation.hoursSincePrepared} hours without blast chilling.
            </div>
          )}

          {/* Active Allergen Warning */}
          {selectedDonation.hasAllergens.length > 0 && (
            <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2 pt-1">
              <span>Identified Allergens:</span>
              <span className="text-amber-300 font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {selectedDonation.hasAllergens.join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Right: Shelter Matching & Dispatch Card */}
        <div className="p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white font-mono">
                OPTIMAL RECIPIENT MATCH
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              Priority Ranking Algorithm
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-aura-surface border border-aura-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">
                {activeMission.matchedShelter.shelterName}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                {activeMission.matchedShelter.urgency} NEED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono text-gray-300 border-t border-white/5">
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
                <span className={activeMission.matchedShelter.hasRefrigeration ? "text-emerald-400 font-bold" : "text-gray-500"}>
                  {activeMission.matchedShelter.hasRefrigeration ? "Equipped" : "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Dispatch Action Button */}
          {isAccepted && (
            <div className="pt-2">
              <button
                onClick={handleDispatch}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-safe transition-all active:scale-[0.98]"
              >
                <Truck className="w-4 h-4" />
                <span>DISPATCH AUTONOMOUS VOLUNTEER & DRONE RESCUE</span>
              </button>
            </div>
          )}

          {isRejected && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300 text-center">
              🚫 Dispatch halted: Microbiological pathogen risk exceeds human safety limits.
            </div>
          )}

          {dispatchStatus && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-400/40 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
              <span>{dispatchStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
