import type { HouseholdProfile } from '../domain/airQuality';

export interface AssistantContext {
  city: string;
  aqi: number;
  category: string;
  dominantPollutant: string | null;
  cleanestWindow: { time: string; aqi: number } | null;
  profile: HouseholdProfile;
}

export async function askAssistant(question: string, context: AssistantContext, signal?: AbortSignal) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context }),
    signal,
  });
  const body = await response.json().catch(() => ({})) as { answer?: string; mode?: string; error?: string };
  const answer = body.answer?.trim();
  if (!response.ok || !answer) throw new Error(body.error ?? 'Assistant unavailable.');
  return { answer, mode: body.mode === 'guided' ? 'guided' : 'gemini' };
}

export function getGuidedAnswer(question: string, context: AssistantContext) {
  const words = question.toLowerCase();
  const sensitive = context.profile.sensitivity !== 'none';
  if (/child|play|exercise|walk|outside|outdoor/.test(words)) {
    if (context.aqi > 150 || (sensitive && context.aqi > 100)) return `At AQI ${context.aqi}, move strenuous outdoor activity indoors. ${context.cleanestWindow ? `The model's lowest daytime reading is AQI ${context.cleanestWindow.aqi}; recheck it before going out.` : 'Recheck conditions before going out.'}`;
    return `At AQI ${context.aqi}, most people can keep activity flexible. Sensitive family members should reduce intensity if symptoms appear and recheck the AQI before a long session.`;
  }
  if (/window|ventilat|air out/.test(words)) {
    return context.aqi > 100 ? 'Keep windows closed during the current polluted period. Ventilate briefly only when the outdoor AQI improves, especially after cooking.' : 'A short 10–15 minute cross-ventilation period is reasonable, especially after cooking or cleaning.';
  }
  if (/\b(commute|travel|cycle|cycling|car|bus)\b/.test(words)) {
    return context.aqi > 150 ? 'Reduce roadside time and strenuous cycling. Prefer a lower-exertion, low-emission option, wait away from the road edge, and use cabin recirculation in congestion.' : 'Prefer quieter streets and public transport where practical; distance from tailpipes usually matters more than a small route difference.';
  }
  return `The current modeled US AQI is ${context.aqi} (${context.category}). Start with the personalized actions above. Modeled conditions can differ from nearby sensors, so recheck before changing health-sensitive plans.`;
}
