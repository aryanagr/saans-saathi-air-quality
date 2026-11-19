import type { LiveAirQuality } from '../data/airQualityClient';
import { describeGuidelineComparison, WHO_POLLUTANT_GUIDELINES, type PollutantGuideline } from '../domain/pollutantGuidelines';

function PollutantReading({ label, value, guideline }: { label: string; value: number | null | undefined; guideline: PollutantGuideline }) {
  return (
    <div className="pollutant-reading">
      <span>{label}</span>
      <strong>{value != null ? `${value} µg/m³` : '—'}</strong>
      {value != null ? (
        <small>
          <b>{describeGuidelineComparison(value, guideline)}</b>
          WHO guideline: {guideline.value} µg/m³ ({guideline.averagingPeriod})
        </small>
      ) : null}
    </div>
  );
}

export function CurrentConditions({ reading }: { reading: LiveAirQuality | null }) {
  return (
    <section className="reading-strip" aria-label="Current pollutant details">
      <div><span>Dominant pollutant</span><strong>{reading?.dominantPollutant ?? 'Not available'}</strong></div>
      <PollutantReading label="PM2.5" value={reading?.pollutants.pm2_5} guideline={WHO_POLLUTANT_GUIDELINES.pm2_5} />
      <PollutantReading label="PM10" value={reading?.pollutants.pm10} guideline={WHO_POLLUTANT_GUIDELINES.pm10} />
      <PollutantReading label="Ozone" value={reading?.pollutants.ozone} guideline={WHO_POLLUTANT_GUIDELINES.ozone} />
      <p>WHO references use averaged exposure; current modeled snapshots are an early warning, not a direct compliance measurement. Concentrations can differ from nearby monitoring stations.</p>
    </section>
  );
}
