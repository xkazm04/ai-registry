---
layer: application
type: application
subject: local-visibility-and-reputation
technique: pack-visibility-per-engine-never-averaged
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Pack visibility per engine, with sustained decline - the dual-engine ladder in a Czech-market workspace

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08, Node
24.x) tracks map-pack positions on two engines - the dominant map and the Czech
national map - through one import seam, one pure rollup module and one recap
grounding function. The structural fact the tree proves: **the two engines are rolled
up separately by construction**, because the split happens in the filter before any
arithmetic runs, and an unrecognised engine cannot enter either series because the
parser returns a value the caller must reject. It also proves the technique's date
policy: an ambiguous slashed date is a typed verdict, not a guess.

## The split happens before the arithmetic

`src/lib/local-signals/summary.ts:46-59` computes the recap's headline figures over
`googleActive = ladderForEngine(active, "google")` and, separately,
`seznamActive = ladderForEngine(active, "seznam")`. Tracked, in-pack (`current <= 3`),
top-1, mean rank and pack rate are computed twice, from two disjoint arrays. There is
no code path in which a row from one engine reaches the other's sum. The comment at
`:41-45` states the rule as a design decision: "Blending two engines into one 'average
position' would describe neither map." The second engine's line (`:126-134`) ends with
the sentence, in the client's language, "the second engine is counted separately, not
averaged with the first" - the rule is written into the report the client reads, not
only the code.

`enginesPresent` (`src/lib/mappack/compute.ts:26-29`) derives the engine list from the
rows and returns an empty list for empty input - "never a phantom 'google' - so a
surface can tell 'no rows at all' from 'google rows only'". That is the technique's
step 4, and it is the reason a fresh project shows an honest empty state rather than
a relabelled sample.

## The import refuses to guess an engine

`parseEngineCell` (`src/lib/local-signals/import.ts:29-47`) returns three distinct
things: `undefined` when the column is absent or empty (the dominant engine, and
nothing is written - the legacy-read rule), a recognised engine after a diacritic and
case fold, or `null` for a present-but-unrecognised value. The doc comment carries the
technique's reason: "mis-attributing a Seznam position to Google would silently corrupt
both ladders, so the caller rejects the row with `invalid-engine`". The pack importer's
`PackRowErrorCode` union (`:690-703`) includes that code alongside `duplicate-rank`
and `bad-coords`; and the section header at `:668-676` states the pack-is-a-ranking
rule verbatim - "silently dropping one competitor renames every position below it and
rewrites share-of-voice, so a partial pack is worse than no pack" - and makes the whole
import fail on any malformed row with a line number. `MAX_PACK_RANK = 20` (`:710`) is
the "beyond that the number is a typo" rule, with the comment naming three-deep pack
and twenty-deep "more places" view as the documented boundary.

## Sustained decline: run and magnitude, both required

`src/lib/mappack/compute.ts:112-115` declares `RANK_DECLINE_MIN_RUN = 3` and
`RANK_DECLINE_MIN_DROP = 3`, each with a comment explaining its half of the rule; the
drop constant's is "so a single blip isn't mistaken for a trend". `rankDecline`
(`:135-143`) returns null for a history shorter than `MIN_RUN + 1`, feeds the raw rank
series into the metrics engine's `detectWeeklyRun` with a noise floor of 1 and z of 1,
fires only when the direction is "up" (rank number increasing means worse), and then
applies the magnitude bar separately. A recovering or flat series returns null - the
technique's "nothing, not stable". The long comment at `:119-134` records the reuse
decision the technique's "shared detector" section describes: the metric detector's
bucketing half does not fit an irregular integer series, but its run-walk does exactly.

The recap consumes it at `summary.ts:80-85`: decliners sorted by `droppedBy`
descending, worst first, so the client reads the two keywords sliding rather than
"positions declined".

## Untracked keeps its history and is disclosed

`summary.ts:33-40` explains the partial-re-import case: an omitted keyword is retained
with `untracked: true` and a frozen `current`; the headline figures are computed over
`active` only, and `untrackedCount` is printed on its own line (`:136-140`) as
"keywords not in the last import (history kept, not counted in current figures)". A
keyword is never zeroed and never deleted by an import that forgot it.

## The ambiguous date is a typed verdict

`classifyReviewDate` (`import.ts:375-408`) returns `ok`, `ambiguous` or `none`. A
dashed year-first date is `ok`; a dotted date is European day-first by convention and
`ok`; a slashed date where both fields are 1-12 and differ is `ambiguous` (`:399`),
and the caller counts and rejects the row. The comment states the policy by separator
in one paragraph, which is the technique's date section almost word for word - an
upward lesson taken from the tree.

## Where the tree falls short

`RANK_WEIGHT` (`compute.ts:44`) is a per-position click ladder the file itself calls
"Illustrative"; `shareOfVoice` built on it is used for relative standing, which is
right, but nothing in the rendered share carries the label into the client's view.
And every observation is one point per area: the tree has no grid, so its decline
verdicts are single-point runs and the recap does not yet say "one point, one day".
The standard - grid as instrument, single point labelled - stays above the tree.
