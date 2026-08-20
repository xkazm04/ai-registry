---
layer: technique
type: technique
subject: production-pipeline-phasing
technique: shared-clock-across-phases
status: forged
laws: [refusal-is-a-state, unmeasured-is-not-pass]
shared_with: []
use_when: [designing the data contracts between production phases, assembling picture voice and music onto one timeline, diagnosing where a multi-phase production is jammed]
---

# Shared clock across phases

A produced video has exactly one clock: its runtime, in seconds, from zero.
The technique is to make every phase speak in that clock from the moment a
runtime target exists — scene targets, narration segments, music cues,
timeline clips all addressed as start-and-duration on the same axis — so
that the assembled product is a *join over time* rather than a pile of
per-phase outputs someone must reconcile at the end.

## Why one clock, structurally

Phases that keep private clocks — the script counts beats, the score counts
bars, the cut counts clips — can each be individually green while the
assembled product has gaps and drift no surface can locate. The failure
announces itself only at assembly, the most expensive place, as a vague
"the score phase is behind". With a shared clock the same defect has an
address: *seconds 13–26 have picture but no music; the cue covering that
region was refused.* "Where is this jammed" becomes a query, not an
investigation.

The clock is also what lets phases proceed in parallel honestly. Score can
be commissioned against the runtime the script settled — cue boundaries at
the seconds where scenes turn — before the frames exist, because both sides
reference the same axis. Without it, parallel phase work is a bet that two
private clocks will happen to agree.

## The contract: start and duration on one axis

- **The runtime target is set upstream and inherited downward.** It is
  seeded early — from a format template — then owned by the creator; every
  phase reads the same figure. Per-scene targets partition it; cue spans
  tile it; clip positions live inside it.
- **Everything placed in time carries `start` and `duration` in the shared
  unit.** Not indexes, not orderings — actual seconds. Ordering is derivable
  from time; time is not derivable from ordering.
- **Structural markers are data on the clock.** The story's turn, the act
  boundary — recorded where they fall in seconds, so the cut can place its
  markers and the score can hit them without re-deriving narrative structure
  from prose.
- **Deliberate deviations are annotated, not silent.** A music tail ringing
  past the picture, a narration entering a beat early — when intended, the
  record says so, because on a shared clock every overhang is otherwise
  indistinguishable from a mistake.

## Absence on the clock is shown, never papered over

The shared axis makes holes visible, and the discipline is to keep them
visible. A refused music cue is a span of the clock with *silence, and a
label saying why* — per
[refusal-is-a-state](../../../_laws.md#refusal-is-a-state), the assembled
preview plays the silence and says so, rather than stretching a neighbour
cue or dropping the region. A missing render is a clip slot marked
*missing* at its true position and duration. Known drift — a voice segment
landing a fraction of a second late — is carried as a measured offset on
the record, not absorbed by nudging the data until it looks aligned.

This is [unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass) in
timeline form: a cut that renders only what exists, gap-free, is claiming a
completeness nobody checked. The honest timeline shows *ok*, *missing*, and
*drift* as first-class per-clip states, and the sum of what is honestly
placed is the real progress of the production — which is how the shared
clock feeds worst-news-first aggregation: the phase with a hole at second
13 is the phase that is not done, however finished its own private view
looks.

## Keeping the clock authoritative

- **One writer per span.** The phase that owns a region's content owns its
  timing record; assembly reads, it does not silently adjust. When the cut
  needs a change — a scene trimmed — the change flows back to the owning
  phase's record, or it is an annotated cut-side offset; it is never an
  unrecorded divergence between two copies of the truth.
- **Re-timing is a migration.** When the runtime target moves, every span
  built on the old target is now suspect; the change is an explicit event
  that marks dependents for review, not a field update whose consequences
  each phase discovers alone.

## When not to use this

Before a runtime target exists — pure research, early drafting — forcing
seconds onto material is false precision; the clock starts when the format
commitment does. Still images and single-frame work have no time axis and
gain nothing from one. And do not extend the shared clock into *wall-clock*
scheduling — when work happens is job-layer business; the shared clock is
the product's internal time only, and conflating the two axes ruins both.
