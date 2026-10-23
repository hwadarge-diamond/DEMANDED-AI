import { NextRequest, NextResponse } from "next/server";
import { CITIES } from "@/lib/cities";
import { VulnerabilityProfile } from "@/lib/types";
import { AgentOrchestrator } from "@/lib/agent-orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cityId = body.cityId || "delhi";
    const profile: VulnerabilityProfile = body.profile || "general";

    const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
    const response = await AgentOrchestrator.executePipeline(city, profile);

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("Agent pipeline error:", err);
    return NextResponse.json(
      { error: err.message || "Pipeline execution failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("city") || "delhi";
    const profile = (searchParams.get("profile") || "general") as VulnerabilityProfile;

    const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
    const response = await AgentOrchestrator.executePipeline(city, profile);

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Pipeline execution failed" },
      { status: 500 }
    );
  }
}
