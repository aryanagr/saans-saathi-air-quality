import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { CommuteMode, HouseholdProfile, Sensitivity } from '../domain/airQuality';

interface ProfilePanelProps {
  open: boolean;
  profile: HouseholdProfile;
  onChange: (profile: HouseholdProfile) => void;
  onClose: () => void;
}

export function ProfilePanel({ open, profile, onChange, onClose }: ProfilePanelProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>('button, select, input, [href], [tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();

    const containFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', containFocus);
    return () => document.removeEventListener('keydown', containFocus);
  }, [open]);

  if (!open) return null;

  const update = <K extends keyof HouseholdProfile>(key: K, value: HouseholdProfile[K]) => {
    onChange({ ...profile, [key]: value });
  };

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">Personalise your plan</p>
            <h2 id="profile-title">Household profile</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close household profile">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="field">
          <label htmlFor="city">Location</label>
          <input id="city" list="city-suggestions" value={profile.city} maxLength={80} autoComplete="address-level2" onChange={(event) => update('city', event.target.value)} />
          <datalist id="city-suggestions">
            {['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Lucknow', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Gurugram', 'Noida'].map((city) => <option key={city} value={city} />)}
          </datalist>
          <p className="field-help">Search any city. Live AQI refreshes after you finish typing.</p>
        </div>

        <div className="field">
          <label htmlFor="sensitivity">Who needs extra care?</label>
          <select id="sensitivity" value={profile.sensitivity} onChange={(event) => update('sensitivity', event.target.value as Sensitivity)}>
            <option value="none">No specific sensitivity</option>
            <option value="child">Child</option>
            <option value="older-adult">Older adult</option>
            <option value="asthma">Person with asthma</option>
            <option value="pregnancy">Pregnant person</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="commute">Usual commute</label>
          <select id="commute" value={profile.commute} onChange={(event) => update('commute', event.target.value as CommuteMode)}>
            <option value="walk">Walk</option>
            <option value="cycle">Cycle</option>
            <option value="public">Public transport</option>
            <option value="car">Car or cab</option>
            <option value="work-home">Work from home</option>
          </select>
        </div>

        <fieldset className="check-group">
          <legend>Home environment</legend>
          <label className="check-row"><input type="checkbox" checked={profile.hasPurifier} onChange={(event) => update('hasPurifier', event.target.checked)} /> I have an air purifier</label>
          <label className="check-row"><input type="checkbox" checked={profile.cooksWithGas} onChange={(event) => update('cooksWithGas', event.target.checked)} /> We cook with gas</label>
        </fieldset>

        <button className="primary-button" type="button" onClick={onClose}>Update my plan</button>
      </section>
    </div>
  );
}
