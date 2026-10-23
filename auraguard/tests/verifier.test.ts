import { describe, it, expect } from "vitest";
import { SafetyVerifier } from "@/lib/verifier";
import { ActionPlan, DeterministicAssessment } from "@/lib/types";

const mockSevereAssessment: DeterministicAssessment = {
  overallRisk: "SEVERE",
  profileRisk: "SEVERE",
  profile: "asthma",
  primaryHazard: "Severe PM2.5 Fine Particulates",
  factors: [],
  hardRulesTriggered: ["CRITICAL_ASTHMA_BRONCHIAL_SPASM_RISK"],
  safeOutdoorDurationMinutes: 15,
  timestamp: new Date().toISOString(),
};

describe("Safety Guardrail Verifier", () => {
  it("should block hallucinated dangerous advice and override with deterministic safety plan", () => {
    const dangerousPlan: ActionPlan = {
      summary: "Air is slightly hazy but it is safe to run outside and enjoy a marathon.",
      topActions: [
        "Go for a 10km run outside without an inhaler",
        "Keep windows wide open all day",
        "No precautions needed today",
      ],
      safeWindows: ["All day"],
      thingsToAvoid: ["Nothing to avoid"],
      checklist: [{ id: "c1", item: "Exercise outdoors", urgent: false }],
    };

    const verification = SafetyVerifier.verifyPlan(dangerousPlan, mockSevereAssessment);
    expect(verification.status).toBe("OVERRIDDEN_FOR_SAFETY");
    expect(verification.auditChecks.some((c) => c.rule === "DANGEROUS_ADVICE_FILTER" && !c.passed)).toBe(true);
    expect(verification.finalPlan.summary).toContain("CRITICAL ALERT");
    expect(verification.finalPlan.thingsToAvoid.some((t) => t.includes("Avoid direct outdoor"))).toBe(true);
  });

  it("should approve valid and safe action plans that respect clinical boundaries", () => {
    const validPlan: ActionPlan = {
      summary: "High environmental particulate density observed. Keep indoor HEPA air filtration active.",
      topActions: [
        "Remain indoors in clean, air-filtered room",
        "Keep fast-acting rescue inhaler immediately accessible",
        "Reschedule outdoor errands to early morning hours",
      ],
      safeWindows: ["06:00 - 07:30"],
      thingsToAvoid: ["Strenuous outdoor running or jogging", "Unfiltered ventilation"],
      checklist: [
        { id: "c1", item: "Run HEPA air purifier", urgent: true },
        { id: "c2", item: "Check inhaler dosage count", urgent: true },
        { id: "c3", item: "Hydrate with warm fluids", urgent: false },
      ],
    };

    const verification = SafetyVerifier.verifyPlan(validPlan, mockSevereAssessment);
    expect(verification.status).toBe("VERIFIED_ACCURATE");
    expect(verification.auditChecks.every((c) => c.passed)).toBe(true);
  });

  it("should enforce exactly 3 top actions rule", () => {
    const invalidCountPlan: ActionPlan = {
      summary: "Valid summary for general user.",
      topActions: ["Only one action provided"],
      safeWindows: ["Morning"],
      thingsToAvoid: ["Avoid heat"],
      checklist: [{ id: "c1", item: "Drink water", urgent: false }],
    };

    const verification = SafetyVerifier.verifyPlan(invalidCountPlan, {
      ...mockSevereAssessment,
      overallRisk: "LOW",
      profile: "general",
    });

    expect(verification.status).toBe("OVERRIDDEN_FOR_SAFETY");
    expect(verification.auditChecks.some((c) => c.rule === "STRUCTURAL_COMPLIANCE" && !c.passed)).toBe(true);
  });
});
