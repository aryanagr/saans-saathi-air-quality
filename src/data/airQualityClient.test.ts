import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLiveAirQuality } from './airQualityClient';

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
});
