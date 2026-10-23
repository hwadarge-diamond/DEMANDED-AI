import {
  ActionPlan,
  ActionPlanSchema,
  DeterministicAssessment,
  EnvironmentalData,
} from "./types";
import { SafetyVerifier } from "./verifier";

export class LLMReasoner {
  /**
   * Generates tailored clinical advice using an LLM (Gemini / OpenAI / Groq)
   * with strict Zod validation and transparent deterministic fallback.
   */
  public static async generatePlan(
    data: EnvironmentalData,
    assessment: DeterministicAssessment
  ): Promise<{ plan: ActionPlan; model: string }> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // 1. Try Gemini if configured
    if (geminiKey) {
      try {
        const plan = await this.callGemini(data, assessment, geminiKey);
        return { plan, model: "Google Gemini 1.5 Flash (Live LLM)" };
      } catch (err) {
        console.warn("Gemini call failed or timed out; engaging deterministic fallback:", err);
      }
    }

    // 2. Try OpenAI if configured
    if (openAiKey) {
      try {
        const plan = await this.callOpenAI(data, assessment, openAiKey);
        return { plan, model: "OpenAI GPT-4o-mini (Live LLM)" };
      } catch (err) {
        console.warn("OpenAI call failed; engaging deterministic fallback:", err);
      }
    }

    // 3. Try Groq if configured
    if (groqKey) {
      try {
        const plan = await this.callGroq(data, assessment, groqKey);
        return { plan, model: "Groq Llama-3.3-70b (Live LLM)" };
      } catch (err) {
        console.warn("Groq call failed; engaging deterministic fallback:", err);
      }
    }

    // 4. Deterministic Clinical Engine Fallback (Guaranteed 100% Reliable & Non-Breaking)
    const fallbackPlan = SafetyVerifier.generateDeterministicPlan(assessment);
    return {
      plan: fallbackPlan,
      model: "AuraGuard Deterministic Clinical Reasoning Engine (Zero-Latency Fallback)",
    };
  }

  private static async callGemini(
    data: EnvironmentalData,
    assessment: DeterministicAssessment,
    apiKey: string
  ): Promise<ActionPlan> {
    const prompt = this.buildPrompt(data, assessment);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) throw new Error(`Gemini status ${res.status}`);
      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty Gemini response");

      const parsed = JSON.parse(rawText);
      return ActionPlanSchema.parse(parsed);
    } finally {
      clearTimeout(timeout);
    }
  }

  private static async callOpenAI(
    data: EnvironmentalData,
    assessment: DeterministicAssessment,
    apiKey: string
  ): Promise<ActionPlan> {
    const prompt = this.buildPrompt(data, assessment);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are AuraGuard Clinical Climate-Health Reasoner. Return strictly valid JSON adhering to the schema.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!res.ok) throw new Error(`OpenAI status ${res.status}`);
      const json = await res.json();
      const rawText = json.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawText);
      return ActionPlanSchema.parse(parsed);
    } finally {
      clearTimeout(timeout);
    }
  }

  private static async callGroq(
    data: EnvironmentalData,
    assessment: DeterministicAssessment,
    apiKey: string
  ): Promise<ActionPlan> {
    const prompt = this.buildPrompt(data, assessment);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) throw new Error(`Groq status ${res.status}`);
    const json = await res.json();
    const parsed = JSON.parse(json.choices?.[0]?.message?.content);
    return ActionPlanSchema.parse(parsed);
  }

  private static buildPrompt(
    data: EnvironmentalData,
    assessment: DeterministicAssessment
  ): string {
    return `
You are the clinical reasoner for AuraGuard, an autonomous climate-health protection grid.
ENVIRONMENTAL SENSOR DATA:
- City: ${data.city}, ${data.country}
- Ambient Temperature: ${data.temperature}°C (Feels Like / Heat Index: ${data.apparentTemperature}°C)
- PM2.5 Fine Particulates: ${data.pm25} µg/m³ (AQI: ${data.aqi})
- Solar UV Index: ${data.uvIndex}
- Relative Humidity: ${data.humidity}%

CLINICAL DETERMINISTIC RISK ASSESSMENT:
- Demographic Profile: ${assessment.profile}
- Calculated Risk Level: ${assessment.overallRisk}
- Primary Hazard: ${assessment.primaryHazard}
- Hard Clinical Rules Active: ${JSON.stringify(assessment.hardRulesTriggered)}
- Maximum Recommended Safe Outdoor Duration: ${assessment.safeOutdoorDurationMinutes} minutes

SAFETY MANDATE:
You must NEVER downgrade the risk level. Provide concrete, highly specific, actionable advice for a ${assessment.profile} person in these conditions.

Return a STRICT JSON object with this exact shape:
{
  "summary": "Concise 1-2 sentence climate-health summary highlighting key risk and advice.",
  "topActions": [
    "Priority Action 1 tailored to profile",
    "Priority Action 2 tailored to profile",
    "Priority Action 3 tailored to profile"
  ],
  "safeWindows": [
    "Time window 1 with brief reason",
    "Time window 2 with brief reason"
  ],
  "thingsToAvoid": [
    "Specific high-risk activity 1",
    "Specific high-risk activity 2"
  ],
  "checklist": [
    { "id": "chk1", "item": "Actionable checklist item", "urgent": true },
    { "id": "chk2", "item": "Actionable checklist item", "urgent": true },
    { "id": "chk3", "item": "Actionable checklist item", "urgent": false }
  ]
}
`.trim();
  }
}
