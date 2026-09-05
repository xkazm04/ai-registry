---
layer: technique
type: technique
subject: quality-gates
technique: deterministic-proxy-gate
status: forged
laws: [gate-sees-target, limits-are-derived]
shared_with: []
use_when: [a cost standard cannot be restated as an operation the source text contains, a timing gate keeps failing on runner noise and the team wants it blocking anyway, choosing an instrument for a performance ratchet, deciding whether a work-count regression is evidence of a slowdown]
---

# Substituting a deterministic proxy for a noisy instrument

[operation-assertion-gates](./operation-assertion-gates.md) works the cost-gate
problem to a stated dead end. Grading on the two-class axis of
[blocking-by-input-determinism](./blocking-by-input-determinism.md) leaves a
timing gate with two honest configurations, both bad — blocking at a threshold
loose enough to survive a bad runner, or advisory forever with no exit
condition — and the escape it offers, restating the standard as a property of
the source text, ends with the concession that it "holds the shape; it does not
hold the number." Where the number *is* the standard, and no operation the
scanner can find stands in for it, that resolution has run out.

This is the fourth resolution, and it moves the other variable. The first
changes the standard until the apparatus can hold it. This one **keeps the
standard and changes the apparatus**: replace elapsed time with a deterministic
counter of the work performed.

## Why a work count blocks and a clock does not

The determinism test asks whether the verdict is a function of the repository's
contents. Elapsed time is a function of the tree *and* of the machine, the
scheduler, the thermal state, and every neighbour process — which is precisely
why it answers *partly*, and why partly disqualifies it from blocking.

A count of work performed — instructions retired, allocations made, calls into
a boundary, syscalls issued — is a function of the tree and the toolchain that
built it, and of nothing the afternoon changes. Same revision, same build,
same machine: the same number, or close enough that the counter's own manual
calls it *highly* reproducible and only for some programs *perfectly* so. Be
exact about the residue, because a gate that promises zero and delivers a
handful is bypassed the first time the handful shows. A simulated counter is
perturbed by address-space randomisation and by the sizes of the executable
and every shared library it loads — so a different machine, with a different
system library, is a different number even on an unchanged tree — and a
hardware counter additionally attributes interrupt handling to the process on
some counter configurations. None of that is the scheduler noise a clock
carries, and all of it is small; the point is that the threshold is derived
from the counter's *measured* repeat variance on one machine (the decision
rule below), not asserted to be zero from the counter's description. The
gate's verdict becomes reproducible on an unchanged commit on the machine
that gates, which is the whole of what the two-class axis was asking for. A regression is then attributable to
its author, so refusing on it does not spend the trust budget the way a noisy
timing wall does.

Note precisely what has and has not been conceded. The gate still reads a
**proxy** — the count is not the elapsed time the standard is about
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)). The claim is
narrower and worth stating exactly: *for compute-bound work, a change in the
count of work performed is the change in cost that the code is responsible
for*, and the residue the clock would have added is the machine's contribution,
which is not the author's to fix.

## The price, stated up front

Two costs, and a gate that hides either will be bypassed once someone discovers
it.

**A large constant-factor slowdown.** The instruments that count work
deterministically either interpret the program or instrument every memory
operation, and an order of magnitude is a normal figure — two is not unusual.
That is not a per-change budget; it is a lane budget. The counting lane runs
over a chosen subset (the specific paths the standard is about), not over the
whole suite, and the subsetting is a stated design decision rather than a
discovered necessity.

**Blindness to everything time measures that work-count does not.** Cache
behaviour, memory-bandwidth saturation, branch prediction, contention, and
paging are all invisible to a counter of operations. A change that halves
instruction count and quadruples cache misses is a regression the gate calls an
improvement — and it is worth writing that sentence into the gate's own
definition, because a work-count gate reads to a newcomer as a performance
gate, and it is not one.

## Where the substitution is invalid

The inversion is sharp and it is the first thing to check, because the
substitution is not a general improvement — it is valid for one class of
workload and misleading for the rest.

**Where the standard is genuinely about wall-clock, the count is uncorrelated
with what matters.** For work that is bound by input and output, by calls into
the operating system, by memory bandwidth, or by parallelism, the processor
spends most of its time waiting rather than executing, and the number of
operations executed says almost nothing about how long the thing takes.
Feedback-directed optimization shows the same asymmetry from the other
direction — recompiling with a real execution profile buys a large improvement
on compute-bound work and very little on work that is waiting — and the reason
is identical: where the count is not the cost, changing the count does not
change the cost.

A gate built on the substitution in that setting enforces a proxy the team will
correctly bypass, and the bypass is the right engineering judgement. When it
happens, the fault is the gate's; do not treat the suppression as indiscipline.

Two more exclusions:

- **Where the work is not deterministic in the first place.** A count is only a
  function of the tree if the execution is. Adaptive algorithms, work-stealing
  schedulers, hash iteration order and randomised seeds all move the count on
  an unchanged tree, and the substitution buys nothing — it has moved the
  nondeterminism, not removed it. Verify by running the counter twice on the
  same revision before the gate blocks anything.
- **Where the counting instrument itself cannot see the target.** Some counters
  cannot cross a boundary out of the program's own representation. If the
  expensive work happens on the far side of that boundary, the count omits
  exactly the part the standard is about.

## The contradiction this resolves, and which side loses

Published practice on this problem routinely says: measure elapsed time in the
pipeline, compare it against the previous run, and **refuse the change** when
it regresses beyond a threshold — with the threshold set at a round number
somebody picked, twenty percent being the usual choice.

That configuration is exactly the loose-blocking shape ruled dishonest above,
and it carries a second defect on top of the first: the threshold is a limit
nobody derived. A bound chosen by feel is raised by feel
([_laws: limits-are-derived_](../../../../_laws.md#limits-are-derived)), and a
suppression band chosen without measuring the instrument's own repeat variance
is a censorship policy with no evidence — the first genuine regression it
swallows costs more trust than all the churn it prevented. The two defects
compound: the number is both unjustified and applied to an instrument whose
noise nobody characterised.

The verdict does not move. **A wall-clock comparison against a guessed
threshold does not get to block**, and the practice that says it should is
wrong on this point. What that practice contributes is the instrument swap and
nothing else: the observation that a deterministic count of work is more stable
than the clock, and can therefore hold a bar the clock cannot. Take the
instrument; leave the gating configuration.

The honest arrangement remains three-rung, with the middle rung newly
available:

1. **Blocking:** operation assertions over source text, where the standard
   restates as an operation.
2. **Blocking, where it does not:** a work-count comparison over a fixed subset
   of compute-bound paths, with a threshold derived from the counter's measured
   repeat variance on an unchanged tree — which for a truly deterministic
   counter is zero, making any movement at all reportable and the threshold a
   statement about tolerance rather than about noise.
3. **Non-gating:** elapsed time, measured against a real prior artifact rather
   than a guessed number, routed to a person for investigation.

## Decision rules

- Before adopting the substitution, classify the workload. Compute-bound:
  proceed. Bound by input/output, system calls, memory bandwidth, or
  parallelism: do not — keep the clock on the non-gating rung.
- Prove the counter's determinism before it blocks: repeated runs on one
  revision, on the machine that will gate, with the spread recorded — zero is
  the claim to verify, not the premise; a counter that moves by a few units
  under address-space randomisation is still usable, at a threshold that
  names that spread.
- Pin the machine class and the toolchain the count is taken on, and compare
  only counts taken under the same pin; a count from another machine is a
  different instrument's reading. Which pin carries the weight is a property
  of the counter class: for an artifact-size counter under a lockfile the
  toolchain pin is the whole pin (one measured ratchet held its baseline
  unchanged across a bundler major, and its first cross-machine run agreed
  to 0.1 KB per chunk), while the machine-class pin belongs to simulated-CPU
  and hardware counters. State which one the gate relies on.
- Scope the counting lane to the paths the standard is about; the slowdown
  makes whole-suite counting a lane that gets deleted.
- Derive the threshold from the counter's measured repeat variance, never from
  a round number. State the derivation beside the constant.
- Write into the gate's definition what the count cannot see — cache,
  bandwidth, contention, paging — so nobody reads a green work-count as a
  performance certificate.
- Keep the timing lane alive and non-gating. The substitution narrows what
  blocks; it does not narrow what is observed.
