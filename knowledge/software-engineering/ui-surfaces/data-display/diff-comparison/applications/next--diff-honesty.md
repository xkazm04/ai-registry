---
layer: application
type: application
subject: diff-comparison
technique: diff-honesty
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Every reason a comparison was not made, spelled as its own sentence

Read in the `ascent` tree (Next.js 16.3.3, React 19.2.4) at HEAD `62c252dd`; every
citation below was resolved against that tree on 2026-09-20.

The scan-comparison route carries two comparisons side by side — one repository
against its own earlier scan, and the same repository against a stronger one — and
between them they exercise most of this technique's clauses on one screen. What
makes the surface worth reading is not that it is clean. It is that three of its
honesty mechanisms were installed *after* the corresponding lie was observed in
production, and each one carries the observation in a comment beside it, so the
file reads as a record of what the failure actually looked like.

## The failure vocabulary is a closed union, and nothing is ever substituted

`src/app/report/compare/ExemplarPanel.tsx:14-19` declares every way the
cross-repository comparison can fail to happen as a variant of one type:

```ts
export type ExemplarFailure =
  | { kind: "unparseable"; raw: string }
  | { kind: "not-found" }
  | { kind: "forbidden" }
  | { kind: "below-floor"; population: number; min: number }
  | { kind: "unavailable" };
```

`ExemplarFailureNotice` (`:21-58`) renders one sentence per variant, and the
sentences do the work the type cannot: each says *no comparison was made*, and three
of them say explicitly that nothing was put in its place — "Nothing was substituted;
pick another exemplar below" (`:35`), "so no comparison was made rather than a
partial one" (`:46`). The parser upstream is built for it: `parseExemplarRef`
(`src/lib/report/exemplar.ts:83`) returns `null` on anything it does not recognise,
with the reason written above it — "a comparison the reader did not ask for,
rendered where the one they did ask for should be, is worse than none" (`:79-82`).
`ExemplarSection.tsx:30-36` is the one place a token becomes either a panel or a
notice, and its module docstring makes the no-substitution rule the file's purpose.

Two of these are more than presentation. `below-floor` carries its own numbers —
population against the minimum (`:43-45`) — so the reader can see how far short the
cohort fell rather than being told it was too small; `unavailable` states the blast
radius of the failure, "The diff above is unaffected" (`:53-54`), which is the
narrower and more useful claim than a page-level error would have made.

## The third state, built twice, for two different reasons

A dimension scored on only one side is not a gap, and both comparisons say so in
their own vocabulary.

Across repositories, `diffAcrossRepos` (`src/lib/report/exemplar.ts:268-278`) gates
every contribution on `comparable = Boolean(mine && theirs)`: a one-sided dimension
enters `notComparable`, contributes to no count, and gets null score gaps. The
comment states the principle exactly — "a 'gap' against a side that was never
measured is an artifact of the measurement, not of the repository". The panel then
renders the list with the claim attached to it: "scored on only one side, so no gap
is claimed for them" (`ExemplarPanel.tsx:113-121`).

Within one repository, `OneSidedBadge`
(`src/components/report/WhatChangedParts.tsx:116-132`) splits the same state into
three — new in this scan with no baseline, no longer scored, scored in neither — and
its comment is the sharper half of the lesson:

> Deliberately NOT emerald/red: a dimension appearing or disappearing is a change in
> WHAT was measured, not an improvement or a regression, and borrowing the gain/loss
> hues would assert a direction the data doesn't have.

Each badge ships a glyph and a full text label, and the accompanying score bar
renders the one-sided value with a hatch fill (`:149-157`) rather than the
directional green or red, which is the non-colour channel for a mark that has no
room for a glyph.

## Truncation that carries an exact remainder, because the total is known

`buildAttribution` (`src/lib/report/compare.ts:284-328`) composes the one-line
explanation of a dimension's movement from signal names under a budget of
`MOVEMENT_NAME_CAP = 3` (`:208`). Names beyond the budget are counted, not dropped:
`overflow` accumulates across the verb groups and renders as `(+n)` at the end of
the line (`:317-327`). That is the technique's distinction between the two truncation
statements, landing on the right side of it — the computation ran to completion, so
the remainder is a fact and the line may state it. The raw evidence lines behind each
headline are kept on `ScanDiff.movementDetail` (`:411-415`) for the expanded views,
so the summary is expandable rather than terminal.

## The summary that contradicted its own detail, and the fix

The best material here is a defect that shipped. `diffScans` computes every delta as
null unless *both* scans measured the dimension (`compare.ts:357`) — correct, and the
source of the bug. The `unchanged` predicate coerced those nulls to zero, so a
dimension added to the model after the baseline counted as "did not move", and the
headline rendered "No measurable change between these two scans" directly above a
visible dimension card reading `— → 70`. The fix is `oneSidedDimCount`, threaded
through the loop (`:344-348`, `:382-383`) into the predicate (`:455-467`), with the
reasoning left in place:

> Their delta is correctly null (no invented numbers), but that null must not read as
> "nothing changed".

This is the summary/detail clause failing in its most instructive form. Nothing was
miscomputed. A null that honestly meant *not comparable* was read by a second piece
of code as *comparable and equal*, and the contradiction surfaced two components
away, in the one sentence a reader most relies on.

The empty answer is handled the same way in the cross-repository panel:
`nothingToTransfer` renders a real sentence and, when the subject carries signals the
exemplar does not, says how many (`ExemplarPanel.tsx:94-104`) — an empty result that
reads as a finding rather than as an empty panel.

## What this surface does not do, and one place the standard still stands

- **No retry anywhere.** The technique requires that a failed comparison offer
  re-running it, "so the cheapest path out of it is re-running the comparison rather
  than trusting the void". None of the five failure notices does. Four offer a
  *re-choice* ("pick another exemplar below"), which is a different action with a
  different outcome, and `unavailable` — the one kind that is genuinely transient,
  the scan store not answering — offers nothing at all: the reader's only route back
  is to reload the route by hand. The deviation is the finding; the standard stands.
- **The affirmative denial is scoped below itself, not inside itself.**
  `nothingToTransfer` is `absentSignalCount === 0` (`exemplar.ts:318`), computed over
  the comparable dimensions only, and renders as the unbounded sentence "Nothing this
  exemplar has is missing here." The dimensions it could not compare *are* disclosed
  — in a separate paragraph further down the panel. The disclosure exists; the claim
  itself is still unscoped, and the technique asks for the claim to carry its own
  scope, because a reader who accepts the headline has no reason to keep reading.
- **The level is not stated on the surface.** Both comparisons normalize before
  comparing — case and whitespace for the time diff, embedded counts blanked for the
  cross-repository one — and both normalizations are documented in the kernel and
  nowhere the reader can see. "No measurable change between these two scans: same
  level, posture, scores, and open gaps" (`WhatChanged.tsx:54-56`) enumerates the
  *fields* it compared, which is more than most surfaces manage, and still does not
  say at what level it compared them.
- **Nothing here was measured against users.** Every claim above is a reading of the
  code and its tests. How often a reader hits `below-floor`, or whether the
  no-substitution sentences are read at all, is unmeasured, and no instrumentation in
  the tree would answer it.
