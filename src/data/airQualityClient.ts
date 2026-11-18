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

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isForecastPoint(value: unknown): value is { time: string; aqi: number } {
  if (typeof value !== 'object' || value === null) return false;
  const point = value as Record<string, unknown>;
  return typeof point.time === 'string' && typeof point.aqi === 'number' && Number.isFinite(point.aqi);
}

export function isLiveAirQuality(value: unknown): value is LiveAirQuality {
  if (typeof value !== 'object' || value === null) return false;
  const reading = value as Record<string, unknown>;
  const pollutants = reading.pollutants;
  const cleanestWindow = reading.cleanestWindow;

  return typeof reading.city === 'string'
    && typeof reading.requestedCity === 'string'
    && typeof reading.aqi === 'number'
    && Number.isFinite(reading.aqi)
    && typeof reading.category === 'string'
    && (typeof reading.dominantPollutant === 'string' || reading.dominantPollutant === null)
    && typeof reading.indexName === 'string'
    && typeof reading.updatedAt === 'string'
    && Number.isFinite(Date.parse(reading.updatedAt))
    && typeof reading.source === 'string'
    && Array.isArray(reading.forecast)
    && reading.forecast.every(isForecastPoint)
    && (cleanestWindow === null || isForecastPoint(cleanestWindow))
    && typeof pollutants === 'object'
    && pollutants !== null
    && isNullableNumber((pollutants as Record<string, unknown>).pm2_5)
    && isNullableNumber((pollutants as Record<string, unknown>).pm10)
    && isNullableNumber((pollutants as Record<string, unknown>).nitrogenDioxide)
    && isNullableNumber((pollutants as Record<string, unknown>).ozone);
}

export async function fetchLiveAirQuality(city: string, signal?: AbortSignal): Promise<LiveAirQuality> {
  const response = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`, { signal });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = typeof body === 'object' && body !== null && typeof (body as Record<string, unknown>).error === 'string'
      ? (body as Record<string, string>).error
      : 'Live air quality is unavailable.';
    throw new Error(error);
  }
  if (!isLiveAirQuality(body)) throw new Error('Live air quality returned an invalid response.');
  return body;
}
