import { z } from "zod";

export type VulnerabilityProfile =
  | "general"
  | "child"
  | "elderly"
  | "asthma"
  | "outdoor_worker";

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

export interface EnvironmentalData {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  temperature: number; // Celsius
  apparentTemperature: number; // Heat index / feels like
  humidity: number; // %
  uvIndex: number;
  windSpeed: number; // km/h
  weatherCode: number;
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  aqi: number; // European or US AQI approximation
  ozone: number; // ug/m3
  no2: number; // ug/m3
  timestamp: string;
  isCached?: boolean;
}

export interface RiskFactor {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  level: RiskLevel;
  description: string;
}

export interface DeterministicAssessment {
  overallRisk: RiskLevel;
  profileRisk: RiskLevel;
  profile: VulnerabilityProfile;
  primaryHazard: string;
  factors: RiskFactor[];
  hardRulesTriggered: string[];
  safeOutdoorDurationMinutes: number;
  timestamp: string;
}

// Zod Schema for strict LLM Reasoning Output
export const ActionPlanSchema = z.object({
  summary: z.string().min(10).max(300),
  topActions: z.array(z.string()).length(3),
  safeWindows: z.array(z.string()).min(1),
  thingsToAvoid: z.array(z.string()).min(1),
  checklist: z.array(
    z.object({
      id: z.string(),
      item: z.string(),
      urgent: z.boolean(),
    })
  ).min(3),
});

export type ActionPlan = z.infer<typeof ActionPlanSchema>;

export interface VerificationResult {
  isVerified: boolean;
  status: "VERIFIED_ACCURATE" | "OVERRIDDEN_FOR_SAFETY" | "FALLBACK_DETERMINISTIC";
  verifiedRiskLevel: RiskLevel;
  auditChecks: {
    rule: string;
    passed: boolean;
    reason: string;
  }[];
  finalPlan: ActionPlan;
}

export interface AgentStepTrace {
  step: "SENSE" | "ASSESS" | "REASON" | "VERIFY" | "ACT";
  name: string;
  durationMs: number;
  status: "success" | "warning" | "fallback" | "error";
  summary: string;
  metadata?: Record<string, any>;
}

export interface AgentPipelineResponse {
  city: string;
  country: string;
  profile: VulnerabilityProfile;
  environmentalData: EnvironmentalData;
  assessment: DeterministicAssessment;
  verification: VerificationResult;
  bestThreeHourWindow: {
    startHour: string;
    endHour: string;
    avgTemp: number;
    avgAqi: number;
    reason: string;
  };
  traces: AgentStepTrace[];
  totalPipelineDurationMs: number;
  modelUsed: string;
  timestamp: string;
}
