"use client";

import React, { useState } from "react";
import { AgentStepTrace } from "@/lib/types";
import { Cpu, CheckCircle, ChevronDown, ChevronUp, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface AgentTracePanelProps {
  traces: AgentStepTrace[];
  totalDurationMs: number;
  modelUsed: string;
}

export default function AgentTracePanel({
  traces,
  totalDurationMs,
  modelUsed,
}: AgentTracePanelProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleExpand = (step: string) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <div className="w-full p-5 rounded-2xl border border-cyan-500/20 bg-aura-card backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-aura-border gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white font-mono tracking-wide">
            LIVE AGENT PIPELINE TRACE
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            5/5 STEPS COMPLETED
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Clock className="w-3.5 h-3.5" /> {totalDurationMs} ms total
          </span>
          <span className="text-gray-500">•</span>
          <span className="truncate max-w-xs">{modelUsed}</span>
        </div>
      </div>

      {/* Step Traces Stream */}
      <div className="space-y-2.5">
        {traces.map((trace, idx) => {
          const isExpanded = expandedStep === trace.step;
          return (
            <div
              key={trace.step}
              className="p-3.5 rounded-xl border border-aura-border bg-aura-surface/60 hover:border-cyan-500/30 transition-all text-xs"
            >
              <div
                onClick={() => toggleExpand(trace.step)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center text-[11px]">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white uppercase">{trace.step}:</span>
                      <span className="text-cyan-300">{trace.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-400 text-[11px]">
                    {trace.durationMs}ms
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      trace.status === "success"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : trace.status === "fallback"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {trace.status}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Action and Decision Summary (Always visible) */}
              <div className="mt-2 pl-9 text-gray-300 leading-relaxed font-sans text-xs">
                {trace.summary}
              </div>

              {/* Expandable Technical Metadata */}
              {isExpanded && trace.metadata && (
                <div className="mt-3 pl-9 pt-2 border-t border-white/5 font-mono text-[11px] text-gray-400 space-y-1">
                  <div className="text-[10px] uppercase text-cyan-400 font-bold">
                    Telemetry & Audit Payload:
                  </div>
                  <pre className="p-2.5 rounded bg-black/60 border border-white/10 overflow-x-auto text-gray-300 text-[10px]">
                    {JSON.stringify(trace.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
