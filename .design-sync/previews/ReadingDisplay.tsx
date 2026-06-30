import * as React from 'react';
import { ReadingDisplay } from 'wanikani-ds';

export const Kanji = () => (
  <div style={{ width: 440 }}>
    <ReadingDisplay
      items={[
        { label: "On'yomi", reading: 'こう', primary: true },
        { label: "Kun'yomi", reading: '—' },
        { label: 'Nanori', reading: '—' },
      ]}
    />
  </div>
);

export const Vocabulary = () => (
  <div style={{ width: 280 }}>
    <ReadingDisplay items={[{ label: 'Reading', reading: 'おおきい', primary: true }]} />
  </div>
);
