---
layer: application
type: application
subject: test-input-generation
technique: seed-is-not-a-reproduction
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.80.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# 50 of 50 seeds re-point, and 38 of 50 persisted inputs come back wrong (Rust, proptest)

This tree runs a property suite over a timeline compiler at 1,024 cases per
property (10,000 on a bake), with composed, documented generators. A prior
application against the same suite recommended one specific repair: the video
generator pins `trim_end` to `0.0`, so the invariant that fires when a clip's
source end exceeds its media duration is unreachable, and the fix is to draw
`trim_end` instead of pinning it.

That makes this the ideal place to test the present technique, because the
recommended repair is exactly the kind of edit the technique says will
invalidate recorded seeds — and it was recommended in writing, by us, before
this measurement existed.

## The two arms

Measurable: **does a recorded seed still name the same input after the repair?**
Both arms run the shipped strategy's exact draw order and ranges — same tuple,
same bounds, same pinned fields — over 50 fixed seeds.

- **Arm A** — the generator as it ships (`trim_end: 0.0`, pinned).
- **Arm A′** — the same seeds, the generator after the recommended repair: one
  additional `0.0..5.0` draw appended to the tuple. Nothing else changes.
- **Arm B** — arm A's derived input, serialized and deserialized, compared to
  the original structure field by field.

A control runs first, because the rest means nothing without it: the same seed
through the same generator, twice.

| measurement | result |
| --- | --- |
| control — same seed, same generator | **50/50 identical** |
| arm A′ — same seed, repaired generator | **50/50 DIFFERENT** |
| arm B — persisted input round-trip (defaults) | **12/50 bit-exact, 38/50 lossy** |
| arm B — persisted input round-trip (exact decode enabled) | **50/50 bit-exact** |

## What the first two rows establish

**Every single seed re-points, and not subtly.** One added draw at the end of a
tuple shifts the entire subsequent draw sequence, so the recorded case does not
drift — it is replaced. In the first differing pair, arm A produced three clips
from files `a`, `c`, `b` starting at 4.15, 33.06 and 2.21 seconds; arm A′
produced three clips from `a`, `a`, `b` starting at 4.15, 37.44 and 13.22, with
every downstream field different. Only the first clip's leading fields survive,
because they are drawn before the insertion point.

This is not a probabilistic claim needing a confidence interval. It is
structural: 50/50, and it would be 50/50 for any seed. The technique's central
assertion — that the repair for a defect invalidates the entry recording that
defect — is confirmed against a repair this corpus had already recommended for
unrelated reasons.

## The finding that was not expected: the remedy has its own precondition

Arm B was included as a control, on the assumption that a serialized structure
obviously round-trips. It does not.

With default settings, **38 of 50** persisted inputs came back differing by one
unit in the last place on at least one floating-point field. Verified at bit
level on a single value: the writer emits `1.9772409946053717`, which is the
correct shortest round-tripping representation; the language's own standard
library parses that string back to the original bits (`…fd5`); the JSON
library's default decoder returns `…fd4`. So the loss is in the decoder, not in
the format, the text, or the writer.

The library documents an opt-in that makes decoding exact. Enabling it moved the
identical measurement to **50/50 bit-exact**, which is what turns this from a
complaint into a finding: the default is a deliberate, documented trade of
exactness for decoding speed, and it is inherited by every project that never
looked. A regression lane built on the naive reading of this technique would
have replayed *neighbours* of its recorded cases on three quarters of them.

The technique gained a section from this, and the section is the one a reader
most needs: persisting the derived input is necessary and not sufficient, and
the round trip must be asserted rather than assumed.

## Does one unit in the last place matter here?

For this suite, on today's assertions, no — and saying so is part of the
finding. Its frame-alignment property compares against a 1e-6 tolerance, and the
observed error is around 4e-16. A replayed case would reach the same verdict.

But that is a fact about the assertions, not about the practice. The suite's
compiler does boundary arithmetic on exactly these fields — trim offsets against
media duration, output spans snapped to frame boundaries — and the invariant the
prior application identified as unreachable is a **strict inequality against a
duration**. A defect parked one ULP outside a boundary is precisely the defect a
widened generator would find and a lossy replay would lose.

## Verdict and what follows

`better`. The technique's claim held at 50/50 against a repair we had already
recommended, and applying it surfaced a precondition the technique did not
originally carry.

The indicated change to the tree is small and was **not committed** — see below.
It is: persist the failing composition as JSON beside the seed rather than
relying on seed-based failure persistence; add a replay lane that loads those
files and asserts the same invariants with no generator involved; enable exact
float decoding for that lane; and add one test asserting the round trip itself,
so the fidelity is a checked property rather than a belief about a dependency's
defaults.

## What this realization cannot do

The strategies were reproduced faithfully rather than linked — same draw order,
same ranges, same pinned fields — because the project's binary was locked by a
running instance and could not be relinked during the run. The claim under test
is about the seed-to-draw-sequence mapping, which a faithful copy reproduces
exactly; but this did not execute the project's own compiler, so it says nothing
about whether any *particular* recorded case would have changed verdict. Nothing
here measures how often the real suite fails, either — the tree has never
persisted a failure, so the regression lane this argues for is currently empty,
and an empty lane is the one state in which none of this costs anything yet.
