import * as React from 'react';
import { Modal, Button } from 'wanikani-ds';

const stage: React.CSSProperties = { position: 'relative', height: 300, background: '#f4f4f4', borderRadius: 8, overflow: 'hidden' };

export const Confirm = () => (
  <div style={stage}>
    <Modal
      title="Reset your account?"
      actions={
        <>
          <Button variant="secondary" size="small">Cancel</Button>
          <Button variant="danger" size="small">Reset</Button>
        </>
      }>
      This permanently deletes all of your progress and cannot be undone.
    </Modal>
  </div>
);

export const Picker = () => (
  <div style={stage}>
    <Modal title="Start a lesson session" size="small" actions={<Button variant="quiz" size="small">Start 5 Lessons</Button>}>
      Choose how many new items to learn in this session.
    </Modal>
  </div>
);
