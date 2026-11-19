import { getUsAqiBand, normalizeUsAqi } from '../../shared/airQualityContract';
import type { AqiLevel, CommuteMode, Sensitivity } from '../../shared/airQualityContract';

export type { AqiLevel, CommuteMode, Sensitivity } from '../../shared/airQualityContract';

export interface HouseholdProfile {
  city: string;
  sensitivity: Sensitivity;
  commute: CommuteMode;
  hasPurifier: boolean;
  cooksWithGas: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  impact: string;
  priority: 'now' | 'today' | 'habit';
  category: 'outdoor' | 'indoor' | 'travel';
}

export interface AirPlan {
  level: AqiLevel;
  label: string;
  summary: string;
  recommendations: Recommendation[];
  exposureReduction: number;
  emissionReduction: number;
}

export function classifyAqi(aqi: number) {
  return getUsAqiBand(aqi);
}

function isSensitive(profile: HouseholdProfile) {
  return profile.sensitivity !== 'none';
}

export function createAirPlan(aqi: number, profile: HouseholdProfile): AirPlan {
  const currentAqi = normalizeUsAqi(aqi);
  const band = classifyAqi(currentAqi);
  const hazardous = currentAqi > 300;
  const unhealthy = currentAqi > 150;
  const sensitive = isSensitive(profile);
  const recommendations: Recommendation[] = [];

  if (unhealthy || (sensitive && currentAqi > 100)) {
    recommendations.push({
      id: 'move-outdoors',
      title: hazardous ? 'Move outdoor plans indoors' : 'Shorten outdoor activity',
      detail: sensitive
        ? 'A sensitive family member is more likely to experience symptoms today. Choose gentle indoor activity.'
        : 'Avoid strenuous outdoor activity while pollution is elevated; reschedule it for a cleaner window.',
      impact: hazardous ? 'High exposure reduction' : 'Meaningful exposure reduction',
      priority: 'now',
      category: 'outdoor',
    });
  } else {
    recommendations.push({
      id: 'outdoor-window',
      title: 'Keep outdoor activity flexible',
      detail: 'Conditions are suitable for most people. Check the AQI again before prolonged or intense activity.',
      impact: 'Maintains a safer routine',
      priority: 'today',
      category: 'outdoor',
    });
  }

  recommendations.push({
    id: 'clean-room',
    title: profile.hasPurifier ? 'Run the purifier in one clean room' : 'Create a cleaner-air room',
    detail: profile.hasPurifier
      ? 'Close doors and windows and run it on high for 30–60 minutes, then use auto mode. Check the filter indicator.'
      : 'Choose one room, close obvious gaps during peak pollution, and avoid incense, candles, and smoking indoors.',
    impact: profile.hasPurifier ? 'Can substantially lower indoor particles' : 'Prevents additional indoor particles',
    priority: unhealthy ? 'now' : 'today',
    category: 'indoor',
  });

  if (profile.cooksWithGas) {
    recommendations.push({
      id: 'cooking',
      title: 'Reduce cooking smoke at the source',
      detail: 'Use the exhaust hood while cooking, prefer back burners, cover pans, and avoid high-heat frying today.',
      impact: 'Lowers indoor particle and nitrogen dioxide buildup',
      priority: 'today',
      category: 'indoor',
    });
  }

  const travelAdvice: Record<CommuteMode, Omit<Recommendation, 'id' | 'category' | 'priority'>> = {
    walk: {
      title: 'Choose a quieter walking route',
      detail: 'Use parallel streets away from heavy traffic and keep distance from idling vehicles.',
      impact: 'Lower roadside pollution exposure',
    },
    cycle: {
      title: unhealthy ? 'Swap the cycle commute today' : 'Cycle away from main roads',
      detail: unhealthy
        ? 'Use public transport or shared transport if possible; exertion increases the amount of polluted air inhaled.'
        : 'Prefer low-traffic routes and avoid riding directly behind exhaust pipes.',
      impact: unhealthy ? 'High exposure reduction' : 'Lower roadside exposure',
    },
    public: {
      title: 'Reduce time beside traffic',
      detail: 'Wait farther from the road edge and choose less crowded, well-ventilated services where possible.',
      impact: 'Lower commute exposure with low emissions',
    },
    car: {
      title: 'Recirculate cabin air in traffic',
      detail: 'Close windows and switch to recirculation near congestion. Combine errands to reduce emissions and time outside.',
      impact: 'Lower cabin exposure and fewer vehicle kilometres',
    },
    'work-home': {
      title: 'Keep today’s commute at zero',
      detail: 'Working from home avoids roadside exposure and a round trip. Take brief movement breaks indoors.',
      impact: 'Avoids commute emissions and exposure',
    },
  };

  recommendations.push({
    id: 'travel',
    ...travelAdvice[profile.commute],
    priority: 'today',
    category: 'travel',
  });

  recommendations.push({
    id: 'ventilation',
    title: unhealthy ? 'Ventilate only during a cleaner window' : 'Air out your home briefly',
    detail: unhealthy
      ? 'Keep windows closed during peak traffic. Recheck local conditions and ventilate briefly only when outdoor AQI improves.'
      : 'Open opposite windows for 10–15 minutes, especially after cooking or cleaning.',
    impact: 'Balances outdoor pollution with indoor pollutants',
    priority: 'habit',
    category: 'indoor',
  });

  const baseReduction = hazardous ? 45 : unhealthy ? 32 : currentAqi > 100 ? 20 : 8;
  const commuteReduction = profile.commute === 'work-home' ? 3.2 : profile.commute === 'car' ? 1.4 : 0.8;

  return {
    level: band.level,
    label: band.label,
    summary: hazardous
      ? 'Pollution is at a level where everyone should reduce exposure.'
      : unhealthy
        ? 'Plan a lower-exposure day, especially for sensitive family members.'
        : currentAqi > 100
          ? 'Sensitive people should take extra care; others can adjust strenuous activity.'
          : 'Most people can follow their usual routine with normal precautions.',
    recommendations,
    exposureReduction: Math.min(60, baseReduction + (sensitive ? 6 : 0) + (profile.hasPurifier ? 8 : 0)),
    emissionReduction: commuteReduction,
  };
}
