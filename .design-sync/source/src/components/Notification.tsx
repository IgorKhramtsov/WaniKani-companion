import * as React from 'react';
import { Icon } from './Icon';
import type { WkIconName } from './Icon';

export type WkNotificationVariant = 'info' | 'error' | 'success';

export interface NotificationProps {
  /** Tone — info (blue), error (red) or success (green). */
  variant?: WkNotificationVariant;
  /** Bold heading line. */
  title?: React.ReactNode;
  /** Body text. */
  children?: React.ReactNode;
  /** Show a dismiss control. */
  onDismiss?: () => void;
}

const ICON: Record<WkNotificationVariant, WkIconName> = {
  info: 'info',
  error: 'exclamation',
  success: 'check',
};

/**
 * A transient notification / toast — distinct from the inline Alert. Uses
 * WaniKani's notification tokens and a leading status icon.
 */
export function Notification({ variant = 'info', title, children, onDismiss }: NotificationProps) {
  return (
    <div className={`wk-notification wk-notification--${variant}`} role="status">
      <span className="wk-notification__icon">
        <Icon name={ICON[variant]} size={18} />
      </span>
      <div className="wk-notification__body">
        {title ? <div className="wk-notification__title">{title}</div> : null}
        {children ? <div>{children}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="wk-notification__close" aria-label="Dismiss" onClick={onDismiss}>
          ✕
        </button>
      ) : null}
    </div>
  );
}
