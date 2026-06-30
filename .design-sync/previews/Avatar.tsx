import * as React from 'react';
import { Avatar } from 'wanikani-ds';

const row: React.CSSProperties = { display: 'flex', gap: 12, alignItems: 'center' };

export const Sizes = () => (
  <div style={row}>
    <Avatar initials="IK" size="small" />
    <Avatar initials="IK" size="medium" />
    <Avatar initials="IK" size="large" />
  </div>
);

export const Fallback = () => (
  <div style={row}>
    <Avatar initials="あ" size="large" />
    <Avatar size="large" />
  </div>
);
