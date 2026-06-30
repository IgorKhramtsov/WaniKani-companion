import * as React from 'react';
import { SummaryCard } from 'wanikani-ds';

export const Dashboard = () => (
  <div style={{ display: 'flex', gap: 16, background: '#f4f4f4', padding: 16, flexWrap: 'wrap' }}>
    <SummaryCard
      tone="lessons"
      title="Today's Lessons"
      count={16}
      subtitle="Learn something new."
      actionLabel="Start Lessons"
    />
    <SummaryCard
      tone="reviews"
      title="Reviews"
      count={249}
      subtitle="Do your reviews to unlock new lessons."
      actionLabel="Start Reviews"
    />
  </div>
);
