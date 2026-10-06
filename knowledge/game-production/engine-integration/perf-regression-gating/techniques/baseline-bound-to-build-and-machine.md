---
layer: technique
type: technique
subject: perf-regression-gating
technique: baseline-bound-to-build-and-machine
status: forged
laws: [a-verdict-is-bound-to-its-content, a-number-carries-its-unit-and-basis, no-gate-self-certifies]
shared_with: []
use_when: [recording the reference a frame-cost gate compares against, a comparison crosses machines or build configurations, a baseline is re-recorded by the pipeline that failed against it, deciding when a regression may be accepted]
---

# Baseline bound to build and machine

The concern: what a performance reference is, and who may change it. A reference
measurement of a noisy quantity is not a number; it is a recorded sample — several runs and
their spread — that judged one build in one configuration, on one scenario, with one
instrument attached, on one class of machine. Move any of those and the sample is evidence
about a different thing. The size baseline in the shipping-gates subject already binds a
reference to a platform and a configuration; frame cost adds the machine to the list, and
changes what promotion means, because a recorded number of a noisy process is not
re-recorded by copying the last run.

## What the basis contains

A baseline carries these, recorded when it is stored, because a field missing at
comparison time cannot be reconstructed:

- **The build**, as a content fingerprint, and the revision it came from.
- **The configuration**: optimisation level, diagnostics and assertions compiled in or out,
  the quality and scalability preset in effect, the device profile.
- **The scenario and its window**: the scenario's identity and version, the phase markers,
  the frame count.
- **The run mode**: whether a renderer is present, the resolution, the fixed step, whether
  a frame cap or display synchronisation is on.
- **The instrument**: which profiler or trace channels were attached, since an attached
  instrument costs frames and a reading taken under one is not comparable with a reading
  taken under another or under none.
- **The hardware class**, defined below, with the driver and operating-system versions and
  the power policy.
- **The sample itself**: the replicate count, the statistic per replicate, the spread.

## Procedure

**1. Define the hardware class by measurement.** The class is the set of machines whose
unchanged-build results differ from each other by no more than one machine's own spread.
Run unchanged replicates across the candidate machines; if the spread across them is about
the spread within one, they are one class and may share a baseline, and if it is larger,
they are two. The properties that decided it — processor, graphics processor and driver,
memory, storage when streaming matters, power policy — are written into the class
definition. Nobody can list in advance which properties matter, so the test is the
measurement.

**2. Refuse to compare across a differing basis.** When the head's basis differs from the
reference's in any field, the verdict is *not comparable*, with the differing fields named.
It is not a regression and not a pass. A comparison across hardware classes is not a weak
comparison; it measures the machines.

**3. Attribute the reference in the verdict.** The verdict states which baseline it
referenced: its build, its basis, its date, who approved it. A baseline that cannot be
attributed — recorded without its basis, or fetched as "the latest one" from a store that
does not say which lane wrote it — makes the comparison unattributed, and an unattributed
comparison is nearer to unmeasured than to a pass
([a-verdict-is-bound-to-its-content](../../../_laws.md#a-verdict-is-bound-to-its-content)).

**4. Treat no baseline as unmeasured.** A first build, a build on a new machine class, a
build after the store was reset: each is the least verified, and the report says *no
baseline; cost change not evaluated*. Policy may let it proceed so that the pipeline can
bootstrap; it may not print it as a comparison that passed.

**5. Promote a baseline by explicit approval, from a fresh sample.** A new reference is
recorded only from a build that passed every gate, by an action that is its own job with
its own approval, and recorded as the aggregate of a new set of replicates with their
spread, never as one run's number. The approval reads the delta against the spread, the
distribution and the reason; it is the performance counterpart of reading a data diff
before accepting a changed snapshot.

**6. Never let the gate record its own reference.** The job that compares has read access
to the store and no write access, and a test proves that it cannot write. A pipeline step
that overwrites the baseline with whatever it just measured turns the gate into a recorder
whose every run passes, and the producer of a regression that approves its own promotion
has certified itself ([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)).

**7. Record a re-baseline and an apparatus change as two moves.** When the driver, the
toolchain or the machine changes, the old and new spreads are characterized first and the
baseline is re-recorded after, as a separate promotion. A baseline held across an
apparatus change was not stable; it was unread.

**8. Prefer a same-job base to a stored baseline where the lane can afford it.** Rerun the
base build in the same job, interleaved with the head, and compare the pair. No stored
reference then has to survive a month of machine drift, and the stored baseline is reserved
for the absolute budget, which is a policy and carries no machine in its definition.

**9. Keep the ceiling that stops creep.** Each accepted promotion absorbs whatever was
within the spread; ten of them compound into a large regression that no single comparison
objected to. The budget stands above the baseline and does not move with it, and a slower
lane compares the head against an old anchor with more replicates.

## Decision rules

- When two bases differ, report *not comparable* and the differing fields. Do not compute a
  delta and annotate it.
- When a reference is unattributed, report it as such in the same sentence as the number.
- When the pipeline has no durable store, run base against head in the same job and gate
  the absolute budget alone; report the cross-build comparison as not stored, rather than
  comparing against whatever happened to be on the machine.
- When a regression is accepted deliberately, promote a new baseline from a fresh sample,
  with the reason and the approver, and leave the allowance unchanged. Widening the
  allowance raises the noise floor for every later build.
- When a hardware class changes — a new driver, a replaced component — the baseline for
  that class is re-characterized before it is trusted again.
- When the same scenario runs on several classes, store one baseline per class; a relative
  statement across classes is a different quantity and is labelled as one.

## When not to use

Do not bind a baseline to a machine class for a deterministic count of operations or the
size of an artifact. The basis there is the build, the configuration and the toolchain, and
the machine contributes nothing; the size baseline in the shipping-gates subject covers it.

Do not read the ban on pipeline-written baselines as absolute for a metric the author
cannot compute locally, such as one that needs a particular graphics processor. There a
pipeline may regenerate the baseline, provided the regeneration lands as a reviewable
change with the delta against the spread attached and an approver named; an unreviewed
regeneration is not a promotion, it is the silent re-record this technique forbids.

Do not treat the stored baseline as the primary comparator when a same-job base is
available. A comparison against last month's number on today's machine is the weaker
instrument, and a team that has both should trust the interleaved pair.
