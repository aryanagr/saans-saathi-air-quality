import type { IncomingMessage, ServerResponse } from 'node:http';

const CITY_PATTERN = /^[\p{L}\p{M}\d .,'()-]+$/u;
const REQUEST_TIMEOUT_MS = 8_000;

type GoogleIndex = {
  code?: string;
  displayName?: string;
  aqi?: number;
  category?: string;
  dominantPollutant?: string;
};

export function validateCity(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const city = value.trim().replace(/\s+/g, ' ');
  return city.length >= 2 && city.length <= 80 && CITY_PATTERN.test(city) ? city : null;
}

export function selectAirQualityIndex(indexes: GoogleIndex[] = []): GoogleIndex | null {
  return indexes.find((item) => item.code !== 'uaqi' && Number.isFinite(item.aqi))
    ?? indexes.find((item) => item.code === 'uaqi' && Number.isFinite(item.aqi))
    ?? indexes.find((item) => Number.isFinite(item.aqi))
    ?? null;
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

async function googleJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Google API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  const url = new URL(request.url ?? '/', 'https://saans-saathi.local');
  const city = validateCity(url.searchParams.get('city'));
  if (!city) return sendJson(response, 400, { error: 'Enter a valid city name.' });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return sendJson(response, 503, { error: 'Live air quality is not configured.' });

  try {
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geocodeUrl.searchParams.set('address', city);
    geocodeUrl.searchParams.set('key', apiKey);

    const geocode = await googleJson<{
      status: string;
      results?: Array<{ formatted_address: string; geometry: { location: { lat: number; lng: number } } }>;
    }>(geocodeUrl.toString());
    const result = geocode.results?.[0];
    if (geocode.status !== 'OK' || !result) return sendJson(response, 404, { error: 'City not found.' });

    const air = await googleJson<{
      dateTime?: string;
      indexes?: GoogleIndex[];
    }>(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { latitude: result.geometry.location.lat, longitude: result.geometry.location.lng },
        extraComputations: ['LOCAL_AQI', 'DOMINANT_POLLUTANT_CONCENTRATION'],
        universalAqi: true,
        languageCode: 'en',
      }),
    });

    const index = selectAirQualityIndex(air.indexes);
    if (!index || !Number.isFinite(index.aqi)) return sendJson(response, 502, { error: 'No current AQI is available for this city.' });

    response.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    return sendJson(response, 200, {
      city: result.formatted_address,
      requestedCity: city,
      aqi: Math.round(index.aqi as number),
      category: index.category ?? 'Current conditions',
      dominantPollutant: index.dominantPollutant ?? null,
      indexName: index.displayName ?? index.code ?? 'AQI',
      updatedAt: air.dateTime ?? new Date().toISOString(),
      source: 'Google Maps Air Quality',
    });
  } catch (error) {
    console.error('Live air-quality lookup failed', error instanceof Error ? error.message : 'Unknown error');
    return sendJson(response, 502, { error: 'Live air quality is temporarily unavailable.' });
  }
}
