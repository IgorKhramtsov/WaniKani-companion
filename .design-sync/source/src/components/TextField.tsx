import * as React from 'react';

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label rendered above the field. */
  label?: React.ReactNode;
  /** Error styling + message. */
  invalid?: boolean;
  /** Helper or error text under the field. */
  hint?: React.ReactNode;
  /** Field size. */
  fieldSize?: 'small' | 'medium' | 'large';
}

/**
 * WaniKani's text input — white field with a grey border that turns
 * WaniKani blue on focus (the `--color-input-focus-border` token). Used for
 * login, search and settings forms.
 */
export function TextField({ label, invalid = false, hint, fieldSize = 'medium', className, id, ...rest }: TextFieldProps) {
  const inputId = id ?? (label ? `wk-field-${String(label).replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const wrapCls = ['wk-field', `wk-field--${fieldSize}`, invalid ? 'wk-field--invalid' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={wrapCls}>
      {label ? (
        <label className="wk-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className="wk-field__input" aria-invalid={invalid || undefined} {...rest} />
      {hint ? <div className="wk-field__hint">{hint}</div> : null}
    </div>
  );
}
