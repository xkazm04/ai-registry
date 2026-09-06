---
layer: application
type: application
subject: test-harness
technique: constraint-injection-for-unreachable-tiers
stack: python
verified_on: 2026-09-06
verified_against: python@3.12
applied: simulation
ab_verdict: better
proof: structural-only
---

# Python — seven capacity rungs, one machine, and the sweep is a named mode

How an open-weights music-generation runtime stands against
[constraint-injection-for-unreachable-tiers](../techniques/constraint-injection-for-unreachable-tiers.md).
The version witness is the tree's `pyproject.toml` interpreter band
(`>=3.11,<3.13`); the tree was read at a pinned commit and not run.

## The seam

The runtime carries a capacity ladder of seven-plus rungs, each declaring its
own duration ceiling, batch ceiling, offload defaults, quantization default and
language-model backend. The rungs that matter are the low ones — they carry the
offload path, the CPU decode fallback and the reduced batch — and no
contributor owns the hardware for most of them.

Three things in the tree implement this technique, and the tree calls the third
one its key feature:

1. **The override sits at the probe.** Environment variables cap the *reported*
   capacity per accelerator family, read inside the capacity reader itself. Tier
   selection, the derived limits and the offload decision then all run their
   real logic against a number they cannot distinguish from a true reading —
   which is precisely the interception point this technique argues for, rather
   than overriding the resolved tier or the individual consumers.
2. **One override per family**, so constraining one accelerator's ladder does
   not silently constrain another's.
3. **The sweep is a first-class mode**, not a habit: a profiling entry point
   walks the rungs, runs the same scenario at each, clamps the scenario to each
   rung's ceiling and reports the clamp, and emits one row per rung with wall
   time split across the language model, the diffusion steps and the decode.
   The rungs can be named explicitly, and the sweep can be run with the
   language model enabled only where a rung admits one.

The per-rung timing table is the artifact this technique says it should be: it
makes a *quantitative* regression visible, not merely a crash.

## What the tree confirms

**The sweep catches the regression the ladder was tuned into.** A comment in the
ladder records that one rung spanning a wide capacity band was split in two
after the bottom of the band regressed — the rung had been tuned at its top,
and the lower hardware could not hold all four models resident. That is the
exact defect class this technique exists to catch, found in a rung nobody owns,
and it is why the boundary arithmetic must be exercised rather than the
consumers.

**Enumerating from the ladder's own definition matters.** The sweep patches the
live ladder configuration when it tests batch boundaries rather than keeping a
private copy of the rung table, so a rung added to the configuration is a rung
the sweep can reach.

## The part the tree names and does not close

This technique's honest limit is that an overridden probe constrains a number
and not the resource: no real pressure, no fragmentation, no eviction. The tree
demonstrates awareness of exactly this in one direction and compensates in the
wrong place. Its per-batch memory estimates carry a comment that profiling on
the development accelerator showed a nearly negligible figure because that
machine has an attention kernel the consumer hardware lacks, and that the table
therefore uses conservative worst-case estimates covering the no-kernel case.

So the tree knows its measuring machine is not its target machine, and answers
by inflating the *table* rather than by qualifying the *sweep's* result. Those
are different repairs: the inflated table makes admission pessimistic
everywhere, while the sweep's green row still reads as "this rung works" when
what it established is "this rung selects and executes its configuration."
Nothing in the tree separates the two claims in a report, which is this
application's one recommendation against it and the reason the technique states
the two-claim discipline explicitly.

## Why better, on a structural proof

The verdict is `better` rather than `unmeasurable` because the comparison does
not need a run: the alternative is testing only the top rung, and the tree
carries a recorded defect — the split rung — that only the low band could have
produced. A sweep that reaches seven rungs from one machine found a bug the
owned hardware could not have found, and the fix is in the ladder as a comment
naming the regression. That is a paired observation with the arms separated by
the tree's own history rather than by an instrument this reading ran.
