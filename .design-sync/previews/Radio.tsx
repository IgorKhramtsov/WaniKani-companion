import * as React from 'react';
import { Radio } from 'wanikani-ds';

export const Group = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Radio checked label="Meaning, then reading" />
    <Radio label="Reading, then meaning" />
    <Radio label="Random order" />
  </div>
);
