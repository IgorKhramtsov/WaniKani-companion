import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const PORTAL = process.argv[2];
const OUTDIR = process.argv[3];
const cssPath = `${PORTAL}/public/assets/assets.wanikani.com_assets_application-d793c418.css`;
const css = readFileSync(cssPath, 'utf8');

// --- extract every :root { ... } block via brace matching ---
function extractBlocks(src, selectorTest) {
  const blocks = [];
  const re = /([^{};]+)\{/g;
  let m;
  while ((m = re.exec(src))) {
    const selector = m[1].trim();
    if (!selectorTest(selector)) continue;
    // brace-match from m.index of the '{'
    let depth = 1;
    let i = re.lastIndex;
    const start = i;
    while (i < src.length && depth > 0) {
      const c = src[i];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    blocks.push({ selector, body: src.slice(start, i - 1) });
  }
  return blocks;
}

const rootBlocks = extractBlocks(css, (s) =>
  /(^|,)\s*:root\s*$/.test(s) || /:root(\[[^\]]*\])?$/.test(s.split(',').pop().trim()) || s.split(',').some((p) => p.trim() === ':root' || p.trim().startsWith(':root['))
);

// collect custom property declarations (last write wins per selector context).
// Keep light-theme (:root with no attribute) separately from themed (:root[data-theme=...]).
const vars = new Map(); // name -> value  (base/light)
const themed = {}; // themeSelector -> Map
for (const b of rootBlocks) {
  const isThemed = /:root\[/.test(b.selector);
  const decls = b.body.split(';');
  for (const d of decls) {
    const idx = d.indexOf(':');
    if (idx < 0) continue;
    const name = d.slice(0, idx).trim();
    const value = d.slice(idx + 1).trim();
    if (!name.startsWith('--')) continue;
    if (isThemed) {
      (themed[b.selector] ??= new Map()).set(name, value);
    } else {
      vars.set(name, value);
    }
  }
}

// resolve var() chains (best-effort) against base vars for a JSON summary
function resolve(value, seen = new Set(), depth = 0) {
  if (depth > 20) return value;
  return value.replace(/var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]*))?\)/g, (whole, ref, fallback) => {
    if (seen.has(ref)) return fallback ?? whole;
    if (vars.has(ref)) {
      seen.add(ref);
      return resolve(vars.get(ref), seen, depth + 1);
    }
    return fallback ?? whole;
  });
}

// group by prefix family
const groups = {};
for (const [name, value] of vars) {
  const stem = name.replace(/^--/, '');
  let fam;
  if (stem.startsWith('color-')) fam = 'colors';
  else if (stem.startsWith('spacing-') || stem.startsWith('space-')) fam = 'spacing';
  else if (stem.startsWith('border-radius') || stem.startsWith('radius')) fam = 'radii';
  else if (stem.startsWith('font-') || stem.startsWith('line-height') || stem.startsWith('letter-spacing')) fam = 'typography';
  else if (stem.startsWith('shadow') || stem.includes('shadow')) fam = 'shadows';
  else if (stem.startsWith('z-') || stem.startsWith('zindex')) fam = 'z-index';
  else if (stem.startsWith('duration') || stem.startsWith('transition') || stem.startsWith('ease')) fam = 'motion';
  else fam = 'misc';
  (groups[fam] ??= []).push([name, value]);
}

mkdirSync(OUTDIR, { recursive: true });

function emit(file, entries, comment) {
  const lines = [];
  lines.push(`/* WaniKani design tokens — ${comment}`);
  lines.push(`   extracted verbatim from application.css (assets.wanikani.com) */`);
  lines.push(':root {');
  for (const [name, value] of entries) lines.push(`  ${name}: ${value};`);
  lines.push('}');
  lines.push('');
  writeFileSync(`${OUTDIR}/${file}`, lines.join('\n'));
}

const order = ['colors', 'typography', 'spacing', 'radii', 'shadows', 'motion', 'z-index', 'misc'];
for (const fam of order) {
  if (groups[fam]) emit(`${fam}.css`, groups[fam], fam);
}

// master file that pulls them all in
const imports = order.filter((f) => groups[f]).map((f) => `@import "./${f}.css";`).join('\n');
writeFileSync(`${OUTDIR}/_tokens.css`, imports + '\n');

// summary for the human
const summary = {
  totalVars: vars.size,
  perGroup: Object.fromEntries(order.filter((f) => groups[f]).map((f) => [f, groups[f].length])),
  themes: Object.keys(themed),
  resolvedSamples: {},
};
const interesting = [
  '--color-radical', '--color-kanji', '--color-vocabulary', '--color-reading', '--color-meaning',
  '--color-apprentice', '--color-guru', '--color-master', '--color-enlightened', '--color-burned',
  '--color-blue', '--color-pink', '--color-purple',
  '--color-text-default', '--color-text', '--color-app-background',
  '--font-family-default', '--font-family-japanese', '--font-family-ja',
  '--border-radius-normal', '--border-radius-pill', '--border-radius-tight',
  '--spacing-normal', '--spacing-tight', '--spacing-loose',
];
for (const k of interesting) if (vars.has(k)) summary.resolvedSamples[k] = { raw: vars.get(k), resolved: resolve(vars.get(k)) };
writeFileSync(`${OUTDIR}/_summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
