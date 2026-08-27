---
layer: technique
type: technique
subject: character-identity-continuity
technique: identity-ruler-calibration
status: forged
laws: [unmeasured-is-not-pass, refusal-is-a-state]
shared_with: []
use_when: [choosing an instrument to score character consistency, someone reports a consistency number with no scale under it, a batch scores well on identity but looks wrong, deciding whether a wide shot can be scored at all, building a regression probe for a character pipeline]
---

# Calibrating the identity ruler

A cosine distance printed on its own is a number with no units. Before any
instrument is allowed to judge generated characters it must be shown material
whose answer is already known, and it must get that material right. This
technique is that procedure. It is cheap — it runs on stills that already
exist — and it is the highest-value step in the subject, because the
alternative failure is silent.

## The rungs, built from real material

Take a real sequence in which the same people recur across real cuts, and cut
character crops for at least three rungs:

    WITHIN     one person, two moments of a single continuous take
    FLOOR      one person, two shots across a real cut — different framing
               AND different lighting, because that is what generated shots face
    CEILING    two DIFFERENT people in the same costume, same location,
               same light, same framing

A fourth rung — two people who look nothing alike — is worth computing once to
show the instrument has range, and proves nothing thereafter. Beating an easy
ceiling is not evidence.

**The ceiling is the load-bearing rung and it must be hard.** Two different
people in matching costume under matching light is the failure that actually
happens in generated work — "who is that, and why is he wearing his jacket".
An instrument that only separates a protagonist from a creature in prosthetics
has not been tested against anything.

## The inversion check, which comes before any verdict

Compute the rungs and read their order. The expected order is
`WITHIN < FLOOR < CEILING`. If it does not hold, **stop** — do not adjust
thresholds, do not average, do not proceed to score generated work. The
instrument is answering a different question than the one asked, and every
number it goes on to produce will be wrong in a direction nobody can see.

This is not a hypothetical guard. A general-purpose self-supervised image
embedding — the family that is *correctly* recommended for separating style —
inverts on this test: it can place two different people in matching costume
nearer each other than one person across a cut, because it reads costume,
palette and framing loudly and identity quietly. The same property that makes
it the right style instrument makes it the wrong identity instrument. An
instrument is not general-purpose just because its inputs are.

What passes the check is an embedding trained for **recognition** — one whose
whole objective is to separate individuals under changes of pose and light.
Choose on the calibration result, never on reputation.

## Two axes, because identity alone can be gamed

Score every pair on two instruments and report both:

- **Identity** — the recognition embedding, calibrated as above.
- **Difference** — whether the two outputs are distinct pictures at all. A
  general image embedding is the right tool for this second job, and the trap
  above becomes a feature: it is sensitive to framing and content, which is
  what "are these two different shots" means.

Identity near zero *with* difference near zero is not consistency, it is
collapse — the reference reproduced instead of incorporated. A pipeline
watching only the identity axis reports its best score at the moment it stops
producing shots. The difference axis is what catches that, and it is the
cheaper of the two to add.

The difference axis needs a rung too, and it is the same real material: two
shots of one character across a real cut, which changes framing on purpose.
"Our framing change costs no more than a real one" is the claim it supports.
It gets no meaningful ceiling — see the inversion above — so publish it as a
floor to stay under and not as a pass/fail.

## Where the instrument must refuse

Recognition embeddings operate on a normalized crop of fixed size. A detected
face far below that size is fed interpolation and returns a confident vector
that encodes noise. There is no error, no warning, and the number looks
exactly like a measurement.

- **Set a minimum subject size and refuse below it.** In practice the two
  populations are nowhere near each other — real faces in medium and close
  shots are many times the threshold, and wide-shot faces are a small fraction
  of it — so this is a floor to declare, not a parameter to tune. Verify that
  gap in your own material rather than assuming it.
- **Refuse on no detection at all**: back-of-head, heavy occlusion, prosthetics
  and stylized faces all return nothing, and nothing is a result.
- **Report refusals as refusals.** Per
  [refusal-is-a-state](../../../_laws.md#refusal-is-a-state), an unscoreable
  pair is named and counted, never dropped from a mean. A batch whose average
  looks fine because half its pairs vanished has not been measured.

The domain limit is not a defect to engineer away. Wide shots carry identity
through silhouette and costume, which is the other instrument's job — so a
mixed sequence is a two-instrument measurement by construction.

## Keep the crop out of human hands

Choose the subject crop with a detector, by one rule applied identically to
the reference material and to the generated output. Hand-drawing a box around
work you have already looked at is the anchoring failure in different
clothing, and it is unavailable here for the same reason a grader is not shown
the answer it is meant to produce.

## Decision rules

- When the instrument changes — new embedding, new detector, new crop rule —
  recalibrate before trusting a single downstream number; the rungs are cheap
  and the claim was re-opened.
- When the inversion check fails, discard the instrument rather than the
  expectation. There is no threshold that repairs a sign error.
- When a generated pair scores between FLOOR and CEILING, report the interval
  honestly — "closer than two different people, further apart than one person
  across a cut" — rather than rounding to pass or fail. That interval is the
  actual finding.
- When a pair is unscoreable, say so in the same breath as the score, and
  never let the scoreable subset stand in for the batch.
- When the numbers pass and a cold human viewer says the character changed,
  the human is right and the instrument's domain is wrong — extend the
  measurement, do not relitigate the viewer.

## When not to use it

This calibration answers "can I trust this instrument" — a question asked when
the instrument is built, when it changes, and when a result surprises someone.
It is not a per-shot gate. Production shots are scored against the calibrated
scale directly; re-running the rungs per frame spends the measurement budget
on a question already answered.
