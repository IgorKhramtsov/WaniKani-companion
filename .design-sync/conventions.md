# WaniKani design system

The look of WaniKani — the Japanese-kanji SRS app. Gathered from the live site
(wanikani.com): the tokens and component CSS are WaniKani's own, the components
are thin React wrappers over them. Use these to design WaniKani app screens
(including the mobile app) on-brand.

## Setup

No provider needed. Every component is styled by `styles.css` (already in the
design closure) — it `@import`s the WaniKani tokens (`tokens/*.css`) and the
component styles (`_ds_bundle.css`). Just import a component and render it. The
type family is Noto Sans / Noto Sans JP / Noto Sans SC (loaded by `styles.css`),
so Japanese characters render correctly.

## The styling idiom: CSS custom properties (design tokens)

WaniKani styles everything through CSS variables. For your own layout glue,
reference these real tokens (defined in `tokens/colors.css`, `spacing.css`,
`radii.css`, `typography.css`) rather than hard-coding values:

- **Subject-type colors** (the signature palette): `var(--color-radical)` blue
  `#00AAFF`, `var(--color-kanji)` pink `#FF00AA`, `var(--color-vocabulary)`
  purple `#AA00FF`. Radicals are always blue, kanji pink, vocabulary purple —
  never swap these.
- **SRS stage colors**: Apprentice `#DD0093`, Guru `#882D9E`, Master `#294DDB`,
  Enlightened `#0093DD`, Burned `var(--color-burned)` `#555`, Locked
  `var(--color-locked)` `#CCC`. (Use the `SrsStagePill` component rather than
  re-deriving these.)
- **Text & surface**: `var(--color-text)` `#333`, `var(--color-app-background)`
  `#F4F4F4`, white panels.
- **Spacing scale**: `var(--spacing-xxtight)` 4px, `--spacing-xtight` 8,
  `--spacing-tight` 12, `--spacing-normal` 16, `--spacing-loose` 24,
  `--spacing-xloose` 32, `--spacing-xxloose` 40.
- **Radii**: `var(--border-radius-tight)` 4px, `--border-radius-normal` 8,
  `--border-radius-widget` 16, `--border-radius-pill` 9999.
- **Type**: family `var(--font-family-default)`; sizes `--font-size-xsmall` 14 …
  `--font-size-large` 24 … `--font-size-xxlarge` 38; weights
  `--font-weight-regular` 350, `--font-weight-medium` 500, `--font-weight-bold`
  600. 475 WaniKani tokens ship in total — read `tokens/colors.css` for the full
  `--color-*` set (buttons, alerts, quiz states, durtle mascot, etc.).

## Icons

`Icon` renders WaniKani's own SVG icon set, scraped verbatim from the site's
sprite — 64 icons: chevrons/arrows, `search`, `home`, `inbox`, `reload`,
`sound-on`/`sound-off`, `check`/`cross`/`info`/`exclamation`, the SRS-stage set
(`srs-apprentice1`–`4`, `srs-guru5`/`6`, `srs-master`, `srs-enlightened`,
`srs-burned`), `turtle`, and more. Monochrome — tint with `color` or inherited
text colour: `<Icon name="chevron-right" size={16} />`. `wkIconNames` lists them
all. Compose into other components via `Button`'s `iconBefore`/`iconAfter`.

## Layers (atoms → compositions)

The library spans the usual design-system altitudes. Lower layers are the source
of truth; higher layers are convenience parts built from them. When composing a
screen, reach for the **highest** layer that fits and drop to primitives only
when you need something custom — don't rebuild a widget out of primitives if a
widget already exists.

- **Tokens** (`tokens/*.css`) — the truth: colors, spacing, type, radii. Not
  components; reference them in layout glue.
- **Primitives** — _Foundations · Typography · Actions · Forms_: `Icon`, `Text`,
  `Heading`, `SectionHeader`, `Button`, `AudioButton`, `TextField`,
  `SearchField`, `Select`, `Checkbox`, `Radio`, `Toggle`.
- **Components** — small reusable parts (one step up): `CountBadge`, `Chip`,
  `Avatar`, `ProgressBar`, `SrsStagePill`, `SubjectLink`, `Tabs`, `Menu`,
  `Tooltip`, `Modal`, `Alert`, `Notification`, `Header`, `TabBar`.
- **Widgets** — _Subjects · Quiz · Data viz · Layout_: `SubjectCharacter`,
  `ReadingDisplay`, `MnemonicBlock`, `ContextSentence`, `QuizInput`,
  `SrsBreakdown`, `ReviewForecast`, `Heatmap`, `LevelProgress`, `Card`,
  `SummaryCard` — whole compositions of the layers above (e.g. `LevelProgress`
  _is_ the real dashboard widget; `Card`/`SummaryCard` are panels). All are
  **presentational**: pass data and children, they render — no fetching, no app
  state, so they drop into any design.
- **Screens** are the *output* you design with these — they are **not** shipped
  here. See `guidelines/screens/` for references to match.

## Components (37, grouped)

- **Foundations** — `Icon` (64 real WaniKani SVGs).
- **Typography** — `Text`, `Heading` (h1–h4), `SectionHeader`.
- **Actions** — `Button` (5 variants, 3D press, icon slots), `AudioButton`.
- **Forms** — `TextField`, `SearchField`, `Select`, `Checkbox`, `Radio`, `Toggle`.
- **Navigation** — `Header` (global top bar), `TabBar` (mobile bottom nav), `Tabs`.
- **Overlays** — `Modal`, `Menu` (dropdown), `Tooltip`.
- **Subjects** — `SubjectCharacter` (text or image radical), `SubjectLink`,
  `ReadingDisplay` (On'yomi/Kun'yomi/Nanori w/ primary highlight), `MnemonicBlock`,
  `ContextSentence`.
- **SRS** — `SrsStagePill` (Apprentice → Burned).
- **Quiz** — `QuizInput` (answer panel; green-correct / red-incorrect).
- **Data display** — `CountBadge`, `Chip`, `Avatar`, `ProgressBar` (continuous
  or segmented level-up).
- **Data viz** — `SrsBreakdown` (item-spread chart), `ReviewForecast` (hourly
  bars), `Heatmap` (activity grid), `LevelProgress` (the dashboard widget). All
  presentational — pass the computed data; the component only visualises it.
- **Layout** — `Card`, `SummaryCard` (the pink Lessons / blue Reviews cards).
- **Feedback** — `Alert` (inline), `Notification` (toast, with status icon).

Each component's `.d.ts` is its API and its `.prompt.md` has usage examples.
`Header`/`TabBar`/`Toggle`/`Menu`/`Tooltip` are adapted for mobile or lack
WaniKani-specific tokens; everything else mirrors a real WaniKani element.

## Motion & interaction states (the WaniKani feel)

Interaction is part of the brand, not decoration. `Button` is a 3D "pushable"
control: the face rests lifted `-4px` above a coloured edge, lifts to `-6px` on
hover, and drops to `0` with an inset shadow on press. Hover/active colours come
from WaniKani's own `--color-button-*-hover-*` / `--color-button-*-active-*`
tokens. Keep this tactile press on interactive controls; inputs use the focus
tint `var(--color-quiz-input-focus)` `#B7E0F4`.

## Idiomatic example

```tsx
import { Card, SubjectCharacter, ProgressBar, Button } from 'wanikani-ds';

<Card title="Level Progress">
  <div style={{ display: 'flex', gap: 'var(--spacing-tight)' }}>
    <SubjectCharacter type="radical" characters="一" size="small" />
    <SubjectCharacter type="kanji" characters="大" size="small" />
  </div>
  <ProgressBar value={45} color="kanji" />
  <Button variant="quiz">Start Reviews</Button>
</Card>
```

Read `guidelines/screens/` for screenshots of the real WaniKani dashboard,
reviews, lessons and subject pages to match layouts.
