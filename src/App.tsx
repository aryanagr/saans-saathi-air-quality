import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, MapPin, Settings2, ShieldCheck, Wind } from 'lucide-react';
import { ActionPlan } from './components/ActionPlan';
import { AqiChart } from './components/AqiChart';
import { AssistantPanel } from './components/AssistantPanel';
import { CurrentConditions } from './components/CurrentConditions';
import { ImpactSummary } from './components/ImpactSummary';
import { ProfilePanel } from './components/ProfilePanel';
import { fetchLiveAirQuality, type LiveAirQuality } from './data/airQualityClient';
import { CITY_AQI } from './data/demo';
import { loadProfile, saveProfile } from './data/profileStorage';
import { createAirPlan, type HouseholdProfile } from './domain/airQuality';

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
  const activeCompleted = useMemo(() => {
    const recommendationIds = new Set(plan.recommendations.map((item) => item.id));
    return completed.filter((id) => recommendationIds.has(id));
  }, [completed, plan.recommendations]);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    const city = profile.city.trim();
    if (city.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
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

  const updatedDate = liveReading ? new Date(liveReading.updatedAt) : null;
  const updatedLabel = updatedDate && Number.isFinite(updatedDate.getTime())
    ? `Updated ${new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(updatedDate)}`
    : 'Illustrative reading';
  const familyGuidance = profile.sensitivity === 'none'
    ? 'No extra sensitivity is selected. Adjust the household profile if someone needs additional care.'
    : `Keep outdoor exertion light. Extra care is enabled for ${profile.sensitivity === 'older-adult' ? 'an older adult' : profile.sensitivity === 'asthma' ? 'a person with asthma' : profile.sensitivity === 'pregnancy' ? 'a pregnant person' : 'a child'}.`;

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

  const updateProfile = (nextProfile: HouseholdProfile) => {
    const cityChanged = nextProfile.city.trim() !== profile.city.trim();
    if (cityChanged) {
      setLiveReading(null);
      setLiveStatus('loading');
      setLiveMessage(nextProfile.city.trim().length < 2
        ? 'Enter at least 2 characters to check current conditions.'
        : 'Checking current conditions…');
    }
    const nextAqi = cityChanged ? CITY_AQI[nextProfile.city] ?? 180 : aqi;
    const recommendationIds = new Set(createAirPlan(nextAqi, nextProfile).recommendations.map((item) => item.id));
    setCompleted((current) => current.filter((id) => recommendationIds.has(id)));
    setProfile(nextProfile);
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
            <p className="location"><MapPin aria-hidden="true" /> {profile.city} <span>{updatedLabel}</span></p>
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
            <div><strong>For your family</strong><p>{familyGuidance}</p></div>
          </aside>
        </section>

        <div className="content-wrap">
          <CurrentConditions reading={liveReading} />

          <ActionPlan plan={plan} completed={activeCompleted} onToggle={toggleCompleted} />

          <AqiChart currentAqi={aqi} forecast={liveReading?.forecast} cleanestWindow={liveReading?.cleanestWindow} isLive={liveStatus === 'live'} />

          <AssistantPanel context={{
            city: liveReading?.city ?? profile.city,
            aqi,
            category: plan.label,
            dominantPollutant: liveReading?.dominantPollutant ?? null,
            cleanestWindow: liveReading?.cleanestWindow ?? null,
            profile,
          }} />

          <ImpactSummary plan={plan} completedCount={activeCompleted.length} />
        </div>
      </main>

      <footer><p><strong>Saans Saathi</strong> turns air-quality data into practical daily choices.</p><p>{liveStatus === 'live' ? <>Modeled air-quality data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> and CAMS • US AQI</> : 'Fallback demo data • US AQI scale'}</p></footer>

      <ProfilePanel open={profileOpen} profile={profile} onChange={updateProfile} onClose={closeProfile} />
    </div>
  );
}
