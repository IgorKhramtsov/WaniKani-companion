import * as React from 'react';
import { Heatmap } from 'wanikani-ds';

// 7 weekday rows × 20 week columns, deterministic activity values.
const data = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 20 }, (_, c) => (r * 4 + c * 3 + ((r * c) % 5)) % 8),
);

export const Activity = () => (
  <div>
    <Heatmap data={data} />
  </div>
);
