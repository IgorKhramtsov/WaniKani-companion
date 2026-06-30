import * as React from 'react';
import { ProgressBar } from 'wanikani-ds';

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14, width: 360 };

export const LevelProgress = () => (
  <div style={col}>
    <div>
      <div style={{ fontFamily: 'var(--font-family-default)', fontSize: 13, marginBottom: 4, color: '#333' }}>Radicals</div>
      <ProgressBar value={80} color="radical" />
    </div>
    <div>
      <div style={{ fontFamily: 'var(--font-family-default)', fontSize: 13, marginBottom: 4, color: '#333' }}>Kanji</div>
      <ProgressBar value={45} color="kanji" />
    </div>
    <div>
      <div style={{ fontFamily: 'var(--font-family-default)', fontSize: 13, marginBottom: 4, color: '#333' }}>Vocabulary</div>
      <ProgressBar value={30} color="vocabulary" />
    </div>
  </div>
);

export const WithLabel = () => (
  <div style={{ width: 360 }}>
    <ProgressBar value={67} color="kanji" showLabel size="large" />
  </div>
);

export const Segmented = () => (
  <div style={{ width: 360 }}>
    <div style={{ fontFamily: 'var(--font-family-default)', fontSize: 13, marginBottom: 6, color: '#333' }}>
      Guru 7 more kanji to level up
    </div>
    <ProgressBar segments={20} filled={13} color="kanji" />
  </div>
);

export const Sizes = () => (
  <div style={col}>
    <ProgressBar value={60} color="radical" size="small" />
    <ProgressBar value={60} color="radical" size="medium" />
    <ProgressBar value={60} color="radical" size="large" />
  </div>
);
