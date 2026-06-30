import * as React from 'react';
import { Select } from 'wanikani-ds';

export const Voice = () => (
  <div style={{ width: 280 }}>
    <Select
      label="Audio voice"
      defaultValue="kyoko"
      options={[
        { value: 'kyoko', label: 'Kyoko (female)' },
        { value: 'kenichi', label: 'Kenichi (male)' },
        { value: 'random', label: 'Random' },
      ]}
    />
  </div>
);
