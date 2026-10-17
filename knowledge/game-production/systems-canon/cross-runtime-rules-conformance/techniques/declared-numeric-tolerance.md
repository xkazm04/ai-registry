---
layer: technique
type: technique
subject: cross-runtime-rules-conformance
technique: declared-numeric-tolerance
status: draft
laws: [a-number-carries-its-unit-and-basis, refuse-rather-than-destroy, unmeasured-is-not-a-pass]
shared_with: []
use_when: [floating-point results differ between runtimes, a vector fails by a rounding difference, deciding which quantities must match exactly]
---

# Declared numeric tolerance

The named concern: two runtimes in two languages will not produce bit-identical
floating-point results for long. Compilers reorder operations, fuse multiply and add,
evaluate transcendental functions differently and round at different widths. A suite that
demands exact equality on every float fails on noise. A suite that allows "close enough"
without a number lets real rule differences through. The tolerance is a declared quantity,
with a unit, a basis and a ceiling.

## Split the state first

- **Exact.** Integers, ticks, counts, identifiers, enums, booleans, strings, event kinds and
  the order of events. A difference here is never rounding. If a discrete value is stored as
  a float, compare it after rounding to an integer and fail when it is not integral.
- **Toleranced.** Continuous quantities only: positions, health and resources stored as
  floating point, rates.
- **Hashed.** A state digest computed by both runtimes is cheap to compare, but only when both
  hash identical bits. With a tolerance in play, a hash mismatch is a pointer to look, not a
  verdict.

## The comparison

Pass a continuous field when the values are identical, or when the absolute difference is
within an absolute floor, or within a relative bound times the larger magnitude. The absolute
floor handles values near zero, where a relative bound collapses. Both numbers are written in
the vector, so the tolerance travels with the expectation it qualifies.

The replayer enforces a **ceiling** on both: a vector that declares a looser tolerance than
the ceiling is refused before it runs. That ceiling is what turns the tolerance into a rule.
Without it, the cheapest fix for any failing vector is a larger number in the vector file.

## Thresholds amplify rounding

A difference far below any tolerance can still change a branch: a resource exactly at a cost,
a distance exactly at a range, a timer exactly at expiry. When a vector fails on a discrete
field and the nearest continuous fields differ only in the last digits, the cause is usually
a comparison sitting on a boundary. Fix it in the rules, by stating which side of the
boundary wins and computing that side in a way both runtimes agree on, such as integer ticks
or fixed-point. Do not fix it with tolerance.

## Procedure

1. Classify every compared field as exact or toleranced, in the replayer, by type.
2. Pick the tolerance from a measurement: run the unmodified port against the vectors with
   exact comparison on toleranced fields and record the largest differences. Set the tolerance
   above those by a stated margin, and well below anything a player could perceive.
3. Write the tolerance into each vector and the ceiling into the replayer.
4. On failure, print expected, actual, absolute and relative difference at full precision.

## Decision rules

- **When a vector fails by rounding, look for the boundary before touching the tolerance.**
- **When someone proposes raising the ceiling, ask what changed in the arithmetic.** A new
  compiler flag or platform is a reason. A failing vector is not.
- **When the runtimes need bit-identical results**, as in lockstep networking between them, a
  tolerance is the wrong tool. Use deterministic arithmetic in both and compare exactly.

## When not to use it

- **Pure integer or fixed-point rules.** Compare everything exactly, and keep the comparison
  free of any tolerance path.
