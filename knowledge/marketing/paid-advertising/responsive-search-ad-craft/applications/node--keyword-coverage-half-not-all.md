---
layer: application
type: application
subject: responsive-search-ad-craft
technique: keyword-coverage-half-not-all
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
---

# Keyword coverage: half, not all - the rater already had the goal, the fallback and the exclusion; not the stem

The marketing workspace at `systedo-case` (commit `7baeb12a`, 2026-10-14) scores
keyword presence in `src/lib/ad-strength.ts`. Most of the technique was already
there: `KEYWORD_COVERAGE_GOAL = 0.5` with the fraction capped at the goal, a
four-character significance filter, a whole-keyword substring fallback when the filter
empties the list, and an unmeasurable keyword list that drops the factor and
renormalises the weights.

## The seam

Procedure step 2 asks for a stem-length prefix so inflected forms count. The tree
tokenised both sides identically but compared by exact set membership
(`ht.has(k)`), so a keyword "ořechy" never matched a headline saying "ořechů". Czech
endings made a set that carried the keyword in half its headlines score as covering
none.

## The change

A `stemKey` that cuts tokens of six or more characters to a five-character prefix
and leaves shorter tokens exact, applied to both sides (commit `af83ee51`, branch
`cur/n58-keyword-stem`). Measured paired on two inflected-form sets: before, both
failed (status not pass); after, both pass, and a third set whose keyword shares only
a three-letter start with unrelated headlines still fails, so the prefix did not
widen into false matches. The existing eight pins stayed green.

## Not measured

How often real generated sets carry an inflected keyword; whether five characters is
the right cut for other inflected languages; the full pre-push gate, which was red for
unrelated tests, so the change sits on a branch.
