import * as React from 'react';
import { SectionHeader } from 'wanikani-ds';

export const Default = () => (
  <div style={{ width: 440 }}>
    <SectionHeader>Meaning</SectionHeader>
    <p style={{ fontFamily: 'var(--font-family-default)', color: '#333', margin: 0 }}>Big</p>
  </div>
);

export const WithAction = () => (
  <div style={{ width: 440 }}>
    <SectionHeader action={<a href="#" style={{ color: 'var(--color-radical)', textDecoration: 'none' }}>Edit</a>}>
      Reading
    </SectionHeader>
  </div>
);
