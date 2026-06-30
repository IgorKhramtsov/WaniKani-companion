import * as React from 'react';
import { TextField } from 'wanikani-ds';

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 14, width: 320 };

export const Login = () => (
  <div style={col}>
    <TextField label="Email" placeholder="crabigator@durtles.com" />
    <TextField label="Password" type="password" placeholder="i love learning kanji" />
  </div>
);

export const States = () => (
  <div style={col}>
    <TextField label="Default" placeholder="Type your answer" />
    <TextField className="is-focus" label="Focused" defaultValue="ground" />
    <TextField label="Invalid" invalid defaultValue="grond" hint="That doesn't look right." />
  </div>
);
