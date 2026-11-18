import { describe, expect, it } from 'vitest';
import { getDominantPollutant, getUsAqiCategory, validateCity } from './air-quality';

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
});
