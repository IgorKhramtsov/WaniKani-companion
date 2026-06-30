import * as React from 'react';

export interface MnemonicBlockProps {
  /** Meaning or reading mnemonic — reading mnemonics get a tinted background. */
  kind?: 'meaning' | 'reading';
  /** Mnemonic text. Embed <SubjectLink> for the highlighted radicals/kanji. */
  children: React.ReactNode;
}

/**
 * A mnemonic passage from a subject page — the story that teaches a meaning or
 * reading, with coloured <SubjectLink> highlights for the referenced subjects.
 */
export function MnemonicBlock({ kind = 'meaning', children }: MnemonicBlockProps) {
  return <div className={`wk-mnemonic wk-mnemonic--${kind}`}>{children}</div>;
}
