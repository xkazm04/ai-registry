---
layer: application
type: application
subject: political-compass-from-votes
technique: disclosed-scoring-rule
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Disclosed scoring rule — pure scoring + lens boundary (politicas)

The politicas compass ("Volební kompas naruby") scores alignment in one pure
function, `scoreAlignment` in `features/votetrack/kompas/score.ts`, whose
header (lines 1–23) *is* the disclosed rule — the same text is rendered
verbatim in the UI via `copy.ts` `scoringRule`.

## The rule as one definition

- **Comparable = positional only** (lines 92–99): per answered question, a
  ballot bucket of `yes`/`no` increments `comparable` (and `matches` on
  agreement); the merged `k` bucket (abstain / present-not-voting, merged by
  the chamber's own procedure) and absence each go to their own displayed
  counter (`kCount`, `awayCount`) and never touch numerator or denominator.
  `rate = matches / comparable`, 3dp, `null` when nothing is comparable
  (line 108) — never 0, keeping "no evidence" distinct from "0% match".
- **Rankability floor** (lines 84, 109): `comparable >= ceil(answered / 2)`,
  recomputed against `answered` after foreign question ids are dropped
  (lines 78–83 — an answer referencing a question outside the current set is
  ignored, so a stale share-link cannot inflate the denominator).
- **Disclosed ordering** (lines 112–119): rankable first, rate desc, more
  comparable ballots first, then Czech-collation of the name — which the
  header and the UI explicitly call a meaningless tiebreak.
- **Clubs against the line** (lines 19–21, 124–140): a club scores against
  its line (strict majority of the club's positional ballots, derived in
  `record/derive.ts` `lineOf`); a tied club has no line and the vote is not
  comparable for it — `line === undefined` simply skips (line 129).
- **Floors as exported constants**: `MIN_ANSWERS = 3` (line 31) — below it no
  result renders at all. Constants and semantics are pinned by fixtures in
  `score.test.ts`; the rendered rule imports from the same module, so the
  stated and computed rule cannot drift.

## The lens boundary, enforced in a sibling feature

The reader-reweighting boundary the technique demands is implemented (for the
contribution index) in `features/civicscore/lens.ts`:

- **Never blended** (lines 19–25): at published default weights the lens does
  not compute — the page shows the authoritative `contribution_score`; the
  moment weights differ, *everything* (score, rank, histogram, duel) comes
  from `reweigh()` and is labeled "your index".
- **One source for published weights** (lines 40–54): `PUBLISHED_WEIGHTS`
  re-exports the single canonical `CONTRIBUTION_WEIGHTS`, and
  `PUBLISHED_WEIGHTS_LABEL` exists because the "25-20-20-15-10-10" string
  previously stood as a literal on four rendered surfaces — a weight change
  would have left them asserting the old methodology.
- **Rejected, never repaired** (lines 76–93): `decodeWeights` returns `null`
  for any malformed URL lens — "an address is a claim, and a silent repair
  would assert someone else's lens".
- **Presets are editorial, attributed to no one** (lines 197–201): example
  lenses are deliberately not ascribed to real organizations — that would
  fabricate an authority's methodology.

Together the two modules show the technique's full shape: one pure definition,
imported by computation and copy alike, with the reader's method firewalled
from the published one.
