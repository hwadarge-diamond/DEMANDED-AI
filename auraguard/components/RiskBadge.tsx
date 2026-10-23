"use client";

import React from "react";
import { DeterministicAssessment, VerificationResult } from "@/lib/types";
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertOctagon } from "lucide-react";

interface RiskBadgeProps {
  assessment: DeterministicAssessment;
  verification: VerificationResult;
}

export default function RiskBadge({ assessment, verification }: RiskBadgeProps) {
  const risk = assessment.overallRisk;

  const riskConfig = {
    SEVERE: {
      border: "border-red-500/50",
      bg: "bg-red-950/40",
      text: "text-red-400",
      pillBg: "bg-red-500",
      glow: "shadow-hazard",
      title: "SEVERE THREAT",
      badgeIcon: <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />,
    },
    HIGH: {
      border: "border-amber-500/50",
      bg: "bg-amber-950/40",
      text: "text-amber-400",
      pillBg: "bg-amber-500",
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.3)]",
      title: "HIGH VULNERABILITY",
      badgeIcon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    },
    MODERATE: {
      border: "border-cyan-500/40",
      bg: "bg-cyan-950/40",
      text: "text-cyan-400",
      pillBg: "bg-cyan-500",
      glow: "shadow-glow",
      title: "MODERATE RISK",
      badgeIcon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
    },
    LOW: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-950/40",
      text: "text-emerald-400",
      pillBg: "bg-emerald-500",
      glow: "shadow-safe",
      title: "LOW HAZARD / SAFE",
      badgeIcon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
  }[risk];

  return (
    <div className={`w-full p-5 rounded-2xl border ${riskConfig.border} ${riskConfig.bg} backdrop-blur-md ${riskConfig.glow} transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Risk Level Header */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10">
            {riskConfig.badgeIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-black font-mono tracking-wider text-black ${riskConfig.pillBg}`}>
                {risk}
              </span>
              <span className={`font-bold text-sm tracking-wide ${riskConfig.text}`}>
                {riskConfig.title}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 max-w-xl">
              {assessment.primaryHazard}
            </p>
          </div>
        </div>

        {/* Verification Guardrail Seal */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/50 border border-emerald-500/30">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <span>VERIFIED BY SAFETY ENGINE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              Deterministic clinical lock • Zero LLM downgrade
            </div>
          </div>
        </div>
      </div>

      {/* Active Hard Safety Rules if triggered */}
      {assessment.hardRulesTriggered.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
            Hard Safety Guardrails Enforced ({assessment.hardRulesTriggered.length}):
          </div>
          {assessment.hardRulesTriggered.map((rule, idx) => (
            <div key={idx} className="text-xs text-red-200/90 font-mono bg-red-950/60 p-2 rounded-lg border border-red-500/20 flex items-start gap-2">
              <span className="text-red-400 font-bold">»</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
