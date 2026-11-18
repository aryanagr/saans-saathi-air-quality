import { afterEach, describe, expect, it, vi } from 'vitest';
import { askAssistant, getGuidedAnswer, type AssistantContext } from './assistantClient';

const context: AssistantContext = {
  city: 'New Delhi', aqi: 166, category: 'Unhealthy', dominantPollutant: 'PM2.5',
  cleanestWindow: { time: '2026-11-18T15:00', aqi: 121 },
  profile: { city: 'New Delhi', sensitivity: 'child', commute: 'public', hasPurifier: true, cooksWithGas: true },
};

describe('guided assistant fallback', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('gives conservative outdoor advice for an unhealthy AQI', () => {
    expect(getGuidedAnswer('Can my child play outside?', context)).toMatch(/move strenuous outdoor activity indoors/i);
  });

  it('answers ventilation questions from current context', () => {
    expect(getGuidedAnswer('When should I open a window?', context)).toMatch(/keep windows closed/i);
  });

  it('does not claim modeled data is a sensor measurement', () => {
    expect(getGuidedAnswer('What should I know?', context)).toMatch(/modeled conditions can differ/i);
  });

  it('does not mistake the word care for a car commute question', () => {
    expect(getGuidedAnswer('How should I care for someone with asthma?', context)).not.toMatch(/roadside|cycling|cabin/i);
  });

  it('rejects a whitespace-only model answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: '   ', mode: 'gemini' }),
    }));
    await expect(askAssistant('What should I do?', context)).rejects.toThrow(/unavailable/i);
  });

  it('normalizes an unknown response mode to Gemini', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: '  Use a cleaner route.  ', mode: 'unexpected' }),
    }));
    await expect(askAssistant('How should I travel?', context)).resolves.toEqual({
      answer: 'Use a cleaner route.',
      mode: 'gemini',
    });
  });
});
