---
layer: golden-path
type: golden-path
subject: metric-gates
status: forged
techniques:
  - ratchet-design
  - counted-set-snapshot
  - operation-assertion-gates
  - deterministic-proxy-gate
  - proxy-metric-counts-its-own-satisfiers
---

# Metric gates

A predicate gate asks a question the tree answers with yes or no: does this
file import that module, does every route carry an authorizer, does the
schema validate. A **metric gate** asks a different kind of question — *how
much* — and compares the answer to a number it recorded earlier: a violation
count against a baseline, a bundle's bytes against last release, a loop's
work against the budget it had when the standard was written. Everything
that makes a predicate gate trustworthy still applies, and it is owned next
door. What this subject owns is the two problems that appear only when the
verdict is a comparison between two numbers: **where the recorded number
came from** (baseline provenance) and **whether the measured number means
what it did last time** (instrument noise). A metric gate that has settled
neither is a predicate gate wearing a dashboard, and it dies the way
dashboards do — by being right, unread, and then wrong.

## Where this subject starts and stops

[quality-gates](../quality-gates/quality-gates.md) owns the gate as a
mechanism of refusal: whether a check has earned the right to block
([blocking-by-input-determinism](../quality-gates/techniques/blocking-by-input-determinism.md)
is the hinge, and it stays there — a metric gate is graded on the same axis
as any other, and its third class, the check that measures rather than
reads, is the door into this subject), what the severity label can do, where
on the cost ladder the gate runs, how the merge decision is bound to it, and
whether it is alive at all. Nothing here re-derives any of that; a ratchet
is a fully blocking gate on a deterministic input, and it inherits liveness,
laddering and binding from that subject unchanged.

This subject begins at the recorded number. Its four techniques answer one
question each: how a baseline is kept honest over time
([ratchet-design](./techniques/ratchet-design.md)); what a baseline must
contain to be comparable at all
([counted-set-snapshot](./techniques/counted-set-snapshot.md)); what to do
when the measurement itself is the unreliable part — restate the standard
so the source text can hold it
([operation-assertion-gates](./techniques/operation-assertion-gates.md)), or
keep the standard and swap the apparatus for a count of work performed
([deterministic-proxy-gate](./techniques/deterministic-proxy-gate.md)). A fifth
covers the substitution nobody chose — a metric cheap enough to compute that its
population can be moved toward it directly, which is answered by publishing the
proxy's blindness in its own artifact, gating on a strictly stronger tier, and
counting the artifacts built only to satisfy it
([proxy-metric-counts-its-own-satisfiers](./techniques/proxy-metric-counts-its-own-satisfiers.md)). The
first reading of a metric — the one frozen as a founding baseline — is the
moment a scope error becomes permanent, and the plausibility test that
guards it is
[excess-indicts-the-instrument](../quality-gates/techniques/excess-indicts-the-instrument.md),
which stays in the neighbour because its subject is the instrument's scope
declaration, not the number. Regression gating of *model* quality — judged
outputs against a scored baseline — has its own subject, quality-regression-
gating, and is not this one; the comparison there is between judgments,
and the noise is the judge's.

## When the input is fine and the instrument is not, change the instrument

The blocking axis assumes the verdict is computed reliably and asks only
where its input lives. Gates that *measure* rather than read — elapsed time,
throughput, a sampled resource count — break that assumption from a third
direction: re-run against the same commit they return a different answer,
and neither the tree nor any external feed moved. The machine did. Such a
gate is deterministic in its subject and nondeterministic in its apparatus,
and both honest configurations fail it: block, and the threshold has to sit
above the regressions worth catching; stay advisory, and no work inside the
repository can ever discharge the trigger.

The first move is to stop grading the measurement and restate the standard
as something the source text either contains or does not — *this loop must
not call these operations* rather than *this loop must finish in this long*.
That input is deterministic, so the ordinary rule lets it block, and the
measurement moves to a non-gating scheduled lane comparing against the
previous release's own artifact rather than a guessed number. The cost is
real and must be written down: the assertion holds the architecture that
produces the performance, not the performance. The translation, the scanner
normalisation that lets a rule be documented in the file it governs, and the
instrument assertions such a scanner needs are
[operation-assertion-gates](./techniques/operation-assertion-gates.md).

Where the number *is* the standard and no operation stands in for it, the
second move keeps the standard and changes the apparatus: count the work
performed — instructions retired, allocations, bytes crossing a boundary —
instead of timing it. The count is a function of the tree and the toolchain
that built it, and of nothing the afternoon changes; what it is *not* is
perfectly reproducible, so the threshold is derived from the counter's
measured repeat spread on the machine that gates, and the pin the gate
relies on is named for the counter's class: the toolchain pin is the whole
pin for an artifact-size counter under a lockfile, the machine-class pin
belongs to simulated-CPU and hardware counters. The workload classes where a
work count is uncorrelated with the cost it stands in for, and the decision
rules, are [deterministic-proxy-gate](./techniques/deterministic-proxy-gate.md).

## Ratchets: monotonic improvement as a gate

Most quality metrics in a living codebase cannot be zeroed today — hundreds
of legacy violations, a bundle that grew for two years, a warning class with
deep roots. The wrong responses are the common ones: block on zero (instant
bypass culture) or track it on a dashboard (numbers that only ever go up).
The senior structure is the **ratchet**: record the current value as an
explicit, committed baseline, and gate on direction — the metric may fall,
never rise.

A correct ratchet fails in **both** directions. Fail on rise, obviously.
But also fail — or at minimum refuse silence — when the measured value drops
below the baseline without a baseline update, because an unexplained
improvement has more than one explanation and the one nobody checks is that
**the measurement broke**. Which explanation is likelier depends on the size
of the drop — a fix or a deletion accounts for most small drops, and a
walk-found-nothing instrument failure for most drops to zero — and the
ratchet's contribution is not to guess but to refuse to let the drop pass
unexamined. A counter that walked zero files reports zero violations;
celebrating that number buries the instrument failure inside good news
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
Improvements are welcomed by re-baselining as a deliberate, reviewed diff —
the baseline file is the metric's audit log. Baseline mechanics, bucketing,
the endgame (a ratchet that reaches zero graduates into a hard ban, or is
kept at zero because an empty baseline *states* the standard — both endings
are priced), and the one boundary on "never auto-update" — a metric only a
build can produce, where the pipeline regenerates the baseline and the diff
becomes a mandatory review artifact instead of a gate — are
[ratchet-design](./techniques/ratchet-design.md).

Both halves of that structure assume the baseline says enough to be
compared against. A baseline of *totals* is silent about substitution: swap
one counted item for another, or change an item's content without changing
how many there are, and every reading stays green while the committed
artifact quietly stops describing the system. What the baseline must
additionally hold — a normalised, per-bucket map from each counted item's
identity to its multiplicity, folded hard enough that incidental churn does
not diff and loosely enough that a real substitution does — is
[counted-set-snapshot](./techniques/counted-set-snapshot.md).

## The founding measurement is the one reading nobody re-examines

A ratchet guards the drop and the rise; it never asks whether the number it
was born with was true. A scope declaration that misses a region produces a
population of findings about ground the checker was never meant to stand on,
and freezing that population as a baseline turns a configuration error into a
floor the ratchet then defends forever. So the first reading gets a question
before it gets a file: is this a statement about the tree, or about the
roots? The plausibility test, why clustering samples but does not
discriminate, and the referrer check that does, are
[excess-indicts-the-instrument](../quality-gates/techniques/excess-indicts-the-instrument.md);
a baseline committed without that reading carries the predicate it was taken
under ([count-carries-predicate](../../../_laws.md#count-carries-predicate))
or it carries a guess.

## A baseline records where it was taken

The number in the baseline file is a reading from an instrument, on a
machine, with a toolchain, at a moment — and the file usually records only
the last of those. Every one of the others can move without a diff: a
bundler major lands in the lockfile and the same source produces a different
byte count; a build moves from a developer box to a hosted runner; a
counter's version changes what it counts. A baseline that held one number
across a toolchain change was not stable, it was unread. So the baseline
carries its derivation
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)):
the instrument and its version, the toolchain it was measured under, and
the machine class where the class matters — enough that a reader can tell a
tree change from an apparatus change by reading the diff, and a re-baseline
that coincides with a toolchain bump is recorded as two moves, never one.

## Failure modes this standard exists to prevent

- **The dashboard metric** — a number tracked, graphed and never gated, so it
  only ever goes up (ratchet-design).
- **The silent drop** — a counter that walked nothing reports zero, and the
  zero is celebrated (ratchet-design).
- **The substitution** — one counted item swapped for another under an
  unchanged total (counted-set-snapshot).
- **The noisy blocker** — a timing gate whose threshold sits above the
  regressions worth catching so that it survives a bad runner
  (operation-assertion-gates).
- **The permanent advisory** — a measurement gate advisory since the day it
  was added, with no trigger inside the repository that could ever promote it
  (operation-assertion-gates, deterministic-proxy-gate).
- **The asserted zero** — a proxy counter promised to be perfectly
  reproducible and bypassed the first time the handful shows
  (deterministic-proxy-gate).
- **The founding floor** — a misconfigured first reading frozen as a baseline
  and defended forever (excess-indicts-the-instrument, next door).
- **The unread baseline** — a number held across a toolchain change because
  nobody could tell from the file that the apparatus had moved.

## The techniques

- [ratchet-design](./techniques/ratchet-design.md) — committed baselines,
  fail-on-rise and fail-on-silent-drop, reviewed re-baselining, the one
  auto-updating baseline that stays honest and its three preconditions, and
  the two endings at zero.
- [counted-set-snapshot](./techniques/counted-set-snapshot.md) — what a
  total cannot see, the normalised per-bucket identity map committed beside
  the count, the normalisation rule that folds churn without folding
  substitutions, and the two artifacts' complementary blind spots.
- [operation-assertion-gates](./techniques/operation-assertion-gates.md) —
  restating a cost standard as an assertion over source text, scoped
  denylists with their replacements attached, normalising comments and
  literals out before matching, testing the scanner itself, and the timing
  lane's demotion to scheduled evidence.
- [deterministic-proxy-gate](./techniques/deterministic-proxy-gate.md) — the
  fourth resolution for a cost gate: keep the standard, swap the apparatus for
  a deterministic count of work performed, the measured spread and the pin
  named by counter class, and the workload classes where that count is
  uncorrelated with the cost it stands in for.
