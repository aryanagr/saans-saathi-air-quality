export const SENSITIVITIES = ['none', 'child', 'older-adult', 'asthma', 'pregnancy'] as const;
export const COMMUTE_MODES = ['walk', 'cycle', 'public', 'car', 'work-home'] as const;

export type Sensitivity = typeof SENSITIVITIES[number];
export type CommuteMode = typeof COMMUTE_MODES[number];
export type AqiLevel = 'good' | 'satisfactory' | 'moderate' | 'poor' | 'very-poor' | 'severe';

export const US_AQI_BANDS: ReadonlyArray<{ max: number; level: AqiLevel; label: string }> = [
  { max: 50, level: 'good', label: 'Good' },
  { max: 100, level: 'satisfactory', label: 'Moderate' },
  { max: 150, level: 'moderate', label: 'Unhealthy for sensitive groups' },
  { max: 200, level: 'poor', label: 'Unhealthy' },
  { max: 300, level: 'very-poor', label: 'Very unhealthy' },
  { max: 500, level: 'severe', label: 'Hazardous' },
];

export function isSensitivity(value: unknown): value is Sensitivity {
  return typeof value === 'string' && SENSITIVITIES.includes(value as Sensitivity);
}

export function isCommuteMode(value: unknown): value is CommuteMode {
  return typeof value === 'string' && COMMUTE_MODES.includes(value as CommuteMode);
}

export function normalizeUsAqi(aqi: number): number {
  // Unknown air quality must never be translated into clean-air guidance.
  if (!Number.isFinite(aqi)) return 500;
  return Math.max(0, Math.min(500, Math.round(aqi)));
}

export function getUsAqiBand(aqi: number) {
  const normalized = normalizeUsAqi(aqi);
  return US_AQI_BANDS.find((band) => normalized <= band.max) ?? US_AQI_BANDS[US_AQI_BANDS.length - 1];
}

export function getUsAqiCategory(aqi: number): string {
  return getUsAqiBand(aqi).label;
}
