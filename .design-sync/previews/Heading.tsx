import * as React from 'react';
import { Heading } from 'wanikani-ds';

export const Levels = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Heading level={1}>Level 6</Heading>
    <Heading level={2}>Today's Lessons</Heading>
    <Heading level={3}>Reading</Heading>
    <Heading level={4}>Found in Vocabulary</Heading>
  </div>
);
