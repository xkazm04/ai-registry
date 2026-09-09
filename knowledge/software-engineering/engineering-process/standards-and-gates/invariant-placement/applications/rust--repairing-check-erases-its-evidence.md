---
layer: application
type: application
subject: invariant-placement
technique: repairing-check-erases-its-evidence
stack: rust
status: forged
verified_on: 2026-09-07
verified_against: rust@1.96.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A clamp, a half-open contract, and a closed assertion

Verified against a Rust scraping service at toolchain `1.96.1` - the toolchain the
tree was observed building under, and the same version its `rust-toolchain.toml`
pins as a floor, so witness and floor agree here.

## The seam

A dependency-free deterministic jitter helper, shared by a pacing governor and an
HTTP retry backoff. Its contract is in its own doc comment: *scrambles a seed into
a deterministic fraction in `[0, 1)`* - half-open, the upper bound excluded. The
body is one LCG step, a shift, a division, and a defensive `.min(1.0)`.

Its single test asserts three things: the output lies in `(0.0..=1.0)`, the same
seed is stable, and 100 consecutive seeds spread with more than 20 falling on each
side of the midpoint.

Two facts sit on top of each other here, and each is harmless alone:

- the assertion's range is **closed** where the contract is **half-open**, so the
  one value the documentation forbids is the one value the test explicitly admits;
- the `.min(1.0)` cannot currently fire. The shift leaves 31 bits and the divisor
  is `2^31`, so the quotient is already below one. The repair is dead code.

## The measurement

Chosen as a falsifying seam. The first candidate seam in this tree was a declared
cohort-size threshold, and it **refuted** the finding: that threshold's fixtures
deliberately straddle it, with in-source comments saying so and three different
values across the suite. A declared threshold advertises both of its sides, so
fixture authors cover both. That refutation is what narrowed the claim from
*fixtures pin a deciding variable* to the form the technique now carries, and it
is why the surviving instance is a **derived** quantity rather than a declared one.

Arm A is the tree as it stands. Arm B applies the single-character maintenance
error the clamp exists to survive - the shift narrowed by one bit, which is what
a later change to the scramble's width would look like - and runs **the same
unmodified test**.

| | exactly `1.0` | below `0.5` | the test |
|---|---|---|---|
| **Arm A** (`n=1,000,000`) | 0 (0.0%) | 499,999 (50.0%) | passes |
| **Arm B** (`n=1,000,000`) | 500,001 (**50.0%**) | 249,999 (25.0%) | **passes** |

Half of all seeds collapse onto the excluded bound, the distribution loses a
quarter of its lower half, and the suite stays green. Both assertions survive for
the reasons the technique predicts: the closed range admits `1.0`, and the spread
check needs only 20 on each side, where arm B still delivers 26 low of 100.

The consequence in the tree is not cosmetic - both consumers convert this fraction
into a delay, so arm B pins half of all pacing and backoff draws to the maximum of
their range while every test reports normal behaviour.

## The verdict

`better`, and specifically: the technique's second remedy - *assert the strict
contract, not the repaired range* - is a one-character edit here (`..=` to `..`)
that closes arm B while leaving arm A green. That is the cheapest of the four
remedies and the weakest, and it is sufficient at this seam only because the clamp
lands exactly on the bound. Where a repair coerces to an interior value it would
catch nothing, which is why the ordering in the technique puts pre-repair
assertion first.

The mutation was reverted; no product change was shipped from this measurement.

## What this tree shows that the technique asserts

The dead clamp is the load-bearing observation, and it was not designed - it fell
out of the arithmetic. The repair was placed against a state the surrounding code
already made impossible, so it has never fired, has never been exercised, and
would begin absorbing a real change silently the moment the width above it moved.
A repair in that condition reads as caution in review and is indistinguishable
from a repair that is actively saving the system, because both have the same
observable: none.
