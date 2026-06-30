import * as React from 'react';
import { AudioButton } from 'wanikani-ds';

export const Voices = () => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
    <AudioButton accent="vocabulary" voice="Kyoko" />
    <AudioButton accent="vocabulary" voice="Kenichi" />
    <AudioButton accent="vocabulary" size="small" />
  </div>
);
