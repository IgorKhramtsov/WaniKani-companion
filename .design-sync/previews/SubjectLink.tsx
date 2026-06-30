import * as React from 'react';
import { SubjectLink } from 'wanikani-ds';

export const InMnemonic = () => (
  <p style={{ fontFamily: 'var(--font-family-default)', fontSize: 16, lineHeight: 1.7, maxWidth: 460, color: '#333' }}>
    The radical <SubjectLink type="radical">ground</SubjectLink> sits under the kanji{' '}
    <SubjectLink type="kanji">下</SubjectLink>, which builds into the vocabulary{' '}
    <SubjectLink type="vocabulary">下げる</SubjectLink>.
  </p>
);

export const Types = () => (
  <div style={{ display: 'flex', gap: 18, fontSize: 18 }}>
    <SubjectLink type="radical">一</SubjectLink>
    <SubjectLink type="kanji">大</SubjectLink>
    <SubjectLink type="vocabulary">大きい</SubjectLink>
  </div>
);
