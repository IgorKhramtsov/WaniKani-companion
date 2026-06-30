import * as React from 'react';
import { Icon } from './Icon';

export interface CheckboxProps {
  /** Checked state. */
  checked?: boolean;
  /** Label beside the box. */
  label?: React.ReactNode;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

/**
 * A checkbox styled with WaniKani's tokens, using the real check icon when on.
 * Used in settings and lesson/review filters.
 */
export function Checkbox({ checked = false, label, disabled = false, onChange, className }: CheckboxProps) {
  const cls = ['wk-check', disabled ? 'wk-check--disabled' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        className={['wk-check__box', checked ? 'wk-check__box--on' : ''].filter(Boolean).join(' ')}
        onClick={() => !disabled && onChange?.(!checked)}>
        {checked ? <Icon name="check" size={12} color="#fff" /> : null}
      </button>
      {label != null ? <span className="wk-check__label">{label}</span> : null}
    </label>
  );
}
