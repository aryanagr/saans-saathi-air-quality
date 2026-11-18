import { describe, expect, it } from 'vitest';
import { classifyAqi, createAirPlan, type HouseholdProfile } from './airQuality';

const profile: HouseholdProfile = {
  city: 'New Delhi',
  sensitivity: 'child',
  commute: 'cycle',
  hasPurifier: true,
  cooksWithGas: true,
};

describe('classifyAqi', () => {
  it.each([
    [0, 'good'], [50, 'good'], [51, 'satisfactory'], [100, 'satisfactory'],
    [101, 'moderate'], [150, 'moderate'], [151, 'poor'], [200, 'poor'],
    [201, 'very-poor'], [300, 'very-poor'], [301, 'severe'], [600, 'severe'],
  ])('classifies AQI %i as %s', (aqi, expected) => {
    expect(classifyAqi(aqi).level).toBe(expected);
  });
});

describe('createAirPlan', () => {
  it('prioritises indoor activity for a sensitive household during very poor air', () => {
    const plan = createAirPlan(312, profile);
    expect(plan.label).toBe('Hazardous');
    expect(plan.recommendations[0]).toMatchObject({ id: 'move-outdoors', priority: 'now' });
    expect(plan.exposureReduction).toBeGreaterThanOrEqual(45);
  });

  it('changes travel advice for a cycling commute', () => {
    const plan = createAirPlan(250, profile);
    expect(plan.recommendations.find((item) => item.id === 'travel')?.title).toContain('Swap');
  });

  it('does not recommend gas cooking changes when gas is not used', () => {
    const plan = createAirPlan(180, { ...profile, cooksWithGas: false });
    expect(plan.recommendations.some((item) => item.id === 'cooking')).toBe(false);
  });
});
