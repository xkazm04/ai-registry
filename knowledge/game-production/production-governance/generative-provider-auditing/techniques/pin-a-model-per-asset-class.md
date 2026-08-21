---
layer: technique
type: technique
subject: generative-provider-auditing
technique: pin-a-model-per-asset-class
status: forged
laws: [one-authority-per-quantity, a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [adopting a generative model into an asset pipeline, a provider exposes several variants, an asset class keeps failing its budget]
---

# Pin a model per asset class

## The concern

A generative service exposes variants that differ in ways that matter downstream: how
much primitive budget they spend, how much surface detail they invent, which input
modality they are tuned for, how often they emit stray disconnected fragments. Choosing
one variant for the whole pipeline forces every asset class through the same character.
Choosing none — accepting whatever the endpoint resolves to — means no asset in the
build can be attributed to a model at all.

The unit of the decision is the **asset class**, because the asset class is what carries
the budget and the acceptance threshold. A dense hero object and a background prop that
must appear two hundred times in a level are not the same problem, and the model that is
right for one is measurably wrong for the other.

## Procedure

1. **Enumerate the asset classes the pipeline actually produces**, and for each one write
   down its primitive budget and its acceptance criteria. If a class has no budget, the
   pin cannot be justified — fix that first.
2. **Declare one pinned model identifier per class**, in a single place, as a literal
   version string. Not an alias, not a family name, not a "latest" marker.
3. **Record beside each pin what it was chosen for**: the class, the budget it holds to,
   and the date and task set of the benchmark that selected it.
4. **Make the pin the only route to the provider.** Any call path that can reach the
   provider without passing through the pin is an unaudited path; there must not be one.
5. **Re-benchmark on a stated cadence and on provider deprecation notice**, not when
   somebody feels curious. The pin's benchmark date is what makes staleness visible.

## Decision rules

- **When two asset classes share a budget and an acceptance threshold, they may share a
  pin.** When either differs, they get separate pins even if the same identifier happens
  to fill both today — because the next benchmark may split them, and a shared pin hides
  that the two decisions were ever independent.
- **When a variant is faster or cheaper but overshoots the class budget, it is rejected
  for that class**, not adopted with a note to clean up afterwards. A budget handed to a
  generative process shapes what it produces; an arm that ignores it will keep ignoring
  it, and downstream reduction is a second cost, not a fix.
- **When a provider offers a variant tuned for a different input modality** — driven by a
  start image rather than by text, for instance — pin both, one per modality, and state
  which the pipeline prefers. The image-driven route is usually cheaper per unit *and*
  more controllable, because it splits the generation into an inspectable intermediate
  and a second step that only has to animate or extend it. Record the per-unit cost with
  its basis beside each pin; the two modalities rarely cost the same.
- **When one class's benchmark is used to justify a pin for other classes, those other
  classes are unbenchmarked** and must render that way, even though the identifier is the
  same. Extending an audited pairing to an unmeasured class is a reasonable default and a
  dishonest pass; record it as *inherited, unbenchmarked for this class* so the gap stays
  visible and schedulable.
- **When the pinned identifier is retired by the provider**, the pin does not silently
  fall back. It fails loudly and the class is unavailable until re-benchmarked. A silent
  fallback replaces an audited engine with an unaudited one at the worst moment.
- **When a class has never been benchmarked**, its pin state is *unbenchmarked* — a
  distinct, visible value. It is not the same as a pin that survived a comparison, and
  it must not render as one.

## What the pin record contains

Each pin carries, at minimum: the exact model identifier; the asset class it serves; the
budget or acceptance threshold it was selected against; the date of the selecting
benchmark; and, if the choice was close, the arm it beat. Numbers appear with their unit
and their basis — a primitive count is meaningless without saying which primitive it
counts, and a cost figure is meaningless without saying per what.

## When NOT to use this

- **During exploration.** Before any class has a budget, pinning is ceremony. Explore
  freely, then pin before the first output enters a build.
- **For a one-off asset that will be hand-finished anyway** and never regenerated: the
  pin buys reproducibility, and there is nothing to reproduce.
- **Where the provider genuinely exposes only one model** and no versioning at all. The
  pin then degrades to recording that fact, plus the date, so the absence of versioning
  is itself a visible risk rather than an assumption.

## Failure signature

The pipeline produces two batches of the same asset class, weeks apart, with visibly
different density or artifact rates, and nobody can say what changed — because nothing in
the repository changed. That is an unpinned model, or a pin bypassed by a second call
path. The second is more common than the first and harder to see: search for every route
that can reach the provider and confirm each one resolves through the pin.
