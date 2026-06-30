import * as React from 'react';

export interface AvatarProps {
  /** Image URL. When omitted, `initials` (or a placeholder) is shown. */
  src?: string;
  alt?: string;
  /** Fallback initials shown when there is no image. */
  initials?: string;
  /** Avatar diameter. */
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * The circular user avatar shown in WaniKani's top navigation, with an
 * initials fallback when no image is available.
 */
export function Avatar({ src, alt = '', initials, size = 'medium', className }: AvatarProps) {
  const cls = ['wk-avatar', `wk-avatar--${size}`, className ?? ''].filter(Boolean).join(' ');
  if (src) {
    return <img className={cls} src={src} alt={alt} />;
  }
  return (
    <span className={cls} role="img" aria-label={alt || initials}>
      {initials ?? '🦀'}
    </span>
  );
}
