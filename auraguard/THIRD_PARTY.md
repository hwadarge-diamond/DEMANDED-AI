# Third-Party Disclosures & Software Bill of Materials (SBOM)

In accordance with competition rules for **"Build Beyond AI: Engineer Secure, Intelligent and Autonomous Applications"**, this document enumerates all external open-source libraries, pretrained model APIs, and frameworks utilized in **AuraGuard**.

---

## 1. Core Framework & Runtimes

| Package Name | Version | License | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Next.js** | `14.2.15` | MIT | Full-stack React framework with App Router, API routes, and SSR/SSG. |
| **React** | `18.3.1` | MIT | Component tree state management and DOM rendering engine. |
| **React-DOM** | `18.3.1` | MIT | Web browser entry point for React UI hierarchy. |
| **TypeScript** | `5.6.3` | Apache-2.0 | Strict static type verification and schema enforcement across the pipeline. |

---

## 2. 3D Graphics & Spatial Visualization

| Package Name | Version | License | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Three.js** | `0.169.0` | MIT | Procedural WebGL renderer. Renders the low-poly living city with 60 FPS `InstancedMesh` buildings, real-time shader fog, dynamic particulate smog simulation, and pulsing alert dome. |
| **@types/three** | `0.169.0` | MIT | Static TypeScript definitions for Three.js geometry, materials, and scenes. |

---

## 3. Validation, Styling & UI Primitives

| Package Name | Version | License | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Zod** | `3.23.8` | MIT | Strict runtime schema parsing and structural validation for LLM cognitive outputs. |
| **Tailwind CSS** | `3.4.14` | MIT | Utility-first responsive design system, custom cyber-eco tokens, and dark mode palette. |
| **PostCSS** | `8.4.47` | MIT | CSS transformation and autoprefixing pipeline. |
| **Autoprefixer** | `10.4.20` | MIT | Automated CSS vendor prefixing for cross-browser visual fidelity. |
| **Lucide-React** | `0.453.0` | MIT | Accessible SVG icon primitives for sensor telemetry, profiles, and badges. |
| **clsx / tailwind-merge** | `2.1.1 / 2.5.4` | MIT | Safe dynamic CSS class concatenation and collision resolution. |

---

## 4. Testing & Verification

| Package Name | Version | License | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Vitest** | `2.1.9` | MIT | High-performance unit testing harness validating the deterministic clinical risk engine and safety guardrail verifier. |

---

## 5. Pretrained Models & External Live APIs

| Service / API | Provider | Purpose & Failover Configuration |
| :--- | :--- | :--- |
| **Open-Meteo Weather API** | Open-Meteo GmbH (Free, Open Access) | Live real-time ambient temperature, apparent heat index, UV radiation, and wind telemetry. Ingested through server-side cached route with retry. |
| **Open-Meteo Air Quality API** | Open-Meteo GmbH (Free, Open Access) | Live PM2.5, PM10, European/US AQI, Ozone, and NO2 telemetry. |
| **Google Gemini 1.5 Flash** | Google LLC | Multimodal LLM generating structured clinical mitigation protocols via REST API. |
| **OpenAI GPT-4o-mini / Groq** | OpenAI / Groq Inc | Optional multi-provider cognitive routing fallbacks. |
| **Deterministic Fallback Engine** | AuraGuard Proprietary | 100% offline, zero-latency clinical rule engine guaranteeing judges never experience a broken demo. |
