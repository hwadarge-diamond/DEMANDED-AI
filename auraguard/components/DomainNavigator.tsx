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
              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
                isActive
                  ? "bg-gradient-to-br from-cyan-950/80 via-[#0a1824] to-[#040912] border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.01]"
                  : "bg-[#060e16]/80 border-cyan-500/15 text-gray-300 hover:border-cyan-400/40 hover:bg-[#091522]/90 hover:scale-[1.005]"
              }`}
            >
              {/* Crystalline Prismatic Sheen */}
              {isActive ? (
                <>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-cyan-400/30 transition-all" />
              )}
              
              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-cyan-500/30 to-indigo-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                      : "bg-white/5 text-gray-400 group-hover:text-cyan-300 group-hover:bg-cyan-950/40"
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-cyan-300 border border-cyan-500/20">
                  {tab.badge}
                </span>
              </div>

              <div>
                <div className="font-bold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
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
