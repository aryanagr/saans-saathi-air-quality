import type { HouseholdProfile } from '../domain/airQuality';
import { DEFAULT_PROFILE } from './demo';

const STORAGE_KEY = 'saans-saathi-profile-v1';
const SENSITIVITIES = new Set<HouseholdProfile['sensitivity']>(['none', 'child', 'older-adult', 'asthma', 'pregnancy']);
const COMMUTE_MODES = new Set<HouseholdProfile['commute']>(['walk', 'cycle', 'public', 'car', 'work-home']);

export function normalizeProfile(value: unknown): HouseholdProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return DEFAULT_PROFILE;
  const input = value as Record<string, unknown>;
  const candidateCity = typeof input.city === 'string' ? input.city.trim() : '';

  return {
    city: candidateCity.length >= 2 && candidateCity.length <= 80 ? candidateCity : DEFAULT_PROFILE.city,
    sensitivity: SENSITIVITIES.has(input.sensitivity as HouseholdProfile['sensitivity'])
      ? input.sensitivity as HouseholdProfile['sensitivity']
      : DEFAULT_PROFILE.sensitivity,
    commute: COMMUTE_MODES.has(input.commute as HouseholdProfile['commute'])
      ? input.commute as HouseholdProfile['commute']
      : DEFAULT_PROFILE.commute,
    hasPurifier: typeof input.hasPurifier === 'boolean' ? input.hasPurifier : DEFAULT_PROFILE.hasPurifier,
    cooksWithGas: typeof input.cooksWithGas === 'boolean' ? input.cooksWithGas : DEFAULT_PROFILE.cooksWithGas,
  };
}

export function loadProfile(): HouseholdProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeProfile(JSON.parse(stored)) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: HouseholdProfile): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false;
  }
}
