import * as React from 'react';

export interface ChipProps {
  /** Chip label. */
  children: React.ReactNode;
  /** Selected/active styling (the filled grey state). */
  active?: boolean;
  /** Render as a link. */
  href?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * WaniKani's chip — a small, bordered, pill-ish control used for filters,
 * part-of-speech tags and level labels. Has hover and active (selected) states.
 */
export function Chip({ children, active = false, href, onClick, className }: ChipProps) {
  const cls = ['wk-chip', active ? 'wk-chip--active' : '', className ?? ''].filter(Boolean).join(' ');
  if (href) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
