import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('shows AQI and a personalised daily plan', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /plan a lower-exposure day/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your air-smart plan/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /mark done/i }).length).toBeGreaterThan(0);
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
});
