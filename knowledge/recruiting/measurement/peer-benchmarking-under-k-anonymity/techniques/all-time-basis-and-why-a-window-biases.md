---
layer: technique
type: technique
subject: peer-benchmarking-under-k-anonymity
technique: all-time-basis-and-why-a-window-biases
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
use_when: [choosing the time basis for a duration benchmark, defending an all-time figure against a request for recency, diagnosing a benchmark everyone seems to be losing against]
shared_with: []
---

# All-time basis, and why a window biases

A cross-organisation duration benchmark is computed over **all completed
processes**, not over a recent window — and the reason is not convenience or
sample size. A window applied to a duration metric biases it **low**, in one
direction, by an amount nobody can see.

## The bias argument

Filter completed hires to those that completed in the last ninety days. A hire
that took a hundred and twenty days cannot appear in that set unless it started
before the window and finished inside it — and as the window tightens, that
possibility shrinks toward zero. The window is structurally incapable of
containing its own slow cases. What remains is the fast ones, and the published
average is their average.

This is survivorship, not noise. It does not average out with more data; more
data inside a tight window means more *fast* data. Three consequences follow,
and all three are damaging:

- **Every participant looks slow.** A team computing its own honest all-time
  time-to-hire compares it against a peer figure from which the hard roles were
  silently removed, concludes it is below par, and acts.
- **The bias is invisible.** The benchmark carries a large sample, a real
  contributor count, and no symptom. Nothing in the output distinguishes a
  genuinely fast market from a tight window.
- **The bias is worst exactly where the stakes are highest.** Hard-to-fill roles
  — the ones a team most wants a benchmark for — are the ones the window drops.

An all-time basis has its own weakness: it mixes eras, so a genuine market shift
takes a long time to show up, and a long-lived contributor's ancient processes
carry the same weight as last month's. That weakness is real, but it is
**symmetric and disclosed** — stating the basis tells the reader the number is
slow-moving. A survivorship bias is neither symmetric nor disclosed. Prefer the
weakness you can name in one sentence.

## Procedure

1. **Default duration benchmarks to all completed processes.** State the basis
   plainly: *all completed hires, all time, across N organisations*.
2. **Include only completed processes**, and say so. A process still running has
   no duration yet; including it as its elapsed-so-far understates, and excluding
   it silently is the same survivorship problem in miniature.
3. **When recency is genuinely required, window by process start, not by
   completion.** Select processes that *started* in the window, and admit only
   cohorts old enough that the slow ones have had time to finish — the accrual
   horizon the small-sample discipline names. A cohort younger than the horizon
   is preliminary, and is labelled as such rather than published.
4. **Re-check the floors on the windowed cohort.** Windowing shrinks both the
   observation count and often the contributor count, and a window is a filter
   like any other.
5. **Never mix bases in one comparison.** A team's own windowed figure against
   an all-time peer figure is not a comparison; it is two different measurements
   rendered side by side, which readers will subtract anyway.
6. **Pin the printed basis to the computation with a test.** The sentence on
   screen ("all time, across N organisations") and the code that produces the
   number are two artefacts that will drift, and the drift is silent — the
   number keeps rendering. A guard that fails when the computation grows a
   window parameter while the surface still claims all-time is what makes the
   basis a contract rather than a caption.

## A control that would withhold is not a control

Before offering a reader any control that narrows the cohort — a date-range
switcher, a role filter, a region selector — evaluate what it does to the
floors. Over a k-anonymised benchmark, a narrowing control usually does not
narrow the figure; it **deletes** it, because the narrowed cohort no longer
clears the contributor and observation floors.

A switcher that makes the panel disappear is not a scoped view, and it is worse
than no switcher at all: it promises the reader a capability the data cannot
support, and the failure is silent in the most damaging way — a control rendered
in its active state above a section that quietly ignored it, so the reader
believes they are looking at a scoped number when they are looking at the
unscoped one. Either thread the control through every figure it visually
governs, or scope it visibly to the figures that honour it. A shared header
control above a mixed page is the standing version of this bug.

## Which metrics this applies to

The bias is specific to metrics whose **value is correlated with how long the
process takes**, because that is what makes completion-windowing selective:

- **Strongly affected:** time-to-hire, time-to-fill, time-in-stage, days to
  first interview, offer-to-start elapsed time.
- **Weakly affected:** conversion and acceptance rates, where slow processes are
  not systematically different in outcome — though check the assumption, because
  in some markets they are.
- **Unaffected:** point-in-time counts and volumes, which have no duration to
  truncate.

Where the metric is only weakly affected, a window may be worth its recency.
Where it is strongly affected, the window is a defect, and no amount of sample
size fixes it.

## Decision rules

- When a stakeholder asks for "the last quarter" on a duration benchmark,
  answer with the survivorship argument, not with sample size. Sample size is
  arguable; the truncation is not.
- When both bases are wanted, publish the all-time figure as the benchmark and
  the start-windowed, horizon-matured figure as a trend, each with its own
  basis. Two labelled numbers are honest; one number with a shifting definition
  is not.
- When a benchmark's value moves sharply after a change to the time basis, the
  change is the finding — record it, because someone will later attribute the
  shift to the market.
- When a market shift genuinely needs to be visible faster than an all-time
  basis allows, weight by recency explicitly and state the weighting, rather
  than truncating. A weighted mean over all completions has no survivorship
  hole; a window does.
- When the underlying processes have no completion event at all — an
  ever-open pipeline, a role withdrawn rather than filled — those rows are not
  slow, they are censored, and folding them in either direction is
  [inference dressed as measurement](../../../_laws.md#inference-must-look-like-inference).
  Report them as a separate count.

## When not to use this

Do not carry an all-time basis into metrics where the world has demonstrably
changed and history is misleading rather than merely stale — a compensation
band, for instance, where a figure from four years ago is not a slow signal but
a wrong one. There, recency is part of the definition of the quantity, and the
correct answer is a stated, bounded window with the sample consequences accepted
and the floors re-checked.

Do not use the all-time basis as an excuse to skip stating the basis. "All time"
is a basis and must be written down
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis));
a benchmark whose time basis is implicit will be compared against a windowed
figure by the first person who builds a second chart.
