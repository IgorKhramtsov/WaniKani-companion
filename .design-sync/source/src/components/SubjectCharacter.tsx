import * as React from 'react';

export type WkSubjectType = 'radical' | 'kanji' | 'vocabulary';
export type WkSubjectSize = 'small' | 'medium' | 'large';

export interface SubjectCharacterProps {
  /**
   * WaniKani subject category. Sets the signature tile colour:
   * radical = blue (#00AAFF), kanji = pink (#FF00AA), vocabulary = purple (#AA00FF).
   */
  type: WkSubjectType;
  /** The Japanese character(s), e.g. 一 or 大きい. Rendered in the Noto Sans JP stack. */
  characters?: React.ReactNode;
  /**
   * Image URL for radicals that have no Unicode character (WaniKani ships these
   * as white SVGs). When set, the image is shown instead of `characters`.
   */
  image?: string;
  /** Tile size. */
  size?: WkSubjectSize;
  /** Render as an anchor linking to the subject page. */
  href?: string;
  className?: string;
}

/**
 * The coloured character tile that is WaniKani's most recognisable element —
 * a radical, kanji or vocabulary item shown in white on its category colour.
 */
export function SubjectCharacter({
  type,
  characters,
  image,
  size = 'medium',
  href,
  className,
}: SubjectCharacterProps) {
  const cls = [
    'wk-subject',
    `wk-subject--${type}`,
    `wk-subject--${size}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const content = image ? (
    <img className="wk-subject__image" src={image} alt="" />
  ) : (
    <span className="wk-subject__characters">{characters}</span>
  );
  if (href) {
    return (
      <a className={cls} href={href}>
        {content}
      </a>
    );
  }
  return <span className={cls}>{content}</span>;
}
