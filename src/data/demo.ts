import type { HouseholdProfile } from '../domain/airQuality';

export const DEFAULT_PROFILE: HouseholdProfile = {
  city: 'New Delhi',
  sensitivity: 'child',
  commute: 'public',
  hasPurifier: true,
  cooksWithGas: true,
};

export const CITY_AQI: Record<string, number> = {
  'New Delhi': 312,
  Mumbai: 146,
  Bengaluru: 92,
  Kolkata: 218,
  Lucknow: 276,
};
