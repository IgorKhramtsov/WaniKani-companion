import * as React from 'react';
import { ProgressBar } from './ProgressBar';

export interface LevelProgressCategory {
  type: 'radical' | 'kanji' | 'vocabulary';
  /** Items passed (Guru'd) in this level. */
  passed: number;
  /** Total items of this type in the level. */
  total: number;
}

export interface LevelProgressProps {
  /** Current level number. */
  level: number;
  /** Per-category progress. */
  categories: LevelProgressCategory[];
  /** Footer line, e.g. "Guru 7 more kanji to level up". */
  toLevelUp?: React.ReactNode;
}

const LABEL: Record<string, string> = { radical: 'Radicals', kanji: 'Kanji', vocabulary: 'Vocabulary' };

/**
 * The dashboard Level-Progress widget — per-category passed/total counts each
 * with a subject-coloured bar, plus the "N more to level up" line. Composed from
 * ProgressBar; presentational.
 */
export function LevelProgress({ level, categories, toLevelUp }: LevelProgressProps) {
  return (
    <div className="wk-levelprogress">
      <div className="wk-levelprogress__head">Level {level} Progress</div>
      {categories.map((c) => (
        <div className="wk-levelprogress__row" key={c.type}>
          <div className="wk-levelprogress__rowhead">
            <span>{LABEL[c.type]}</span>
            <span className="wk-levelprogress__count">
              {c.passed}/{c.total}
            </span>
          </div>
          <ProgressBar value={c.total ? Math.round((c.passed / c.total) * 100) : 0} color={c.type} size="small" />
        </div>
      ))}
      {toLevelUp != null ? <div className="wk-levelprogress__foot">{toLevelUp}</div> : null}
    </div>
  );
}
