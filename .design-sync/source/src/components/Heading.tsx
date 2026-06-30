import * as React from 'react';

export interface HeadingProps {
  /** 1 → 38px, 2 → 28px, 3 → 24px, 4 → 18px (WaniKani's heading sizes). */
  level?: 1 | 2 | 3 | 4;
  /** Heading colour (defaults to #333). */
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

const SIZE: Record<number, string> = {
  1: 'var(--font-size-xxlarge, 38px)',
  2: 'var(--font-size-xlarge, 28px)',
  3: 'var(--font-size-large, 24px)',
  4: 'var(--font-size-medium, 18px)',
};

/**
 * Headings in the WaniKani type scale. Levels 1–4 map to the xxlarge → medium
 * font-size tokens, rendered bold in Noto Sans.
 */
export function Heading({ level = 2, color, children, className }: HeadingProps) {
  const Tag = `h${level}` as any;
  return (
    <Tag
      className={['wk-heading', className].filter(Boolean).join(' ')}
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-default)',
        fontSize: SIZE[level],
        fontWeight: 'var(--font-weight-bold, 600)' as any,
        color: color ?? 'var(--color-text, #333)',
        lineHeight: 1.2,
      }}>
      {children}
    </Tag>
  );
}
