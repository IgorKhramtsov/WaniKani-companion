import * as React from 'react';
import { Tabs } from 'wanikani-ds';

export const Sections = () => (
  <div style={{ width: 460 }}>
    <Tabs
      tabs={[
        { key: 'meaning', label: 'Meaning' },
        { key: 'reading', label: 'Reading' },
        { key: 'context', label: 'Context' },
      ]}
      activeKey="reading"
      accent="kanji">
      <p style={{ fontFamily: 'var(--font-family-default)', color: '#333', margin: 0 }}>
        The reading of 下 is した (kun'yomi) or か (on'yomi).
      </p>
    </Tabs>
  </div>
);
