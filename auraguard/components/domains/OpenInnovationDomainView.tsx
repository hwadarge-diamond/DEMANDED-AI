"use client";

import React, { useState } from "react";
import { SWARM_AGENTS, MOCK_LEDGER_ENTRIES } from "@/lib/domains/open-innovation-agent";
import { Network, Terminal, ShieldCheck, Cpu, Code2, ArrowUpRight, Play, CheckCircle } from "lucide-react";

export default function OpenInnovationDomainView() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("/api/agent/pipeline");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  const handleTestApi = async () => {
    setIsApiLoading(true);
    try {
      if (selectedEndpoint === "/api/agent/pipeline") {
        const res = await fetch("/api/agent/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cityId: "tokyo", profile: "asthma" }),
        });
        const data = await res.json();
        setApiResponse(data);
      } else {
        const res = await fetch("/api/weather?city=tokyo");
        const data = await res.json();
        setApiResponse(data);
      }
    } catch (e: any) {
      setApiResponse({ error: e.message });
    } finally {
      setIsApiLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-950/30 via-aura-card to-aura-darkest backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase font-bold">
            <Network className="w-4 h-4" />
            <span>Open Innovation, Multi-Agent Swarm & Decentralized Protocol</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Autonomous Agent Orchestration Grid & SHA-256 Verifiable Ledger
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            An open ecosystem for collaborative climate-health intelligence. Exposes open API schemas, verifies agent decisions on a tamper-evident audit ledger, and enables decentralized tool composition.
          </p>
        </div>

        <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-gray-400 block text-[10px]">SWARM NODES:</span>
            <span className="text-emerald-400 font-bold">6 Cooperating Agents Online</span>
          </div>
        </div>
      </div>

      {/* Swarm Agent Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-teal-400 flex items-center gap-2">
            <Cpu className="w-4 h-4" /> Active Swarm Agent Nodes
          </label>
          <span className="text-[11px] font-mono text-gray-400">
            Decentralized Event-Driven Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SWARM_AGENTS.map((agent) => {
            const isBusy = agent.status !== "IDLE";
            return (
              <div
                key={agent.id}
                className="p-4 rounded-xl border border-aura-border bg-aura-card backdrop-blur-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">
                      {agent.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        agent.status === "SENSING"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : agent.status === "REASONING"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : agent.status === "VERIFYING"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : agent.status === "EXECUTING"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{agent.role}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 text-[11px] font-mono text-gray-300">
                  <span className="text-gray-500 block text-[9px] uppercase">Active Task:</span>
                  <span className="truncate block">{agent.activeTask}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-white/5 pt-2">
                  <span>Latency: <strong className="text-white">{agent.latencyMs}ms</strong></span>
                  <span>Confidence: <strong className="text-teal-400">{Math.round(agent.confidenceScore * 100)}%</strong></span>
                  <span className="uppercase text-gray-500">{agent.domain}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Cryptographic Ledger + Developer API Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Cryptographic SHA-256 Immutable Audit Ledger */}
        <div className="p-5 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white font-mono">
                CRYPTOGRAPHIC SHA-256 AUDIT LEDGER
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              Zero-Trust Verification
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Every autonomous agent decision—from clinical risk locks to food bio-safety dispatches—is hashed with SHA-256 to ensure complete mathematical auditability and non-repudiation.
          </p>

          <div className="space-y-2">
            {MOCK_LEDGER_ENTRIES.map((entry) => (
              <div
                key={entry.txId}
                className="p-3 rounded-xl bg-aura-surface border border-aura-border font-mono text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">{entry.txId}</span>
                    <span className="text-[10px] text-gray-500">• {entry.timestamp}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {entry.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-300 font-bold">
                  {entry.decisionType} <span className="text-gray-500">by</span> {entry.agentId}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  SHA-256: {entry.hashSHA256}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Open Developer API Playground */}
        <div className="p-5 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-aura-border">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white font-mono">
                OPEN API DEVELOPER PLAYGROUND
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              Live REST Endpoints
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Integrate AuraGuard's autonomous climate-health and food rescue agents directly into your civic dashboard, hospital triage system, or school notifications.
          </p>

          {/* Endpoint Selector & Run */}
          <div className="flex gap-2">
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-aura-border bg-aura-surface text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
            >
              <option value="/api/agent/pipeline">POST /api/agent/pipeline (Full 5-Stage Agent)</option>
              <option value="/api/weather">GET /api/weather?city=tokyo (Telemetry Proxy)</option>
            </select>

            <button
              onClick={handleTestApi}
              disabled={isApiLoading}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isApiLoading ? "RUNNING..." : "TEST"}</span>
            </button>
          </div>

          {/* Live JSON Response Viewer */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-gray-400">Response Payload:</span>
            <pre className="p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-cyan-300 max-h-56 overflow-y-auto">
              {apiResponse
                ? JSON.stringify(apiResponse, null, 2)
                : '// Click "TEST" above to execute live REST query and inspect JSON output'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
