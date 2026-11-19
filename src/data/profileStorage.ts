import type { HouseholdProfile } from '../domain/airQuality';
import { isCommuteMode, isSensitivity } from '../../shared/airQualityContract.js';
import { DEFAULT_PROFILE } from './demo';

const STORAGE_KEY = 'saans-saathi-profile-v1';

export function normalizeProfile(value: unknown): HouseholdProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return DEFAULT_PROFILE;
  const input = value as Record<string, unknown>;
  const candidateCity = typeof input.city === 'string' ? input.city.trim() : '';

  return {
    city: candidateCity.length >= 2 && candidateCity.length <= 80 ? candidateCity : DEFAULT_PROFILE.city,
    sensitivity: isSensitivity(input.sensitivity)
      ? input.sensitivity
      : DEFAULT_PROFILE.sensitivity,
    commute: isCommuteMode(input.commute)
      ? input.commute
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
