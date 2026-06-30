import * as React from 'react';
import { MnemonicBlock, SubjectLink } from 'wanikani-ds';

export const Meaning = () => (
  <div style={{ maxWidth: 460 }}>
    <MnemonicBlock kind="meaning">
      The radical <SubjectLink type="radical">ground</SubjectLink> with a line below it becomes the
      kanji <SubjectLink type="kanji">下</SubjectLink>, meaning <strong>below</strong>.
    </MnemonicBlock>
  </div>
);

export const Reading = () => (
  <div style={{ maxWidth: 460 }}>
    <MnemonicBlock kind="reading">
      To remember the reading <SubjectLink type="vocabulary">した</SubjectLink>, picture pointing at
      the ground below your feet.
    </MnemonicBlock>
  </div>
);
