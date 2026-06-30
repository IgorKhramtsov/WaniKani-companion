import * as React from 'react';
import { Chip } from 'wanikani-ds';

const row: React.CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' };

export const States = () => (
  <div style={row}>
    <Chip>Default</Chip>
    <Chip className="is-hover">Hover</Chip>
    <Chip active>Selected</Chip>
  </div>
);

export const Filters = () => (
  <div style={row}>
    <Chip active>All</Chip>
    <Chip>Radicals</Chip>
    <Chip>Kanji</Chip>
    <Chip>Vocabulary</Chip>
  </div>
);

export const Tags = () => (
  <div style={row}>
    <Chip>Verb</Chip>
    <Chip>Common Word</Chip>
    <Chip>Level 6</Chip>
  </div>
);
