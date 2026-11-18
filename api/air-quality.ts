import type { IncomingMessage, ServerResponse } from 'node:http';

const CITY_PATTERN = /^[\p{L}\p{M}\d .,'()-]+$/u;
const REQUEST_TIMEOUT_MS = 8_000;

type CurrentAir = {
  time?: string; us_aqi?: number; pm2_5?: number; pm10?: number; carbon_monoxide?: number;
  nitrogen_dioxide?: number; sulphur_dioxide?: number; ozone?: number;
  us_aqi_pm2_5?: number; us_aqi_pm10?: number; us_aqi_nitrogen_dioxide?: number;
  us_aqi_carbon_monoxide?: number; us_aqi_sulphur_dioxide?: number; us_aqi_ozone?: number;
};

type HourlyAir = { time?: string[]; us_aqi?: Array<number | null> };

export function findCleanestWindow(times: string[] = [], values: Array<number | null> = []) {
  const candidates = times.map((time, index) => ({ time, value: values[index] }))
    .filter((entry): entry is { time: string; value: number } => {
      const hour = Number(entry.time.slice(11, 13));
      return Number.isFinite(entry.value) && hour >= 6 && hour <= 20;
    });
  return candidates.sort((a, b) => a.value - b.value)[0] ?? null;
}

export function validateCity(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const city = value.trim().replace(/\s+/g, ' ');
  return city.length >= 2 && city.length <= 80 && CITY_PATTERN.test(city) ? city : null;
}

export function getUsAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for sensitive groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very unhealthy';
  return 'Hazardous';
}

export function getDominantPollutant(current: CurrentAir): string | null {
  const components: Array<[string, number | undefined]> = [
    ['PM2.5', current.us_aqi_pm2_5], ['PM10', current.us_aqi_pm10],
    ['NO₂', current.us_aqi_nitrogen_dioxide], ['CO', current.us_aqi_carbon_monoxide],
    ['SO₂', current.us_aqi_sulphur_dioxide], ['O₃', current.us_aqi_ozone],
  ];
  return components.filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Air data provider returned ${response.status}`);
  return response.json() as Promise<T>;
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return sendJson(response, 405, { error: 'Method not allowed.' });
  }

  const requestUrl = new URL(request.url ?? '/', 'https://saans-saathi.local');
  const city = validateCity(requestUrl.searchParams.get('city'));
  if (!city) return sendJson(response, 400, { error: 'Enter a valid city name.' });

  try {
    const geocodeUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geocodeUrl.searchParams.set('name', city);
    geocodeUrl.searchParams.set('count', '1');
    geocodeUrl.searchParams.set('language', 'en');
    geocodeUrl.searchParams.set('format', 'json');
    const geocode = await fetchJson<{ results?: Array<{ name: string; latitude: number; longitude: number; admin1?: string; country?: string }> }>(geocodeUrl.toString());
    const location = geocode.results?.[0];
    if (!location) return sendJson(response, 404, { error: 'City not found.' });

    const airUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    airUrl.searchParams.set('latitude', String(location.latitude));
    airUrl.searchParams.set('longitude', String(location.longitude));
    airUrl.searchParams.set('timezone', 'GMT');
    airUrl.searchParams.set('forecast_hours', '24');
    airUrl.searchParams.set('hourly', 'us_aqi');
    airUrl.searchParams.set('current', [
      'us_aqi', 'pm2_5', 'pm10', 'carbon_monoxide', 'nitrogen_dioxide', 'sulphur_dioxide', 'ozone',
      'us_aqi_pm2_5', 'us_aqi_pm10', 'us_aqi_nitrogen_dioxide', 'us_aqi_carbon_monoxide',
      'us_aqi_sulphur_dioxide', 'us_aqi_ozone',
    ].join(','));
    const air = await fetchJson<{ current?: CurrentAir; hourly?: HourlyAir }>(airUrl.toString());
    const current = air.current;
    if (!current || !Number.isFinite(current.us_aqi)) return sendJson(response, 502, { error: 'No current AQI is available for this city.' });

    const aqi = Math.round(current.us_aqi as number);
    const forecast = (air.hourly?.time ?? []).map((time, index) => ({
      time,
      aqi: air.hourly?.us_aqi?.[index] == null ? null : Math.round(air.hourly.us_aqi[index] as number),
    })).filter((entry): entry is { time: string; aqi: number } => entry.aqi !== null);
    const cleanest = findCleanestWindow(air.hourly?.time, air.hourly?.us_aqi);
    response.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=1800');
    return sendJson(response, 200, {
      city: [location.name, location.admin1, location.country].filter(Boolean).join(', '),
      requestedCity: city,
      aqi,
      category: getUsAqiCategory(aqi),
      dominantPollutant: getDominantPollutant(current),
      indexName: 'US AQI (modeled)',
      updatedAt: current.time ? `${current.time}:00Z` : new Date().toISOString(),
      source: 'Open-Meteo / CAMS',
      forecast,
      cleanestWindow: cleanest ? { time: cleanest.time, aqi: Math.round(cleanest.value) } : null,
      pollutants: { pm2_5: current.pm2_5 ?? null, pm10: current.pm10 ?? null, nitrogenDioxide: current.nitrogen_dioxide ?? null, ozone: current.ozone ?? null },
    });
  } catch (error) {
    console.error('Live air-quality lookup failed', error instanceof Error ? error.message : 'Unknown error');
    return sendJson(response, 502, { error: 'Current air quality is temporarily unavailable.' });
  }
}
