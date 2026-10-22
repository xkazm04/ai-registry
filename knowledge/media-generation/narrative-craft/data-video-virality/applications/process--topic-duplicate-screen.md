---
layer: application
type: application
subject: data-video-virality
technique: topic-duplicate-screen
stack: process
status: draft
verified_on: 2026-10-22
applied: experiment
ab_verdict: unmeasurable
---

# A duplicate screen on the case-idea validator: title equality, and what it cannot see

The `StatReel` studio (see process--recognizable-cast) brainstorms use cases in batches and
posts the ones that pass a self-check. The seam was chosen to falsify "the tree screens
duplicates": it does, but only at the level the technique calls insufficient. The case brief
tells the seats not to repeat an idea "even under another name", and the code enforces that
with one normalised-title equality, once against the existing titles and once inside the batch.
The existing-ideas list the check receives holds titles only, so no stored idea's topic, span or
measure is available to compare.

## A and B

Run against the tree's own self-check (arm A) and a throwaway screen written beside it (arm B),
on five constructed ideas in one topic over 1985-2020: one restates an existing title in other
words, two are the technique's own "same chart, new title" pair, one is a different measure of
the same subject, and one is a near-identical title.

- **A (as it was):** all five passed (0 of 3 true duplicates caught). Even "Best selling games of
  all time" against an existing "Best-selling video games of all time" passed, because one added
  word changes the key.
- **B- (topic plus span, the fields the schema has):** all five were flagged, so both
  different-measure controls were failed. The floor, "a genuinely different measure is not a
  duplicate", fell from 2 of 2 to 0 of 2.
- **B (topic plus a declared measure plus span overlap of at least half the shorter span):** 3 of
  3 duplicates caught, each against the older idea, and 2 of 2 controls passed.

## What the tree says about the standard

The case schema has no measure field, so only B- is computable today, and B- fails the floor.
The measure is the half of the technique's key that separates a duplicate from a sibling, and
here it lives in prose (title, pitch, arc) where nothing can compare it. Shipping B would also
need the field stored: the case table has a column per declared field (the series and branch
year fields were each added that way), so a cross-pass screen is a schema change plus a
migration, not a validator line. A within-batch screen could ship without storage, but the
drift the technique names is across passes.

## What this cannot show

The five ideas are constructed from the technique's own examples. The studio's real backlog
(hundreds of ideas, with the twelve duplicates it recorded catching) is not reachable from this
checkout, so the true duplicate rate and the false-positive rate of B on real ideas are not
measured. No product code was changed.
