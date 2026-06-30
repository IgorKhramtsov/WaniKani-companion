import * as React from 'react';
import { ContextSentence } from 'wanikani-ds';

export const Sentences = () => (
  <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <ContextSentence japanese="水を一杯ください。" english="One glass of water, please." />
    <ContextSentence japanese="大きい犬が好きです。" english="I like big dogs." />
  </div>
);
