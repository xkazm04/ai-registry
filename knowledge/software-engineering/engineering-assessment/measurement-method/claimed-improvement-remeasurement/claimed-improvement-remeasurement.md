---
layer: golden-path
type: golden-path
subject: claimed-improvement-remeasurement
status: forged
use_when: [an agent or contributor claims a change made the pipeline faster or cheaper, crediting a performance improvement before it counts toward someone's record, deciding which commit moved a timing series, building a judge that re-measures a claimed gain]
techniques:
  - claimant-figure-never-decides
  - three-way-verdict-over-raw-samples
  - change-point-by-ancestry
  - queued-runs-as-head-sample
  - watermark-halts-at-unfinished
---

# Claimed-improvement remeasurement

Someone says a change made things better: the pipeline is forty percent faster, the
endpoint's latency halved, the nightly job costs a third of what it did. The someone is
increasingly an agent, and the claim increasingly carries weight — it is credited to the
agent's record, it lifts an autonomy tier, it is quoted in a release note. A claimed
improvement is a **hypothesis about two distributions**, the one before the change and the
one after it, and the only honest way to settle it is to re-measure both from raw samples
with a judge that never saw the figure being claimed.

That sentence carries the whole subject, and each clause closes a failure the naive reading
leaves open. *Re-measure*, because the claimant's own measurement was taken on its own
machine, against its own choice of baseline, at its own choice of moment, and usually once.
*Both*, because a head figure alone is a number with no comparison, and a base figure
remembered from the claimant's description is the claimant's figure again. *Raw samples*,
because a pre-aggregated mean has already discarded the spread that decides whether the
difference is real. *Never saw the figure*, because a judge that knows the number it is
meant to confirm finds a way to confirm it — through a tolerance widened "just enough", a
window chosen to include the good runs, a comparison scoped to the benchmark the claimant
ran. This is [claimant-does-not-adjudicate](../../../_laws.md#claimant-does-not-adjudicate)
applied to a quantity.

## Where this subject sits

[measurement-honesty](../measurement-honesty/measurement-honesty.md) owns what a single
number is permitted to say: the sample floor below which a rate is refused
([minimum-sample-floors](../measurement-honesty/techniques/minimum-sample-floors.md)), the
instrument's measured noise band and the hysteresis on announcements
([noise-band-and-hysteresis](../measurement-honesty/techniques/noise-band-and-hysteresis.md)),
the separation of an unmeasurable value from a measured zero. This subject consumes all of
it and restates none of it. What it owns is the **adjudication of a claimed delta between two
code states**: which samples belong to the before and which to the after, what the judge is
allowed to read, the three verdicts it can return, and how the moment of change is found when
nobody marked it. The rule a reader uses to pick: if the question is *what may this number
honestly say*, read the neighbour; if it is *did this change earn the improvement someone
claimed for it*, read this.

[completion-claim-verification](../../../llm-agent/orchestration/fleet-orchestration/techniques/completion-claim-verification.md)
settles whether a delegate's *done* is true — whether the artifact exists and does what was
asked. It is binary and structural. A claimed improvement is a magnitude, and an agent can
complete its task honestly and still overstate what the task achieved; the two checks run in
sequence and neither substitutes for the other.
[metric-gates](../../../engineering-process/standards-and-gates/metric-gates/metric-gates.md)
compares a head measurement against a recorded baseline in order to *refuse a merge*. This
subject usually runs after the merge, over organic runs, and its output is *credit*, not a
block; where a team wants a claimed gain to gate, the gate's mechanics are the neighbour's and
the verdict it reads is this subject's.

## The judge's inputs are fixed before the claim is read

The defining structural move is a separation of channels. The claim arrives with a figure,
a description, often a chart. The judge's input is the change's identity — the commit, the
pipeline, the metric name — and the raw run records the system collected itself. The claimed
figure is stored and displayed beside the verdict, because a reader wants to see the claim
and the measurement side by side and the *gap* between them is itself a record of the
claimant's calibration. It never reaches any parameter the verdict reads: not the tolerance,
not the window, not the choice of metric, not the sample selection. The discipline, and the
leak points that defeat it in practice, are
[claimant-figure-never-decides](./techniques/claimant-figure-never-decides.md).

## Three verdicts, read from medians and spread

A judge that can say only yes or no will say one of them about a comparison it had no right
to decide. The honest output has three values: **credited** (head is better than base by more
than the noise allows), **not earned** (the samples are sufficient and the improvement is not
there — no change, or a regression), and **inconclusive** (the judge cannot tell, and says
why). Inconclusive is not a polite no. It is returned when base and head ran on different
runner classes, when either side is below its sample floor, when the base is zero or
unmeasurable so a relative gain has no denominator, and when the spread of the samples is
wide enough to swallow any gain the tolerance would credit; it carries the reason
so the claimant knows whether to wait for more runs or to fix the instrument.

The arithmetic is deliberately plain. Medians, not means, because a CI timing distribution
has a long right tail — a cold cache, a contended runner, a retried download — and one such
run drags a mean further than any honest change moves it. Spread read from the same samples,
so the noise is this series' own rather than assumed from a global constant, and a series
whose spread exceeds a multiple of the tolerance is too noisy to decide. A tolerance held in
reviewed policy and **clamped** to a ceiling there, because anything that proposes a wider one
— an evidence job running in the very pipeline the change can edit — is the judged party
choosing its own margin. Only successful runs yield samples: a failed run's duration measures
the failure. And a shortfall that time will cure by itself is *waiting, k of N*, not a verdict
at all; inconclusive is reserved for what will not cure itself. The procedure, the order of
the checks, and why the zero base is its own case are
[three-way-verdict-over-raw-samples](./techniques/three-way-verdict-over-raw-samples.md).

## Before and after are defined by ancestry, not by the clock

The comparison needs two sets, and the tempting definition — runs before the change landed
and runs after — is wrong on any repository with branches. A run started an hour after the
merge may be building a branch that does not contain the change; a run on a commit that
contains it may have started before the merge, on the feature branch. Time ordering mixes the
sets, and a mixed head sample dilutes a real gain into an inconclusive one or, worse, credits
a gain that belongs to an unrelated commit landing at the same time. The base set is runs on
commits that do **not** contain the change; the head set is runs on commits that **do**; and
when nobody named the change — when the question is *which commit moved this series* — the
search walks ancestry the same way, testing candidate commits by which runs descend from them.
That is [change-point-by-ancestry](./techniques/change-point-by-ancestry.md), and it is where
the published practice of change-point detection over performance series meets the fact that
a series of CI runs is a partial order, not a line.

## Getting enough head samples, and not losing any

Organic traffic is slow. A change that landed on a quiet repository may collect two runs in a
week, and two is below any sample floor worth having. The judge therefore asks for samples
rather than waiting for them: it queues a small, capped batch of measurement runs on the
change, as the person who asked, and records the batch's run identifiers as it queues them.
The head is then exactly those runs, compared only once every one of them has finished,
against the same number of runs of the same target that preceded the batch. The batch record is the mark
that separates triggered runs from organic ones: a judge that mixes the two without knowing
which is which cannot tell whether a difference came from the change or from the trigger's
different cache state. [queued-runs-as-head-sample](./techniques/queued-runs-as-head-sample.md)
covers the trigger, the record, the whole-batch wait, and why a run queued by branch name
must still be checked for the commit it actually built.

The samples arrive through incremental collection, which keeps a watermark — the newest run
already read — so each pass reads only what is new. The watermark is the quiet place where
samples are lost. Runs finish out of order; a pass that sees run 41 finished and run 40 still
running, and advances the watermark past both, never reads run 40 again, and the series has a
hole exactly where the slow runs were — which biases every median toward fast. The watermark
advances only to the last run before the first unfinished one:
[watermark-halts-at-unfinished](./techniques/watermark-halts-at-unfinished.md).

## Failure modes of the naive reading

- **"The claim is metadata; the check is what matters."** The claim leaks into the check
  wherever the check has a free parameter. A tolerance set to "the claimed delta minus a
  margin", a window ending where the claimant's benchmark ended, a metric chosen because the
  claim named it while a correlated metric regressed — each lets the claimed figure decide.
- **"Inconclusive means no."** Recording it as not-earned punishes a claimant for the
  repository's traffic, and teaches agents to claim only on busy pipelines. Recording it as
  credited is the opposite fraud. It is a third state with a reason and a path out.
- **"Compare the means."** One retried network fetch moves a mean by more than most real
  improvements. Medians and robust spread, or say nothing.
- **"A base of zero is a perfect base."** A zero-second base is an instrument that did not
  see the stage, and a relative gain over zero is undefined, not infinite. It is the
  unmeasurable state, and the verdict is inconclusive.
- **"Let the evidence say its own tolerance."** The job that produced the numbers runs in the
  pipeline the change can edit; a tolerance it states is a claim, and only a ceiling held
  outside the change's reach bounds it. A tolerance read from spread needs the same clamp, at
  both ends, or a noisy series excuses anything and a silent one convicts anything.
- **"Runs after the merge are the head."** Only runs on commits that contain the change are.
- **"Advance the watermark to the newest finished run."** That skips every run still
  executing beneath it, and the skipped runs are the slow ones.

## What good looks like, compressed

- The claimed figure is stored and shown; no verdict parameter reads it.
- The judge reads raw per-run samples it collected itself, for both base and head.
- Three verdicts, with inconclusive carrying its reason: not comparable, below floor, base
  unmeasurable, spread beyond a multiple of the tolerance.
- Medians compared, spread read from the same samples, the tolerance from reviewed policy and
  clamped to its ceiling; floors and bands are the measurement-honesty subject's.
- Base and head are sets defined by commit ancestry; a change point is located the same way,
  by binary search where the runs follow one line of history.
- Head samples are requested in a recorded batch, judged only once the whole batch finished.
- Incremental collection never advances past an unfinished run.

## The techniques

- [claimant-figure-never-decides](./techniques/claimant-figure-never-decides.md) — the claim
  displayed beside the verdict and cut off from every parameter the verdict reads, and the
  leak points where it gets back in.
- [three-way-verdict-over-raw-samples](./techniques/three-way-verdict-over-raw-samples.md) —
  credited, not-earned and inconclusive from medians and robust spread, the zero base, and the
  clamped tolerance.
- [change-point-by-ancestry](./techniques/change-point-by-ancestry.md) — base and head as
  commit-ancestry sets, and locating the commit that moved a series over a partial order.
- [queued-runs-as-head-sample](./techniques/queued-runs-as-head-sample.md) — triggering a
  capped, recorded batch of measurement runs when organic traffic is too thin, and judging over
  exactly that batch once all of it has finished.
- [watermark-halts-at-unfinished](./techniques/watermark-halts-at-unfinished.md) — the
  incremental-collection watermark that stops at the first run still executing, so slow runs
  are never skipped.
