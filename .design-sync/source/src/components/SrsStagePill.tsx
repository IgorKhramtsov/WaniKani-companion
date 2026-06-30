import * as React from 'react';

export type WkSrsStage =
  | 'lesson'
  | 'apprentice'
  | 'guru'
  | 'master'
  | 'enlightened'
  | 'burned'
  | 'locked';

export interface SrsStagePillProps {
  /** The SRS stage — colours the pill with WaniKani's stage palette. */
  stage: WkSrsStage;
  /** Pill label. Defaults to the capitalised stage name. */
  children?: React.ReactNode;
  /** Render the filled/“complete” treatment used once a stage is reached. */
  complete?: boolean;
  className?: string;
}

const LABEL: Record<WkSrsStage, string> = {
  lesson: 'Lesson',
  apprentice: 'Apprentice',
  guru: 'Guru',
  master: 'Master',
  enlightened: 'Enlightened',
  burned: 'Burned',
  locked: 'Locked',
};

/**
 * A pill in WaniKani's SRS-stage colours (Apprentice pink → Guru purple →
 * Master blue → Enlightened sky-blue → Burned grey). Used for item status
 * and the dashboard SRS-progression breakdown.
 */
export function SrsStagePill({ stage, children, complete = false, className }: SrsStagePillProps) {
  const cls = [
    'wk-srs-pill',
    `wk-srs-pill--${stage}`,
    complete ? 'wk-srs-pill--complete' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return <span className={cls}>{children ?? LABEL[stage]}</span>;
}
