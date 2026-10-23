import {
  SimulationParameters,
  SimulationResult,
  EducationalModule,
} from "../types";

export const EDUCATIONAL_MODULES: EducationalModule[] = [
  {
    id: "mod-01",
    title: "The Wet-Bulb Phenomenon: Why Humidity Kills",
    domain: "health",
    targetAudience: "communities",
    keyTakeaway:
      "When relative humidity exceeds 75% at 35°C, the human body can no longer evaporate sweat to cool itself, causing internal body temperature to rise rapidly toward organ failure in under 4 hours.",
    actionChecklist: [
      "Always measure 'Apparent Temperature' (Heat Index), never dry thermometer alone.",
      "In high humidity, seek air-conditioned dehumidified environments immediately.",
      "Fans without mist or cooling stop working effectively when ambient temp > 36°C.",
    ],
    mythVsFact: {
      myth: "Drinking ice water is all you need to stay safe in a heatwave.",
      fact: "If ambient humidity blocks sweat evaporation, core temperature keeps rising regardless of cold liquid intake. Active external air cooling is required.",
    },
  },
  {
    id: "mod-02",
    title: "PM2.5 Alveolar Penetration: The Silent Cardiovascular Hazard",
    domain: "health",
    targetAudience: "students",
    keyTakeaway:
      "PM2.5 particles are smaller than 2.5 microns (30x thinner than a human hair). Unlike dust, they bypass the upper airway and pass directly into lung alveoli and bloodstream, inducing vascular inflammation.",
    actionChecklist: [
      "Wear certified N95 / FFP2 masks when AQI exceeds 150 (cloth masks do not filter PM2.5).",
      "Run HEPA filters in bedroom sleeping zones during peak nighttime pollution inversions.",
      "Keep windows tightly latched during early morning temperature inversions.",
    ],
    mythVsFact: {
      myth: "You can build tolerance to polluted city air if you grow up in it.",
      fact: "Particulate matter causes cumulative micro-scarring of lung tissue and arterial plaque buildup regardless of perceived acclimatization.",
    },
  },
  {
    id: "mod-03",
    title: "HACCP & Cold-Chain Discipline in Food Recovery",
    domain: "food",
    targetAudience: "volunteers",
    keyTakeaway:
      "The 'Thermal Danger Zone' (4°C to 60°C) allows bacterial colonies (Staphylococcus, Bacillus cereus) to double every 20 minutes. Cooked food left in this zone over 2 hours cannot be made safe by reheating.",
    actionChecklist: [
      "Blast-chill hot surplus catering to below 4°C within 90 minutes of service.",
      "Always use insulated coolers with ice gel packs for transit under 45 minutes.",
      "Verify core temperature with an infrared probe before serving to shelter recipients.",
    ],
    mythVsFact: {
      myth: "Reheating spoiled food kills all bacteria and makes it safe.",
      fact: "While heat kills live bacteria, it does not destroy heat-stable enterotoxins already produced, which cause violent food poisoning.",
    },
  },
  {
    id: "mod-04",
    title: "Scope 3 Carbon Accounting & Circular Logistics",
    domain: "business",
    targetAudience: "enterprise",
    keyTakeaway:
      "Decomposing food in municipal landfills generates anaerobic methane (CH4), a greenhouse gas 28x more potent than CO2. Diverting 1 ton of food equals averting 2.5 tons of CO2e.",
    actionChecklist: [
      "Integrate automated donation intake into ERP inventory closing shifts.",
      "Claim IRS 170(e)(3) corporate tax deductions for enhanced food donations.",
      "Audit logistics routes for electric-cargo-bike last-mile dispatch.",
    ],
    mythVsFact: {
      myth: "Composting food waste is just as good as rescuing it for humans.",
      fact: "Feeding people preserves all the embodied energy, water, and agricultural labor, whereas composting only recovers baseline soil nutrients.",
    },
  },
];

export class EducationSimulationEngine {
  /**
   * Deterministically calculates projected consequences of climate scenarios.
   */
  public static runSimulation(params: SimulationParameters): SimulationResult {
    // 1. Heat Stroke Risk Index (0-100)
    let heatIndex = 10;
    if (params.ambientTempCelsius >= 43) heatIndex = 95;
    else if (params.ambientTempCelsius >= 38) heatIndex = 75;
    else if (params.ambientTempCelsius >= 32) heatIndex = 45;
    else if (params.ambientTempCelsius >= 28) heatIndex = 25;

    // Weight by elderly and outdoor vulnerability
    heatIndex += params.vulnerabilitySplit.elderlyPct * 0.3;
    heatIndex = Math.min(100, Math.round(heatIndex));

    // 2. Pulmonary Emergency Index (0-100)
    let pulmonaryIndex = 10;
    if (params.aqiValue >= 300) pulmonaryIndex = 98;
    else if (params.aqiValue >= 200) pulmonaryIndex = 80;
    else if (params.aqiValue >= 120) pulmonaryIndex = 50;
    else if (params.aqiValue >= 60) pulmonaryIndex = 25;

    pulmonaryIndex += params.vulnerabilitySplit.asthmaPct * 0.4;
    pulmonaryIndex = Math.min(100, Math.round(pulmonaryIndex));

    // 3. Projected ER visits per 100,000 population per hour
    const baseRate = (heatIndex * 0.18 + pulmonaryIndex * 0.22) * (params.populationScale / 100000);
    const projectedERVisits = Math.max(1, Math.round(baseRate * 10) / 10);

    // 4. School Status
    let schoolStatus: "PERMITTED" | "RESTRICTED_RECESS" | "STRICT_INDOOR_CLOSURE" = "PERMITTED";
    if (params.ambientTempCelsius >= 38 || params.aqiValue >= 200) {
      schoolStatus = "STRICT_INDOOR_CLOSURE";
    } else if (params.ambientTempCelsius >= 33 || params.aqiValue >= 100) {
      schoolStatus = "RESTRICTED_RECESS";
    }

    // 5. Labor Advisory
    let laborAdvisory: "NORMAL" | "MODIFIED_SHIFTS" | "MANDATORY_HALT" = "NORMAL";
    if (params.ambientTempCelsius >= 42 || params.aqiValue >= 250) {
      laborAdvisory = "MANDATORY_HALT";
    } else if (params.ambientTempCelsius >= 35 || params.aqiValue >= 140) {
      laborAdvisory = "MODIFIED_SHIFTS";
    }

    // Guidance list
    const guidance: string[] = [];
    if (schoolStatus === "STRICT_INDOOR_CLOSURE") {
      guidance.push("All educational institutions must cancel outdoor activities and operate indoor air-scrubbers.");
    }
    if (laborAdvisory === "MANDATORY_HALT") {
      guidance.push("Occupational safety guidelines mandate complete suspension of unshaded physical labor.");
    }
    if (heatIndex >= 70) {
      guidance.push("Municipal cooling hubs activated. High alert for nursing homes and isolated seniors.");
    }
    if (pulmonaryIndex >= 60) {
      guidance.push("Distribute emergency N95 respirators at transit hubs; asthma patients advised to remain indoors.");
    }

    return {
      heatStrokeRiskIndex: heatIndex,
      pulmonaryEmergencyIndex: pulmonaryIndex,
      projectedERVisitsPerHour: projectedERVisits,
      schoolOutdoorStatus: schoolStatus,
      laborAdvisory,
      recommendedCitizenGuidance: guidance,
    };
  }
}
