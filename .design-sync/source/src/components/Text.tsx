import * as React from 'react';

export type WkTextSize = 'caption' | 'small' | 'body' | 'medium' | 'large';
export type WkTextWeight = 'light' | 'regular' | 'medium' | 'bold' | 'heavy';

export interface TextProps {
  /** Maps to WaniKani's font-size tokens: caption 11 · small 14 · body 16 · medium 18 · large 24. */
  size?: WkTextSize;
  /** Maps to WaniKani's font-weight tokens (light 300 … heavy 700). */
  weight?: WkTextWeight;
  /** Text colour (defaults to the WaniKani body colour #333). */
  color?: string;
  /** HTML element to render. */
  as?: 'p' | 'span' | 'div' | 'label';
  children?: React.ReactNode;
  className?: string;
}

const SIZE_VAR: Record<WkTextSize, string> = {
  caption: 'var(--font-size-xxsmall, 11px)',
  small: 'var(--font-size-xsmall, 14px)',
  body: 'var(--font-size-small, 16px)',
  medium: 'var(--font-size-medium, 18px)',
  large: 'var(--font-size-large, 24px)',
};
const WEIGHT_VAR: Record<WkTextWeight, string> = {
  light: 'var(--font-weight-light, 300)',
  regular: 'var(--font-weight-regular, 350)',
  medium: 'var(--font-weight-medium, 500)',
  bold: 'var(--font-weight-bold, 600)',
  heavy: 'var(--font-weight-heavy, 700)',
};

/**
 * Body text in the WaniKani type scale (Noto Sans). A thin primitive that
 * keeps font size, weight and family consistent with the design tokens.
 */
export function Text({ size = 'body', weight = 'regular', color, as = 'p', children, className }: TextProps) {
  const Tag = as as any;
  return (
    <Tag
      className={['wk-text', className].filter(Boolean).join(' ')}
      style={{
        margin: 0,
        fontFamily: 'var(--font-family-default)',
        fontSize: SIZE_VAR[size],
        fontWeight: WEIGHT_VAR[weight] as any,
        color: color ?? 'var(--color-text, #333)',
        lineHeight: 1.5,
      }}>
      {children}
    </Tag>
  );
}
