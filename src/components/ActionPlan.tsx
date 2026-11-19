import { Activity, Bus, Check, Home, Leaf, Sparkles } from 'lucide-react';
import type { AirPlan, Recommendation } from '../domain/airQuality';

function RecommendationIcon({ item }: { item: Recommendation }) {
  const Icon = item.category === 'indoor' ? Home : item.category === 'travel' ? Bus : Activity;
  return <Icon aria-hidden="true" />;
}

function priorityLabel(priority: Recommendation['priority']) {
  if (priority === 'now') return 'Do now';
  if (priority === 'today') return 'Today';
  return 'Build the habit';
}

export function ActionPlan({ plan, completed, onToggle }: { plan: AirPlan; completed: string[]; onToggle: (id: string) => void }) {
  return (
    <section id="plan" className="plan-section" aria-labelledby="plan-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow"><Sparkles aria-hidden="true" /> Personalised for your routine</p>
          <h2 id="plan-title">Your air-smart plan for today</h2>
          <p>Start with the highest-impact actions. Tap an item when it’s done.</p>
        </div>
        <span className="progress-copy" aria-live="polite">{completed.length} of {plan.recommendations.length} done</span>
      </div>

      <div className="recommendation-list">
        {plan.recommendations.map((item, index) => {
          const isDone = completed.includes(item.id);
          return (
            <article className={`recommendation ${isDone ? 'is-done' : ''}`} key={item.id}>
              <div className="recommendation-icon"><RecommendationIcon item={item} /></div>
              <div className="recommendation-content">
                <div className="recommendation-meta">
                  <span className={`priority priority-${item.priority}`}>{priorityLabel(item.priority)}</span>
                  <span>Action {index + 1}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
                <p className="impact-line"><Leaf aria-hidden="true" /><strong>Direct impact:</strong> {item.impact}</p>
              </div>
              <button className="complete-button" type="button" aria-pressed={isDone} onClick={() => onToggle(item.id)}>
                <Check aria-hidden="true" /> {isDone ? 'Done' : 'Mark done'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
