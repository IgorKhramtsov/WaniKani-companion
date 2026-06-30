import * as React from 'react';
import { Alert } from 'wanikani-ds';

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 460 };

export const Variants = () => (
  <div style={col}>
    <Alert variant="info" title="Heads up">
      This vocab has an unusual spelling, so watch out for that!
    </Alert>
    <Alert variant="error" title="That's not quite right">
      Need help? Check the meaning and reading explanations below.
    </Alert>
    <Alert variant="system">Scheduled maintenance tonight at 9pm PST.</Alert>
    <Alert variant="cta" title="Reviews are ready">
      You have 42 reviews waiting. Keep your streak going!
    </Alert>
  </div>
);
