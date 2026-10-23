import { describe, it, expect } from "vitest";
import { BusinessIntelligenceEngine } from "@/lib/domains/business-agent";

describe("Business Intelligence & Corporate ESG Engine", () => {
  it("should generate consistent ESG carbon offset accounting", () => {
    const esg = BusinessIntelligenceEngine.generateESGReport();

    expect(esg.totalFoodDivertedKg).toBeGreaterThan(0);
    expect(esg.co2eAvertedTons).toBe(37.1);
    expect(esg.waterSavedLiters).toBeGreaterThan(1000000);
    expect(esg.scope3AvoidedEmissionsScore).toBeGreaterThan(90);
  });

  it("should calculate OSHA heat stress labor protection during extreme heat", () => {
    const impact = BusinessIntelligenceEngine.calculateWorkforceImpact(
      "construction",
      100, // 100 workers
      42 // 42°C severe heat
    );

    expect(impact.currentRiskLevel).toBe("SEVERE");
    expect(impact.recommendedRestCycleMinutes).toBe(30);
    expect(impact.preventedLostLaborHours).toBe(350);
  });
});
