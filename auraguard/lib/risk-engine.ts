import {
  EnvironmentalData,
  VulnerabilityProfile,
  RiskLevel,
  RiskFactor,
  DeterministicAssessment,
} from "./types";

const RISK_LEVEL_ORDER: Record<RiskLevel, number> = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  SEVERE: 4,
};

export class DeterministicRiskEngine {
  /**
   * Evaluates environmental indicators against clinical thresholds tailored to vulnerability profiles.
   * This is the mathematical and clinical source of truth for the entire pipeline.
   */
  public static assessRisk(
    data: EnvironmentalData,
    profile: VulnerabilityProfile
  ): DeterministicAssessment {
    const factors: RiskFactor[] = [];
    const hardRulesTriggered: string[] = [];

    // 1. Heat Index / Apparent Temperature Factor
    const heatFactor = this.evaluateHeatRisk(data.apparentTemperature, profile);
    factors.push(heatFactor);

    // 2. PM2.5 Fine Particulates Factor
    const pm25Factor = this.evaluatePm25Risk(data.pm25, profile);
    factors.push(pm25Factor);

    // 3. Solar UV Index Factor
    const uvFactor = this.evaluateUvRisk(data.uvIndex, profile);
    factors.push(uvFactor);

    // 4. Overall AQI Factor
    const aqiFactor = this.evaluateAqiRisk(data.aqi, profile);
    factors.push(aqiFactor);

    // 5. Evaluate Hard Clinical Rules
    if (profile === "asthma" && data.pm25 >= 35) {
      hardRulesTriggered.push(
        "CRITICAL_ASTHMA_BRONCHIAL_SPASM_RISK: PM2.5 exceeds 35 µg/m³. Strenuous outdoor cardiovascular activity is contraindicated."
      );
    }

    if (profile === "elderly" && data.apparentTemperature >= 38) {
      hardRulesTriggered.push(
        "CRITICAL_ELDERLY_CARDIOVASCULAR_STRAIN: Apparent temperature exceeds 38°C. Thermoregulation failure risk; air-conditioned shelter mandatory."
      );
    }

    if (profile === "child" && data.uvIndex >= 8) {
      hardRulesTriggered.push(
        "CRITICAL_CHILD_CELLULAR_UV_DAMAGE: UV Index exceeds 8. Avoid direct solar exposure between 10:00 and 16:00."
      );
    }

    if (profile === "outdoor_worker" && data.apparentTemperature >= 37) {
      hardRulesTriggered.push(
        "CRITICAL_OCCUPATIONAL_EXERTIONAL_HEAT_STROKE: High WBGT equivalent. Mandatory 15-minute shaded rest per hour with 750ml electrolyte hydration."
      );
    }

    // 6. Compound Crisis Synergy (Extreme heat + poor air quality)
    const isCompoundCrisis =
      RISK_LEVEL_ORDER[heatFactor.level] >= 3 &&
      RISK_LEVEL_ORDER[pm25Factor.level] >= 3;

    if (isCompoundCrisis) {
      hardRulesTriggered.push(
        "COMPOUND_ENVIRONMENTAL_CRISIS: Concurrent severe heat stress and particulate pollution create compounded systemic cardiopulmonary danger."
      );
    }

    // 7. Calculate Baseline vs Profile Risk
    let highestFactorRank = Math.max(
      ...factors.map((f) => RISK_LEVEL_ORDER[f.level])
    );

    if (isCompoundCrisis && highestFactorRank < 4) {
      highestFactorRank = 4; // Escalate compound crises to SEVERE
    }

    const calculatedRisk: RiskLevel =
      Object.keys(RISK_LEVEL_ORDER).find(
        (key) => RISK_LEVEL_ORDER[key as RiskLevel] === highestFactorRank
      ) as RiskLevel || "LOW";

    // Primary hazard identification
    const primaryFactor = [...factors].sort(
      (a, b) => RISK_LEVEL_ORDER[b.level] - RISK_LEVEL_ORDER[a.level]
    )[0];

    const safeMinutes = this.calculateSafeOutdoorDuration(calculatedRisk, profile);

    return {
      overallRisk: calculatedRisk,
      profileRisk: calculatedRisk,
      profile,
      primaryHazard: `${primaryFactor.name} (${primaryFactor.level}) - ${primaryFactor.description}`,
      factors,
      hardRulesTriggered,
      safeOutdoorDurationMinutes: safeMinutes,
      timestamp: new Date().toISOString(),
    };
  }

  private static evaluateHeatRisk(
    temp: number,
    profile: VulnerabilityProfile
  ): RiskFactor {
    let level: RiskLevel = "LOW";
    let threshold = 30;

    if (profile === "elderly" || profile === "child") {
      threshold = 28;
      if (temp >= 38) level = "SEVERE";
      else if (temp >= 33) level = "HIGH";
      else if (temp >= 28) level = "MODERATE";
    } else if (profile === "outdoor_worker") {
      threshold = 32;
      if (temp >= 40) level = "SEVERE";
      else if (temp >= 35) level = "HIGH";
      else if (temp >= 30) level = "MODERATE";
    } else {
      if (temp >= 41) level = "SEVERE";
      else if (temp >= 36) level = "HIGH";
      else if (temp >= 30) level = "MODERATE";
    }

    return {
      name: "Heat Stress & Index",
      value: Math.round(temp * 10) / 10,
      unit: "°C",
      threshold,
      level,
      description:
        level === "SEVERE"
          ? "Dangerous risk of heat exhaustion, heat stroke, and dehydration."
          : level === "HIGH"
          ? "Elevated thermal burden. Caution required during continuous exertion."
          : level === "MODERATE"
          ? "Noticeable warmth; monitor hydration and personal comfort."
          : "Comfortable thermal range with minimal thermal stress.",
    };
  }

  private static evaluatePm25Risk(
    pm25: number,
    profile: VulnerabilityProfile
  ): RiskFactor {
    let level: RiskLevel = "LOW";
    const threshold = profile === "asthma" ? 15 : 25;

    if (profile === "asthma") {
      if (pm25 >= 50) level = "SEVERE";
      else if (pm25 >= 25) level = "HIGH";
      else if (pm25 >= 12) level = "MODERATE";
    } else if (profile === "child" || profile === "elderly") {
      if (pm25 >= 60) level = "SEVERE";
      else if (pm25 >= 35) level = "HIGH";
      else if (pm25 >= 20) level = "MODERATE";
    } else {
      if (pm25 >= 75) level = "SEVERE";
      else if (pm25 >= 45) level = "HIGH";
      else if (pm25 >= 25) level = "MODERATE";
    }

    return {
      name: "Fine Particulate Matter (PM2.5)",
      value: Math.round(pm25 * 10) / 10,
      unit: "µg/m³",
      threshold,
      level,
      description:
        level === "SEVERE"
          ? "Severe micro-particulate infiltration; deep alveolar irritation."
          : level === "HIGH"
          ? "Unhealthy for sensitive respiratory systems; air filtering recommended."
          : level === "MODERATE"
          ? "Moderate particulate density; mild irritation in sensitive individuals."
          : "Optimal air purity meeting clean atmospheric guidelines.",
    };
  }

  private static evaluateUvRisk(
    uv: number,
    profile: VulnerabilityProfile
  ): RiskFactor {
    let level: RiskLevel = "LOW";
    const threshold = profile === "child" ? 6 : 7;

    if (profile === "child") {
      if (uv >= 8) level = "SEVERE";
      else if (uv >= 6) level = "HIGH";
      else if (uv >= 4) level = "MODERATE";
    } else {
      if (uv >= 11) level = "SEVERE";
      else if (uv >= 8) level = "HIGH";
      else if (uv >= 5) level = "MODERATE";
    }

    return {
      name: "Solar UV Index",
      value: Math.round(uv * 10) / 10,
      unit: "Index",
      threshold,
      level,
      description:
        level === "SEVERE"
          ? "Extreme erythema and burn potential in under 15 minutes of unprotected sun."
          : level === "HIGH"
          ? "Very high solar UV radiation; full SPF50+ and eye protection required."
          : level === "MODERATE"
          ? "Moderate solar radiation; seek shade during peak midday hours."
          : "Low solar radiation danger; safe for ambient outdoors.",
    };
  }

  private static evaluateAqiRisk(
    aqi: number,
    profile: VulnerabilityProfile
  ): RiskFactor {
    let level: RiskLevel = "LOW";
    const threshold = profile === "asthma" ? 100 : 120;

    if (profile === "asthma") {
      if (aqi >= 150) level = "SEVERE";
      else if (aqi >= 100) level = "HIGH";
      else if (aqi >= 60) level = "MODERATE";
    } else {
      if (aqi >= 200) level = "SEVERE";
      else if (aqi >= 140) level = "HIGH";
      else if (aqi >= 75) level = "MODERATE";
    }

    return {
      name: "Air Quality Index (AQI)",
      value: Math.round(aqi),
      unit: "AQI",
      threshold,
      level,
      description:
        level === "SEVERE"
          ? "Hazardous atmospheric contamination. Significant respiratory impacts."
          : level === "HIGH"
          ? "Unhealthy ambient air quality. Limit prolonged outdoor exposure."
          : level === "MODERATE"
          ? "Acceptable air quality with potential sensitivity for select groups."
          : "Clean, healthy air quality across all demographics.",
    };
  }

  private static calculateSafeOutdoorDuration(
    risk: RiskLevel,
    profile: VulnerabilityProfile
  ): number {
    switch (risk) {
      case "SEVERE":
        return profile === "outdoor_worker" ? 30 : 15;
      case "HIGH":
        return profile === "outdoor_worker" ? 45 : 30;
      case "MODERATE":
        return 90;
      case "LOW":
      default:
        return 240;
    }
  }
}
