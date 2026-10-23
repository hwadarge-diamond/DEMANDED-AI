import { describe, it, expect } from "vitest";
import { DeterministicRiskEngine } from "@/lib/risk-engine";
import { EnvironmentalData } from "@/lib/types";

const mockNominalData: EnvironmentalData = {
  city: "San Francisco",
  country: "United States",
  coordinates: { lat: 37.77, lng: -122.41 },
  temperature: 20,
  apparentTemperature: 20,
  humidity: 55,
  uvIndex: 3,
  windSpeed: 12,
  weatherCode: 0,
  pm25: 8,
  pm10: 14,
  aqi: 32,
  ozone: 25,
  no2: 15,
  timestamp: new Date().toISOString(),
};

describe("Deterministic Risk Engine", () => {
  it("should evaluate nominal baseline conditions as LOW risk for general population", () => {
    const assessment = DeterministicRiskEngine.assessRisk(mockNominalData, "general");
    expect(assessment.overallRisk).toBe("LOW");
    expect(assessment.hardRulesTriggered.length).toBe(0);
    expect(assessment.safeOutdoorDurationMinutes).toBe(240);
  });

  it("should trigger SEVERE risk and hard rules for asthma patients when PM2.5 >= 50", () => {
    const highPm25Data: EnvironmentalData = {
      ...mockNominalData,
      pm25: 65,
      aqi: 165,
    };

    const assessment = DeterministicRiskEngine.assessRisk(highPm25Data, "asthma");
    expect(assessment.overallRisk).toBe("SEVERE");
    expect(assessment.hardRulesTriggered.some((r) => r.includes("CRITICAL_ASTHMA"))).toBe(true);
    expect(assessment.safeOutdoorDurationMinutes).toBeLessThanOrEqual(30);
  });

  it("should trigger SEVERE risk and hard rules for elderly when apparent temp exceeds 38°C", () => {
    const heatwaveData: EnvironmentalData = {
      ...mockNominalData,
      temperature: 37,
      apparentTemperature: 41,
    };

    const assessment = DeterministicRiskEngine.assessRisk(heatwaveData, "elderly");
    expect(assessment.overallRisk).toBe("SEVERE");
    expect(assessment.hardRulesTriggered.some((r) => r.includes("CRITICAL_ELDERLY"))).toBe(true);
  });

  it("should trigger hard rules for children when UV index >= 8", () => {
    const highUvData: EnvironmentalData = {
      ...mockNominalData,
      uvIndex: 9.5,
    };

    const assessment = DeterministicRiskEngine.assessRisk(highUvData, "child");
    expect(assessment.hardRulesTriggered.some((r) => r.includes("CRITICAL_CHILD"))).toBe(true);
  });

  it("should enforce compound crisis escalation when both heat and particulates are elevated", () => {
    const compoundCrisisData: EnvironmentalData = {
      ...mockNominalData,
      temperature: 36,
      apparentTemperature: 37,
      pm25: 48, // High for general
    };

    const assessment = DeterministicRiskEngine.assessRisk(compoundCrisisData, "general");
    expect(assessment.overallRisk).toBe("SEVERE");
    expect(assessment.hardRulesTriggered.some((r) => r.includes("COMPOUND_ENVIRONMENTAL_CRISIS"))).toBe(true);
  });
});
