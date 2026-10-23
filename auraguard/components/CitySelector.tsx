"use client";

import React from "react";
import { CITIES, CityConfig } from "@/lib/cities";
import { MapPin, Sparkles } from "lucide-react";

interface CitySelectorProps {
  selectedCity: CityConfig;
  onSelectCity: (city: CityConfig) => void;
  isLoading?: boolean;
}

export default function CitySelector({
  selectedCity,
  onSelectCity,
  isLoading,
}: CitySelectorProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>Target Monitored City</span>
        </label>
        <span className="text-xs text-gray-400 font-mono">
          Open-Meteo Realtime Feed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CITIES.map((city) => {
          const isSelected = selectedCity.id === city.id;
          return (
            <button
              key={city.id}
              onClick={() => onSelectCity(city)}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "bg-cyan-950/40 border-cyan-400 text-white shadow-glow"
                  : "bg-aura-card border-aura-border text-gray-300 hover:border-cyan-500/40 hover:bg-aura-surface"
              } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-sm">{city.name}</span>
                {isSelected && <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />}
              </div>
              <span className="text-xs text-gray-400 mt-1">{city.country}</span>
              <div className="mt-2 text-[10px] text-gray-500 font-mono truncate">
                {city.typicalHazard.split("&")[0]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
