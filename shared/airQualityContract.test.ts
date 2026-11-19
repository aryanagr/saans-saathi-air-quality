import { describe, expect, it } from 'vitest';
import { getUsAqiBand, getUsAqiCategory, isCommuteMode, isSensitivity, normalizeUsAqi } from './airQualityContract';

describe('shared air-quality contract', () => {
  it.each([
    [0, 'good', 'Good'], [50, 'good', 'Good'], [51, 'satisfactory', 'Moderate'],
    [100, 'satisfactory', 'Moderate'], [101, 'moderate', 'Unhealthy for sensitive groups'],
    [150, 'moderate', 'Unhealthy for sensitive groups'], [151, 'poor', 'Unhealthy'],
    [200, 'poor', 'Unhealthy'], [201, 'very-poor', 'Very unhealthy'],
    [300, 'very-poor', 'Very unhealthy'], [301, 'severe', 'Hazardous'], [500, 'severe', 'Hazardous'],
  ])('maps AQI %i to the shared %s band', (aqi, level, label) => {
    expect(getUsAqiBand(aqi)).toMatchObject({ level, label });
    expect(getUsAqiCategory(aqi)).toBe(label);
  });

  it('clamps numeric extremes and handles unknown values conservatively', () => {
    expect(normalizeUsAqi(-20)).toBe(0);
    expect(normalizeUsAqi(800)).toBe(500);
    expect(normalizeUsAqi(Number.NaN)).toBe(500);
  });

  it('recognizes only supported household values', () => {
    expect(isSensitivity('asthma')).toBe(true);
    expect(isSensitivity('wizard')).toBe(false);
    expect(isCommuteMode('public')).toBe(true);
    expect(isCommuteMode('teleport')).toBe(false);
  });
});
