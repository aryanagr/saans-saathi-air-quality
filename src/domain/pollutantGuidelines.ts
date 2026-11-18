export type PollutantGuideline = {
  value: number;
  averagingPeriod: string;
};

export const WHO_POLLUTANT_GUIDELINES = {
  pm2_5: { value: 15, averagingPeriod: '24-hour mean' },
  pm10: { value: 45, averagingPeriod: '24-hour mean' },
  ozone: { value: 100, averagingPeriod: '8-hour mean' },
} satisfies Record<string, PollutantGuideline>;

export function describeGuidelineComparison(
  current: number,
  guideline: PollutantGuideline,
): string {
  const ratio = current / guideline.value;

  if (ratio <= 1) return 'Within the guideline reference';

  return `${ratio.toFixed(1)}× the guideline reference`;
}
