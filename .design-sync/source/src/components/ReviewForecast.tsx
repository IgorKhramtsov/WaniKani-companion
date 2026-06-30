import * as React from 'react';

export interface ForecastHour {
  /** Hour/time label, e.g. "10", "11", "Now". */
  label: React.ReactNode;
  /** Reviews becoming available at that hour. */
  count: number;
}

export interface ReviewForecastProps {
  /** One entry per upcoming hour. */
  hours: ForecastHour[];
  /** Bar area height in px. */
  height?: number;
}

/**
 * The dashboard review-forecast chart — upcoming reviews per hour as green bars
 * (grey when zero), the way WaniKani shows your day's workload. Presentational.
 */
export function ReviewForecast({ hours, height = 120 }: ReviewForecastProps) {
  const max = Math.max(1, ...hours.map((h) => h.count));
  return (
    <div className="wk-forecast">
      {hours.map((h, i) => (
        <div className="wk-forecast__col" key={i}>
          <div className="wk-forecast__count">{h.count > 0 ? h.count : ''}</div>
          <div className="wk-forecast__track" style={{ height }}>
            <div
              className="wk-forecast__bar"
              style={{
                height: `${(h.count / max) * 100}%`,
                background: h.count > 0 ? 'var(--color-review-forecast-bar-positive, #35a753)' : 'var(--color-review-forecast-bar-zero, #cad0d6)',
              }}
            />
          </div>
          <div className="wk-forecast__label">{h.label}</div>
        </div>
      ))}
    </div>
  );
}
