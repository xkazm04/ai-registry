---
layer: application
type: application
subject: presenting-a-score-to-a-recruiter
technique: score-bands-locked-across-surfaces
stack: react
status: forged
verified_on: 2026-09-29
verified_against: react@19
---

# Two band families, each locked, disagreeing about one number

The technique's rule is one table for every consumer, with the mirror across a runtime
boundary asserted by a test. kp follows it, twice. The result is two tables, and that
is the defect. (kp at `70dd2319d`.)

## Family one: the fit tier, 70 and 55

`fit_tier_for` in `pipeline/jobfit/matching.py` bands a match total into
`strong` / `promising` / `partial` at `FIT_STRONG_THRESHOLD = 70` and
`FIT_PROMISING_THRESHOLD = 55`, and the tier rides on every `MatchResult`.
`app/_lib/fit-thresholds.ts` re-declares both floors for client code that cannot call
Python, and every TS consumer derives from it: the rediscovery admission gate, the
Candidates "Pool fit" filter, the group-eval `low_fit` risk, and `scoreToFitTier` in
`app/_components/Badge.tsx`, the fallback for a surface with no server tier.

This family is the technique done properly, including the part that is usually skipped.
Commit `97d64953b` (2026-08-20) found the badge fallback re-hardcoding both literals, so
tuning the shared floor "would have moved every gate and left the badge the recruiter
reads on the old scale", and derived it from the constants. And
`pipeline/jobfit/tests/test_fit_threshold_sync.py` reads the numeric literals out of the
TS file with comments stripped (its docstring records why: the prose names both numbers)
and fails the build when they diverge, both floors and the tier vocabulary, enumerated
from both sides.

## Family two: the tone, 75 and 50

`SCORE_STRONG_MIN = 75` and `SCORE_MID_MIN = 50` in `app/_lib/format.ts` drive
`scoreTone`, which yields `strong` / `mid` / `weak` / `null` and picks the colour token.
`ScoreBadge`, `Meter`, the dial, the factor bars and the candidate detail model read it,
21 files in all. `scripts/_common.py` mirrors both numbers for terminal colour, and its
comment says "Update both sides together if the bands change". Nothing tests that mirror:
a search of `app`, `scripts`, `pipeline` and `tests` for `score_color`, `SCORE_MID_MIN` and
`SCORE_STRONG_MIN` found no test of the Python side; the one test that names the TS constant
is `decisionBrief.test.ts`, in a comment. This is the hand-kept arrangement the
fit family retired.

## The two families meet on one candidate

`FitReadout` in `app/features/hiring/decisions/DecisionsAnalysisParts.tsx` renders, in one
`span`, a `ScoreBadge` and a `FitTierBadge` fed the same number:
`match?.total ?? entry.matchScore`. The candidate overview does the same with
`FitTierBadge` and the detail model's `scoreTone(raw)`. Both tables are single-sourced and
pinned, and they disagree.

Measured by reading the two constants out of the source files (not by copying them) and
banding every integer from 0 to 100 under each: the tiers disagree on **10 of 101**
scores. 70 to 74 reads `strong` under the fit tier and `mid` (amber) under the tone; 50 to
54 reads `partial` under the fit tier and `mid` under the tone. A 72 is a "strong" label
next to an amber number. The control cases behaved (72 splits, 90 agrees at strong).
Recruiters read the label and remember the colour, so a debrief can hold both.

## Why the tests do not see it

Each test binds a family to its own mirror. Nothing asserts a relation between the
families, because they were built for different jobs: the tone for any 0-100 quantity in
the app (analysis totals, factor bars, rating projections), the fit tier for match totals.
The two jobs overlap on exactly the number a recruiter looks at most. The technique's
"closed vocabulary, named once" is violated one level up: the vocabulary is closed inside
each family and there are two families.

## What the fix has to decide

Not which table wins by taste. The candidates are: derive the tone from the fit floors on
match surfaces and keep 75/50 for the surfaces that show non-match quantities; or give the
tone the same three words and one set of cutoffs everywhere; or render one channel
(word or colour) on match surfaces. Whichever it is, the check that would have caught it is
a test that enumerates every consumer's cutoffs for a given quantity and asserts they
partition the scale identically. Logged as an open deviation; the tree was not edited in
this pass because the choice moves a recruiter-visible threshold.
