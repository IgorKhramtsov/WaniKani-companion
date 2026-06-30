import * as React from 'react';

export interface ToggleProps {
  /** On/off state. */
  checked?: boolean;
  /** Optional label rendered next to the switch. */
  label?: React.ReactNode;
  disabled?: boolean;
  /** Track colour when on. Defaults to WaniKani radical blue. */
  accent?: 'radical' | 'kanji' | 'vocabulary' | (string & {});
  onChange?: (checked: boolean) => void;
  className?: string;
}

const ACCENT: Record<string, string> = {
  radical: 'var(--color-radical, #00aaff)',
  kanji: 'var(--color-kanji, #ff00aa)',
  vocabulary: 'var(--color-vocabulary, #aa00ff)',
};

/**
 * A settings switch. WaniKani's web settings use native checkboxes; this is a
 * mobile-friendly toggle painted with a WaniKani accent when on.
 */
export function Toggle({ checked = false, label, disabled = false, accent = 'radical', onChange, className }: ToggleProps) {
  const accentColor = ACCENT[accent] ?? accent;
  const cls = ['wk-toggle', checked ? 'wk-toggle--on' : '', disabled ? 'wk-toggle--disabled' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <label className={cls}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className="wk-toggle__track"
        style={checked ? ({ background: accentColor } as React.CSSProperties) : undefined}
        onClick={() => !disabled && onChange?.(!checked)}>
        <span className="wk-toggle__thumb" />
      </button>
      {label ? <span className="wk-toggle__label">{label}</span> : null}
    </label>
  );
}
