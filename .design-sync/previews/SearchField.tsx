import * as React from 'react';
import { SearchField } from 'wanikani-ds';

export const Default = () => (
  <div style={{ width: 320 }}>
    <SearchField />
  </div>
);

export const Focused = () => (
  <div style={{ width: 320 }}>
    <SearchField className="is-focus" defaultValue="ground" />
  </div>
);
