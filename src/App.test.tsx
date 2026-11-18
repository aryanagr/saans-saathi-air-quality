import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows AQI and a personalised daily plan', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /plan a lower-exposure day/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your air-smart plan/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /mark done/i }).length).toBeGreaterThan(0);
  });

  it('recovers from a malformed saved household profile', () => {
    localStorage.setItem('saans-saathi-profile-v1', JSON.stringify({ city: null, commute: 'teleport', sensitivity: 7 }));
    render(<App />);
    expect(screen.getByText(/New Delhi/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /plan a lower-exposure day/i })).toBeInTheDocument();
  });

  it('tracks completed actions accessibly', () => {
    render(<App />);
    const button = screen.getAllByRole('button', { name: /mark done/i })[0];
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/1 of \d+ done/i)).toBeInTheDocument();
  });

  it('opens and closes the household profile', () => {
    render(<App />);
    const trigger = screen.getByRole('button', { name: /household/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: /household profile/i })).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: /close household profile/i });
    expect(closeButton).toHaveFocus();
    fireEvent.click(closeButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates family guidance from the household profile', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /household/i }));
    fireEvent.change(screen.getByLabelText(/who needs extra care/i), { target: { value: 'none' } });
    fireEvent.click(screen.getByRole('button', { name: /update my plan/i }));
    expect(screen.getByText(/no extra sensitivity is selected/i)).toBeInTheDocument();
  });

  it('clears a previous city reading as soon as the location changes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        city: 'New Delhi, India', requestedCity: 'New Delhi', aqi: 312,
        category: 'Hazardous', dominantPollutant: 'PM2.5', indexName: 'US AQI (modeled)',
        updatedAt: '2026-11-18T10:00:00.000Z', source: 'Open-Meteo / CAMS', forecast: [],
        cleanestWindow: null,
        pollutants: { pm2_5: 120, pm10: 180, nitrogenDioxide: 40, ozone: 50 },
      }),
    }));

    render(<App />);
    await screen.findByText(/US AQI \(modeled\) via Open-Meteo/i, {}, { timeout: 1_500 });
    fireEvent.click(screen.getByRole('button', { name: /household/i }));
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Mumbai' } });

    expect(screen.getByText(/checking current conditions/i)).toBeInTheDocument();
    expect(screen.queryByText('120 µg/m³')).not.toBeInTheDocument();
  });
});
