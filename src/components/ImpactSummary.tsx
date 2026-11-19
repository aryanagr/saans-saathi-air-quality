import { Check, HeartPulse, Leaf, ShieldCheck } from 'lucide-react';
import type { AirPlan } from '../domain/airQuality';

export function ImpactSummary({ plan, completedCount }: { plan: AirPlan; completedCount: number }) {
  return (
    <>
      <section id="impact" className="impact-section" aria-labelledby="impact-title">
        <div className="section-heading compact">
          <div><p className="eyebrow">Why these choices matter</p><h2 id="impact-title">Your estimated daily impact</h2></div>
          <span className="estimate-note">Illustrative estimate</span>
        </div>
        <div className="impact-grid">
          <article><HeartPulse aria-hidden="true" /><p><strong>{plan.exposureReduction}%</strong> potential reduction in pollution exposure</p><span>Compared with an unchanged outdoor routine</span></article>
          <article><Leaf aria-hidden="true" /><p><strong>{plan.emissionReduction.toFixed(1)} kg</strong> potential CO₂e avoided</p><span>Based on your selected commute choice</span></article>
          <article><Check aria-hidden="true" /><p><strong>{completedCount}</strong> protective actions completed</p><span>Small actions add up across your household</span></article>
        </div>
        <p className="method-note">Estimates are educational, not measurements. Actual impact varies with route, building ventilation, equipment, and local conditions.</p>
      </section>

      <section className="safety-note" aria-labelledby="safety-title">
        <ShieldCheck aria-hidden="true" />
        <div><h2 id="safety-title">Know when to seek help</h2><p>This assistant provides general environmental guidance, not medical advice. If anyone has severe breathlessness, chest pain, confusion, or blue lips, seek urgent medical care.</p></div>
      </section>
    </>
  );
}
