"use client";

import React, { useState } from "react";
import { ActionPlan, VulnerabilityProfile, RiskLevel } from "@/lib/types";
import { CheckCircle, AlertTriangle, Printer, Share2, Copy, Check } from "lucide-react";

interface ActionPlanCardProps {
  plan: ActionPlan;
  cityName: string;
  profile: VulnerabilityProfile;
  riskLevel: RiskLevel;
}

export default function ActionPlanCard({
  plan,
  cityName,
  profile,
  riskLevel,
}: ActionPlanCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `AuraGuard Action Plan for ${cityName} (${profile.toUpperCase()}) - Risk: ${riskLevel}\n\nSUMMARY:\n${plan.summary}\n\nTOP 3 ACTIONS:\n1. ${plan.topActions[0]}\n2. ${plan.topActions[1]}\n3. ${plan.topActions[2]}\n\nTHINGS TO AVOID:\n- ${plan.thingsToAvoid.join("\n- ")}\n\nSAFE WINDOWS:\n- ${plan.safeWindows.join("\n- ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full p-6 rounded-2xl border border-teal-500/20 bg-aura-card backdrop-blur-md space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-aura-border gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-teal-400">
            Personalized Mitigation Protocol
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            Tailored Action Plan: {cityName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-aura-border bg-aura-surface hover:bg-aura-border text-xs font-mono text-gray-300 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED" : "SHARE PLAN"}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-500/40 bg-teal-950/40 hover:bg-teal-900/50 text-xs font-mono text-teal-300 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/30 text-sm text-gray-200 leading-relaxed">
        <strong className="text-teal-400 font-mono text-xs uppercase block mb-1">
          Clinical Guidance Briefing:
        </strong>
        {plan.summary}
      </div>

      {/* Top 3 Actions Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
          Top 3 Priority Actions for {profile}:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plan.topActions.map((action, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-aura-border bg-aura-surface/80 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  {i + 1}
                </span>
                <span className="text-xs font-mono text-gray-400 uppercase">
                  Action {i + 1}
                </span>
              </div>
              <p className="text-xs text-white leading-relaxed font-medium">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid and Safe Windows Split Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Things to Avoid */}
        <div className="p-4 rounded-xl bg-red-950/15 border border-red-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>High-Risk Behaviors to Avoid</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {plan.thingsToAvoid.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safe Windows */}
        <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
            <CheckCircle className="w-4 h-4" />
            <span>Safe Outdoor Time Windows</span>
          </div>
          <ul className="space-y-1.5 text-xs text-gray-300">
            {plan.safeWindows.map((window, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{window}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
