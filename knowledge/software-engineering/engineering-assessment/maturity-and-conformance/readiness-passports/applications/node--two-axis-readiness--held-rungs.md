---
layer: application
type: application
subject: readiness-passports
technique: two-axis-readiness
stack: node
status: forged
verified_on: 2026-10-01
verified_against: node@24
applied: code
ab_verdict: better
---

# A held rung: coverage is not absence, in a score

Realized in the Ascent repo, `src/lib/analyze/passport-score.ts`, landed
2026-09-24 (`31c8d877`). It is the partial-read case of the technique's
"missing is a third state" rule, which the repo had honoured only for a
whole project until a fleet ranking exposed the gap.

## The defect

The CI and security ladders are read off workflow content that arrives through
a bounded fetch. When the scan read less than the tree listed, the builder
already demoted the findings to `*-unassessable`, but the ordinals were still
scored off the partial text: an unread tree sat at CI `build` (20 points) and
security `none` (0), so the production score and every fleet ranking priced a
bounded fetch as a weak pipeline.

## The shape

`HOLD` maps each rung to its coverage-finding code and its floor set
(`ci: none, build`; `security: none, policy`), and `isRungHeld(rung, level,
findings)` is the one read of that fact; every consumer goes through it
(`passport-score.ts:40-60`). `deriveProductionScore` leaves a held axis out and
divides by the measured weight (`:83-95`), with no division at all when nothing
is held so every other score is byte-identical. The fleet table sorts held rows
after every assessed row in either direction; the CSV prints `unassessable`.

## What it measured

On fixtures of unread, partial and truncated trees with the other axes real,
the score went 40 (`internal`) to 64 (`beta`), 3 of 3 held. The guards are the
useful half: a tree read whole with build-only CI stays measured (40), no
workflows listed is an observed absence and scores, a partial read that saw
checks keeps `checks` as a lower bound and only security is held
(`passport-held.test.ts`). A rollback override re-derives over the same axes
(71, with the measured 64 kept on the override record), so the hold is not
laundered by the overlay.

Single tree, one landing; the 40-to-64 swing is these fixtures, not a rate.
