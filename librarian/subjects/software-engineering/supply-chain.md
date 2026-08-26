---
subject: supply-chain
domain: software-engineering
last_touched: 2026-08-26
touched_by: intake
dry_streak: 0
---

# supply-chain

First touch: [[2026-08-26-next-16-3-3-fleet]], operator dispatch about a web
framework's patch release. `update-automation-review` gained
`## When the dependency is the framework`; the subject gained its first
`next`-stack application (`next--update-automation-review`,
`verified_against: next@16.3.3`) and the bundle gained the `next` stack plus a
90-day currency window, half the react window, because a citation against this
stack is routinely a claim about a default a *patch* release can retire.

## What the amendment adds, and what it contradicts

The technique tiers **patch bumps as the lightest tier and an auto-merge
candidate**. The amendment is a counter-example to that tier, not a refinement
of it: a patch release of a framework retired a capability one fleet member had
explicitly configured. The tier is priced on the size of the diff; the
amendment argues the reach of the package belongs in the price too.

The structural claim underneath, and the reusable half: **declaratively
requested capabilities have no test surface.** A suite asserts behavior it
calls. A capability requested in config and delivered by the framework is
asserted by no call site, so its removal is green. This is a general statement
about configuration, not about any framework, and it is the part most likely to
be wanted by a neighbouring subject.

## Boundary, stated because it was contested during the run

Four subjects were read for their boundary statements and all four scope *away*
from adopting a framework version across a fleet:

- this subject owns **trust crossings** guarded by mechanical policy;
- `build-and-release/build-economics` owns the **cost of iterating**;
- `operations/perf-instrumentation` owns **the product measuring itself in
  production**;
- `standards-and-gates/multi-project` owns the **portfolio management layer**.

The amendment sits inside this subject because the occasion was an advisory and
the reader arrives via the update-review path. That placement is defensible for
one sighting and should be revisited at two - see the lead below.

## Banked (single-sighted)

- **`framework-stewardship` as its own subject.** Four candidates from one run
  (framework-vs-library reach, label-vs-effect, fleet version coherence, the
  test-surface gap) landed in or beside this subject without any of them being
  about trust. Return condition: a second framework in a different ecosystem
  producing the same shape. At two sightings the amendment should be promoted
  and split out, with this subject keeping only the trust half.
- **The declarative-capability inventory wants a tool.** Documented in the
  amendment as a habit; reconstructed by hand during this run. Return
  condition: a connected project adopting it, or `scripts/fleet-deps.mjs`
  growing a lane that reads config surfaces rather than manifests.
- **The exposure window is named as the metric and has never been measured
  here.** The fleet learned of a critical advisory because an unrelated question
  was asked. Return condition: a watch lane that produces the number.
