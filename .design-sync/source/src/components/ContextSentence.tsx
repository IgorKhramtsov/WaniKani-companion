import * as React from 'react';

export interface ContextSentenceProps {
  /** The Japanese sentence. */
  japanese: React.ReactNode;
  /** The English translation. */
  english: React.ReactNode;
}

/**
 * A context-sentence pair from a WaniKani vocabulary page: the Japanese
 * sentence above its English translation.
 */
export function ContextSentence({ japanese, english }: ContextSentenceProps) {
  return (
    <div className="wk-context">
      <p className="wk-context__ja" lang="ja">
        {japanese}
      </p>
      <p className="wk-context__en">{english}</p>
    </div>
  );
}
