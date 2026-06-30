import * as React from 'react';

export interface TabItem {
  key: string;
  label: React.ReactNode;
}

export interface TabsProps {
  /** Tab headers. */
  tabs: TabItem[];
  /** Key of the active tab. */
  activeKey?: string;
  /** Underline accent colour for the active tab. */
  accent?: 'radical' | 'kanji' | 'vocabulary' | (string & {});
  onChange?: (key: string) => void;
  /** Content of the active tab. */
  children?: React.ReactNode;
}

const ACCENT: Record<string, string> = {
  radical: 'var(--color-radical, #00aaff)',
  kanji: 'var(--color-kanji, #ff00aa)',
  vocabulary: 'var(--color-vocabulary, #aa00ff)',
};

/**
 * In-page tabs with an underlined active indicator in a WaniKani accent colour
 * (used for tabbed content sections).
 */
export function Tabs({ tabs, activeKey, accent = 'radical', onChange, children }: TabsProps) {
  const accentColor = ACCENT[accent] ?? accent;
  return (
    <div className="wk-tabs">
      <div className="wk-tabs__list" role="tablist">
        {tabs.map((t) => {
          const active = t.key === activeKey;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={['wk-tabs__tab', active ? 'wk-tabs__tab--active' : ''].filter(Boolean).join(' ')}
              style={active ? ({ color: accentColor, borderBottomColor: accentColor } as React.CSSProperties) : undefined}
              onClick={() => onChange?.(t.key)}>
              {t.label}
            </button>
          );
        })}
      </div>
      {children != null ? <div className="wk-tabs__panel">{children}</div> : null}
    </div>
  );
}
