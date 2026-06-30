import * as React from 'react';

export interface TabBarItem {
  /** Unique key for the tab. */
  key: string;
  /** Tab label. */
  label: React.ReactNode;
  /** Optional icon (emoji or glyph). */
  icon?: React.ReactNode;
}

export interface TabBarProps {
  /** Tabs to render. */
  items: TabBarItem[];
  /** Key of the active tab — coloured with the active accent. */
  activeKey?: string;
  /** Accent colour for the active tab. Defaults to WaniKani radical blue. */
  accent?: 'radical' | 'kanji' | 'vocabulary' | (string & {});
  onChange?: (key: string) => void;
  className?: string;
}

const ACCENT: Record<string, string> = {
  radical: 'var(--color-radical, #00aaff)',
  kanji: 'var(--color-kanji, #ff00aa)',
  vocabulary: 'var(--color-vocabulary, #aa00ff)',
};

/**
 * A bottom navigation bar for the mobile app. WaniKani's web uses a top nav, so
 * this is adapted for mobile — the active tab is painted with a WaniKani accent
 * colour, inactive tabs are grey.
 */
export function TabBar({ items, activeKey, accent = 'radical', onChange, className }: TabBarProps) {
  const accentColor = ACCENT[accent] ?? accent;
  return (
    <nav className={['wk-tabbar', className].filter(Boolean).join(' ')}>
      {items.map((it) => {
        const active = it.key === activeKey;
        return (
          <button
            key={it.key}
            type="button"
            className={['wk-tabbar__item', active ? 'wk-tabbar__item--active' : ''].filter(Boolean).join(' ')}
            style={active ? ({ color: accentColor } as React.CSSProperties) : undefined}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange?.(it.key)}>
            {it.icon ? <span className="wk-tabbar__icon">{it.icon}</span> : null}
            <span className="wk-tabbar__label">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
