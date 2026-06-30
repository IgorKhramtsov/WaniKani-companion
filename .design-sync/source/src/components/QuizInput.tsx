import * as React from 'react';

export type WkQuizState = 'neutral' | 'correct' | 'incorrect';
export type WkQuizPrompt = 'meaning' | 'reading';

export interface QuizInputProps {
  /** The subject prompt shown above the input (e.g. the kanji being quizzed). */
  prompt: React.ReactNode;
  /** Whether the question asks for the meaning or the reading. */
  promptType?: WkQuizPrompt;
  /** Subject category — colours the prompt header band. */
  subjectType?: 'radical' | 'kanji' | 'vocabulary';
  /** Answer-checking state — drives the green correct / red incorrect colouring. */
  state?: WkQuizState;
  /** Current input value. */
  value?: string;
  /** Placeholder text for the answer field. */
  placeholder?: string;
}

/**
 * The lesson/review answer panel: a coloured subject header, a meaning/reading
 * label and the answer field that turns green when correct and red when wrong.
 */
export function QuizInput({
  prompt,
  promptType = 'meaning',
  subjectType = 'kanji',
  state = 'neutral',
  value,
  placeholder = 'Your Response',
}: QuizInputProps) {
  return (
    <div className="wk-quiz">
      <div className={`wk-quiz__header wk-quiz__header--${subjectType}`}>
        <span className="wk-quiz__characters">{prompt}</span>
      </div>
      <div className={`wk-quiz__prompt wk-quiz__prompt--${promptType}`}>
        <span>{subjectType === 'radical' ? 'Radical Name' : promptType === 'reading' ? 'Reading' : 'Meaning'}</span>
      </div>
      <div className={`wk-quiz-input wk-quiz-input--${state}`}>
        <input
          className="wk-quiz-input__field"
          defaultValue={value}
          placeholder={placeholder}
          readOnly
          aria-label="Answer"
        />
      </div>
    </div>
  );
}
