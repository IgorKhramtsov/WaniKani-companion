import * as React from 'react';
import { ReviewForecast } from 'wanikani-ds';

export const Hourly = () => (
  <div style={{ width: 460 }}>
    <ReviewForecast
      hours={[
        { label: 'Now', count: 42 },
        { label: '10', count: 0 },
        { label: '11', count: 8 },
        { label: '12', count: 15 },
        { label: '13', count: 0 },
        { label: '14', count: 23 },
        { label: '15', count: 5 },
        { label: '16', count: 0 },
        { label: '17', count: 31 },
      ]}
    />
  </div>
);
