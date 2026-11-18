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

export const HOURLY_AQI = [
  { time: '6 am', value: 338 },
  { time: '9 am', value: 326 },
  { time: '12 pm', value: 312 },
  { time: '3 pm', value: 284 },
  { time: '6 pm', value: 301 },
  { time: '9 pm', value: 329 },
];
