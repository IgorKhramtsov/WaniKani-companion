import * as React from 'react';
import { SearchField } from './SearchField';

export interface HeaderNavItem {
  key: string;
  label: React.ReactNode;
  href?: string;
}

export interface HeaderProps {
  /** Brand label (defaults to "WaniKani"). */
  brand?: React.ReactNode;
  /** Primary navigation links. */
  nav?: HeaderNavItem[];
  /** Key of the active nav item. */
  activeKey?: string;
  /** Render the search box on the right. */
  showSearch?: boolean;
  /** Right-hand slot, typically an <Avatar/>. */
  avatar?: React.ReactNode;
}

/**
 * WaniKani's global top header — brand mark, primary nav, search and the user
 * avatar. The app chrome that sits above every page.
 */
export function Header({ brand = 'WaniKani', nav = [], activeKey, showSearch = true, avatar }: HeaderProps) {
  return (
    <header className="wk-header">
      <div className="wk-header__brand">{brand}</div>
      <nav className="wk-header__nav">
        {nav.map((it) => (
          <a
            key={it.key}
            href={it.href ?? '#'}
            className={['wk-header__link', it.key === activeKey ? 'wk-header__link--active' : ''].filter(Boolean).join(' ')}
            aria-current={it.key === activeKey ? 'page' : undefined}>
            {it.label}
          </a>
        ))}
      </nav>
      <div className="wk-header__right">
        {showSearch ? <SearchField fieldSize="small" /> : null}
        {avatar}
      </div>
    </header>
  );
}
