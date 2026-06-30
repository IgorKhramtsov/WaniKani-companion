import * as React from 'react';

export interface RadioProps {
  /** Selected state. */
  checked?: boolean;
  /** Label beside the control. */
  label?: React.ReactNode;
  disabled?: boolean;
  onChange?: () => void;
  className?: string;
}

/**
 * A radio control styled with WaniKani's tokens — WaniKani blue when selected.
 * Group several together for a single-choice setting.
 */
export function Radio({ checked = false, label, disabled = false, onChange, className }: RadioProps) {
  const cls = ['wk-radio', disabled ? 'wk-radio--disabled' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        className={['wk-radio__dot', checked ? 'wk-radio__dot--on' : ''].filter(Boolean).join(' ')}
        onClick={() => !disabled && onChange?.()}>
        <span className="wk-radio__inner" />
      </button>
      {label != null ? <span className="wk-radio__label">{label}</span> : null}
    </label>
  );
}
