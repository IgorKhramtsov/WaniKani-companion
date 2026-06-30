import * as React from 'react';

export type WkAlertVariant = 'info' | 'error' | 'system' | 'cta';

export interface AlertProps {
  /**
   * Alert tone, mapped to WaniKani's alert tokens:
   * `info` (slate), `error` (red), `system` (pink banner), `cta` (blue call-to-action).
   */
  variant?: WkAlertVariant;
  /** Optional bold heading line. */
  title?: React.ReactNode;
  /** Alert body. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * WaniKani's inline notice / banner used for system messages, validation
 * errors and call-to-action prompts.
 */
export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const cls = ['wk-alert', `wk-alert--${variant}`, className ?? ''].filter(Boolean).join(' ');
  return (
    <div className={cls} role="alert">
      {title ? <div className="wk-alert__title">{title}</div> : null}
      {children ? <div className="wk-alert__body">{children}</div> : null}
    </div>
  );
}
