import { describe, it, expect } from "vitest";
import { EducationSimulationEngine } from "@/lib/domains/education-agent";

describe("Education & Scenario Simulation Engine", () => {
  it("should trigger STRICT_INDOOR_CLOSURE for schools when temp >= 38°C and AQI >= 200", () => {
    const simulation = EducationSimulationEngine.runSimulation({
      ambientTempCelsius: 41,
      aqiValue: 240,
      uvIndexValue: 9.0,
      populationScale: 100000,
      vulnerabilitySplit: {
        childrenPct: 20,
        elderlyPct: 20,
        asthmaPct: 15,
        generalPct: 45,
      },
    });

    expect(simulation.schoolOutdoorStatus).toBe("STRICT_INDOOR_CLOSURE");
    expect(simulation.laborAdvisory).toBe("MODIFIED_SHIFTS");
    expect(simulation.heatStrokeRiskIndex).toBeGreaterThanOrEqual(75);
    expect(simulation.recommendedCitizenGuidance.length).toBeGreaterThanOrEqual(2);
  });
});
