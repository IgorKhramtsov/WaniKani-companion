import * as React from 'react';
import { Tooltip, SrsStagePill } from 'wanikani-ds';

export const OnHover = () => (
  <div style={{ display: 'flex', gap: 48, padding: '44px 0' }}>
    <Tooltip open label="Reviews in 4 hours">
      <SrsStagePill stage="apprentice" />
    </Tooltip>
    <Tooltip open placement="bottom" label="Burned — you've mastered it!">
      <SrsStagePill stage="burned" />
    </Tooltip>
  </div>
);
