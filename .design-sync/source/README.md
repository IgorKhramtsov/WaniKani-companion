# WaniKani design-system source

The source the Claude Design **`wanikani`** project is generated from. This is a
**web React** library (React DOM + CSS custom properties) consumed by
claude.ai/design — **not** the React Native app. The only app-shareable part is
the tokens (`packages/tokens/*.css`); mirror those into the RN theme.

## Layout

- `src/components/*.tsx` — the 37 components.
- `src/index.ts` — the public exports.
- `src/styles/wk.css` — component CSS, wired to the tokens.
- `packages/tokens/*.css` — the design tokens (source of truth for colour /
  spacing / type / radii).
- `docs/*.md` — frontmatter-only stubs that set each component's design-system
  group (empty body keeps the synthesized `prompt.md`).
- `tooling/` — secret-free regenerators: `extract-tokens.mjs` (application.css →
  token CSS), `gen-icon.mjs` + `icons-sprite.json` (sprite → `Icon.tsx`).

`node_modules/` and `dist/` are gitignored — rebuild them locally.

## Change something, then re-sync

1. Edit a component (`src/components/X.tsx`) or a token (`packages/tokens/*.css`).
   Additive changes are safe; renaming/removing a prop is breaking for any cloud
   design already using it.
2. `cd .design-sync/source && npm ci && npx tsc`  (produces `dist/`).
3. Re-run the **`/design-sync`** skill from the repo root. It restages the
   converter, reads the pinned `projectId` in `../config.json`, rebuilds, and
   re-uploads **only what changed** to the same cloud project. (Manual converter
   invocation: `--entry .design-sync/source/dist/index.js --node-modules
   .design-sync/source/node_modules`.)

The live-site scraping scripts (cookie-authenticated) are intentionally **not**
committed. Recreate them if WaniKani restyles and you need to re-scrape tokens
or the icon sprite.
