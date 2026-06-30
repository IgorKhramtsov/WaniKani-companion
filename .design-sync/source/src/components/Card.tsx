import * as React from 'react';

export interface CardProps {
  /** Optional panel heading shown with WaniKani's underlined title treatment. */
  title?: React.ReactNode;
  /** Panel contents. */
  children?: React.ReactNode;
  /** Use the larger 16px “widget” corner radius instead of the normal 8px. */
  widget?: boolean;
  className?: string;
}

/**
 * The white rounded panel WaniKani uses for dashboard widgets and content
 * sections, with an optional underlined title.
 */
export function Card({ title, children, widget = false, className }: CardProps) {
  const cls = ['wk-card', widget ? 'wk-card--widget' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <section className={cls}>
      {title ? <h3 className="wk-card__title">{title}</h3> : null}
      <div className="wk-card__body">{children}</div>
    </section>
  );
}
