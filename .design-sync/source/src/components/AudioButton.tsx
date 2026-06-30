import * as React from 'react';
import { Icon } from './Icon';

export interface AudioButtonProps {
  /** Whether audio is currently playing (shows the muted icon). */
  playing?: boolean;
  /** Voice label, e.g. "Kyoko" / "Female". */
  voice?: React.ReactNode;
  /** Accent colour (a subject type or any colour). Defaults to vocabulary purple. */
  accent?: 'radical' | 'kanji' | 'vocabulary' | (string & {});
  size?: 'small' | 'medium';
  onToggle?: () => void;
}

const ACCENT: Record<string, string> = {
  radical: 'var(--color-radical, #00aaff)',
  kanji: 'var(--color-kanji, #ff00aa)',
  vocabulary: 'var(--color-vocabulary, #aa00ff)',
};

/**
 * The round speaker button WaniKani shows next to vocabulary readings to play
 * the pronunciation audio.
 */
export function AudioButton({ playing = false, voice, accent = 'vocabulary', size = 'medium', onToggle }: AudioButtonProps) {
  const bg = ACCENT[accent] ?? accent;
  return (
    <span className={`wk-audio wk-audio--${size}`}>
      <button type="button" className="wk-audio__btn" style={{ background: bg }} aria-label="Play audio" onClick={onToggle}>
        <Icon name={playing ? 'sound-off' : 'sound-on'} size={size === 'small' ? 14 : 18} color="#fff" />
      </button>
      {voice ? <span className="wk-audio__voice">{voice}</span> : null}
    </span>
  );
}
