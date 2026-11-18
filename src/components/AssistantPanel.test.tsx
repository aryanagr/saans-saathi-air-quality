import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssistantPanel } from './AssistantPanel';

const context = {
  city: 'New Delhi', aqi: 166, category: 'Unhealthy', dominantPollutant: 'PM2.5',
  cleanestWindow: { time: '2026-11-18T15:00', aqi: 121 },
  profile: { city: 'New Delhi', sensitivity: 'child' as const, commute: 'public' as const, hasPurifier: true, cooksWithGas: true },
};

describe('AssistantPanel', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('provides a guided answer when Gemini is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Not configured' }) }));
    render(<AssistantPanel context={context} />);
    fireEvent.click(screen.getByRole('button', { name: /can my child play outside/i }));
    await waitFor(() => expect(screen.getByText(/move strenuous outdoor activity indoors/i)).toBeInTheDocument());
    expect(screen.getByText(/guided safety answer/i)).toBeInTheDocument();
  });

  it('labels a successful Gemini answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ answer: 'Keep activity indoors for now.', mode: 'gemini' }) }));
    render(<AssistantPanel context={context} />);
    fireEvent.change(screen.getByLabelText(/your air-quality question/i), { target: { value: 'Can we exercise?' } });
    fireEvent.click(screen.getByRole('button', { name: /^ask$/i }));
    await waitFor(() => expect(screen.getByText('Keep activity indoors for now.')).toBeInTheDocument());
    expect(screen.getByText(/gemini explanation/i)).toBeInTheDocument();
  });
});
