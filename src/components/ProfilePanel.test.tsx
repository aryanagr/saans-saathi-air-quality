import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfilePanel } from './ProfilePanel';

const profile = {
  city: 'Bengaluru',
  sensitivity: 'none' as const,
  commute: 'public' as const,
  hasPurifier: false,
  cooksWithGas: true,
};

describe('ProfilePanel', () => {
  it('connects location guidance and prevents background scrolling while open', () => {
    const { unmount } = render(<ProfilePanel open profile={profile} onChange={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByLabelText('Location')).toHaveAttribute('aria-describedby', 'city-help');
    expect(document.body).toHaveStyle({ overflow: 'hidden' });

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps keyboard focus inside the dialog', () => {
    render(<ProfilePanel open profile={profile} onChange={vi.fn()} onClose={vi.fn()} />);
    const close = screen.getByRole('button', { name: /close household profile/i });
    const update = screen.getByRole('button', { name: /update my plan/i });

    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(update).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();
  });
});
