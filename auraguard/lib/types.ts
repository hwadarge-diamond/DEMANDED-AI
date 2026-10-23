import { z } from "zod";

export type ImpactDomain =
  | "health"
  | "food"
  | "business"
  | "education"
  | "innovation";

export type VulnerabilityProfile =
  | "general"
  | "child"
  | "elderly"
  | "asthma"
  | "outdoor_worker";

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

// =============================================================================
// 1. HEALTH & CLIMATE TELEMETRY TYPES
// =============================================================================
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

// =============================================================================
// 2. FOOD SECURITY & BIO-RESILIENCE TYPES
// =============================================================================
export interface FoodDonationItem {
  id: string;
  donorName: string;
  donorType: "caterer" | "hotel" | "restaurant" | "university_canteen" | "supermarket";
  foodName: string;
  category: "cooked_prepared" | "bakery" | "produce" | "dairy" | "packaged";
  quantityKg: number;
  portions: number;
  storageTempCelsius: number;
  hoursSincePrepared: number;
  hasAllergens: string[];
  packagingCondition: "sealed_foodgrade" | "covered_chafing" | "open_container";
}

export interface HACCPVerification {
  decision: "ACCEPTED" | "NEEDS_INSPECTION" | "REJECTED_BIOHAZARD";
  pathogenGrowthScore: number; // 0.0 - 1.0
  thermalDangerZoneViolated: boolean;
  safeConsumptionHoursRemaining: number;
  haccpReason: string;
  ruleViolations: string[];
}

export interface ShelterMatchResult {
  shelterId: string;
  shelterName: string;
  distanceKm: number;
  transitMinutes: number;
  mealsNeeded: number;
  hasRefrigeration: boolean;
  urgency: "CRITICAL" | "HIGH" | "STANDARD";
}

export interface FoodRescueMission {
  donation: FoodDonationItem;
  verification: HACCPVerification;
  matchedShelter: ShelterMatchResult;
  carbonOffsetKg: number;
  mealsServed: number;
  status: "DISPATCHED" | "HELD_REVIEW" | "REJECTED";
}

// =============================================================================
// 3. DATA & BUSINESS INTELLIGENCE (ESG) TYPES
// =============================================================================
export interface ESGImpactReport {
  reportingPeriod: string;
  totalRescues: number;
  totalFoodDivertedKg: number;
  totalMealsDistributed: number;
  co2eAvertedTons: number;
  methaneAvertedKg: number;
  economicValuePreservedUsd: number;
  workforceHeatStressLossAvoidedUsd: number;
  corporateTaxIncentiveEligibleUsd: number;
  waterSavedLiters: number;
  scope3AvoidedEmissionsScore: number;
  industryBenchmarkPercentile: number;
}

export interface CorporateWorkforceImpact {
  industry: "construction" | "delivery_logistics" | "manufacturing" | "agriculture";
  workforceCount: number;
  currentRiskLevel: RiskLevel;
  recommendedRestCycleMinutes: number;
  hydrationRequirementLitersPerWorker: number;
  preventedLostLaborHours: number;
  projectedProductivityRecoveryPercent: number;
}

// =============================================================================
// 4. EDUCATION & SCENARIO SIMULATION TYPES
// =============================================================================
export interface SimulationParameters {
  ambientTempCelsius: number;
  aqiValue: number;
  uvIndexValue: number;
  populationScale: number;
  vulnerabilitySplit: {
    childrenPct: number;
    elderlyPct: number;
    asthmaPct: number;
    generalPct: number;
  };
}

export interface SimulationResult {
  heatStrokeRiskIndex: number; // 0-100
  pulmonaryEmergencyIndex: number; // 0-100
  projectedERVisitsPerHour: number;
  schoolOutdoorStatus: "PERMITTED" | "RESTRICTED_RECESS" | "STRICT_INDOOR_CLOSURE";
  laborAdvisory: "NORMAL" | "MODIFIED_SHIFTS" | "MANDATORY_HALT";
  recommendedCitizenGuidance: string[];
}

export interface EducationalModule {
  id: string;
  title: string;
  domain: ImpactDomain;
  targetAudience: "students" | "communities" | "enterprise" | "volunteers";
  keyTakeaway: string;
  actionChecklist: string[];
  mythVsFact: { myth: string; fact: string };
}

// =============================================================================
// 5. OPEN INNOVATION & SWARM PROTOCOL TYPES
// =============================================================================
export interface SwarmAgentNode {
  id: string;
  name: string;
  role: string;
  domain: ImpactDomain;
  status: "IDLE" | "SENSING" | "REASONING" | "VERIFYING" | "EXECUTING";
  latencyMs: number;
  confidenceScore: number;
  activeTask: string;
}

export interface CryptographicAuditEntry {
  txId: string;
  timestamp: string;
  domain: ImpactDomain;
  agentId: string;
  decisionType: string;
  hashSHA256: string;
  status: "VERIFIED_TAMPER_PROOF";
}
