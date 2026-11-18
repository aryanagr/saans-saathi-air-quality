import { describe, expect, it } from 'vitest';
import { findCleanestWindow, getDominantPollutant, getUsAqiCategory, localTimeToUtc, resolveKnownCity, validateCity } from './air-quality';

describe('live air-quality API helpers', () => {
  it('normalizes safe city names', () => {
    expect(validateCity('  New   Delhi  ')).toBe('New Delhi');
    expect(validateCity('São Paulo, Brazil')).toBe('São Paulo, Brazil');
  });

  it('rejects invalid input', () => {
    expect(validateCity('<script>')).toBeNull();
    expect(validateCity('a')).toBeNull();
    expect(validateCity('x'.repeat(81))).toBeNull();
  });

  it('uses the US AQI category boundaries', () => {
    expect(getUsAqiCategory(50)).toBe('Good');
    expect(getUsAqiCategory(101)).toBe('Unhealthy for sensitive groups');
    expect(getUsAqiCategory(301)).toBe('Hazardous');
  });

  it('finds the component driving the overall AQI', () => {
    expect(getDominantPollutant({ us_aqi_pm2_5: 164, us_aqi_ozone: 72, us_aqi_pm10: 91 })).toBe('PM2.5');
  });

  it('selects the lowest daytime forecast value', () => {
    expect(findCleanestWindow(
      ['2026-11-18T04:00', '2026-11-18T09:00', '2026-11-18T15:00'],
      [30, 82, 61],
    )).toEqual({ time: '2026-11-18T15:00', value: 61 });
  });

  it('ignores malformed times and impossible AQI values in clean-window selection', () => {
    expect(findCleanestWindow(
      ['soon', '2026-11-18T09:00', '2026-11-18T15:00'],
      [10, -1, 61],
    )).toEqual({ time: '2026-11-18T15:00', value: 61 });
  });

  it('converts provider-local timestamps to UTC', () => {
    expect(localTimeToUtc('2026-11-18T21:30', 19_800)).toBe('2026-11-18T16:00:00.000Z');
  });

  it('resolves common cities without a geocoding request', () => {
    expect(resolveKnownCity('New Delhi')).toMatchObject({ latitude: 28.6139, longitude: 77.209 });
    expect(resolveKnownCity('São Paulo')).toBeUndefined();
  });
});
