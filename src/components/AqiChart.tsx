interface ForecastPoint { time: string; aqi: number }

interface AqiChartProps {
  currentAqi: number;
  forecast?: ForecastPoint[];
  cleanestWindow?: ForecastPoint | null;
  isLive: boolean;
}

function formatHour(value: string) {
  const hour = Number(value.slice(11, 13));
  if (hour === 0) return '12 am';
  if (hour === 12) return '12 pm';
  return hour > 12 ? `${hour - 12} pm` : `${hour} am`;
}

export function AqiChart({ currentAqi, forecast = [], cleanestWindow, isLive }: AqiChartProps) {
  const visible = forecast.filter((_, index) => index % 4 === 0).slice(0, 6);
  const values = visible.map((entry) => entry.aqi);
  const lowest = values.length ? Math.min(...values) : 0;
  const highest = values.length ? Math.max(...values) : 100;
  const padding = Math.max(6, (highest - lowest) * 0.35);
  const min = Math.max(0, lowest - padding);
  const max = highest + padding;
  const range = Math.max(1, max - min);
  const points = visible.map((entry, index) => {
    const x = visible.length === 1 ? 50 : (index / (visible.length - 1)) * 100;
    const y = 88 - ((entry.aqi - min) / range) * 68;
    return { ...entry, x, y };
  });

  return (
    <section className="chart-card" aria-labelledby="forecast-title">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Next 24 hours</p>
          <h2 id="forecast-title">{cleanestWindow ? `Lowest daytime AQI near ${formatHour(cleanestWindow.time)}` : 'Hourly outlook unavailable'}</h2>
          {cleanestWindow && <p>Modeled AQI {cleanestWindow.aqi}. Recheck conditions before changing outdoor plans.</p>}
        </div>
        <span className="data-badge">{isLive ? 'Live model forecast' : 'Forecast unavailable'}</span>
      </div>
      <dl className="aqi-comparison" aria-label="Current AQI compared with the good range">
        <div><dt>Current AQI</dt><dd>{currentAqi}</dd></div>
        <div className="good-reference"><dt>Good AQI range</dt><dd>0–50</dd></div>
        <div><dt>Difference from good</dt><dd>{currentAqi > 50 ? `${currentAqi - 50} above the limit` : 'Within the good range'}</dd></div>
      </dl>
      {points.length > 1 ? (
        <div className="chart-wrap">
          <svg className="aqi-chart" viewBox="0 0 100 100" role="img" aria-label={`Modeled AQI ranges from ${Math.min(...values)} to ${Math.max(...values)} over the next 24 hours`}>
            <line x1="0" y1="88" x2="100" y2="88" className="chart-grid" />
            <line x1="0" y1="54" x2="100" y2="54" className="chart-grid" />
            <line x1="0" y1="20" x2="100" y2="20" className="chart-grid" />
            <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} className="chart-line" />
            {points.map(({ time, aqi, x, y }) => (
              <g key={time}>
                <circle cx={x} cy={y} r="1.8" className="chart-dot"><title>{formatHour(time)}: AQI {aqi}</title></circle>
                <text x={x} y={Math.max(12, y - 5)} className="chart-value" textAnchor="middle" aria-hidden="true">{aqi}</text>
              </g>
            ))}
          </svg>
          <ol className="chart-labels" aria-label="Hourly AQI values">
            {points.map(({ time, aqi }) => <li key={time}><span>{formatHour(time)}</span><strong>AQI {aqi}</strong></li>)}
          </ol>
        </div>
      ) : <p className="chart-empty">Current guidance remains available. Try another city or refresh shortly.</p>}
    </section>
  );
}
