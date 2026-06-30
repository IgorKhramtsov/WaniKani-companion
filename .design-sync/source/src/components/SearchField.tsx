import * as React from 'react';
import { Icon } from './Icon';

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field size. */
  fieldSize?: 'small' | 'medium' | 'large';
}

/**
 * WaniKani's subject search box — a rounded input with the real search icon,
 * focusing to WaniKani blue. Used in the header and the subjects browser.
 */
export function SearchField({ fieldSize = 'medium', className, placeholder = 'Search subjects…', ...rest }: SearchFieldProps) {
  const cls = ['wk-search', `wk-search--${fieldSize}`, className ?? ''].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <span className="wk-search__icon">
        <Icon name="search" size={16} />
      </span>
      <input className="wk-search__input" type="search" placeholder={placeholder} {...rest} />
    </div>
  );
}
