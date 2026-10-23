"use client";

import React from "react";
import { Info } from "lucide-react";

export default function MedicalDisclaimer() {
  return (
    <div className="w-full p-4 rounded-xl border border-white/10 bg-black/40 text-xs text-gray-400 font-mono flex items-start gap-3">
      <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <strong className="text-gray-200">CLINICAL & SAFETY NOTICE:</strong> AuraGuard is an autonomous climate-health decision support and environmental awareness platform. It utilizes deterministic public health algorithms and multimodal AI to assist risk management. This guidance does not constitute formal medical diagnosis, treatment, or clinical prescription. Individuals experiencing acute respiratory distress, severe heat exhaustion symptoms, or cardiac irregularities should seek immediate emergency medical services.
      </div>
    </div>
  );
}
