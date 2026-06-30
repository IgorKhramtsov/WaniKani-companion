import { readFileSync, writeFileSync } from 'node:fs';
const raw = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const outFile = process.argv[3];

// keep all scraped icons except the over-specific widget one (rename)
const reg = {};
for (const [name, v] of Object.entries(raw)) {
  let n = name;
  if (n === 'widget-extra-study-recent-mistakes') n = 'extra-study';
  reg[n] = { viewBox: v.viewBox, body: v.body };
}
const names = Object.keys(reg).sort();

const union = names.map((n) => `'${n}'`).join(' | ');
const regLiteral = JSON.stringify(reg, null, 2);

const out = `import * as React from 'react';

// WaniKani's real wk-icon SVG set, scraped verbatim from wanikani.com.
export type WkIconName =
  | ${names.map((n) => `'${n}'`).join('\n  | ')};

const ICONS: Record<WkIconName, { viewBox: string; body: string }> = ${regLiteral};

export interface IconProps {
  /** Icon name from WaniKani's real set. */
  name: WkIconName;
  /** Width = height, in px. */
  size?: number;
  /** Colour (defaults to currentColor, so it inherits text colour). */
  color?: string;
  /** Accessible label; when omitted the icon is aria-hidden. */
  title?: string;
  className?: string;
}

/**
 * Renders one of WaniKani's own SVG icons (chevrons, search, the SRS-stage
 * icons, the turtle mascot, audio, etc.). Monochrome — tint with \`color\` or
 * the surrounding text colour.
 */
export function Icon({ name, size = 20, color, title, className }: IconProps) {
  const ic = ICONS[name];
  if (!ic) return null;
  return (
    <svg
      className={['wk-icon', className].filter(Boolean).join(' ')}
      viewBox={ic.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      style={color ? { color } : undefined}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: (title ? '<title>' + title + '</title>' : '') + ic.body }}
    />
  );
}

/** All available icon names. */
export const wkIconNames = Object.keys(ICONS) as WkIconName[];
`;
writeFileSync(outFile, out);
console.log(`wrote Icon.tsx with ${names.length} icons`);
