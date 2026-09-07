---
layer: application
type: application
subject: generative-provider-routing
technique: unspent-budget-is-a-defect
stack: node
status: forged
verified_on: 2026-09-07
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# Node — teaching a one-directional spend meter to see downward

`gravitone-gcloud` meters every image call in `lib/imaging/budget.ts` behind
the router chokepoint. The version witnessed here is the CI pin in
`.github/workflows/gates.yml:250` (`node-version: 22`), not the dev box's
runtime — the repository declares no `engines` field, so the pin is the only
version the tree itself asserts.

The tree is a strong realization of this subject already: the plan in
`router.ts` is ordered by a measured 60-cell grid, the ledger row carries the
same axes as the log line, and the ceiling refuses before any vendor is
touched. That is what makes it a useful place to test this technique — the
gap found here is not laxity, it is a blind spot in a careful instrument.

## The structural fact: a careful enumeration, entirely one-directional

The budget module documents its own history in a header block, and that block
is the finding. It says:

> A ceiling that never reports its own activity is only half a limit. **Two
> things** used to happen silently here and now do not — refusals were not
> counted; the window reset was invisible.

Both additions look *upward*. Refusal volume is the ceiling's health metric;
the eviction trace explains a falling total. The enumeration closes at two,
and a third case fits its own premise exactly and is absent: a window that
spends almost nothing, on the cheapest provider in the plan, while the entry
the grid put first is never called. Nobody designed that omission — it fell
out of every control in the file having been written to answer the question
"is this run spending too much".

The raw material was already present, which sharpens rather than softens the
point. `spendByAxis().byProvider` reports spend per provider, so a human could
in principle notice. But it is flat across capabilities: a provider that
served one `recognize` call reads as "called" for `generate` too. The data
existed and the *verdict* did not, which is
[unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) at the
window level rather than the call level.

## What was added

Three small pieces, all on the reporting side of the gate:

- `budgetFloorUsd()` and `FLOOR_VAR`, with `floorUsd` and `underFloor` on
  `budgetStats`. Nothing here is read by `assertWithinBudget`, so declaring a
  band cannot change who gets refused — the same discipline the existing
  counters were built under. `underFloor` requires a non-empty window: an idle
  meter is arithmetically under any floor, and reporting it would make the
  signal worthless.
- `reachByCapability()` — which providers actually *served* each capability,
  excluding `failed` rows, because a vendor that was reached and fell over did
  not serve the work.
- `unreachedPlanTops()` in the router, where the plan lives, so the verdict is
  computed against the table rather than restating it.

## The paired proof

The measurable named before the change: **how many run-level dispositions the
meter can distinguish.** Two windows were built from real plan vendors and
real grid prices — a thrifty one (a single $0.0257 fallback call) and a
healthy one (40 × $0.045 on the plan's top entry) — and fed through both arms.

| Arm | Fields read | Thrifty | Healthy |
| --- | --- | --- | --- |
| A (pre-change) | refusals, bookedFailed, unpriced, over-ceiling | clean | clean |
| B (post-change) | `underFloor`, `unreachedPlanTops` | `true` / 1 | `false` / 0 |

Arm A returns the same verdict for both: 1 disposition. Arm B separates them:
2. **The arm-A control ships as a committed test**, which is the part worth
copying — without it the second result is a restatement of its own
implementation rather than evidence that the gap was real.

21/21 pass in `imaging-budget.probe.spec.ts` (4 new), `tsc --noEmit` and
`eslint` clean.

## What the realization cannot do

The floor is a **declared band, and nobody has calibrated one against real
traffic**. This run proved the instrument fires on constructed windows; it did
not establish what a production floor should be, and a badly chosen one turns
a useful report into noise an operator learns to ignore. The technique's own
rule — the floor is reported to a human, never enforced — is what keeps a
miscalibrated band cheap, and it is the reason the field was kept off the gate
path rather than a stylistic preference.

Nor does it separate the two explanations for an uncalled top. It reports the
fact; deciding between "the grid is stale" and "the work never got there"
still needs a person, and the technique says so.

## The second instance, found by the test

Writing the per-capability reach test surfaced a live case nobody was looking
for. The dev plan lists `recognize: ["ollama", "google"]` — the local eye
first, at $0, explicitly so that a box with a daemon never pays for
recognition. A `recognize` served by the cloud vendor therefore leaves the
plan's top uncalled, and until now nothing anywhere said so; the per-call
elimination trail cannot, because no single call departed from the plan.
That is the technique's second explanation (the work never reached the entry)
rather than its first, and it is a $0-vs-billed difference rather than a
quality one — which is exactly the shape a spend meter should have caught and
could not.
