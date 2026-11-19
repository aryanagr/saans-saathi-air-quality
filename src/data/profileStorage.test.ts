import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PROFILE } from './demo';
import { loadProfile, normalizeProfile, saveProfile } from './profileStorage';

describe('profile storage', () => {
  beforeEach(() => localStorage.clear());

  it('normalizes persisted fields independently', () => {
    expect(normalizeProfile({ ...DEFAULT_PROFILE, city: '  Pune  ', commute: 'teleport' })).toEqual({
      ...DEFAULT_PROFILE,
      city: 'Pune',
    });
  });

  it('round-trips a valid profile', () => {
    const profile = { ...DEFAULT_PROFILE, city: 'Mumbai', hasPurifier: false };
    expect(saveProfile(profile)).toBe(true);
    expect(loadProfile()).toEqual(profile);
  });

  it('fails safely when browser storage is unavailable', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable');
    });

    expect(saveProfile(DEFAULT_PROFILE)).toBe(false);
    setItem.mockRestore();
  });

  it('falls back when stored JSON is corrupt', () => {
    localStorage.setItem('saans-saathi-profile-v1', '{bad json');
    expect(loadProfile()).toEqual(DEFAULT_PROFILE);
  });
});
