"use client";

import React from "react";
import { EnvironmentalData } from "@/lib/types";
import { Thermometer, Wind, Sun, Droplets, AlertTriangle, ShieldCheck } from "lucide-react";

interface EnvironmentalHudProps {
  data: EnvironmentalData;
}

export default function EnvironmentalHud({ data }: EnvironmentalHudProps) {
  const isHighHeat = data.apparentTemperature >= 35;
  const isHighPm25 = data.pm25 >= 35;
  const isHighUv = data.uvIndex >= 8;

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Heat & Temperature Card */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
        isHighHeat
          ? "bg-orange-950/20 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]"
          : "bg-aura-card border-aura-border"
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span>THERMAL INDEX</span>
          </span>
          {isHighHeat ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> HEAT STRESS
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NOMINAL
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {data.temperature}°C
          </span>
          <span className="text-xs text-gray-400 font-mono">
            Feels like <strong className="text-white">{data.apparentTemperature}°C</strong>
          </span>
        </div>

        <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHighHeat ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-emerald-400"
            }`}
            style={{ width: `${Math.min(100, (data.apparentTemperature / 50) * 100)}%` }}
          />
        </div>
      </div>

      {/* 2. Particulate Matter PM2.5 & AQI Card */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
        isHighPm25
          ? "bg-amber-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          : "bg-aura-card border-aura-border"
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-amber-400" />
            <span>AIR PURITY (PM2.5)</span>
          </span>
          {isHighPm25 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> SMOG ALERT
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CLEAN
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {data.pm25}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            µg/m³ • AQI <strong className="text-white">{data.aqi}</strong>
          </span>
        </div>

        <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHighPm25 ? "bg-gradient-to-r from-amber-400 to-red-500" : "bg-cyan-400"
            }`}
            style={{ width: `${Math.min(100, (data.pm25 / 150) * 100)}%` }}
          />
        </div>
      </div>

      {/* 3. Solar UV Radiation Card */}
      <div className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
        isHighUv
          ? "bg-purple-950/20 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          : "bg-aura-card border-aura-border"
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-purple-400" />
            <span>SOLAR UV INDEX</span>
          </span>
          {isHighUv ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              VERY HIGH
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
              SAFE / MODERATE
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {data.uvIndex}
          </span>
          <span className="text-xs text-gray-400 font-mono">
            Max Burn Time:{" "}
            <strong className="text-white">
              {data.uvIndex >= 10 ? "< 15 mins" : data.uvIndex >= 7 ? "25 mins" : "> 60 mins"}
            </strong>
          </span>
        </div>

        <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHighUv ? "bg-gradient-to-r from-purple-400 to-pink-500" : "bg-yellow-400"
            }`}
            style={{ width: `${Math.min(100, (data.uvIndex / 12) * 100)}%` }}
          />
        </div>
      </div>

      {/* 4. Ambient Humidity & Air Flow Card */}
      <div className="p-4 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span>ATMOSPHERE & WIND</span>
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-700 text-gray-300">
            {data.windSpeed} km/h
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {data.humidity}%
          </span>
          <span className="text-xs text-gray-400 font-mono">
            Humidity • Dewpoint Comfort
          </span>
        </div>

        <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-500"
            style={{ width: `${data.humidity}%` }}
          />
        </div>
      </div>
    </div>
  );
}
