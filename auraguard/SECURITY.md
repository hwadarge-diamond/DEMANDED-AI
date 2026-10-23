# AuraGuard Security & Safety Threat Model

AuraGuard is engineered with **Defense-in-Depth** and a strict **Zero-Trust AI Guardrail Architecture** designed to protect vulnerable individuals from environmental hazards while preventing prompt injections, adversarial overrides, and algorithmic risk downgrades.

---

## 1. STRIDE Threat Model & Mitigations

| STRIDE Category | Threat Vector | AuraGuard Architectural Mitigation | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Adversary falsifies geolocation or impersonates trusted weather feeds. | Server-side validation of coordinates, bounding box checks, and isolated server proxy to Open-Meteo with HTTPS and certificate validation. | `lib/weather-service.ts` |
| **Tampering** | Malicious injection attempting to alter risk thresholds or prompt parameters. | Inputs strictly parsed via TypeScript types and Zod schemas. LLM prompts separate untrusted inputs from system directives. | `lib/types.ts`, `lib/llm-reasoner.ts` |
| **Repudiation** | Ambiguity regarding which model or rule generated health recommendations. | Transparent 5-step `AgentTrace` records model identifier, precision timestamps, duration in ms, and rule audits. | `lib/agent-orchestrator.ts`, `components/AgentTracePanel.tsx` |
| **Information Disclosure** | Leakage of user personal medical status or location coordinates. | Zero PII is stored. User demographic profiles (`asthma`, `elderly`, `child`) are held purely in ephemeral client session memory. | Stateless Next.js API Routes |
| **Denial of Service** | Volumetric hammering of weather APIs or LLM billing quota exhaustion. | In-memory 10-minute caching per coordinate cluster; 5s AbortController timeouts; deterministic fallback when quotas exceed limits. | `lib/weather-service.ts` |
| **Elevation of Privilege** | LLM jailbreak or hallucination overriding clinical safety rules (e.g. advising outdoor jogging during hazardous AQI 300). | **Zero-Tolerance Safety Verifier**: The deterministic clinical assessment is the absolute source of truth. LLM outputs are audited; any risk downgrade or prohibited reckless phrase triggers immediate override by the deterministic plan. | `lib/verifier.ts`, `tests/verifier.test.ts` |

---

## 2. Guardrail Verifier Specifications

The verifier executes deterministic tests prior to delivering recommendations to users:
1. **Structural Conformance Check**: Validates that exactly 3 priority actions, structured safe time windows, and checklist items are returned.
2. **Reckless Advice & Hallucination Filter**: Regex scanning against banned phrases (e.g., `/safe to run outside/i`, `/enjoy (a )?marathon/i`, `/no precautions needed/i`).
3. **Hard Clinical Safety Rules Enforcement**:
   - `CRITICAL_ASTHMA_BRONCHIAL_SPASM_RISK`: If PM2.5 > 35 µg/m³, strenuous outdoor cardiovascular activity is blocked.
   - `CRITICAL_ELDERLY_CARDIOVASCULAR_STRAIN`: If apparent temperature > 38°C, mandatory cooling and shaded hydration are enforced.
   - `CRITICAL_CHILD_CELLULAR_UV_DAMAGE`: If UV Index >= 8, direct midday solar exposure is blocked.
   - `COMPOUND_ENVIRONMENTAL_CRISIS`: Concurrent extreme heat and elevated particulates automatically trigger SEVERE escalation.
4. **Deterministic Override**: If any verification rule fails, the pipeline immediately substitutes the plan with the unit-tested, clinically verified deterministic protocol.

---

## 3. Defense-in-Depth HTTP Security Headers

Configured in `next.config.mjs`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
