---
layer: application
type: application
subject: coalition-and-portfolio-strategy
technique: proportional-subgrant-split
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A proportional split that did not add up to the award

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-14 at `95e719d` on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `8be3ab0` on the project's `main`.

## The tree already derived the split from revenue, and then broke the sum

The technique says derive each member's share from verified revenue, present it in whole
percentage points, and write it into the agreement. The coalition proposal does the first two:
share is member revenue over combined revenue, rounded to two decimals. But each share was
rounded on its own, so the set did not reconcile. Three equal members came out as 33, 33 and 33,
a split of 99 percent that no signed agreement can carry and that leaves one point of the award
unassigned. The project's own test only required the sum to land between 0.98 and 1.02, which is
a written-down acceptance of the drift.

## A and B

The seam was chosen because it could falsify the technique's premise that whole-point shares are
safe to present: if independent rounding had always summed to 100, the premise held without help.
It did not.

- A (shipped behavior): 500 seeded random revenue mixes of two to six members, shares rounded
  independently. 136 of 500 summed to something other than 100 points.
- B: largest-remainder allocation in whole points (floor each share, hand the leftover points to
  the largest fractional remainders, ties to higher revenue). 0 of 500 miss; equal thirds give
  34, 33, 33.

Target: proposals whose shares sum to exactly 100 points, 364 of 500 to 500 of 500. Floor: the
216 match-engine tests, the type check and lint stayed green, and the lead is still listed first
with unchanged ordering. Not measured: any effect on how members negotiate the anchor, and the
scope-of-work and lead-administrative adjustments the technique puts after it, which the tree
does not model.

## What it taught

Rounding each share is not the same as presenting a split. The technique's visibility argument
(an allocation whose formula is stated gets negotiated around) fails if the stated shares do not
sum to the whole. The technique gained a decision rule for it.
