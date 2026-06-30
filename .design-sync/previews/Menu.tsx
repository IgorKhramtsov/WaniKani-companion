import * as React from 'react';
import { Menu } from 'wanikani-ds';

export const Account = () => (
  <Menu
    items={[
      { key: 'profile', label: 'Profile', icon: 'turtle' },
      { key: 'settings', label: 'Settings', icon: 'pencil' },
      { key: 'help', label: 'Help', icon: 'question-mark' },
      { key: 'logout', label: 'Log out', icon: 'open-link', danger: true },
    ]}
  />
);
