import {
  FoodDonationItem,
  HACCPVerification,
  ShelterMatchResult,
  FoodRescueMission,
} from "../types";

export const SAMPLE_FOOD_DONATIONS: FoodDonationItem[] = [
  {
    id: "don-01",
    donorName: "Grand Central Hyatt Catering",
    donorType: "caterer",
    foodName: "Chilled Roast Chicken & Mediterranean Rice Trays",
    category: "cooked_prepared",
    quantityKg: 28,
    portions: 65,
    storageTempCelsius: 3.2,
    hoursSincePrepared: 1.5,
    hasAllergens: ["poultry", "gluten"],
    packagingCondition: "sealed_foodgrade",
  },
  {
    id: "don-02",
    donorName: "Artisan Sourdough Bakery",
    donorType: "restaurant",
    foodName: "Fresh Baked Artisan Sourdough & Baguettes",
    category: "bakery",
    quantityKg: 22,
    portions: 50,
    storageTempCelsius: 21.0,
    hoursSincePrepared: 2.0,
    hasAllergens: ["gluten", "sesame"],
    packagingCondition: "sealed_foodgrade",
  },
  {
    id: "don-03",
    donorName: "Sunset Beach Banquet Hall",
    donorType: "hotel",
    foodName: "Cooked Seafood Platter (Ambient Sitting)",
    category: "cooked_prepared",
    quantityKg: 15,
    portions: 35,
    storageTempCelsius: 28.5,
    hoursSincePrepared: 5.5,
    hasAllergens: ["shellfish", "fish"],
    packagingCondition: "covered_chafing",
  },
  {
    id: "don-04",
    donorName: "University Dining Hall",
    donorType: "university_canteen",
    foodName: "Fresh Steamed Vegetable & Quinoa Bowls",
    category: "cooked_prepared",
    quantityKg: 35,
    portions: 80,
    storageTempCelsius: 62.0, // Hot holding
    hoursSincePrepared: 1.0,
    hasAllergens: [],
    packagingCondition: "sealed_foodgrade",
  },
];

export const SHELTERS: ShelterMatchResult[] = [
  {
    shelterId: "shelter-01",
    shelterName: "Hope Harbor Emergency Community Kitchen",
    distanceKm: 3.2,
    transitMinutes: 12,
    mealsNeeded: 120,
    hasRefrigeration: true,
    urgency: "CRITICAL",
  },
  {
    shelterId: "shelter-02",
    shelterName: "St. Vincent Community Youth Center",
    distanceKm: 5.8,
    transitMinutes: 19,
    mealsNeeded: 55,
    hasRefrigeration: true,
    urgency: "HIGH",
  },
  {
    shelterId: "shelter-03",
    shelterName: "Metropolitan Senior Day Pavilion",
    distanceKm: 7.1,
    transitMinutes: 24,
    mealsNeeded: 40,
    hasRefrigeration: false,
    urgency: "STANDARD",
  },
];

export class FoodRescueEngine {
  /**
   * Deterministic HACCP evaluation.
   * Thermal Danger Zone: 4°C - 60°C.
   */
  public static evaluateHACCP(item: FoodDonationItem): HACCPVerification {
    const ruleViolations: string[] = [];
    const isCooked = item.category === "cooked_prepared" || item.category === "dairy";
    const inDangerZone = item.storageTempCelsius > 4 && item.storageTempCelsius < 60;

    let pathogenGrowthScore = 0.05;

    if (isCooked && inDangerZone) {
      pathogenGrowthScore += (item.hoursSincePrepared / 4) * 0.7;
      ruleViolations.push(
        `FDA_THERMAL_DANGER_ZONE: Food stored at ${item.storageTempCelsius}°C (danger zone 4°C - 60°C) for ${item.hoursSincePrepared} hours.`
      );
    }

    if (item.packagingCondition === "open_container") {
      pathogenGrowthScore += 0.25;
      ruleViolations.push("CROSS_CONTAMINATION_RISK: Food reported in unsealed/open containers.");
    }

    pathogenGrowthScore = Math.min(1.0, Math.round(pathogenGrowthScore * 100) / 100);

    // Decision Logic
    if (pathogenGrowthScore >= 0.7 || (inDangerZone && item.hoursSincePrepared >= 4)) {
      return {
        decision: "REJECTED_BIOHAZARD",
        pathogenGrowthScore,
        thermalDangerZoneViolated: inDangerZone,
        safeConsumptionHoursRemaining: 0,
        haccpReason: "Severe risk of bacterial proliferation (Bacillus cereus / Salmonella). Automatic discard.",
        ruleViolations,
      };
    }

    if (pathogenGrowthScore >= 0.35 || item.packagingCondition === "covered_chafing") {
      return {
        decision: "NEEDS_INSPECTION",
        pathogenGrowthScore,
        thermalDangerZoneViolated: inDangerZone,
        safeConsumptionHoursRemaining: Math.max(1, 4 - item.hoursSincePrepared),
        haccpReason: "Borderline thermal window. Requires mandatory core temperature thermometer check by volunteer before distribution.",
        ruleViolations,
      };
    }

    return {
      decision: "ACCEPTED",
      pathogenGrowthScore,
      thermalDangerZoneViolated: inDangerZone,
      safeConsumptionHoursRemaining: 6,
      haccpReason: "Food meets strict cold-chain or hot-holding HACCP specifications. Certified safe for immediate intake.",
      ruleViolations,
    };
  }

  public static matchShelter(
    item: FoodDonationItem,
    haccp: HACCPVerification
  ): ShelterMatchResult {
    // If refrigeration required
    const requiresFridge = item.storageTempCelsius <= 4;
    const candidates = SHELTERS.filter((s) => (requiresFridge ? s.hasRefrigeration : true));
    // Sort by urgency, then distance
    return candidates.sort((a, b) => (a.urgency === "CRITICAL" ? -1 : 1))[0] || SHELTERS[0];
  }

  public static processDonation(item: FoodDonationItem): FoodRescueMission {
    const verification = this.evaluateHACCP(item);
    const matchedShelter = this.matchShelter(item, verification);

    // 1 kg food diverted ≈ 2.5 kg CO2e averted
    const carbonOffsetKg = Math.round(item.quantityKg * 2.5 * 10) / 10;
    const mealsServed = item.portions;

    const status =
      verification.decision === "ACCEPTED"
        ? "DISPATCHED"
        : verification.decision === "NEEDS_INSPECTION"
        ? "HELD_REVIEW"
        : "REJECTED";

    return {
      donation: item,
      verification,
      matchedShelter,
      carbonOffsetKg,
      mealsServed,
      status,
    };
  }
}
