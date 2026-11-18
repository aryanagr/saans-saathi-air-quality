import { describe, expect, it } from 'vitest';
import { describeGuidelineComparison, WHO_POLLUTANT_GUIDELINES } from './pollutantGuidelines';

describe('pollutant guideline comparisons', () => {
  it('describes a reading above the reference as a multiple', () => {
    expect(describeGuidelineComparison(52.6, WHO_POLLUTANT_GUIDELINES.pm2_5)).toBe(
      '3.5× the guideline reference',
    );
  });

  it('describes readings at or below the reference without relying on colour', () => {
    expect(describeGuidelineComparison(100, WHO_POLLUTANT_GUIDELINES.ozone)).toBe(
      'Within the guideline reference',
    );
  });
});
