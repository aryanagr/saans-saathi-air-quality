import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, Bus, Check, HeartPulse, Home, Leaf, MapPin, Settings2, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import { AqiChart } from './components/AqiChart';
import { ProfilePanel } from './components/ProfilePanel';
import { fetchLiveAirQuality, type LiveAirQuality } from './data/airQualityClient';
import { CITY_AQI, DEFAULT_PROFILE } from './data/demo';
import { createAirPlan, type HouseholdProfile, type Recommendation } from './domain/airQuality';

const STORAGE_KEY = 'saans-saathi-profile-v1';

function loadProfile(): HouseholdProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function RecommendationIcon({ item }: { item: Recommendation }) {
  const Icon = item.category === 'indoor' ? Home : item.category === 'travel' ? Bus : Activity;
  return <Icon aria-hidden="true" />;
}

export default function App() {
  const [profile, setProfile] = useState(loadProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [liveReading, setLiveReading] = useState<LiveAirQuality | null>(null);
  const [liveStatus, setLiveStatus] = useState<'loading' | 'live' | 'fallback'>('loading');
  const [liveMessage, setLiveMessage] = useState('Checking current conditions…');
  const profileTrigger = useRef<HTMLElement | null>(null);
  const aqi = liveReading?.aqi ?? CITY_AQI[profile.city] ?? 180;
  const plan = useMemo(() => createAirPlan(aqi, profile), [aqi, profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const city = profile.city.trim();
    if (city.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLiveStatus('loading');
      setLiveMessage('Checking current conditions…');
      fetchLiveAirQuality(city, controller.signal)
        .then((reading) => {
          setLiveReading(reading);
          setLiveStatus('live');
          setLiveMessage(`${reading.indexName} via Open-Meteo`);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setLiveReading(null);
          setLiveStatus('fallback');
          setLiveMessage(error instanceof Error ? `${error.message} Showing demo data.` : 'Showing demo data.');
        });
    }, 500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [profile.city]);

  const updatedLabel = liveReading
    ? `Updated ${new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date(liveReading.updatedAt))}`
    : 'Illustrative reading';

  useEffect(() => {
    if (!profileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setProfileOpen(false);
      window.requestAnimationFrame(() => profileTrigger.current?.focus());
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [profileOpen]);

  const openProfile = () => {
    profileTrigger.current = document.activeElement as HTMLElement;
    setProfileOpen(true);
  };

  const closeProfile = () => {
    setProfileOpen(false);
    window.requestAnimationFrame(() => profileTrigger.current?.focus());
  };

  const toggleCompleted = (id: string) => {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to today's air plan</a>
      <header className="topbar">
        <a className="brand" href="#main" aria-label="Saans Saathi home">
          <span className="brand-mark"><Wind aria-hidden="true" /></span>
          <span>Saans Saathi</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#plan">Today’s plan</a>
          <a href="#impact">My impact</a>
        </nav>
        <button className="profile-button" type="button" onClick={openProfile}>
          <Settings2 aria-hidden="true" />
          <span>Household</span>
        </button>
      </header>

      <main id="main">
        <section className={`aqi-hero level-${plan.level}`} aria-labelledby="aqi-heading">
          <div className="hero-content">
            <p className="location"><MapPin aria-hidden="true" /> {liveReading?.city ?? profile.city} <span>{updatedLabel}</span></p>
            <p className={`data-status data-${liveStatus}`} aria-live="polite"><span aria-hidden="true" />{liveMessage}</p>
            <div className="aqi-reading">
              <div className="aqi-number" aria-label={`Air quality index ${aqi}`}><span>AQI</span>{aqi}</div>
              <div>
                <p className="status-label"><span className="status-symbol" aria-hidden="true">!</span>{plan.label}</p>
                <h1 id="aqi-heading">Plan a lower-exposure day</h1>
                <p>{plan.summary}</p>
              </div>
            </div>
            <div className="hero-actions">
              <a className="primary-button light" href="#plan">See my action plan <ArrowRight aria-hidden="true" /></a>
              <button className="text-button light-text" type="button" onClick={openProfile}>Personalise advice</button>
            </div>
          </div>
          <aside className="quick-guidance" aria-label="Immediate health guidance">
            <ShieldCheck aria-hidden="true" />
            <div><strong>For your family</strong><p>Keep outdoor exertion light. A child is included in your household profile.</p></div>
          </aside>
        </section>

        <div className="content-wrap">
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
                        <span className={`priority priority-${item.priority}`}>{item.priority === 'now' ? 'Do now' : item.priority === 'today' ? 'Today' : 'Build the habit'}</span>
                        <span>Action {index + 1}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.detail}</p>
                      <p className="impact-line"><Leaf aria-hidden="true" /><strong>Direct impact:</strong> {item.impact}</p>
                    </div>
                    <button className="complete-button" type="button" aria-pressed={isDone} onClick={() => toggleCompleted(item.id)}>
                      <Check aria-hidden="true" /> {isDone ? 'Done' : 'Mark done'}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <AqiChart />

          <section id="impact" className="impact-section" aria-labelledby="impact-title">
            <div className="section-heading compact">
              <div><p className="eyebrow">Why these choices matter</p><h2 id="impact-title">Your estimated daily impact</h2></div>
              <span className="estimate-note">Illustrative estimate</span>
            </div>
            <div className="impact-grid">
              <article><HeartPulse aria-hidden="true" /><p><strong>{plan.exposureReduction}%</strong> potential reduction in pollution exposure</p><span>Compared with an unchanged outdoor routine</span></article>
              <article><Leaf aria-hidden="true" /><p><strong>{plan.emissionReduction.toFixed(1)} kg</strong> potential CO₂e avoided</p><span>Based on your selected commute choice</span></article>
              <article><Check aria-hidden="true" /><p><strong>{completed.length}</strong> protective actions completed</p><span>Small actions add up across your household</span></article>
            </div>
            <p className="method-note">Estimates are educational, not measurements. Actual impact varies with route, building ventilation, equipment, and local conditions.</p>
          </section>

          <section className="safety-note" aria-labelledby="safety-title">
            <ShieldCheck aria-hidden="true" />
            <div><h2 id="safety-title">Know when to seek help</h2><p>This assistant provides general environmental guidance, not medical advice. If anyone has severe breathlessness, chest pain, confusion, or blue lips, seek urgent medical care.</p></div>
          </section>
        </div>
      </main>

      <footer><p><strong>Saans Saathi</strong> turns air-quality data into practical daily choices.</p><p>{liveStatus === 'live' ? <>Modeled air-quality data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> and CAMS • US AQI</> : 'Fallback demo data • US AQI scale'}</p></footer>

      <ProfilePanel open={profileOpen} profile={profile} onChange={setProfile} onClose={closeProfile} />
    </div>
  );
}
