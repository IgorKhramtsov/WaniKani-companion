import * as React from 'react';

export type WkCountTone = 'lessons' | 'reviews' | 'neutral' | 'outline';

export interface CountBadgeProps {
  /** The number (or short label) to display. */
  count: React.ReactNode;
  /**
   * Colour: `lessons` pink, `reviews` blue, `neutral` grey (the dashboard
   * lesson/review count chip), or `outline` (white count bubble with a border).
   */
  tone?: WkCountTone;
  /** Pill size. */
  size?: 'small' | 'medium';
  className?: string;
}

/**
 * The small count pill WaniKani uses for lesson / review counts and the
 * count bubbles dotted around the dashboard.
 */
export function CountBadge({ count, tone = 'neutral', size = 'medium', className }: CountBadgeProps) {
  const cls = ['wk-count', `wk-count--${tone}`, `wk-count--${size}`, className ?? '']
    .filter(Boolean)
    .join(' ');
  return <span className={cls}>{count}</span>;
}
