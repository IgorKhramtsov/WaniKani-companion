import * as React from 'react';
import { SrsStagePill } from 'wanikani-ds';

const row: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' };

export const Stages = () => (
  <div style={row}>
    <SrsStagePill stage="apprentice" />
    <SrsStagePill stage="guru" />
    <SrsStagePill stage="master" />
    <SrsStagePill stage="enlightened" />
    <SrsStagePill stage="burned" />
  </div>
);

export const LessonAndLocked = () => (
  <div style={row}>
    <SrsStagePill stage="lesson" />
    <SrsStagePill stage="locked" />
  </div>
);

export const Progression = () => (
  <div style={row}>
    <SrsStagePill stage="apprentice" complete>Apprentice IV</SrsStagePill>
    <SrsStagePill stage="guru">Guru I</SrsStagePill>
  </div>
);
