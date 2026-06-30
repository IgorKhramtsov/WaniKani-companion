import * as React from 'react';
import { Button, Icon } from 'wanikani-ds';

const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' };

export const WithIcons = () => (
  <div style={row}>
    <Button variant="quiz" iconAfter={<Icon name="chevron-right" size={14} />}>Start Reviews</Button>
    <Button variant="primary" iconBefore={<Icon name="reload" size={14} />}>Redo</Button>
    <Button variant="secondary" iconBefore={<Icon name="search" size={14} />}>Search</Button>
  </div>
);

export const Variants = () => (
  <div style={row}>
    <Button variant="primary">Continue</Button>
    <Button variant="quiz">Start Reviews</Button>
    <Button variant="subscribe">Subscribe</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="danger">Reset Account</Button>
  </div>
);

export const Sizes = () => (
  <div style={row}>
    <Button variant="quiz" size="small">Small</Button>
    <Button variant="quiz" size="medium">Medium</Button>
    <Button variant="quiz" size="large">Large</Button>
  </div>
);

// The 3D face lifts on hover and presses down on click. `is-hover` / `is-active`
// force those states statically so the motion is visible here.
export const States = () => (
  <div style={{ ...row, gap: 20 }}>
    <div style={{ textAlign: 'center' }}>
      <Button variant="quiz">Rest</Button>
      <div style={{ fontSize: 11, color: '#6b7079', marginTop: 8 }}>rest (−4px)</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Button variant="quiz" className="is-hover">Hover</Button>
      <div style={{ fontSize: 11, color: '#6b7079', marginTop: 8 }}>hover (−6px)</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Button variant="quiz" className="is-active">Pressed</Button>
      <div style={{ fontSize: 11, color: '#6b7079', marginTop: 8 }}>pressed (0, inset)</div>
    </div>
    <div style={{ textAlign: 'center' }}>
      <Button variant="quiz" disabled>Disabled</Button>
      <div style={{ fontSize: 11, color: '#6b7079', marginTop: 8 }}>disabled</div>
    </div>
  </div>
);

export const FullWidth = () => (
  <div style={{ width: 280 }}>
    <Button variant="quiz" fullWidth>
      Start 42 Reviews
    </Button>
  </div>
);
