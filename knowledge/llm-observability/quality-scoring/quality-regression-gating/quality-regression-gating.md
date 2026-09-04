---
layer: golden-path
type: golden-path
subject: quality-regression-gating
status: reconciled
use_when: [wiring an eval run into a deploy gate, deciding whether a score drop is real, designing benchmark exit codes, a leaderboard needs a defensible winner line]
techniques:
  - paired-per-case-testing
  - family-wise-correction
  - fixed-alpha-discipline
  - tested-superiority-claims
  - unverified-vs-regressed-exit-states
  - partial-run-never-green
  - baseline-carries-its-conditions
---

# Quality regression gating

A quality gate is the place where a number becomes a decision: this build
ships, or it does not. Everything upstream of the gate — the judge, the
rubric, the case set — produces *scores*; the gate's job is to turn score
movement into a **verdict you can defend** in the postmortem where someone
asks "why did you block my deploy?" or, worse, "why didn't you?". The naive
reading is that gating is a comparison: `new_mean < old_mean`, block. The
principal reading is that gating is a **statistical claim made under
adversarial conditions** — adversarial because every party in the room has an
incentive to move the answer. The team that shipped the change wants green.
The operator who pays for reruns wants fewer of them. The tool that wants to
be trusted must therefore be built so that none of them *can* move the
answer, including its own author.

The boundary with the builder-side evaluation harness is sharp: the harness
owns producing a pass/fail or a score per case against a fixed dataset. This
subject owns what happens **between two runs** — the statistical verdict of a
run against a prior run, the correction across a family of such verdicts, the
sentence a leaderboard is allowed to print, and the exit-state contract a
pipeline branches on. A harness without this layer produces numbers; a gate
without the harness has nothing to test. Neither substitutes for the other.

## Why the scalar compare is the weakest math in the building

Eval scores are noisy in three stacked ways: the cases vary in difficulty,
the model varies across samples, and the judge varies across calls. A bare
mean-versus-mean compare reads all three noises as signal. The consequences
are symmetric and both fatal:

- **False blocks.** A 0.003 dip inside the noise of a thirty-case run blocks
  a deploy. After the second such block, engineers stop believing the gate;
  after the third, someone adds a bypass flag, and the gate is now
  ornamental.
- **False greens.** A real regression on the hard cases is washed out by luck
  on the easy ones, and the mean holds. The gate passes exactly the build it
  existed to catch.

Every discipline in this subject exists to strip one of those noises out of
the verdict or to disclose the noise it could not strip. The order of
operations matters and is fixed:

1. **Pair per case** — the same cases in both runs, tested on their per-case
   *differences*, which removes between-case variance entirely. This is
   typically several times more statistical power at the same sample size —
   often the difference between "cannot tell" and a usable gate
   (paired-per-case-testing).
2. **Correct across the family** — a run that tests six targets at an
   uncorrected 95% level shows at least one spurious red on roughly a
   quarter of clean runs. Correct the per-comparison threshold, and name the
   correction in the report (family-wise-correction).
3. **Fix the confidence level in the artifact, not the configuration** — a
   gate whose alpha is a knob invites tuning it until the answer is the
   desired one (fixed-alpha-discipline).
4. **Test any superiority sentence before printing it** — "best" is a claim
   about models, not a fact about a sample, and it must survive a paired
   test against the runner-up at the corrected level or degrade to "highest
   mean, no significant difference" (tested-superiority-claims).
5. **Give the pipeline an honest vocabulary** — regressed, passed, and
   *unverified* are three states, not two, and they get three distinct exit
   codes (unverified-vs-regressed-exit-states).
6. **Never let a fraction of a run speak for the whole** — a run that judged
   30% of its dataset, for any reason, is unverified, not green
   (partial-run-never-green).

## The doctrine: composition only adds detection

A mature gate runs more than one test — typically an **absolute floor** (the
run's whole corrected confidence interval below a recorded baseline score)
and a **paired drop** (a significantly negative mean per-case delta versus
the previous comparable run). The composition rule is asymmetric on purpose:
the verdict is *regressed if either test fires*. Adding statistical rigor is
allowed to trade a false alarm for a real detection; it is never allowed to
**disarm** the gate. Any refactor of the verdict logic should be checked
against exactly this property, because the most common way a gate rots is
that someone tightens the math and quietly converts a detection path into a
reporting path.

The same doctrine governs downstream consumers. A promotion endpoint, a
dashboard, a chat summary — none of them re-derive statistics. They read the
runner's verdict and its evidence, and they are permitted to print a
*weaker* sentence than the claim they were handed, never a stronger one. One
definition of "regressed" exists in the product, and it lives where the
per-case data lives.

## Honesty about what the test cannot see

Every verdict carries its own limitations in plain words, in the artifact
itself — not in documentation:

- A baseline recorded as a bare scalar has no standard error, so the floor
  test treats it as a known constant, which it is not: it came from a run
  with its own sampling noise. The verdict says so, verbatim, every time.
  The paired test is the structural fix, because it compares two runs each
  carrying their own noise; where pairing is impossible, the limitation is
  stated rather than hidden.
- A run with fewer than two scored cases has no standard error at all. The
  fallback is a plain scalar compare — allowed, but **labelled** as a bare
  compare rather than a test, and never silently upgraded to test-strength
  language by a consumer.
- A conservative correction costs power. The report says so, and names the
  remedy — more cases — instead of choosing the trade-off silently for the
  operator.
- Every limitation above is about how the baseline was *sampled*. A baseline
  also expires: it was produced by a judge and a dataset revision that have
  since moved on, and the floor test — unlike the paired test — carries no
  comparability precondition at all. The verdict names the baseline's
  conditions and refuses the floor when they no longer hold
  (baseline-carries-its-conditions).

This is the discipline that separates a gate you can defend from a gate you
can merely operate. When the verdict is challenged, the artifact already
contains which test decided, at what corrected threshold, with what caveats
— the postmortem reads the run report, not the maintainer's memory.

## Failure modes of the naive reading

- **The epsilon gate.** `new + ε < old` blocks on noise, so ε grows with
  each complaint until it is larger than any regression worth catching. The
  fix is not a better ε; it is a test with a real null hypothesis.
- **The configurable alpha.** The team under deadline sets 0.20 "just for
  this release". The number that made the verdict is now a negotiation, and
  the tool has become a rationalization engine (fixed-alpha-discipline).
- **The silent pair mismatch.** The case set changed between runs and the
  paired test quietly dropped the unmatched cases — or worse, zipped
  misaligned score vectors. A paired test over mismatched cases is worse
  than no paired test: it reports high confidence about a comparison that
  never happened. Refuse to pair, loudly, when the cases do not line up.
- **The green partial.** The run hit a cost ceiling, an operator cancelled
  it, a pre-flight refused it — and the pipeline read "no regression
  detected" as "passed". Detection you did not perform is not detection
  (partial-run-never-green).
- **The argmax winner.** Two targets 0.01 apart with wide overlapping
  intervals, and the report bolds one of them. Every reader downstream now
  believes a claim no test supports (tested-superiority-claims).

## What a run must record for any of this to work

Pairing and correction are only as good as the run metadata: the case
identifiers and per-case scores (not just the mean), the dataset version,
the mode and target that make two runs "comparable", the family size the
correction was computed over, the surviving per-comparison threshold, the
method that produced the verdict, and the caveats. A gate retrofitted onto
runs that stored only means cannot pair, cannot correct honestly, and
cannot explain itself — it can only compare scalars and apologize. Record
per-case evidence from the first run, even before the statistics exist to
consume it.
