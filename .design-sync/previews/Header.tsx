import * as React from 'react';
import { Header, Avatar } from 'wanikani-ds';

const nav = [
  { key: 'levels', label: 'Levels' },
  { key: 'radicals', label: 'Radicals' },
  { key: 'kanji', label: 'Kanji' },
  { key: 'vocabulary', label: 'Vocabulary' },
  { key: 'help', label: 'Help' },
];

export const Global = () => (
  <Header nav={nav} activeKey="kanji" avatar={<Avatar initials="IK" size="small" />} />
);
