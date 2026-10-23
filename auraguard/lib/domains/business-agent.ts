import { ESGImpactReport, CorporateWorkforceImpact, RiskLevel } from "../types";

export class BusinessIntelligenceEngine {
  /**
   * Computes enterprise ESG metrics and economic returns for sustainable operations.
   */
  public static generateESGReport(): ESGImpactReport {
    const totalFoodDivertedKg = 14850;
    const totalMealsDistributed = 32670;
    const co2eAvertedTons = Math.round((totalFoodDivertedKg * 2.5) / 100) / 10; // 37.1 tons
    const methaneAvertedKg = Math.round(totalFoodDivertedKg * 0.18);
    const economicValuePreservedUsd = Math.round(totalMealsDistributed * 4.5); // $4.50 meal value
    const workforceHeatStressLossAvoidedUsd = 48200;
    const corporateTaxIncentiveEligibleUsd = Math.round(economicValuePreservedUsd * 0.28);
    const waterSavedLiters = totalFoodDivertedKg * 410; // 410 L water embedded per kg

    return {
      reportingPeriod: "Q1-Q3 2026 Consolidated",
      totalRescues: 412,
      totalFoodDivertedKg,
      totalMealsDistributed,
      co2eAvertedTons,
      methaneAvertedKg,
      economicValuePreservedUsd,
      workforceHeatStressLossAvoidedUsd,
      corporateTaxIncentiveEligibleUsd,
      waterSavedLiters,
      scope3AvoidedEmissionsScore: 94.2,
      industryBenchmarkPercentile: 98,
    };
  }

  /**
   * Evaluates corporate workforce climate liability & OSHA heat-stress mitigation.
   */
  public static calculateWorkforceImpact(
    industry: "construction" | "delivery_logistics" | "manufacturing" | "agriculture",
    workforceCount: number,
    apparentTemperature: number
  ): CorporateWorkforceImpact {
    let riskLevel: RiskLevel = "LOW";
    let restMinutes = 0;
    let hydrationLiters = 0.5;
    let preventedHoursPerWorker = 0;

    if (apparentTemperature >= 40) {
      riskLevel = "SEVERE";
      restMinutes = 30; // 30 min rest per hour in shade
      hydrationLiters = 1.0;
      preventedHoursPerWorker = 3.5;
    } else if (apparentTemperature >= 35) {
      riskLevel = "HIGH";
      restMinutes = 20;
      hydrationLiters = 0.75;
      preventedHoursPerWorker = 2.0;
    } else if (apparentTemperature >= 30) {
      riskLevel = "MODERATE";
      restMinutes = 10;
      hydrationLiters = 0.5;
      preventedHoursPerWorker = 1.0;
    }

    const totalPreventedLostHours = Math.round(workforceCount * preventedHoursPerWorker);
    const productivityRecovery =
      riskLevel === "SEVERE" ? 82 : riskLevel === "HIGH" ? 91 : 97;

    return {
      industry,
      workforceCount,
      currentRiskLevel: riskLevel,
      recommendedRestCycleMinutes: restMinutes,
      hydrationRequirementLitersPerWorker: hydrationLiters,
      preventedLostLaborHours: totalPreventedLostHours,
      projectedProductivityRecoveryPercent: productivityRecovery,
    };
  }
}
