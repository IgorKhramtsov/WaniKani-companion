import * as React from 'react';
import { CountBadge } from 'wanikani-ds';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

export const Tones = () => (
  <div style={row}>
    <CountBadge tone="lessons" count={16} />
    <CountBadge tone="reviews" count={249} />
    <CountBadge tone="neutral" count={42} />
    <CountBadge tone="outline" count={7} />
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <CountBadge tone="reviews" count={249} size="small" />
    <CountBadge tone="reviews" count={249} size="medium" />
  </div>
);
