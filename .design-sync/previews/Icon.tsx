import * as React from 'react';
import { Icon, wkIconNames } from 'wanikani-ds';

export const Gallery = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14, maxWidth: 520 }}>
    {wkIconNames.map((n) => (
      <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#333' }}>
        <Icon name={n} size={22} />
        <span style={{ fontSize: 8, color: '#9aa0a6', textAlign: 'center', lineHeight: 1.2 }}>{n}</span>
      </div>
    ))}
  </div>
);

export const SrsIcons = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Icon name="srs-apprentice1" size={28} color="#dd0093" />
    <Icon name="srs-guru5" size={28} color="#882d9e" />
    <Icon name="srs-master" size={28} color="#294ddb" />
    <Icon name="srs-enlightened" size={28} color="#0093dd" />
    <Icon name="srs-burned" size={28} color="#555555" />
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: '#333' }}>
    <Icon name="search" size={16} />
    <Icon name="search" size={24} />
    <Icon name="search" size={36} />
    <Icon name="turtle" size={36} color="#00aaff" />
  </div>
);
