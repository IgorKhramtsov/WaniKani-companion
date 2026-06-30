import * as React from 'react';
import { TabBar, Icon } from 'wanikani-ds';

const items = [
  { key: 'home', label: 'Home', icon: <Icon name="home" size={20} /> },
  { key: 'lessons', label: 'Lessons', icon: <Icon name="inbox" size={20} /> },
  { key: 'reviews', label: 'Reviews', icon: <Icon name="reload" size={20} /> },
  { key: 'search', label: 'Search', icon: <Icon name="search" size={20} /> },
  { key: 'profile', label: 'Profile', icon: <Icon name="turtle" size={20} /> },
];

export const Mobile = () => (
  <div style={{ width: 360, border: '1px solid #e7e9eb', borderRadius: 12, overflow: 'hidden' }}>
    <TabBar items={items} activeKey="home" accent="radical" />
  </div>
);

export const KanjiAccent = () => (
  <div style={{ width: 360, border: '1px solid #e7e9eb', borderRadius: 12, overflow: 'hidden' }}>
    <TabBar items={items} activeKey="reviews" accent="kanji" />
  </div>
);
