---
layer: technique
type: technique
subject: claimed-improvement-remeasurement
technique: three-way-verdict-over-raw-samples
status: forged
laws: [unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [turning base and head timing samples into a verdict on a claimed gain, a judge returns yes or no on two or three runs, choosing a tolerance for a noisy CI series]
---

# Three-way verdict over raw samples

The judge holds two sets of raw samples — per-run durations, latencies or costs, one value
per run — for the base and for the head. It returns exactly one of three verdicts, and the
third one is the reason it is trustworthy.

- **Credited** — the head is better than the base by more than the tolerance.
- **Not earned** — both sides cleared their floors, the series is quiet enough to decide, and
  the head is not better by more than the tolerance: unchanged, or worse.
- **Inconclusive** — the judge cannot decide, with a reason that names what would let it.

A two-valued judge maps inconclusive onto one of the others, and both mappings are
dishonest: onto *not earned* it convicts a claimant for the repository's traffic, onto
*credited* it pays out for noise. This is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) for a comparison.

## Before the verdict: what counts as a sample, and waiting

A sample is the value of one **successful** run or stage. A failed run's duration measures the
failure — a test suite that died at minute two is not a fast suite — and a run whose command
exited non-zero yields no value at all, never its elapsed time. A stage that was skipped yields
no value either, never zero. This filter runs at sample extraction, so absences shrink the
count honestly instead of entering the median as zeros
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

A shortfall that time will cure by itself — the change has landed and two head runs exist so
far — is reported as **waiting, k of N**, and no verdict is recorded yet. Writing an
inconclusive verdict every time the judge looks would bury the one that matters under a
dozen that only said "not yet". Inconclusive is the verdict for a shortfall that will *not*
cure itself: a queued batch that finished with too few usable runs, a series that is noisy,
a base that cannot be measured.

## The procedure, in order

Each inconclusive exit carries its own reason code, because the claimant's next move differs
per reason.

1. **Comparability.** Base and head must come from the same runner class (and, for a stage
   target, the same stage name). Samples from different machine classes compare the machines,
   so the verdict is *inconclusive: not comparable*, never a delta.
2. **Sample floors.** Count the samples on each side. If either is below its floor, return
   *inconclusive: too few samples* with both counts. The floor itself belongs to
   [minimum-sample-floors](../../measurement-honesty/techniques/minimum-sample-floors.md);
   the point here is that it is checked **per side**, because a hundred base runs do not rescue
   three head runs. A metric that reads the same value every run — a count, a size — takes a
   floor of one; a wall time never does.
3. **Centre and spread.** Take the median of each side. Read spread from the same samples,
   relative to the median. At three to five samples the range over the median is all the
   sample can support; from roughly eight upward, prefer the interquartile range or the median
   absolute deviation, which one cold-cache run cannot inflate. Means are the wrong centre: a CI
   timing series has a heavy right tail of cold caches, contended runners and retries, and one
   such run moves a mean more than most real changes do.
4. **Unmeasurable base.** If the base median is zero or the base samples are all absent, return
   *inconclusive: base unmeasurable*. A zero-duration stage is one the instrument did not see,
   and a relative gain over zero has no denominator — never a perfect base, never an infinite
   improvement. The asymmetry is worth knowing: a *regression* check over a zero base can still
   decide, because any worse move from zero is beyond every fraction; only a *gain* is
   undefined there.
5. **The tolerance, clamped.** The tolerance is a fraction of the base median, taken from
   reviewed policy (a default) and never above a policy ceiling; when anything else proposes a
   tolerance — an evidence job, a per-target override — the ceiling clamps it. A team that
   derives the tolerance from measured spread instead clamps it at both ends: a floor so a
   dead-quiet series cannot turn sub-second jitter into a credited win, the ceiling so a noisy
   one cannot widen the band until nothing is ever decided. The instrument's measured band from
   [noise-band-and-hysteresis](../../measurement-honesty/techniques/noise-band-and-hysteresis.md)
   is the natural floor.
6. **Noise exit.** If either side's spread exceeds a fixed multiple of the tolerance — twice is
   a defensible default — return *inconclusive: noisy*, with both spreads. A difference smaller
   than the series' own scatter is not evidence either way, and calling it *not earned* would
   convict the claimant for the runner fleet.
7. **Compare.** Relative change = (head median − base median) / base median, signed by the
   metric's direction so that improvement is positive. Beyond the tolerance: credited.
   Otherwise: not earned, with the reason saying *within tolerance* or *worse*.

Steps 4 and 6 may run in either order; both must precede the comparison, and the floors must
precede both, because a spread over two samples is not a measurement of noise.

## Why not a significance test

A rank test over the two samples is a defensible upgrade, and published regression detectors
use one. It does not replace the steps above: it still needs floors (a two-sided exact rank
test over three samples a side cannot get below p = 0.10), it still needs the zero-base exit,
and a significant difference smaller than the tolerance is real and worthless.
When one is added, add it as a further gate inside step 7, never as a replacement for the clamp.

## The output record

Record the verdict with both medians, both spreads, both counts, the tolerance actually used,
and the reason code. A verdict that cannot be recomputed from its own record is a claim by the
judge, and the judge is not exempt from the rule it enforces. The claimed figure sits beside
this record and is never an input to it.

## Decision rules

- When a shortfall will cure itself with time, report waiting and record nothing; when it will
  not, the verdict is inconclusive with the counts.
- When base and head ran on different machine classes, inconclusive — never a delta.
- When the base median is zero or absent, a gain is inconclusive — never a percentage.
- When spread exceeds the noise multiple of the tolerance, inconclusive with the spreads.
- When a regression is measured, the verdict is not earned; whether it also raises an alarm is
  a different system's decision.

## When not to use it

For a deterministic count rather than a timing, one reading per side decides, and spread is
overhead. For a claim over a population of services rather than one series, compare per series
first; pooling medians across series of different scales produces a number that belongs to
none of them.
