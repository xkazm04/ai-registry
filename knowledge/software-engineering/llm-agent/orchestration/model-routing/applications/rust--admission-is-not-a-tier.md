---
layer: application
type: application
subject: model-routing
technique: admission-is-not-a-tier
stack: rust
verified_on: 2026-09-20
verified_against: rust@1.96.1
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The probe asks what an endpoint is, and the generator discovers what it accepts (Rust)

Run 2026-09-20 against a Rust benchmark engine whose `openai` provider path can
be re-pointed at any endpoint speaking the shared completion protocol, so an
operator can benchmark a local runtime instead of the hosted origin. The witness
is the repository's toolchain file, which pins the channel to `1.96.1` and says
in its own comment that CI names no version anywhere else, so every gate is a
function of that one address — the strongest version fact this tree states about
itself, and one that cannot drift from what CI actually ran.

The seam was chosen to falsify. The engine already has an **endpoint probe**
module that runs before a benchmark run whenever the base is re-pointed, and its
own doc comment says it exists to ask an endpoint *what it is* before a row is
attributed to it. A tree that already probes endpoints is the place where this
technique is most likely to be re-derivation of known practice rather than a
finding — and had the probe covered admission, the landing would have been
withdrawn.

## The arm that was run, and refuted

The technique names three admission surfaces, and the **liveness contract** was
the one this tree looked most exposed on: the probe caps every request at a 2s
timeout on its own client, while the generation client is allowed 120s. The
predicted defect was a false negative — a local runtime busy loading a large
model answers the probe too slowly, resolves as unidentified, and the run
records an endpoint it could in fact have used.

- **Target**: worst probe-route latency against the 2.0s cap.
- **Floor**: the endpoint must be genuinely usable in the same window, or a slow
  probe is a true negative and there is no finding at all.
- **Arm A**: the three probe rungs against an idle local runtime.
- **Arm B**: the same three rungs while the runtime loads a 17 GB model.
- **Known positive**: an origin with nothing listening, to prove the timer fires.

The known positive hit 2.04s, so the instrument was sound. Arm A returned 0.00s
on all three rungs. Arm B returned 0.03s, 0.01s and 0.00s — and the floor held,
the concurrent generation completing in 6.9s. **The prediction was wrong and the
cap is well chosen**: this runtime serves its metadata routes off a path
independent of the model loader, so the rungs stay fast precisely when the
endpoint is busiest. A run that had assumed the defect and "fixed" the timeout
would have loosened a bound that is doing its job.

## What the seam returned instead

The probe resolves identity from metadata routes only — a native route, the
shared protocol's model listing, then a root banner. **It never issues a
generation**, which is correct for its stated purpose and is exactly why it
cannot answer the technique's first surface: *which request fields will this
endpoint accept?* That question is answered nowhere before a run.

It is answered during one, reactively, and the tree records the tuition. The
request builder carries a comment that some reasoning models reject a sampling
parameter it pins, pointing at a fallback in the deterministic entry point. That
fallback catches a bad-request rejection and re-issues the call **schema-less
and non-deterministic** — dropping the structured-output schema and the pinned
temperature and seed together.

The structural fact is in what that costs the artifact rather than the call. The
judge path documents determinism as the property that makes a verdict *a
measurement* — it requests a pinned temperature and a fixed seed for exactly
that reason. So the one function whose name promises determinism is the one that
can stop being deterministic, on a rejection that has nothing to do with the
answer, and the resulting row is shaped identically to a row drawn under the pin.
The degradation is announced on standard error, which is a channel no stored row
reads.

That is this technique's loud/silent split landing on opposite sides of one
event: the **admission failure** is loud, and the **degraded contract it leaves
behind** is silent in the artifact. It is also the inversion the technique
describes, seen from the receiving end — the field that triggered the rejection
was not the answer's, it was the pin's, and an endpoint that never advertised
its accepted parameter set could only refuse them at generation time.

## What this realization cannot do

The probe cannot report admission, and should not be asked to: attribution and
admission are different questions and this module answers the first one well.
Nothing here measures how often the strip fallback fires in practice — the tree
carries no counter for it, so the frequency is unknown rather than low, and this
application does not claim otherwise.

## The change this argues for, not made here

Carry the degradation into the outcome so a row can record the contract it was
drawn under, rather than leaving it on standard error. That is a type change
across an engine crate with several call sites, not a few lines a reviewer reads
in one diff, so it is filed as the project's next change rather than shipped
from this run. The measurable it would move is the share of stored rows whose
determinism is knowable from the row itself, which is currently zero for rows
that took the fallback and is not distinguishable from 100%.
