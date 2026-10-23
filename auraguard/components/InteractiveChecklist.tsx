"use client";

import React, { useState } from "react";
import { CheckSquare, Square, CheckCircle2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  item: string;
  urgent: boolean;
}

interface InteractiveChecklistProps {
  checklist: ChecklistItem[];
}

export default function InteractiveChecklist({ checklist }: InteractiveChecklistProps) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  return (
    <div className="w-full p-5 rounded-2xl border border-aura-border bg-aura-card backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-aura-border">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Actionable Safeguards
          </span>
          <h3 className="font-bold text-sm text-white font-mono mt-0.5">
            PERSONAL SAFETY CHECKLIST
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">
            {completedCount} of {checklist.length} Completed
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {checklist.map((item) => {
          const isDone = !!completedMap[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-500/40 text-gray-400"
                  : "bg-aura-surface border-aura-border text-white hover:border-cyan-500/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={isDone ? "text-emerald-400" : "text-gray-500 hover:text-cyan-400"}
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <span className={`text-xs ${isDone ? "line-through text-gray-500" : "text-gray-200"}`}>
                  {item.item}
                </span>
              </div>

              {item.urgent && !isDone && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRIORITY
                </span>
              )}

              {isDone && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> DONE
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
