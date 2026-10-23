"use client";

import React from "react";
import { VulnerabilityProfile } from "@/lib/types";
import { User, Baby, HeartPulse, Wind, HardHat } from "lucide-react";

interface ProfileSelectorProps {
  selectedProfile: VulnerabilityProfile;
  onSelectProfile: (profile: VulnerabilityProfile) => void;
  isLoading?: boolean;
}

interface ProfileOption {
  id: VulnerabilityProfile;
  label: string;
  icon: React.ReactNode;
  subtitle: string;
  vulnerabilityTag: string;
}

const PROFILES: ProfileOption[] = [
  {
    id: "general",
    label: "General Public",
    icon: <User className="w-4 h-4" />,
    subtitle: "Standard adult baseline",
    vulnerabilityTag: "Standard Thresholds",
  },
  {
    id: "asthma",
    label: "Asthma / Respiratory",
    icon: <Wind className="w-4 h-4" />,
    subtitle: "Airway hyperreactivity",
    vulnerabilityTag: "PM2.5 Trigger: 25µg",
  },
  {
    id: "elderly",
    label: "Senior (65+)",
    icon: <HeartPulse className="w-4 h-4" />,
    subtitle: "Thermoregulation strain",
    vulnerabilityTag: "Heat Trigger: 33°C",
  },
  {
    id: "child",
    label: "Child (< 12 yrs)",
    icon: <Baby className="w-4 h-4" />,
    subtitle: "Developing pulmonary system",
    vulnerabilityTag: "UV & Smog Sensitivity",
  },
  {
    id: "outdoor_worker",
    label: "Outdoor Worker",
    icon: <HardHat className="w-4 h-4" />,
    subtitle: "Prolonged occupational exertion",
    vulnerabilityTag: "Exertional WBGT Limits",
  },
];

export default function ProfileSelector({
  selectedProfile,
  onSelectProfile,
  isLoading,
}: ProfileSelectorProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-teal-400 flex items-center gap-2">
          <span>Personal Vulnerability Profile</span>
        </label>
        <span className="text-xs text-gray-400 font-mono">
          Clinical Tailoring
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PROFILES.map((p) => {
          const isSelected = selectedProfile === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "bg-teal-950/40 border-teal-400 text-white shadow-safe"
                  : "bg-aura-card border-aura-border text-gray-300 hover:border-teal-500/40 hover:bg-aura-surface"
              } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className={isSelected ? "text-teal-300" : "text-gray-400"}>
                  {p.icon}
                </span>
                <span className="font-semibold text-xs truncate">{p.label}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 line-clamp-1">{p.subtitle}</p>
              <div className="mt-2 text-[10px] text-teal-400 font-mono">
                {p.vulnerabilityTag}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
