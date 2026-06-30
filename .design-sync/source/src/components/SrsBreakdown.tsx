import * as React from 'react';

export interface SrsBreakdownItem {
  /** Stage label (e.g. "I", "Appr.", "Guru"). */
  label: React.ReactNode;
  radical?: number;
  kanji?: number;
  vocabulary?: number;
}

export interface SrsBreakdownProps {
  /** One entry per SRS stage / bucket. */
  items: SrsBreakdownItem[];
  /** Bar area height in px. */
  height?: number;
}

/**
 * The dashboard "Active Item Spread" chart — a bar per SRS stage, each stacked
 * with radical (blue), kanji (pink) and vocabulary (purple) counts. Presentational:
 * pass the per-stage counts; the component just visualises them.
 */
export function SrsBreakdown({ items, height = 140 }: SrsBreakdownProps) {
  const totals = items.map((i) => (i.radical ?? 0) + (i.kanji ?? 0) + (i.vocabulary ?? 0));
  const max = Math.max(1, ...totals);
  const seg = (v: number | undefined, color: string) =>
    v ? <span className="wk-spread__seg" style={{ height: `${(v / max) * 100}%`, background: color }} /> : null;
  return (
    <div className="wk-spread">
      {items.map((it, i) => (
        <div className="wk-spread__col" key={i}>
          <div className="wk-spread__bar" style={{ height }}>
            {seg(it.vocabulary, 'var(--color-vocabulary, #aa00ff)')}
            {seg(it.kanji, 'var(--color-kanji, #ff00aa)')}
            {seg(it.radical, 'var(--color-radical, #00aaff)')}
          </div>
          <div className="wk-spread__label">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
