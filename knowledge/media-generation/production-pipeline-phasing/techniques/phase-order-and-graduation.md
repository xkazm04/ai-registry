---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: phase-order-and-graduation
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when: [sequencing the phases of a production pipeline, deciding when work may graduate to the next phase, merging or retiring a phase without corrupting existing projects]
---

# Phase order and graduation

The phase order is the pipeline's constitution: which decisions get settled
before which money gets spent. This technique covers three obligations that
come with owning one — declaring it, gating graduation through it, and
changing it without lying about the past.

## Declare the order once, as data

The ordered phase list is a single exported constant that every surface
reads — the stepper, the project shelf, the aggregators, the migrations.
Two rules make it durable:

- **One source.** The moment two surfaces each hard-code the sequence, a
  reorder is a bug hunt. When the order is data, a reorder is one edit and
  every consumer follows.
- **Order by what each phase settles.** A phase belongs before another
  exactly when the decisions it locks are the ones the later phase would
  otherwise gamble on. If you cannot name what a phase settles for its
  successor, it is not a phase — it is a tab.

The boundary test for phase *granularity*: a phase boundary must never cut
through the middle of a single creative decision. When picking a still and
directing the motion given to that still are one art-direction judgment made
against one source image, splitting them into two phases forces the creator
to graduate half a decision — and every reorganization pressure the pipeline
ever feels will push toward re-merging them. Merge phases whose decisions
are inseparable; split phases only along seams where the earlier half can be
genuinely locked while the later half is still open.

## Graduation is a human act, not an inference

A phase graduates — becomes safe to build on — when its decisions are
signed off, and sign-off is something a person does, not something the
system derives. Two consequences:

- **Do not compute "the current phase" from completion.** A helper that
  answers "the first phase not yet done" is only correct if "done" is
  actually reachable, and in a pipeline where sign-off has no control yet,
  it answers "the first phase" for every project, forever. An exported
  derivation that can only ever be wrong is worse than none; report where
  the creator actually is instead.
- **Gate the expensive boundary, and gate it honestly.** The transition
  from cheap phases (words, structure) to expensive ones (renders) deserves
  a machine-checkable gate that reads the artifact itself — not a
  hand-authored table of assertions about it. Per
  [unmeasured-is-not-pass](../../_laws.md#unmeasured-is-not-pass), the gate
  reports pass, fail, or *unmeasured* per promise, plus the fraction of
  promises it could actually execute. A checklist of human-typed "honoured"
  fields is conscientious in prose and permissive in fact; the failures it
  misses are precisely the ones that cost render money downstream, which is
  what [cost-per-usable-output](../../_laws.md#cost-per-usable-output)
  prices.

## The cheap-probe ladder inside a phase

Graduation pressure exists within a phase too. Fidelity — resolution,
duration, sample quality — is a property of the *decision stage*, never a
global knob: draft trials at the lowest fidelity that supports the
comparison, a proof at working quality, final quality only for the promoted
winner. A pipeline with one global fidelity setting pays winner prices for
every loser. The rule: **before any render whose cost you would notice,
there must exist a cheaper probe that could have killed it.**

## Retiring a phase: migrate at the read seam, merge worst-news-first

Pipelines reshape. When a phase is retired and absorbed by a neighbour,
records written under the old shape still name it — as the parked position
and as a progress key — and both are read constantly. The durable pattern:

- **Keep a retirement map** (`old phase → heir`) next to the phase list, and
  apply it at the *read seam* — the one or two functions every load goes
  through — rather than in each surface. A stored position naming a phase
  that no longer exists would otherwise match nothing, and the product would
  silently open somewhere wrong.
- **Make migration cheap and idempotent.** A record with nothing retired in
  it is returned untouched; migrated records need no write-back ceremony.
- **Merge states worst-news-first.** When the heir phase absorbs the retired
  phase's state, the merged state is the *worse* of the two. If the survivor
  was locked but the absorbed phase was blocked, the merged phase is
  blocked. Reporting the survivor as done when half of what it now covers
  had stopped is the one lie a migration must not tell — it converts a
  reorganization into a false pass.

## When not to use this

A single-phase tool — one prompt, one render, one output — needs none of
this machinery; a phase list of one is a title, not a constitution. And do
not add a phase to represent a *tool* rather than a decision: "the phase
where we use the image model" is not a phase unless something graduates
there. Phases are named after what gets settled, or they multiply until the
stepper is a toolbar.
