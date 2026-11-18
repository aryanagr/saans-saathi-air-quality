import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AqiChart } from './AqiChart';

describe('AqiChart', () => {
  it('shows numeric AQI values with their times', () => {
    const forecast = Array.from({ length: 24 }, (_, index) => ({
      time: `2026-11-19T${String(index).padStart(2, '0')}:00`,
      aqi: 100 + index,
    }));
    render(<AqiChart currentAqi={166} forecast={forecast} cleanestWindow={forecast[6]} isLive />);
    const values = screen.getByRole('list', { name: /hourly aqi values/i });
    expect(values).toHaveTextContent('AQI 100');
    expect(values).toHaveTextContent('AQI 120');
    expect(screen.getByRole('img')).toHaveAccessibleName(/ranges from 100 to 120/i);
    expect(screen.getByText('116 above the limit')).toBeInTheDocument();
  });

  it('identifies a current reading within the good range', () => {
    render(<AqiChart currentAqi={42} forecast={[]} cleanestWindow={null} isLive={false} />);
    expect(screen.getByText('Within the good range')).toBeInTheDocument();
  });
});
