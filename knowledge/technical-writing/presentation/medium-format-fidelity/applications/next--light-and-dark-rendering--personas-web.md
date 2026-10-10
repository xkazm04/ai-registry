---
layer: application
type: application
subject: medium-format-fidelity
technique: light-and-dark-rendering
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# Eleven themes, one picked at random, and an inline-code colour that fails on two of them

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The pages are the blog and guide of the `reading-column-and-type-scale` application beside
this file.

## What the site does

- **The scheme is picked for the reader.** The site ships eleven themes, eight dark and
  three light. On a first visit the pre-paint script picks one at random and stores it,
  src/app/layout.tsx:102 "id=T[Math.floor(Math.random()*T.length)]". The system
  preference is not read. Its only mention in the styles is a comment,
  src/app/globals.css:11 "not only OS". A theme switcher sits in the footer.
- **Colours are role tokens per theme.** The guide's inline code uses `text-brand-cyan`,
  src/components/guide/guide-markdown/parseInline.tsx:67 "font-mono text-brand-cyan",
  and the token resolves per theme, src/app/globals.css:23 "--color-brand-cyan: var(--brand-cyan);".
- **The code highlighter has one theme.** It loads a single dark theme,
  src/components/guide/blocks/CodeFence.tsx:49 "github-dark-default.mjs", and forces the
  block's background transparent, src/components/guide/blocks/CodeFence.tsx:156 "[&_pre]:!bg-transparent".
  The guide content has no fenced block at this commit, so no page shows it yet.

## Contrast, computed

These are WCAG relative-luminance ratios against each theme's page background. The control
pair, black on white, gave 21.00.

| Element | Theme | Ratio |
| --- | --- | --- |
| Guide inline code | `light` | **4.30**, src/styles/themes.css:227 "--brand-cyan: #0e7490;" |
| Guide inline code | `light-ice` | **3.53**, src/styles/themes.css:256 "--brand-cyan: #0284c7;" on src/styles/themes.css:245 "--background: #e8eff6;" (3.38 to 3.56 across the body gradient) |
| Guide inline code | `light-news` | 9.40 |
| Guide inline code | six dark themes | 4.63 to 15.90 |
| Blog body text | `light-news` | 4.82 (lowest of the themes read) |

Two themes were not measured: `dark-midnight` and `dark-pink` inherit the colour from a
layer not read. Inline code is 16-pixel regular text, so the floor is 4.5.

## Simulation

Policy A is the technique before 2026-10-10: tokens for both schemes, default to the
system preference, check both schemes. Policy B adds three things:
- a first visit never picks a theme by brand, rotation or chance;
- with more than two themes, check every one;
- a highlighter with one theme and a transparent background is a one-scheme highlighter.

- **The random first theme.** A catches it with its default rule. B catches it in the
  same place and names the move: read the preference on a first visit, keep the stored
  choice after. Same verdict, a plainer instruction.
- **Inline code on light themes.** A reviewer following A checks one light and one dark
  theme. Two of the three light themes fail, so whether A finds it depends on which light
  theme is picked: two chances in three. B checks all eleven and finds both.
- **The dormant highlighter.** A's rule that code highlighting has its own pair of themes
  applies, but only once a page shows a fenced block. B's mechanism is visible in the
  component today: pale tokens on every light theme, the first time content uses a fence.

B finds a defect A may miss on one case, and finds one earlier on another. This is judgment
on computed ratios and the code; no page was rendered.

## Not a reading claim

Honouring the system preference is a courtesy, not a reading gain. The controlled studies
cited in the technique found dark text on light read better. Eight dark themes out of
eleven, assigned at random, put most first-time readers on the measured weaker polarity
without their asking.

**Falsifier:** a rendered `light-ice` guide page whose inline code measures 4.5 or more,
which would mean another layer overrides the token. Nothing was changed on the site: the
project's map does not join this bundle.
