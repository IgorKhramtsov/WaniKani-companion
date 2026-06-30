import * as React from 'react';

export interface SectionHeaderProps {
  /** Section title, e.g. "Meaning", "Reading", "Mnemonic". */
  children: React.ReactNode;
  /** Optional action/control rendered on the right. */
  action?: React.ReactNode;
}

/**
 * The underlined section title used throughout WaniKani's subject pages
 * ("Meaning", "Reading", "Mnemonic", "Context Sentences").
 */
export function SectionHeader({ children, action }: SectionHeaderProps) {
  return (
    <div className="wk-section-header">
      <h2 className="wk-section-header__title">{children}</h2>
      {action ? <div className="wk-section-header__action">{action}</div> : null}
    </div>
  );
}
