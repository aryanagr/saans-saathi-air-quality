export interface LiveAirQuality {
  city: string;
  requestedCity: string;
  aqi: number;
  category: string;
  dominantPollutant: string | null;
  indexName: string;
  updatedAt: string;
  source: string;
  forecast: Array<{ time: string; aqi: number }>;
  cleanestWindow: { time: string; aqi: number } | null;
  pollutants: { pm2_5: number | null; pm10: number | null; nitrogenDioxide: number | null; ozone: number | null };
}

export async function fetchLiveAirQuality(city: string, signal?: AbortSignal): Promise<LiveAirQuality> {
  const response = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`, { signal });
  const body = await response.json().catch(() => ({})) as LiveAirQuality & { error?: string };
  if (!response.ok) throw new Error(body.error ?? 'Live air quality is unavailable.');
  return body;
}
