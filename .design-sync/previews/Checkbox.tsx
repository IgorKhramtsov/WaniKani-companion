import * as React from 'react';
import { Checkbox } from 'wanikani-ds';

export const States = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Checkbox checked label="Show SRS stage on tiles" />
    <Checkbox label="Hide mnemonics during reviews" />
    <Checkbox checked disabled label="Locked setting" />
  </div>
);
