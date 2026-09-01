---
layer: application
type: application
subject: generative-artifact-gating
technique: placeholder-is-not-an-asset
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Node — a step pipeline that already ran three origins, and named two

`pof` is a Next.js catalog/lab app whose Items pipeline carries thirteen authored steps
(`src/components/layout-lab/steps/itemsSteps.ts`, `ITEM_STEP_SPECS`). Each one owns a
`produce` that emits an artifact and an `accept` that grades it. The app states the
two-valued origin rule this technique used to carry, verbatim and in two places — the
caption constant `SEED_PREVIEW_CAPTION` in
`src/components/layout-lab/steps/shared/assetHonesty.tsx`:

> Deterministic seed preview — not the generated asset.

and the collector in `src/components/layout-lab/steps/shared/stepEvidence.ts:26`, whose
`url` field is documented as *"The served URL of a real artifact. Never a swatch, never a
data-derived placeholder."* Both encode the same disjointness: a served reference is real,
a locally computed value is not.

## What the tree does with its own rule

Only two of the thirteen steps are generative — `Icon 2D Art` and `3D Generation` — and
both correctly return `deferred` when no generated asset stands behind them. The other
eleven construct their artifact locally, in `produce`, from the entity and the project's
own canon: an attribute schema, an economy curve, a tooltip projection, a packaging
manifest. Not one of them defers to a generator, and there is no generator for them to
defer to.

Under the two-valued rule those eleven artifacts are deterministic stand-ins, and the
prescribed verdict is *defer, naming the missing artifact — the generator must run*. The
app does the opposite for all eleven, and the app is right. Nobody designed this as three
origins; it fell out of building one pipeline over two kinds of producer, and it is the
clearest available evidence that the origin axis has three values rather than two.

## The A/B

**The measurable:** of the thirteen steps, how many does each origin policy classify
correctly — where *correct* means the verdict matches whether real work stands behind the
artifact?

**Arm A, two-valued origin** (generated | deterministic stand-in): 2 of 13. The two
generative steps land right; the eleven constructed ones are classed as stand-ins awaiting
a generator run.

**Arm B, three-valued origin** (generated | constructed | stand-in): 13 of 13. The eleven
carry construction evidence — the schema, the curve and its stated basis, the manifest —
and grade on their own terms; the two generative ones carry a served URL and a history, or
they defer; the swatch carries nothing and is excluded from evidence, exactly as before.

Arm B's classification is only worth anything if those eleven artifacts are genuinely
graded rather than merely present, which is what the second instrument establishes.

## The instrument, and the two ways it lied first

The probe is this technique's own mutation probe, added to the project as
`src/__tests__/components/layout-lab/stepAcceptanceMutation.test.ts`: take each step's own
produced artifact, mutate it, re-run that step's `accept`, and record whether any mutant
moves the status. **Result: 13 of 13 sensitive, 0 insensitive.**

The first version of the probe reported four insensitive steps, and all four were the
instrument's fault. Both faults are worth carrying, because a probe that under-reports
sensitivity indicts working gates:

- **It mutated every value at once.** `Economy` grades a cost against a curve derived from
  power; scaling every number uniformly preserves the ratio, so the verdict cannot move.
  Mutate **one leaf at a time**.
- **It walked only the top level.** `Attributes` produces `{ stats: { … } }` — a single
  top-level object — so no top-level mutation ever reached a number the checker reads.
  **Recurse**, and delete keys as well as perturbing them.

That is the same lesson this subject already teaches about remedies, applied to a
measurement: an instrument earns its verdict by being checked against a case whose answer
is known, never by being plausible.

## What this realization cannot do

The three origins are implicit here — they are a consequence of which frame a step lives
in (`StaticStepFrame` versus `GenerativeStepFrame`), not a declared property of the asset
class. The technique asks for a declaration, and this tree has none: nothing would stop a
fourteenth step from being added to the wrong frame, and nothing would report it. That
matters more than it used to, because the two frames were recently put on one shared
`useStepAcceptance`; convergence onto a single grading path is exactly the moment a
two-valued origin read at that junction would start deferring eleven finished steps.

The probe also grades only sensitivity, not correctness. A step whose verdict moves under
mutation is checking *something*; whether it checks the right thing is a separate rung and
a separate rubric.
