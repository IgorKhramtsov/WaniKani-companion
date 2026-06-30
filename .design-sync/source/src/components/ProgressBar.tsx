import * as React from 'react';

export interface ProgressBarProps {
  /** Completion from 0 to 100. */
  value: number;
  /**
   * Fill colour. A subject type maps to its signature colour; otherwise pass any
   * CSS colour. Defaults to the radical blue used by the level-progress bars.
   */
  color?: 'radical' | 'kanji' | 'vocabulary' | (string & {});
  /** Show the percentage label inside the bar. */
  showLabel?: boolean;
  /** Bar height. */
  size?: 'small' | 'medium' | 'large';
  /**
   * Render as discrete segments (WaniKani's "N more kanji to level up" bar)
   * instead of a continuous fill. With `segments`, `filled` counts how many are
   * complete and `value` is ignored.
   */
  segments?: number;
  /** Number of filled segments when `segments` is set. */
  filled?: number;
  className?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  radical: 'var(--color-radical)',
  kanji: 'var(--color-kanji)',
  vocabulary: 'var(--color-vocabulary)',
};

/**
 * The horizontal progress bar WaniKani uses for level-up progress (radicals and
 * kanji passed) and other completion metrics.
 */
export function ProgressBar({
  value,
  color = 'radical',
  showLabel = false,
  size = 'medium',
  segments,
  filled = 0,
  className,
}: ProgressBarProps) {
  const fill = SUBJECT_COLORS[color] ?? color;

  if (segments && segments > 0) {
    const done = Math.max(0, Math.min(segments, filled));
    const cls = ['wk-progress-seg', `wk-progress-seg--${size}`, className ?? ''].filter(Boolean).join(' ');
    return (
      <div className={cls} role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={segments}>
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={['wk-progress-seg__cell', i < done ? 'wk-progress-seg__cell--filled' : ''].filter(Boolean).join(' ')}
            style={i < done ? { background: fill } : undefined}
          />
        ))}
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, value));
  const cls = ['wk-progress', `wk-progress--${size}`, className ?? ''].filter(Boolean).join(' ');
  return (
    <div className={cls} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="wk-progress__bar" style={{ width: `${pct}%`, background: fill }}>
        {showLabel ? <span className="wk-progress__label">{pct}%</span> : null}
      </div>
    </div>
  );
}
