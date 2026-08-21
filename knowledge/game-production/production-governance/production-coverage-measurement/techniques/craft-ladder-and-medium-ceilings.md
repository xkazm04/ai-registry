---
layer: technique
type: technique
subject: production-coverage-measurement
technique: craft-ladder-and-medium-ceilings
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [reporting craft quality across a whole project, a generated medium cannot reach the commercial bar, deciding what a project-wide quality headline may claim]
---

# Craft ladder and medium ceilings

The second axis: how far each item's craft sits from the standard of work that actually
ships in its genre — reported project-wide, orthogonal to readiness, and bounded per
medium by a dated market assumption about what that medium can currently reach.

## The ladder

Five levels, ascending, graded absolutely against shipped work:

| Level | Name | Meaning |
| --- | --- | --- |
| 0 | ungauged | No craft verdict, or the verdict predates the current rubric version. |
| 1 | hobby | Would not survive any professional review. |
| 2 | indie | Competent and shippable in a small commercial title; systematic gaps against professional practice. |
| 3 | professional | Professional craft; misses named top-tier-differentiating practices, and the findings cite which. |
| 4 | top-tier parity | Indistinguishable from the rubric's named reference anchors for this deliverable class. |

Level 0 is a real level with a real meaning, never a zero score. It is the value an
absent verdict takes, and keeping it on the same scale is what lets an aggregate say how
much of the project has never been looked at.

## Ceilings

A **ceiling** is the highest level a given generative medium is currently assumed to
reach — a recorded, dated, revisitable market assumption, not a fact about your team.
Each ceiling carries three fields: the level, a class, and a stated reason.

The class is the important part, because it says what the ceiling means:

- **uncapped** — the medium is expected to reach parity; the gap is work to be done.
- **arguable** — the medium plausibly reaches its recorded level today and the level
  above is unproven; revisit as the model market moves.
- **permanent** — the medium is assumed never to reach the top; reaching its recorded
  level *is* the roof for this class.

Ceilings vary widely and honestly by medium. Text, structured design data and code
plausibly sit uncapped at parity. Generated 2D imagery arguably reaches professional
today with parity unproven. Generated 3D geometry and generated motion are commonly
recorded as permanently capped two levels below parity, because hand-keyed and captured
pipelines still define the top of those crafts. Changing a ceiling is a product decision
and the reason field is where it is argued.

**A thing at its ceiling renders as achievement, never as a warning.** This is the whole
point of recording ceilings. Without them a generated mesh sits forever amber at a level
it can never leave, the board reads as a permanent failure, and readers learn to ignore
that column. With them, the same item reads as *at roof*, and the remaining gap is
correctly attributed to a capability ceiling rather than to missing effort.

## The project-wide headline: distance to roof

The aggregate that actually drives work is not the mean level and not the share at
parity. It is **the sum, across items, of levels remaining to each item's own ceiling** —
the total climb the project still has available to it.

- An ungauged item counts its **full** distance: nothing gauged means the whole climb
  remains. This is what stops "we have not looked" from reading as "nothing to do".
- An item scored above its ceiling — because a ceiling was later lowered — clamps to
  **zero**, never negative. A negative distance would silently pay for another item's
  gap.
- The figure carries its basis whenever quoted: distance to *ceiling*, not to parity.
  Quoting it as distance-to-parity overstates the achievable work by exactly the sum of
  the permanent caps.

## Invalidation: two states above the level

A level alone is not a report. Carry a state with it.

**Stale** — the artifact changed after it was gauged. The level shown grades content the
item no longer holds and must not be reported as current.

**At ceiling** — at the recorded roof for its medium; renders as achievement.

**Precedence is stale first, then at-ceiling, then plainly gauged.** A stale at-ceiling
item would otherwise read as "roof reached" about content nobody has gauged, which is
the most flattering possible reading of the least evidence.

A third invalidation runs through the rubric itself: **a verdict scored under an older
rubric version drops to ungauged, not to its old level.** Rubrics change only by a
version bump, and the bump must visibly invalidate the verdicts beneath it rather than
silently re-meaning them. An old lenient pass that keeps an item green under a stricter
rubric is the exact mechanism by which a tightened standard produces no change on the
board.

## Decision rules

- **When a craft score would influence a readiness grade, sever the path.** Store the two
  in separate records and pin the separation with a test. Adjacency is enough for leakage.
- **When a criterion cannot name a reference standard at its level, it is not a craft
  criterion.** Grade against what ships; correctness is the floor, not a passing grade.
- **When an item has no verdict, report ungauged — never a middle default.** A neutral
  number standing in for an absent measurement is the failure this whole model exists to
  prevent.
- **When a ceiling is at issue, argue the reason field, not the level.** A ceiling without
  a written reason and a date is an opinion that will be re-litigated every quarter.

## When not to use it

- **To author the rubric.** What each level means for a given deliverable class, and
  where a medium's ceiling belongs as a property of that rubric, is a rubric-authoring
  concern. This technique consumes the rubric and reports across a whole project.
- **To grade one finished piece as a piece.** Judging a single generated output on its
  own merits is general generative-media craft. Here the level exists to be aggregated.
- **Where no reference standard exists.** A genre with no shipped comparator has nothing
  to grade absolutely against, and a ladder built anyway will quietly become a curve.
