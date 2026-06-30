import * as React from 'react';
import { Toggle } from 'wanikani-ds';

export const States = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
    <Toggle checked label="Vacation mode" />
    <Toggle label="Autoplay lesson audio" />
    <Toggle checked accent="kanji" label="Pink accent (on)" />
    <Toggle checked disabled label="Disabled (on)" />
  </div>
);
