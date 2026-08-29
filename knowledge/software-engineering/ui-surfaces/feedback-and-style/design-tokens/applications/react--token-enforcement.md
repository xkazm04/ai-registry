---
layer: application
type: application
subject: design-tokens
technique: token-enforcement
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# React application — token enforcement

*Verified against the project tree at `2b5e24223`.*

This tree is the technique's best measured specimen: it has every kind of
gate the technique names, and 2026-08 audits measured exactly what each one
does and does not hold. File-and-line evidence throughout; the deep audits
are `docs/concepts/golden-paths/design-token-usage.md` and
`docs/concepts/golden-paths/theming-and-contrast.md`.

## The contrast gate — the strong half

`scripts/check-themes.mjs` is a real gate-sees-target instrument: it parses
the shipped stylesheet (`src/styles/globals.css`), layers each
`[data-theme=...]` block over `:root`, recomputes WCAG ratios for the text
pairs, and hard-fails (exit 1) any theme where body/muted text drops below
4.5:1 (header comment, `check-themes.mjs:1-40`). It runs in CI
(`.github/workflows/ci.yml:144`), supports a fixture redirect for testing
the checker itself (`CHECK_THEMES_CSS`, `check-themes.mjs:47-50`), and has
no dependencies. Its measured limits (audited at
`theming-and-contrast.md:245-287`): it reads *pre-filter* declarations while
a whole-document brightness filter changes what reaches the screen — the
light themes' default 0.82 level pushes `muted-foreground@80%` from a
passing 4.6:1 to a failing 4.0–4.1:1 with the gate green — and it audits 11
of the 66 reachable theme × brightness × contrast configurations. A correct
instrument pointed at a proxy of the target.

## The raw-value bans — the advisory half

The lint rules the technique prescribes all exist
(`eslint-rules/no-raw-radius-classes.cjs`, `no-raw-text-classes.cjs`,
`no-low-contrast-text-classes.cjs`, …) and all sit at `"warn"`
(`eslint.config.js:96-101`). The measured lesson, verbatim from this repo's
own audits: `npm run check` runs with no `--max-warnings`, and the
pre-commit hook runs `--quiet --max-warnings 99999`, so **a warn-level rule
enforces nothing at either gate at any count, by construction**
(`theming-and-contrast.md:761-765`). Baseline at HEAD: 0 errors, 1,135
warnings — 705 of them `no-low-contrast-text-classes`, 128
`no-raw-radius-classes`. The correlation-without-enforcement effect is also
measured: token axes with an early-wired rule sit at 94–99% adoption (typo
99.0%, elevation 99.4%, radius 94.0%); axes with no firing rule collapse
(`CARD_PADDING` 0.8%, `MOTION` 3.4%, `is-disabled` 1.0%)
(`design-token-usage.md:285-330`) — and the cross-repo check falsified
delivery format as the cause, leaving "a gate fires, wired early" as the
surviving predictor.

## The visibility failures, one specimen each

- **Byte-identical token:** `STATUS_PALETTE.success.text` *is* the string
  `'text-emerald-400'` (`src/lib/design/statusTokens.ts:26-33`), so no
  lexical rule can tell an adopter from a violator — which is why the color
  axis has no raw-value rule at all
  (`design-token-usage.md:493-511`).
- **Deny-list certifying the nonexistent:** `no-raw-text-classes.cjs:41` is
  a deny-list, so `text-md` — a class defined by *no* layer — passes green;
  230 occurrences across 63 files, four of them inside the shared `Button`
  (`design-token-usage.md:438-451`).
- **Exemption buckets:** the radius rule's path exemptions and
  attribute-visiting gaps leave it seeing 130 of 307 real occurrences
  (42.3%) (`design-token-usage.md:401-411`); the contrast rule walks
  template-literal quasis but never expressions, costing 14% recall
  (`theming-and-contrast.md:429-467`).
- **The authority violating itself:** the token file ships raw values the
  standard bans — `INPUT_FIELD` hardcodes `rounded-xl` against the
  documented `rounded-input` mandate (`src/lib/utils/designTokens.ts:141-142`,
  and `INPUT_FIELD_ERROR` beside it at `:145-146`, vs `.claude/Design.md:216`) — and it can, because the exemption matrix
  excludes `src/lib/` from the rules (`no-raw-radius-classes.cjs:46-52`).

## The migration clause, lived: the 2026-08-07 type-recipe softening

The golden path's "a token change is a migration" section is this repo's
`typo-label` change, generalized. The recipe dropped its uppercase + wide
tracking (`src/styles/typography.css` — the current file carries the
post-change script notes at `typography.css:89-98`; `.claude/Design.md:61`
records the before/after). Because the recipe had been *suppressing* local
styling — `typography.css` is unlayered and beat utility-layer declarations
— **567 `uppercase`/`tracking-*` utilities sitting next to `typo-label` in
class strings were inert, and every one would have switched back on the
instant the token stopped declaring `text-transform`**. The change swept all
of them pre-emptively, touching 143 component files in the same commit
(`193d4aeab`; run ledger `.claude/active-runs.md:263-267`). The ledger's own
lesson: *"when you soften a `typo-*` token, sweep the utilities it was
silently suppressing in the same change or the app ends up half-shouting."*
The blast radius of a token change is what referenced it plus what it
overrode — measured here at 143 files for a one-recipe edit.

## The compensation dialect around a whole-surface filter

The technique's decay story is about raw values accreting past a gate. This
tree carries the same story in a form the technique names only in passing —
**a dialect that grows to compensate for something the token layer cannot
express** — and it is worth recording because every one of its members looks
like a token when read on its own.

The root fact is one declaration. `src/styles/globals.css:831-833` applies a
filter to the document element:

```css
html {
  filter: brightness(var(--app-brightness)) saturate(var(--app-saturation));
}
```

Six brightness levels feed it (`:816-819` — dark 1.25 / 1.38 / 1.50, light
0.82 / 0.91 / 1.0), and the comment at `:820` states the appeal plainly:
"Applied via filter on `<html>` so every theme benefits universally." One
declaration, every theme, no per-token work. That is exactly the trade the
technique warns about, and the bill arrives as vocabulary.

**Member one: an inverse constant.** `:827` defines
`--brightness-compensate: calc(1 / var(--app-brightness))` — a token whose
only meaning is "undo the other token".

**Member two: a lock utility.** `@utility brightness-lock` (`:847-850`) sets
`--tw-brightness` to that inverse and re-declares the entire Tailwind filter
chain by hand, because setting one link would drop the others:

```css
filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,);
```

At HEAD it is applied in exactly two components —
`src/features/shared/components/buttons/Button.tsx` and
`src/features/vault/sub_credentials/components/forms/FormActions.tsx` — so
the escape hatch exists, is countable, and is barely used.

**Member three: a hardcoded class-prefix list, which is a deny-list.**
`:852-860` re-applies the same nine-variable filter chain to a selector list
matched on Tailwind class *substrings*:

```css
[class*="bg-gradient-to-"],
[class*="bg-red-5"], [class*="bg-red-6"],
[class*="bg-indigo-5"], [class*="bg-indigo-6"],
[class*="bg-orange-5"] { … }
```

This is the technique's deny-list membership failure transplanted out of the
linter and into the stylesheet. It enumerates remembered offenders — the
vivid backgrounds someone noticed washing out — and certifies every colour it
has not heard of. `bg-red-4`, `bg-violet-500`, `bg-emerald-500`, and any
future accent get no compensation and are silently rendered at the wrong
intensity. It also cannot be checked: no gate reads this list, and nothing
relates it to the palette it is a subset of.

**Member four: the `-raw` twin, six times over.** `:862-960` pre-adjusts the
status and brand tokens so they survive the filter, one block per brightness
level, twelve declarations each — seventy-two `color-mix` lines whose factors
(80%, 72%, 67%, 82%, 91%, raw) are hand-derived from the filter values in the
comment at `:864`: "Factor = round(100 / brightness_value)". Every semantic
colour therefore exists twice, as `--status-error-raw` and `--status-error`,
and the split has escaped into the accessibility layer: `html[data-cvd="safe"]`
(`:5116-5123`) must set both, and its comment says why —

> Override the -raw token AND the rendered token so the brightness
> counteraction layer (color-mix on -raw) picks up the safe value too.

That is the moment a compensation becomes a dialect: a rule that authors of
*unrelated* features now have to know. Adding a colour-vision override is no
longer "set the token"; it is "set the token and its twin, or the
counteraction layer will quietly reinstate the unsafe value at five of the six
brightness levels".

### The structural fact

Four constructs — an inverse variable, a lock utility, a deny-list of class
prefixes, and a doubled token namespace with six restatement blocks — exist
for no reason other than that one `filter` declaration cannot be addressed
token by token. None of them is a violation. Each was the smallest available
repair at the moment it was written. And the growth is monotone: the deny-list
gains a prefix whenever someone notices a washed-out colour, the `-raw` twin
gains a member whenever a semantic colour is added, and each new brightness
level would add twelve more declarations. The technique's economics section
argues that removing an established dialect costs a migration project; this
one is measured at 72 declarations, 6 selector prefixes, and one rule every
future token author must be told.

The compounding effect on the gates is already recorded in §7.A of this tree's
own audit (`theming-and-contrast.md:245-287`), cited above: the contrast
checker reads pre-filter declarations, so it scores the `-raw`-derived values
and not the pixels. The dialect and the gate blindness are the same fact seen
from two sides — the filter is invisible to the token layer, so the token
layer grew a vocabulary to argue with it, and the instrument that audits the
token layer cannot see either the filter or whether the argument worked.

## What this realization cannot do or prove

- **No adoption number exists for the dialect.** The 94–99% / single-digit
  adoption split cited above was measured per token axis by a census
  (`design-token-usage.md:283-330`). Nothing has counted how many components
  *should* carry `brightness-lock` and do not, so "two uses" is a count of
  applications, not a recall figure. The two components using it may be the
  only two that need it, or two of forty.
- **The counter-filter list's error rate is unmeasured.** That
  `[class*="bg-red-5"]` certifies `bg-violet-500` by omission is a structural
  reading of the selector, not an observation of a wrong-looking button. No
  screenshot diff, no per-colour measurement, and no gate exists that would
  fail when a new accent is introduced without a matching prefix.
- **The compensation arithmetic is unverified end to end.** `round(100 /
  brightness)` is a plausible inverse for a `brightness()` filter over sRGB,
  and `color-mix(… N%, black)` is not that inverse in general — the two
  operate in different spaces. Whether the pre-adjusted token actually lands
  back at its authored appearance after the filter has never been measured
  here; the factors are documented as derived, not as checked.
- **This says nothing about the technique's severity clause.** The dialect is
  a *stylesheet* phenomenon and none of it is lintable by the rule family this
  document's earlier sections audit. A tree could fix every warn-level rule
  named above and this section would be unchanged, which is the point: the
  severity failure and the dialect failure are independent routes to the same
  decay.
- **One tree, one filter.** The generalization — that a whole-surface visual
  transform the token layer cannot address grows a compensation vocabulary —
  is supported here by a single specimen with a single root cause. A second
  sighting (a global saturation, a zoom, a print stylesheet) is what would
  make it a family rather than an anecdote.
