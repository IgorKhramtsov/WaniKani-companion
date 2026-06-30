import * as React from 'react';
import { QuizInput } from 'wanikani-ds';

export const Neutral = () => (
  <div style={{ width: 420 }}>
    <QuizInput prompt="大" subjectType="kanji" promptType="meaning" />
  </div>
);

export const Correct = () => (
  <div style={{ width: 420 }}>
    <QuizInput prompt="大" subjectType="kanji" promptType="meaning" state="correct" value="big" />
  </div>
);

export const Incorrect = () => (
  <div style={{ width: 420 }}>
    <QuizInput prompt="大" subjectType="kanji" promptType="reading" state="incorrect" value="おお" />
  </div>
);

export const Vocabulary = () => (
  <div style={{ width: 420 }}>
    <QuizInput prompt="大きい" subjectType="vocabulary" promptType="reading" />
  </div>
);
