import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLiveAirQuality, isLiveAirQuality } from './airQualityClient';

const validReading = {
  city: 'Delhi, India', requestedCity: 'Delhi', aqi: 120, category: 'Unhealthy for sensitive groups',
  dominantPollutant: 'PM2.5', indexName: 'US AQI (modeled)', updatedAt: '2026-11-18T17:00:00.000Z',
  source: 'Open-Meteo / CAMS', forecast: [{ time: '2026-11-18T22:00', aqi: 121 }],
  cleanestWindow: { time: '2026-11-19T06:00', aqi: 110 },
  pollutants: { pm2_5: 42, pm10: 55, nitrogenDioxide: 20, ozone: null },
};

const invalidReadings: Array<{ name: string; reading: unknown }> = [
  { name: 'invalid timestamps', reading: { ...validReading, updatedAt: 'not-a-date' } },
  { name: 'non-finite forecast values', reading: { ...validReading, forecast: [{ time: 'soon', aqi: Number.NaN }] } },
  { name: 'non-numeric pollutants', reading: { ...validReading, pollutants: { ...validReading.pollutants, pm2_5: '42' } } },
  { name: 'malformed cleanest windows', reading: { ...validReading, cleanestWindow: { time: 123, aqi: 110 } } },
  { name: 'out-of-range current AQI', reading: { ...validReading, aqi: 900 } },
  { name: 'out-of-range forecast AQI', reading: { ...validReading, forecast: [{ time: '2026-11-18T22:00', aqi: -1 }] } },
  { name: 'malformed forecast times', reading: { ...validReading, forecast: [{ time: 'soon', aqi: 100 }] } },
  { name: 'negative pollutant concentrations', reading: { ...validReading, pollutants: { ...validReading.pollutants, pm2_5: -3 } } },
];

describe('air-quality client boundary', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects malformed successful responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    await expect(fetchLiveAirQuality('Delhi')).rejects.toThrow(/invalid response/i);
  });

  it('preserves a provider error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'City not found.' }) }));
    await expect(fetchLiveAirQuality('Unknown')).rejects.toThrow('City not found.');
  });

  it('accepts a complete normalized response', () => {
    expect(isLiveAirQuality(validReading)).toBe(true);
  });

  it.each(invalidReadings)('rejects $name', ({ reading }) => {
    expect(isLiveAirQuality(reading)).toBe(false);
  });
});
