import * as React from 'react';
import type { WkSubjectType } from './SubjectCharacter';

export interface SubjectLinkProps {
  /** Subject category — colours the text (radical=blue, kanji=pink, vocabulary=purple). */
  type: WkSubjectType;
  /** The character(s) or label to show inline. */
  children: React.ReactNode;
  /** Optional subject page link. */
  href?: string;
  className?: string;
}

/**
 * Inline coloured reference to a subject, the way WaniKani highlights kanji and
 * radicals inside mnemonics and reading explanations.
 */
export function SubjectLink({ type, children, href, className }: SubjectLinkProps) {
  const cls = ['wk-subject-link', `wk-subject-link--${type}`, className ?? '']
    .filter(Boolean)
    .join(' ');
  if (href) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return <span className={cls}>{children}</span>;
}
