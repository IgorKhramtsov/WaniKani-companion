import * as React from 'react';
import { SrsBreakdown } from 'wanikani-ds';

export const ItemSpread = () => (
  <div style={{ width: 460 }}>
    <SrsBreakdown
      items={[
        { label: 'I', radical: 2, kanji: 1 },
        { label: 'II', radical: 1, kanji: 3, vocabulary: 2 },
        { label: 'III', kanji: 4, vocabulary: 6 },
        { label: 'IV', kanji: 2, vocabulary: 8 },
        { label: 'V', vocabulary: 14 },
        { label: 'VI', radical: 3, kanji: 6, vocabulary: 20 },
        { label: 'VII', kanji: 4, vocabulary: 18 },
        { label: 'VIII', radical: 1, kanji: 30, vocabulary: 90 },
      ]}
    />
  </div>
);
