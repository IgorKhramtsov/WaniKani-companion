import * as React from 'react';

export interface ReadingItem {
  /** Reading category, e.g. "On'yomi", "Kun'yomi", "Nanori". */
  label: React.ReactNode;
  /** The reading(s); use "—" when none. */
  reading: React.ReactNode;
  /** Highlight as the primary reading WaniKani wants you to learn. */
  primary?: boolean;
}

export interface ReadingDisplayProps {
  /** Reading columns. */
  items: ReadingItem[];
}

/**
 * The reading panel from a kanji page — On'yomi / Kun'yomi / Nanori columns
 * with the primary reading highlighted (WaniKani shows it in white/bold).
 */
export function ReadingDisplay({ items }: ReadingDisplayProps) {
  return (
    <div className="wk-readings">
      {items.map((it, i) => (
        <div
          key={i}
          className={['wk-readings__col', it.primary ? 'wk-readings__col--primary' : ''].filter(Boolean).join(' ')}>
          <div className="wk-readings__label">{it.label}</div>
          <div className="wk-readings__value" lang="ja">
            {it.reading}
          </div>
        </div>
      ))}
    </div>
  );
}
