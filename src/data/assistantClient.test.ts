import { describe, expect, it } from 'vitest';
import { getGuidedAnswer, type AssistantContext } from './assistantClient';

const context: AssistantContext = {
  city: 'New Delhi', aqi: 166, category: 'Unhealthy', dominantPollutant: 'PM2.5',
  cleanestWindow: { time: '2026-11-18T15:00', aqi: 121 },
  profile: { city: 'New Delhi', sensitivity: 'child', commute: 'public', hasPurifier: true, cooksWithGas: true },
};

describe('guided assistant fallback', () => {
  it('gives conservative outdoor advice for an unhealthy AQI', () => {
    expect(getGuidedAnswer('Can my child play outside?', context)).toMatch(/move strenuous outdoor activity indoors/i);
  });

  it('answers ventilation questions from current context', () => {
    expect(getGuidedAnswer('When should I open a window?', context)).toMatch(/keep windows closed/i);
  });

  it('does not claim modeled data is a sensor measurement', () => {
    expect(getGuidedAnswer('What should I know?', context)).toMatch(/modeled conditions can differ/i);
  });
});
