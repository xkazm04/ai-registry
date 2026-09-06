---
layer: application
type: application
subject: admission-queue
technique: budget-includes-the-callers-own-cache
stack: python
verified_on: 2026-09-06
verified_against: python@3.12
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Python — a local generation runtime that reads its own allocator back

How an open-weights music-generation runtime stands against
[budget-includes-the-callers-own-cache](../techniques/budget-includes-the-callers-own-cache.md).
The version witness is the tree's own `pyproject.toml` interpreter band
(`>=3.11,<3.13`) together with the pinned accelerator runtime in
`requirements.txt`; the tree was read at a pinned commit and nothing in it was
run, so every figure below is structural.

## The seam

The runtime admits a generation by deriving duration and batch limits from
available accelerator memory before any model loads. Its capacity reader is a
single function, and the naive form of it — ask the driver for free memory — is
the form the tree used until a regression corrected it.

The corrected reader adds the process's own caching-allocator reserve back to
the driver's figure, then clamps the sum by the allocator's own budget minus
what is actually allocated. Both halves of the technique are present, and the
tree is explicit that the first half alone was the bug: its regression test's
docstring records the primary case as *models fully occupy memory from the OS
perspective (driver-free is zero) while the allocator holds a large
reserved-but-unused pool*, and a second test covers the both-terms-non-zero
case that catches a missing or doubled clamp.

That is the loaded-case discipline this technique asks for, arrived at
independently and paid for once.

## What the tree confirms, and the part it does not

**Confirms the correction is not optional.** The reader is reached through one
accessor with an alias, so admission never calls the platform directly — the
one-function rule, structurally enforced rather than documented. The pair of
tests is exactly the pair the technique names, which is the strongest
corroboration available for a rule about which cases to test: an independent
codebase, having hit the bug, wrote the same two.

**Does not confirm the naming rule.** The technique asks that the figure travel
with its observer — "process-effective; driver-free plus allocator-reserved" —
and the tree returns a bare float. Its logs carry the tier and the derived
limits but not the decomposition, so an operator comparing the runtime's
reported headroom against a platform tool would see a disagreement with nothing
to explain it. This is the one rule the tree makes a case *against* by omission
rather than by argument, and it is the cheap half.

## The structural fact nobody designed

The empirical capacity table this reader feeds carries a comment naming the
script that should calibrate it. The script exists and measures real component
footprints. Nothing runs it, nothing compares its output to the constants, and
the table records neither a calibration date nor the hardware it was measured
on — while a sibling comment in the same file notes that the measuring machine
had an attention kernel the low tiers will not have, and that the table
therefore carries conservative worst-case estimates instead of the measured
figures.

So the tree independently reached the corrected *reading* of remaining capacity
and left the *denominator's own provenance* unaudited. Those are the two terms
of one arithmetic and only one of them has a regression test. It is a fair
illustration that this technique's correction is the more discoverable of the
two — it announces itself as a refused generation on an idle machine, and a
stale capacity table announces itself as nothing at all.

## Why the verdict is unmeasurable here

Both arms need an accelerator under real memory pressure with models resident.
The tree ships the instrument that would produce the number — a profiling mode
that reports per-tier wall time and derived limits, and a capacity override
that can place the reader at any tier — so the measurement is *specified*, and
this reading is not the measurement. The instrument that would settle it is
that profiling mode run twice on one machine, once against the driver-only
reader and once against the corrected one, counting refused admissions at a
tier where the allocator holds a large reserve.
