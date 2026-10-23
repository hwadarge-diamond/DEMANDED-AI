import { NextRequest, NextResponse } from "next/server";
import { CITIES } from "@/lib/cities";
import { WeatherService } from "@/lib/weather-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get("city") || "delhi";
    const city = CITIES.find((c) => c.id === cityId) || CITIES[0];

    const data = await WeatherService.fetchCityEnvironmentalData(city);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch environmental data" },
      { status: 500 }
    );
  }
}
