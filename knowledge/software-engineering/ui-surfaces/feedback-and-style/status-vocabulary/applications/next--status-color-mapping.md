---
layer: application
type: application
subject: status-vocabulary
technique: status-color-mapping
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Next.js application — parallel tables, each total over the union

Measured in the `ascent` tree at HEAD `62c252dd` (Next 16.3.3, Node 24 per
`.nvmrc`). This tree is the counter-case to the merged-entry rule: it does
not carry colour and label in one entry anywhere, and it is nonetheless
free of the silent-omission drift the rule exists to stop — because every
channel of its main vocabulary is a *separately total* map keyed by the
same union. It is also where that arrangement's real cost showed up in
the one place a type cannot look: the values.

## Three tables, one union, three channels

`src/lib/types.ts:8` declares `LevelId = "L1" | … | "L5"` — a five-member
maturity vocabulary, worst-to-best. Three tables in `src/lib/ui.ts` map it:

- `:75` `LEVEL_HEX: Record<LevelId, string>` — the raw value, for canvas
  and vector consumers that cannot take a class name. Its docstring
  (`:64-74`) is a contrast audit naming the floor member and the measured
  ratios, and stating that darkening any token would *reduce* contrast on
  this canvas — the reasoning kept beside the values rather than in a
  review thread.
- `:90` `LEVEL_GLYPH: Record<LevelId, string>` — the non-colour channel, a
  circle that fills as maturity ascends, with the redundancy argument in
  source (`:83-89`) and the instruction that the glyph is decorative
  reinforcement and ships hidden from assistive technology, because the
  level id carries the meaning.
- `:110` `LEVEL_CLASSES: Record<LevelId, { text; border; bg }>` — the
  three-slot class set for the document.

The second link of the chain is a function, not a lookup: `scoreHex`
(`:124`) and `scoreGlyph` (`:99`) both route a 0–100 score through
`levelForScore` (`src/lib/maturity/model.ts:445`) and index the tables by
the resulting member. So no call site maps a score to a colour; it maps a
score to a *level* and the level to a colour, and re-banding the rubric
retunes every surface at once. `scoreHex` is imported by 144 files (count
taken 2026-09-20), which is the scale at which that indirection stops
being ceremony.

## What the split costs, in the repo's own words

The tables are total, so a sixth member would be a `tsc` error three
times over. What actually drifted was agreement. `LEVEL_CLASSES`' comment
(`:103-109`) is the post-mortem verbatim: the class table's `text` shade
had been one stop lighter than `LEVEL_HEX`, and one member was declared
in a different colour family altogether, *"so the same level showed up as
two different greens side by side"* — a level pill beside a score ring
drawn from the other table. The correction that shipped is the last line
of that comment, *"Keep this in lockstep with LEVEL_HEX"*: a prose
instruction to the next author, which is exactly the gate a merged entry
would not have needed. Nothing in the suite or the lint set compares the
two literals today.

The channels also do not travel together. `LEVEL_HEX` is imported by 30
files, `LEVEL_GLYPH` by 18 and `LEVEL_CLASSES` by 10 (2026-09-20) — so
"never colour alone" is re-decided per surface rather than delivered by
the table, and `LevelBadge` (`src/components/LevelBadge.tsx:9`) exists
because two headline surfaces had hand-rolled the pill recipe and one of
them had dropped the glyph.

## The unknown direction, argued in two places

`LevelBadge.tsx:13-14` clamps both lookups: `LEVEL_CLASSES[id] ??
LEVEL_CLASSES.L1`, `LEVEL_GLYPH[id] ?? LEVEL_GLYPH.L1`. Its comment
(`:10-12`) argues *totality* — callers force-cast a stored history string
to `LevelId`, so a legacy or hand-edited id would otherwise leave the
lookup undefined and crash the header. That is the honest reason the
clamp is there, and it is not the technique's reason.

The technique's reason is written one module away, at
`src/lib/maturity/model.ts:450-455`: *"An unknown level must NOT read as
'above everything' / maxed out at L5."* That is the direction decision
made out loud, and `levelIndex` implements it as `Math.max(0,
LEVELS.findIndex(…))`. The same clamp-to-index-zero shape is a defect in a
sibling tree and is correct here, and the difference is only which end of
the ordering index zero holds: this ladder runs worst-first, so the
not-found sentinel lands on the attention-demanding member. Copy the
comment, not the expression.

## Where the union key was switched off, live at HEAD

`Impact` and `Effort` are closed unions (`src/lib/types.ts:10-11`), and
their presentation tables are not keyed by them:

- `src/lib/ui.ts:194` `IMPACT_CLASS: Record<string, string>` and `:200`
  `EFFORT_CLASS: Record<string, string>` — three literal keys each,
  exhaustiveness off, for a union that is right there. Two of the three
  consumers carry a neutral fallback
  (`src/components/org/followups/FollowupChips.tsx:46,49`;
  `src/components/org/shared/RepoDimensionModal.tsx:153,156`); the third,
  `src/components/report/roadmapPieces.tsx:39-40`, does not, so a fourth
  member interpolates `undefined` into the class string and ships the
  colourless chip by construction.
- `src/features/standing/overview/dimensionReading.ts:36` `BAND_WORD:
  Record<string, string>` is a **fourth** parallel table over the level
  vocabulary — one word per band — string-keyed, with `?? "—"` at `:63`.
  It is the table that would have made a merged entry obviously right,
  and it sits in a feature module rather than beside the other three.
- `src/lib/db/org-shared.ts:35` `LEVEL_RANK: Record<string, number>` holds
  the same vocabulary's *order*, string-keyed, consumed at
  `src/lib/db/org-insights.ts:141` as `(LEVEL_RANK[now.level] ?? 0) -
  (LEVEL_RANK[prev.level] ?? 0)`. Ranks run 1–5, so an unrecognised member
  ranks below the worst real level and manufactures a one-rung *drop* in
  a reported delta rather than an absent reading. The same identifier done
  correctly is two directories away — `src/lib/standard/check-ids.ts:122`,
  `Record<CheckLevel, number>` with the severest member highest.

## The pair that is total, and still unpinned

`src/components/org/shared/backlogShared.ts` is the arrangement at its
best: `STATUS_LABEL: Record<RecStatus, string>` (`:4`) and
`STATUS_ACCENT: Record<RecStatus, string>` (`:13`), with the comment at
`:11-12` stating the conversion's purpose — *"Typed against RecStatus (not
string) so a newly-added status can't silently index to an `undefined`
border colour — it becomes a compile error here instead"* — and citing the
review that produced it. Two tables, both total, adjacent in one file.
Adding a member is loud twice. Nothing still checks that the label and the
accent describe the same thing.

## What gates it

`tsc --noEmit` and nothing else: `.github/workflows/ci.yml:37` and
`.githooks/pre-push:5,51` via `npm run verify`. The lint set is stock
(`eslint.config.mjs`, no custom rule directory), there is no structural
test suite, and no instrument anywhere compares two total tables' values
— which is the whole finding. The type system makes this arrangement safe
against omission and says nothing at all about agreement.
