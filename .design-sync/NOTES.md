# design-sync notes — WaniKani

**This is an OFF-SCRIPT sync.** WaniKani ships no React component library (the
site is server-rendered Rails + Stimulus/Turbo). The design system here is
synthesized from the **scraped wanikani.com design system**: tokens and CSS are
WaniKani's own; components are thin React wrappers over them.

## How it was built
- Scraped assets: `…/scratchpad/portal/` (public + signed-in HTML, CSS, JS,
  screenshots). Captured with the user's `_wanikani_session` cookie via
  puppeteer-core + system Chrome.
- Tokens: 475 CSS custom properties extracted from `application.css` by
  `…/scratchpad/extract-tokens.mjs` → `wk-design-system/packages/tokens/*.css`.
- DS source package: `…/scratchpad/wk-design-system/` (React + tsc → `dist/`).
  `tokensPkg: wanikani-tokens` (a local `file:packages/tokens` dep) is how the
  converter copies tokens into `tokens/` and the `styles.css` closure.
- Fonts: remote Google Fonts `@import` for Noto Sans / JP / SC (`[FONT_REMOTE]`,
  not shipped — WaniKani self-hosts ~100 JP subset woffs; impractical to ship).
- SRS stage colors (apprentice/guru/master/enlightened) are NOT `:root` tokens
  in WK's CSS — used canonical WK brand values `#DD0093 / #882D9E / #294DDB /
  #0093DD`; `burned` uses `--color-burned` (#555). Documented in conventions.md.
- Render check: playwright/chromium not installed. Previews verified **visually**
  via `…/scratchpad/shot/capture-cards.mjs` (puppeteer-core + system Chrome) and
  graded good; `package-validate.mjs` run with `--no-render-check`.
- `guidelines/screens/*.png` (signed-in dashboard/reviews/lessons/subject pages)
  are copied into `ds-bundle/` **after** the build — the converter only copies
  `.md` guidelines.
- **Icons**: WaniKani renders icons via `<use href="#wk-icon__…">` against an
  inline SVG **sprite injected by JS** — a static HTML scrape only gets the
  `<use>` stub. The real `<symbol>` paths were extracted from the **live DOM**
  via `…/scratchpad/shot/extract-sprite.mjs` (puppeteer + cookie) →
  `icons-sprite.json` → `gen-icon.mjs` → `src/components/Icon.tsx` (64 icons).
  `Icon` renders the path body with `dangerouslySetInnerHTML` (works in the
  Chromium preview renderer's SVG namespace). The `<use>`-scrape path
  (`scrape-icons.mjs`) is dead — keep using the sprite extractor on re-sync.

## Known render warns
- `[RENDER_SKIPPED]` — expected; render check done out-of-band with Chrome.

## Re-sync risks (read before re-syncing)
- **DS source is committed at `.design-sync/source/`** (see its README). To
  re-sync: `cd .design-sync/source && npm ci && npx tsc`, then re-run
  `/design-sync` (it restages the converter and reads the pinned `projectId`),
  or invoke the converter manually with `--entry .design-sync/source/dist/index.js
  --node-modules .design-sync/source/node_modules`. The **scraped assets** (the
  signed-in HTML/CSS and the cookie-authenticated `shot/`+`portal/` scripts) are
  NOT committed — recreate them with a fresh session cookie only if you need to
  re-scrape (site restyle). The secret-free regenerators (`extract-tokens.mjs`,
  `gen-icon.mjs`, `icons-sprite.json`) are kept in `source/tooling/`.
- `guidelines/` is a post-build manual step — after any rebuild: (a) restore
  `screens/*.png` + `screens.md` (re-capture pngs with a fresh session cookie);
  (b) the converter mirrors the `docs/` grouping stubs into `guidelines/docs/`
  (37 empty `category:`-only pages) and writes an `index.md` that just lists
  them — `rm -rf ds-bundle/guidelines/docs` and replace `index.md` with the
  curated guidelines index (layout principles + screen pointers). validate
  ignores `guidelines/`, so this is safe.
- 37 components in 13 groups, set via `docsMap` frontmatter stubs in the source
  package's `docs/<Name>.md` (`---\ncategory: X\n---`); empty body keeps the
  synthesized `prompt.md` (emit.mjs `if (c.docBody)` is falsy).
- Tokens reflect WaniKani's CSS at capture time; re-scrape if the site restyles.
