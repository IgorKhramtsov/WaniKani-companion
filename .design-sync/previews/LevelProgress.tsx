import * as React from 'react';
import { LevelProgress } from 'wanikani-ds';

export const Widget = () => (
  <div style={{ width: 360, background: '#fff', padding: 16, borderRadius: 8 }}>
    <LevelProgress
      level={6}
      categories={[
        { type: 'radical', passed: 13, total: 36 },
        { type: 'kanji', passed: 5, total: 39 },
        { type: 'vocabulary', passed: 1, total: 114 },
      ]}
      toLevelUp="Guru 31 more kanji to level up"
    />
  </div>
);
