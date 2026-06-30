import * as React from 'react';
import { Card, SubjectCharacter, Button } from 'wanikani-ds';

export const DashboardWidget = () => (
  <div style={{ width: 360, background: '#f4f4f4', padding: 16 }}>
    <Card title="Recent Lessons">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <SubjectCharacter type="radical" characters="一" size="small" />
        <SubjectCharacter type="kanji" characters="大" size="small" />
        <SubjectCharacter type="vocabulary" characters="大人" size="small" />
      </div>
      <Button variant="quiz" size="small">
        Start Lessons
      </Button>
    </Card>
  </div>
);

export const Widget = () => (
  <div style={{ width: 360, background: '#f4f4f4', padding: 16 }}>
    <Card title="Level 6" widget>
      You've passed 28 of 35 items needed to reach the next level. Keep going!
    </Card>
  </div>
);
