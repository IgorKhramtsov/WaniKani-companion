import * as React from 'react';
import { Notification } from 'wanikani-ds';

const noop = () => {};

export const Variants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Notification variant="info" title="New feature" onDismiss={noop}>
      You can now customise your dashboard from Settings.
    </Notification>
    <Notification variant="error" title="Connection lost" onDismiss={noop}>
      We couldn't save your last answer — retrying…
    </Notification>
    <Notification variant="success" title="Level up!" onDismiss={noop}>
      You reached Level 7. すごい！
    </Notification>
  </div>
);
