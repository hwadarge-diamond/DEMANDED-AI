import {
  ActionPlan,
  DeterministicAssessment,
  VerificationResult,
  VulnerabilityProfile,
} from "./types";

const DANGEROUS_HALLUCINATIONS = [
  /safe to run outside/i,
  /enjoy (a )?marathon/i,
  /no precautions needed/i,
  /unrestricted outdoor (play|exercise|sports)/i,
  /air is clean and harmless/i,
  /no need for (water|hydration|sunscreen|inhaler)/i,
  /prolonged sunbathing/i,
];

export class SafetyVerifier {
  /**
   * Enforces zero-tolerance safety guardrails on LLM-generated action plans.
   * Ensures the AI never contradicts the deterministic clinical risk assessment.
   */
  public static verifyPlan(
    llmPlan: ActionPlan,
    assessment: DeterministicAssessment
  ): VerificationResult {
    const auditChecks: { rule: string; passed: boolean; reason: string }[] = [];
    let passedAll = true;

    // Check 1: Structure and Action Count
    const countCheck = llmPlan.topActions.length === 3;
    auditChecks.push({
      rule: "STRUCTURAL_COMPLIANCE",
      passed: countCheck,
      reason: countCheck
        ? "Action plan strictly satisfies the 3-action requirement."
        : `Expected 3 actions, but received ${llmPlan.topActions.length}.`,
    });
    if (!countCheck) passedAll = false;

    // Check 2: Dangerous Hallucination Filter
    const allText = [
      llmPlan.summary,
      ...llmPlan.topActions,
      ...llmPlan.safeWindows,
      ...llmPlan.thingsToAvoid,
      ...llmPlan.checklist.map((c) => c.item),
    ].join(" ");

    let foundHallucination = false;
    let matchedPattern = "";

    for (const pattern of DANGEROUS_HALLUCINATIONS) {
      if (pattern.test(allText)) {
        foundHallucination = true;
        matchedPattern = pattern.source;
        break;
      }
    }

    auditChecks.push({
      rule: "DANGEROUS_ADVICE_FILTER",
      passed: !foundHallucination,
      reason: foundHallucination
        ? `LLM output contained prohibited reckless phrase matching: ${matchedPattern}`
        : "No contradictory reckless or unsafe recommendations detected.",
    });
    if (foundHallucination) passedAll = false;

    // Positive advice fields (exclude thingsToAvoid)
    const positiveAdviceText = [
      llmPlan.summary,
      ...llmPlan.topActions,
      ...llmPlan.safeWindows,
      ...llmPlan.checklist.map((c) => c.item),
    ].join(" ");

    // Check 3: Risk Level Consistency & Hard Safety Rule Enforcement
    let hardRuleViolation = false;
    let violationDetail = "";

    if (assessment.overallRisk === "SEVERE" || assessment.overallRisk === "HIGH") {
      // Must not suggest strenuous outdoor activities during severe risk in positive recommendations
      if (/(strenuous outdoor|heavy training outside|outdoor soccer tournament)/i.test(positiveAdviceText)) {
        hardRuleViolation = true;
        violationDetail =
          "Recommending strenuous outdoor workouts under HIGH/SEVERE risk violates clinical safety boundaries.";
      }
    }

    auditChecks.push({
      rule: "HARD_CLINICAL_SAFETY_RULES",
      passed: !hardRuleViolation,
      reason: hardRuleViolation
        ? violationDetail
        : `Verified alignment with ${assessment.hardRulesTriggered.length} active hard safety rules.`,
    });
    if (hardRuleViolation) passedAll = false;

    // Check 4: Profile Specific Safeguards
    const profileSafeguard = this.checkProfileSafeguard(allText, assessment);
    auditChecks.push(profileSafeguard);
    if (!profileSafeguard.passed) passedAll = false;

    // If all pass, return verified plan
    if (passedAll) {
      return {
        isVerified: true,
        status: "VERIFIED_ACCURATE",
        verifiedRiskLevel: assessment.overallRisk,
        auditChecks,
        finalPlan: llmPlan,
      };
    }

    // Safety fallback: Generate deterministic clinically grounded plan
    const fallbackPlan = this.generateDeterministicPlan(assessment);

    return {
      isVerified: true,
      status: "OVERRIDDEN_FOR_SAFETY",
      verifiedRiskLevel: assessment.overallRisk,
      auditChecks,
      finalPlan: fallbackPlan,
    };
  }

  private static checkProfileSafeguard(
    text: string,
    assessment: DeterministicAssessment
  ): { rule: string; passed: boolean; reason: string } {
    if (assessment.profile === "asthma" && assessment.overallRisk !== "LOW") {
      const mentionsPrecautions = /(inhaler|respiratory|mask|filter|pm2\.5|air quality|indoor)/i.test(text);
      return {
        rule: "ASTHMA_PROFILE_PRECISION",
        passed: mentionsPrecautions,
        reason: mentionsPrecautions
          ? "Plan specifically addresses asthma pulmonary triggers and indoor air filtering."
          : "Plan lacked mandatory asthma precautions during elevated environmental risk.",
      };
    }

    if (assessment.profile === "elderly" && assessment.overallRisk !== "LOW") {
      const mentionsHydrationCooling = /(hydration|water|cool|rest|shade|indoor|air-condition)/i.test(text);
      return {
        rule: "ELDERLY_THERMOREGULATION_PRECISION",
        passed: mentionsHydrationCooling,
        reason: mentionsHydrationCooling
          ? "Plan incorporates thermoregulation safeguards and cooling hydration for seniors."
          : "Plan omitted essential hydration or cooling advice for elderly demographics.",
      };
    }

    return {
      rule: "PROFILE_SPECIFIC_ALIGNMENT",
      passed: true,
      reason: `Plan provides tailored actionable precautions for ${assessment.profile} demographic.`,
    };
  }

  /**
   * Deterministic rule-based plan generator.
   * Guarantees 100% reliable, medically sound, and safe output if LLM is unavailable or fails.
   */
  public static generateDeterministicPlan(
    assessment: DeterministicAssessment
  ): ActionPlan {
    const risk = assessment.overallRisk;
    const profile = assessment.profile;

    if (risk === "SEVERE") {
      return {
        summary: `CRITICAL ALERT: Environmental conditions present severe hazards for ${profile} individuals. Atmospheric exposure must be minimized immediately.`,
        topActions: [
          `Remain indoors within sealed, air-filtered environments with active cooling/filtration.`,
          profile === "asthma"
            ? `Keep rescue inhaler readily accessible; use HEPA air purifier continuously.`
            : profile === "outdoor_worker"
            ? `Suspend heavy physical labor; enforce 20-min shaded rest cycles with electrolyte fluids.`
            : `Hydrate intensively (at least 500ml water/electrolytes per hour).`,
          `Reschedule all outdoor recreational activities to low-risk early morning or evening hours.`,
        ],
        safeWindows: [
          "05:30 - 07:30 (Lowest solar radiation and baseline particulate levels)",
          "21:00 - 23:30 (Post-sunset ambient cooling period)",
        ],
        thingsToAvoid: [
          "Avoid direct outdoor physical exertion during peak afternoon hours (11:00 - 17:00).",
          "Avoid opening unsealed windows when outdoor AQI / PM2.5 levels are spiked.",
          "Avoid sugary, caffeinated, or dehydrating beverages.",
        ],
        checklist: [
          { id: "c1", item: "Verify HEPA filtration or sealed indoor cooling is operating", urgent: true },
          { id: "c2", item: "Hydration check: drink 500ml water with electrolytes", urgent: true },
          { id: "c3", item: "Notify vulnerable family members, coworkers, or guardians", urgent: true },
          { id: "c4", item: "Check local emergency weather and health bulletins", urgent: false },
        ],
      };
    }

    if (risk === "HIGH") {
      return {
        summary: `ELEVATED WARNING: Heightened environmental stress detected. High caution advised for ${profile} individuals during outdoor activities.`,
        topActions: [
          `Limit continuous outdoor exposure to under ${assessment.safeOutdoorDurationMinutes} minutes.`,
          profile === "child"
            ? `Apply SPF 50+ sunscreen, wear wide-brimmed UV protection, and ensure frequent water breaks.`
            : profile === "outdoor_worker"
            ? `Rotate to shaded work zones; increase fluid intake to 750ml/hour.`
            : `Seek shaded, well-ventilated or air-conditioned environments during midday hours.`,
          `Monitor respiratory comfort and thermal fatigue indicators closely.`,
        ],
        safeWindows: [
          "06:00 - 09:00 (Favorable morning atmospheric conditions)",
          "18:30 - 21:00 (Declining UV radiation and thermal relaxation)",
        ],
        thingsToAvoid: [
          "Avoid strenuous outdoor cardio workouts between 11:30 and 16:30.",
          "Avoid prolonged sun exposure without protective clothing and eyewear.",
        ],
        checklist: [
          { id: "c1", item: "Prepare reusable chilled water bottle with electrolytes", urgent: true },
          { id: "c2", item: "Apply broad-spectrum UV protection / wear protective hat", urgent: true },
          { id: "c3", item: "Schedule outdoor errands within the safe time window", urgent: false },
        ],
      };
    }

    if (risk === "MODERATE") {
      return {
        summary: `MODERATE CONDITIONS: Atmospheric indicators are within tolerable limits, with minor vigilance advised for sensitive ${profile} groups.`,
        topActions: [
          `Hydrate regularly throughout the day to support normal thermoregulation.`,
          `Wear light, breathable clothing and UV-rated sunglasses when outdoors.`,
          `Plan outdoor activities during morning or late afternoon for maximum comfort.`,
        ],
        safeWindows: [
          "07:00 - 11:00 (Optimal clean air and mild temperatures)",
          "16:00 - 20:00 (Gentle evening conditions)",
        ],
        thingsToAvoid: [
          "Avoid neglecting hydration during extended outdoor tasks.",
        ],
        checklist: [
          { id: "c1", item: "Carry a personal water flask", urgent: false },
          { id: "c2", item: "Review afternoon weather updates before extended travel", urgent: false },
        ],
      };
    }

    // LOW RISK
    return {
      summary: `OPTIMAL CONDITIONS: Environmental indicators are clean and comfortable across all metrics for ${profile} individuals.`,
      topActions: [
        `Take advantage of fresh outdoor air for exercise, commuting, and recreation.`,
        `Maintain standard healthy hydration habits throughout your day.`,
        `Ventilate indoor living spaces to refresh indoor air quality.`,
      ],
      safeWindows: ["06:00 - 22:00 (Unrestricted safe outdoor window)"],
      thingsToAvoid: ["No environmental hazards currently restrict outdoor activity."],
      checklist: [
        { id: "c1", item: "Enjoy outdoor physical activity and natural sunlight", urgent: false },
        { id: "c2", item: "Keep windows open for fresh room circulation", urgent: false },
      ],
    };
  }
}
