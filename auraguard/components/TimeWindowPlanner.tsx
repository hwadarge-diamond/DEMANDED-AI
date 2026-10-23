"use client";

import React from "react";
import { Sparkles, Clock, Sun, Moon } from "lucide-react";

interface TimeWindowPlannerProps {
  bestWindow: {
    startHour: string;
    endHour: string;
    avgTemp: number;
    avgAqi: number;
    reason: string;
  };
}

export default function TimeWindowPlanner({ bestWindow }: TimeWindowPlannerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const startHourInt = parseInt(bestWindow.startHour.split(":")[0], 10);
  const endHourInt = parseInt(bestWindow.endHour.split(":")[0], 10);

  return (
    <div className="w-full p-5 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aura-border gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm text-white font-mono tracking-wide">
            BEST 3-HOUR OUTDOOR WINDOW TODAY
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-safe">
            <Clock className="w-3.5 h-3.5" />
            <span>{bestWindow.startHour} - {bestWindow.endHour}</span>
          </span>
        </div>
      </div>

      {/* 24-Hour Timeline Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> 00:00</span>
          <span>06:00</span>
          <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-yellow-500" /> 12:00</span>
          <span>18:00</span>
          <span className="flex items-center gap-1"><Moon className="w-3 h-3" /> 23:59</span>
        </div>

        <div className="grid grid-cols-24 gap-0.5 h-6 rounded-lg overflow-hidden bg-gray-900 p-0.5 border border-white/10">
          {hours.map((h) => {
            const isOptimal = h >= startHourInt && h <= endHourInt;
            const isPeakHeat = h >= 12 && h <= 16;
            return (
              <div
                key={h}
                title={`${h}:00 - ${isOptimal ? "Optimal Window" : isPeakHeat ? "Peak Thermal Burden" : "Standard"}`}
                className={`h-full rounded-sm transition-all ${
                  isOptimal
                    ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                    : isPeakHeat
                    ? "bg-red-950/60 hover:bg-red-800/60"
                    : "bg-gray-800/80 hover:bg-gray-700"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Details Box */}
      <div className="p-3.5 rounded-xl bg-aura-surface border border-aura-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-gray-300 leading-relaxed font-sans max-w-xl">
          <span className="font-mono text-emerald-400 font-bold mr-1">RATIONALE:</span>
          {bestWindow.reason}
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400 shrink-0">
          <div>
            <span className="text-gray-500">EST. TEMP: </span>
            <span className="text-white font-bold">{bestWindow.avgTemp}°C</span>
          </div>
          <div>
            <span className="text-gray-500">EST. AQI: </span>
            <span className="text-white font-bold">{bestWindow.avgAqi}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
