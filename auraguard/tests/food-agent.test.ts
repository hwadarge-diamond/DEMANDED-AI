import { describe, it, expect } from "vitest";
import { FoodRescueEngine, SAMPLE_FOOD_DONATIONS } from "@/lib/domains/food-agent";

describe("Food Rescue & HACCP Bio-Safety Agent", () => {
  it("should ACCEPT fresh chilled food stored below 4°C", () => {
    const chilledCatering = SAMPLE_FOOD_DONATIONS[0]; // Chilled chicken at 3.2°C
    const verification = FoodRescueEngine.evaluateHACCP(chilledCatering);

    expect(verification.decision).toBe("ACCEPTED");
    expect(verification.thermalDangerZoneViolated).toBe(false);
    expect(verification.pathogenGrowthScore).toBeLessThan(0.35);
  });

  it("should REJECT cooked food left in thermal danger zone (>4°C to 60°C) for over 4 hours", () => {
    const spoiledSeafood = SAMPLE_FOOD_DONATIONS[2]; // Ambient sitting at 28.5°C for 5.5 hours
    const verification = FoodRescueEngine.evaluateHACCP(spoiledSeafood);

    expect(verification.decision).toBe("REJECTED_BIOHAZARD");
    expect(verification.thermalDangerZoneViolated).toBe(true);
    expect(verification.safeConsumptionHoursRemaining).toBe(0);
  });

  it("should calculate carbon offset and meals correctly upon donation dispatch", () => {
    const donation = SAMPLE_FOOD_DONATIONS[0]; // 28 kg, 65 portions
    const mission = FoodRescueEngine.processDonation(donation);

    expect(mission.mealsServed).toBe(65);
    expect(mission.carbonOffsetKg).toBe(70); // 28 * 2.5
    expect(mission.status).toBe("DISPATCHED");
    expect(mission.matchedShelter.shelterName).toBeDefined();
  });
});
