import * as React from 'react';
import { SubjectCharacter } from 'wanikani-ds';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };

// A radical that has no Unicode character — WaniKani ships these as white SVGs.
const groundRadical =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="14" y="46" width="72" height="10" rx="3" fill="white"/></svg>',
  );

export const ImageRadical = () => (
  <div style={row}>
    <SubjectCharacter type="radical" image={groundRadical} size="medium" />
    <SubjectCharacter type="radical" characters="一" size="medium" />
  </div>
);

export const Types = () => (
  <div style={row}>
    <SubjectCharacter type="radical" characters="一" />
    <SubjectCharacter type="kanji" characters="大" />
    <SubjectCharacter type="vocabulary" characters="大きい" />
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <SubjectCharacter type="kanji" characters="水" size="small" />
    <SubjectCharacter type="kanji" characters="水" size="medium" />
    <SubjectCharacter type="kanji" characters="水" size="large" />
  </div>
);

export const Lattice = () => (
  <div style={row}>
    {['人', '大', '工', '上', '下', '口', '山', '川'].map((c) => (
      <SubjectCharacter key={c} type="kanji" characters={c} size="small" />
    ))}
  </div>
);
