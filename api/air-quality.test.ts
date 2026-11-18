import { describe, expect, it } from 'vitest';
import { selectAirQualityIndex, validateCity } from './air-quality';

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

  it('prefers the local index and falls back to universal AQI', () => {
    expect(selectAirQualityIndex([{ code: 'uaqi', aqi: 80 }, { code: 'ind_cpcb', aqi: 164 }])?.aqi).toBe(164);
    expect(selectAirQualityIndex([{ code: 'uaqi', aqi: 80 }])?.aqi).toBe(80);
  });
});
