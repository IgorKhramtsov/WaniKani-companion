import * as React from 'react';
import { Text } from 'wanikani-ds';

export const Scale = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <Text size="large">Large 24 — section heading</Text>
    <Text size="medium">Medium 18 — subheading</Text>
    <Text size="body">Body 16 — the kanji 大 means “big”.</Text>
    <Text size="small" color="#6b7079">Small 14 — secondary text</Text>
    <Text size="caption" color="#6b7079">Caption 11 — metadata</Text>
  </div>
);

export const Weights = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <Text weight="light">Light 300</Text>
    <Text weight="regular">Regular 350</Text>
    <Text weight="medium">Medium 500</Text>
    <Text weight="bold">Bold 600</Text>
    <Text weight="heavy">Heavy 700</Text>
  </div>
);
