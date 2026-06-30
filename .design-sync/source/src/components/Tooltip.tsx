import * as React from 'react';

export interface TooltipProps {
  /** Tooltip text. */
  label: React.ReactNode;
  /** The element the tooltip describes. */
  children: React.ReactNode;
  /** Where the bubble appears. */
  placement?: 'top' | 'bottom';
  /** Force the tooltip visible (for demos). Otherwise shows on hover/focus. */
  open?: boolean;
}

/**
 * A small dark tooltip bubble shown on hover — WaniKani uses these for SRS-stage
 * hints and item info.
 */
export function Tooltip({ label, children, placement = 'top', open = false }: TooltipProps) {
  const cls = ['wk-tooltip', `wk-tooltip--${placement}`, open ? 'wk-tooltip--open' : ''].filter(Boolean).join(' ');
  return (
    <span className={cls}>
      <span className="wk-tooltip__trigger">{children}</span>
      <span className="wk-tooltip__bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
