---
layer: technique
type: technique
subject: acceptance-verdict-spine
technique: three-layer-merge-order
status: forged
laws: [one-authority-per-quantity, unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [several authorities report on the same unit of work, two surfaces show different colours for one step, designing how an out-of-band runner reports back]
---

# Three-layer merge order

The named concern: **given a local checker's verdict, an out-of-band runner's
outcome, and a craft judgment about the same unit of work, produce one verdict
deterministically.**

## The order and its justification

Authorities are ranked by what they can observe, and applied cheapest first.

| Rung | Authority | Observes | Can decide |
| --- | --- | --- | --- |
| 1 | Local checker | the produced data | shape, content invariants, budgets |
| 2 | Drain overlay | a real run of a runtime or perceptual gate | what the checker had to defer |
| 3 | Craft judge | the artifact as a finished piece | whether the craft clears the bar |

The order is not a priority list where higher beats lower. It is a **pipeline**: each
layer receives the previous layer's result and returns a result, and the layer's rule
says when it is permitted to change anything.

## The procedure

1. Compute the local verdict from the produced data. If the unit's gate needs a
   runtime or a rendered frame, the checker returns the *deferred* status — a
   distinct member of the vocabulary meaning "an authority that can actually look has
   not looked yet". Never `pending`, never `pass`.
2. Apply the drain overlay. **Only** if the local status is deferred and the stored
   outcome is a concrete decision does the overlay replace it, carrying the runner's
   own rung and reason. In every other case the local verdict passes through
   untouched — including the case where a stored outcome exists and disagrees.
3. Apply the judge. A judgment that is current, bound to the content on record, and
   scoped to this unit's judged class may turn a pass into a failure. It may never
   turn a failure into a pass. Attach the judgment's provenance to the result even
   when the judgment was not applied.
4. Return the result. It carries status, rung, reason, and the identity of the layer
   that decided.

## Decision rules

- **When a later authority knows strictly more than an earlier one about the
  specific question, it may act; otherwise it may not.** Every guard in the merge is
  an instance of this. If you cannot state what the later layer knows that the
  earlier one did not, delete the layer.
- **When the drain's stored outcome contradicts a checker that decided for itself,
  keep the checker's verdict and treat the contradiction as a defect to
  investigate** — do not silently prefer either. Two authorities answering a question
  one of them owns is the condition
  [one authority per quantity](./../../_laws.md#one-authority-per-quantity) exists to
  forbid.
- **When the overlay wins, drop the superseded reason.** A deferred reason
  ("nothing has run this yet") displayed beside a concrete outcome is actively
  misleading. Replace it with the deciding authority's own reason.
- **When no judgment exists, return the overlaid result unchanged** — do not
  synthesise a neutral judgment, and do not treat the absence as a pass.
- **When the merge must run in more than one runtime** (an authoring surface and a
  headless service, say), make it a pure function whose inputs are supplied by the
  caller. Each environment reads the stored verdicts from its own store; neither
  imports the other's. Purity is what makes "the same three inputs give the same
  verdict anywhere" checkable.

## Ordering is not an optimisation surface

The temptation, always, is to reorder by data availability — apply the judgment first
because it was already loaded, skip the overlay when the store is cold. Resist it.
The order encodes semantics; changing it changes verdicts. If a layer's input is
expensive, make the layer lazy, not early.

Equally: the merge does not re-grade. It never calls a generator, never re-runs a
runtime gate, never asks a judge for a fresh opinion. It reads verdicts that already
exist and combines them. A merge with a side effect cannot be replayed, and replay is
the property that makes it trustworthy.

## When NOT to use this

- **When the authorities genuinely measure the same quantity with equal standing.**
  Then you do not have a layering problem, you have a duplicate-implementation
  problem: delete one.
- **When there is exactly one authority.** Do not build the spine speculatively. Build
  it the moment a second authority appears — which is the moment the surfaces start
  disagreeing.
- **When the layers are peers whose disagreement is itself the signal** (two
  independent evaluators cross-checked to measure evaluator reliability). That is a
  measurement problem, not a resolution problem, and forcing a total order over it
  destroys the data you were collecting.
- **Where the "layers" are really tiers of one authority.** Rungs of an evidence
  ladder inside a single checker are composition, not merge; use the composition rule
  for reporting instead.
