import * as React from 'react';
import { CountBadge } from './CountBadge';
import { Button } from './Button';

export interface SummaryCardProps {
  /** `lessons` paints the card WaniKani pink, `reviews` paints it blue. */
  tone: 'lessons' | 'reviews';
  /** Heading, e.g. "Today's Lessons" / "Reviews". */
  title: React.ReactNode;
  /** The count shown as a badge in the corner. */
  count?: number;
  /** Optional supporting line under the title. */
  subtitle?: React.ReactNode;
  /** Call-to-action button label. */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * The big dashboard entry card — the pink "Today's Lessons" and blue "Reviews"
 * panels with a count badge and a call-to-action button.
 */
export function SummaryCard({ tone, title, count, subtitle, actionLabel, onAction, className }: SummaryCardProps) {
  const cls = ['wk-summary', `wk-summary--${tone}`, className ?? ''].filter(Boolean).join(' ');
  return (
    <section className={cls}>
      <div className="wk-summary__head">
        <h3 className="wk-summary__title">{title}</h3>
        {count != null ? <CountBadge tone="outline" count={count} /> : null}
      </div>
      {subtitle ? <p className="wk-summary__subtitle">{subtitle}</p> : null}
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
