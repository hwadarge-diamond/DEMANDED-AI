export interface CityConfig {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  typicalHazard: string;
  elevation: number;
}

export const CITIES: CityConfig[] = [
  {
    id: "delhi",
    name: "Delhi",
    country: "India",
    lat: 28.6139,
    lng: 77.209,
    timezone: "Asia/Kolkata",
    typicalHazard: "Severe particulate matter (PM2.5) & seasonal extreme heat",
    elevation: 216,
  },
  {
    id: "phoenix",
    name: "Phoenix",
    country: "United States",
    lat: 33.4484,
    lng: -112.074,
    timezone: "America/Phoenix",
    typicalHazard: "Extreme desert heatwave (>42°C) & high UV index",
    elevation: 331,
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2048,
    lng: 55.2708,
    timezone: "Asia/Dubai",
    typicalHazard: "Compound extreme heat index, humidity & UV",
    elevation: 16,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    timezone: "Asia/Tokyo",
    typicalHazard: "Urban heat island & summer oppressive humidity",
    elevation: 40,
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    lat: 40.7128,
    lng: -74.006,
    timezone: "America/New_York",
    typicalHazard: "Urban heat spikes, ozone & wildfire smoke plumes",
    elevation: 10,
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    timezone: "Europe/London",
    typicalHazard: "Maritime temperature shifts & unadapted heat resilience",
    elevation: 11,
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    timezone: "Australia/Sydney",
    typicalHazard: "Severe solar UV radiation & airborne allergens",
    elevation: 19,
  },
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    lat: 30.0444,
    lng: 31.2357,
    timezone: "Africa/Cairo",
    typicalHazard: "Dust/particulate suspension & arid thermal peaks",
    elevation: 23,
  },
];
