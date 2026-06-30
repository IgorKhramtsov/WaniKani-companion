import * as React from 'react';
import { Icon } from './Icon';
import type { WkIconName } from './Icon';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  /** Optional leading icon. */
  icon?: WkIconName;
  /** Render in the destructive colour. */
  danger?: boolean;
}

export interface MenuProps {
  /** Menu items. */
  items: MenuItem[];
  onSelect?: (key: string) => void;
  className?: string;
}

/**
 * A dropdown menu panel — WaniKani's avatar/account menu and overflow menus.
 * Render it inside a positioned popover in the app.
 */
export function Menu({ items, onSelect, className }: MenuProps) {
  return (
    <div className={['wk-menu', className ?? ''].filter(Boolean).join(' ')} role="menu">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          role="menuitem"
          className={['wk-menu__item', it.danger ? 'wk-menu__item--danger' : ''].filter(Boolean).join(' ')}
          onClick={() => onSelect?.(it.key)}>
          {it.icon ? (
            <span className="wk-menu__icon">
              <Icon name={it.icon} size={16} />
            </span>
          ) : null}
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
