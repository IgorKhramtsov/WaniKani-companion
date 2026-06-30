import * as React from 'react';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Dropdown options. */
  options: SelectOption[];
  /** Label above the control. */
  label?: React.ReactNode;
  /** Control size. */
  fieldSize?: 'small' | 'medium' | 'large';
}

/**
 * A styled select / dropdown — WaniKani's tokens with a chevron, focusing to
 * WaniKani blue. Used in settings (voice, autoplay, etc.).
 */
export function Select({ options, label, fieldSize = 'medium', className, id, ...rest }: SelectProps) {
  const selId = id ?? (label ? `wk-select-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={['wk-field', className ?? ''].filter(Boolean).join(' ')}>
      {label != null ? (
        <label className="wk-field__label" htmlFor={selId}>
          {label}
        </label>
      ) : null}
      <div className={`wk-select wk-select--${fieldSize}`}>
        <select id={selId} className="wk-select__el" {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="wk-select__chevron" aria-hidden="true">
          <Icon name="chevron-down" size={14} />
        </span>
      </div>
    </div>
  );
}
