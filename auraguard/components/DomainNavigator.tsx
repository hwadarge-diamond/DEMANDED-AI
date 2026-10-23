"use client";

import React from "react";
import { ImpactDomain } from "@/lib/types";
import { HeartPulse, Utensils, BarChart3, GraduationCap, Network } from "lucide-react";

interface DomainNavigatorProps {
  activeDomain: ImpactDomain;
  onSelectDomain: (domain: ImpactDomain) => void;
}

interface DomainTab {
  id: ImpactDomain;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  badge: string;
}

const DOMAIN_TABS: DomainTab[] = [
  {
    id: "health",
    label: "Healthcare & Climate",
    sublabel: "3D Living Metropolis & Clinical Guard",
    icon: <HeartPulse className="w-4 h-4" />,
    badge: "Live Telemetry",
  },
  {
    id: "food",
    label: "Food Security & Bio-Rescue",
    sublabel: "HACCP Safety & Shelter Logistics",
    icon: <Utensils className="w-4 h-4" />,
    badge: "HACCP Certified",
  },
  {
    id: "business",
    label: "Business Intelligence & ESG",
    sublabel: "Scope 3 Carbon & Workforce Liability",
    icon: <BarChart3 className="w-4 h-4" />,
    badge: "ESG Analytics",
  },
  {
    id: "education",
    label: "Education & Simulation",
    sublabel: "Citizen Scenario Modeler & Literacy",
    icon: <GraduationCap className="w-4 h-4" />,
    badge: "Interactive Sim",
  },
  {
    id: "innovation",
    label: "Open Innovation Swarm",
    sublabel: "Autonomous Multi-Agent Ledger",
    icon: <Network className="w-4 h-4" />,
    badge: "SHA-256 Ledger",
  },
];

export default function DomainNavigator({
  activeDomain,
  onSelectDomain,
}: DomainNavigatorProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {DOMAIN_TABS.map((tab) => {
          const isActive = activeDomain === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectDomain(tab.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isActive
                  ? "bg-gradient-to-br from-cyan-950/60 to-aura-surface border-cyan-400 text-white shadow-glow"
                  : "bg-aura-card border-aura-border text-gray-300 hover:border-cyan-500/40 hover:bg-aura-surface"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />
              )}
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className={`p-1.5 rounded-lg ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-white/5">
                  {tab.badge}
                </span>
              </div>

              <div>
                <div className="font-bold text-xs sm:text-sm tracking-tight text-white">
                  {tab.label}
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-0.5 line-clamp-1">
                  {tab.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
