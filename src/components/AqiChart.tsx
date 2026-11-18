import { HOURLY_AQI } from '../data/demo';

export function AqiChart() {
  const min = 250;
  const max = 350;
  const points = HOURLY_AQI.map((entry, index) => {
    const x = (index / (HOURLY_AQI.length - 1)) * 100;
    const y = 88 - ((entry.value - min) / (max - min)) * 68;
    return `${x},${y}`;
  }).join(' ');

  return (
    <section className="chart-card" aria-labelledby="forecast-title">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Next 12 hours</p>
          <h2 id="forecast-title">A cleaner window is likely at 3 pm</h2>
        </div>
        <span className="data-badge">Demo forecast</span>
      </div>
      <div className="chart-wrap">
        <svg className="aqi-chart" viewBox="0 0 100 100" role="img" aria-label="AQI forecast decreases from 338 at 6 am to 284 at 3 pm, then rises to 329 at 9 pm">
          <line x1="0" y1="88" x2="100" y2="88" className="chart-grid" />
          <line x1="0" y1="54" x2="100" y2="54" className="chart-grid" />
          <line x1="0" y1="20" x2="100" y2="20" className="chart-grid" />
          <polyline points={points} className="chart-line" />
          {points.split(' ').map((point, index) => {
            const [cx, cy] = point.split(',');
            return <circle key={HOURLY_AQI[index].time} cx={cx} cy={cy} r="1.8" className="chart-dot" />;
          })}
        </svg>
        <div className="chart-labels" aria-hidden="true">
          {HOURLY_AQI.map((entry) => <span key={entry.time}>{entry.time}</span>)}
        </div>
      </div>
    </section>
  );
}
