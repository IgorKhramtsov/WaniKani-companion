import * as React from 'react';

export type WkButtonVariant = 'primary' | 'secondary' | 'danger' | 'quiz' | 'subscribe';
export type WkButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style, mapped to WaniKani's button tokens.
   * `primary` is the default light button; `quiz` is the blue lesson/review CTA;
   * `subscribe` the pink upsell; `secondary` a low-emphasis action; `danger` destructive.
   */
  variant?: WkButtonVariant;
  /** Controls height, padding and font-size. */
  size?: WkButtonSize;
  /** Stretch to fill the available width. */
  fullWidth?: boolean;
  /** Icon rendered before the label (e.g. an <Icon/>). */
  iconBefore?: React.ReactNode;
  /** Icon rendered after the label (e.g. a chevron). */
  iconAfter?: React.ReactNode;
}

/**
 * WaniKani's signature 3D button. The face sits raised above a coloured edge;
 * it lifts on hover and presses down (with an inset shadow) on click — that
 * tactile motion is core to the WaniKani feel. Use it for primary page
 * actions, lesson/review entry points and form submits.
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  iconBefore,
  iconAfter,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = [
    'wk-button',
    `wk-button--${variant}`,
    `wk-button--${size}`,
    fullWidth ? 'wk-button--block' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      <span className="wk-button__edge" aria-hidden="true" />
      <span className="wk-button__content">
        {iconBefore ? <span className="wk-button__icon wk-button__icon--before">{iconBefore}</span> : null}
        {children != null ? <span className="wk-button__text">{children}</span> : null}
        {iconAfter ? <span className="wk-button__icon wk-button__icon--after">{iconAfter}</span> : null}
      </span>
    </button>
  );
}
