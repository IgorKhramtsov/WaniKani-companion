import * as React from 'react';

export interface HeatmapProps {
  /** Activity grid: rows (e.g. 7 weekdays) × columns (weeks). Values are counts. */
  data: number[][];
  /** Max value for the colour scale (defaults to the data max). */
  max?: number;
  /**
   * Five-step colour scale from empty → most active. Defaults to WaniKani's
   * green review-activity scale.
   */
  palette?: [string, string, string, string, string];
  /** Cell size in px. */
  cell?: number;
}

const GREEN: [string, string, string, string, string] = ['#ebedf0', '#c6e9c9', '#7bc97f', '#35a753', '#1f6b33'];

/**
 * The study-activity heat map — a calendar grid of cells shaded by how much you
 * studied, like WaniKani's dashboard heat map. Presentational.
 */
export function Heatmap({ data, max, palette = GREEN, cell = 13 }: HeatmapProps) {
  const m = max ?? Math.max(1, ...data.flat());
  const colorFor = (v: number) => {
    if (v <= 0) return palette[0];
    const step = Math.min(4, Math.max(1, Math.ceil((v / m) * 4)));
    return palette[step];
  };
  return (
    <div className="wk-heatmap" style={{ gridTemplateRows: `repeat(${data.length}, ${cell}px)` }}>
      {data.map((row, r) => (
        <div className="wk-heatmap__row" key={r}>
          {row.map((v, c) => (
            <span
              key={c}
              className="wk-heatmap__cell"
              style={{ width: cell, height: cell, background: colorFor(v) }}
              title={String(v)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
