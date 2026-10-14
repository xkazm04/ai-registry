---
layer: technique
type: technique
subject: measurement-honesty
technique: the-baseline-is-the-untouched-path
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [publishing a saving or reduction an intervention claims for itself, an intervention changes the request it then measures against, both arms of a comparison are counted with an approximate estimator, a per-item decision is made on a ratio of two estimates, a reported saving looks implausibly large for what the consumer experienced]
---

# The baseline is the untouched path

Every "how much better" figure an intervention publishes about itself - a
saving, a reduction, a speedup - is a ratio of two arms, and its honesty sits
in the denominator. The control arm is **what the consumer would have
received had the intervention not been there**: the same request, as the
consumer issued it, measured on the instrument the consumer pays in. Two
drifts move that arm while looking like rigour, and both were measured on one
tree that reported its own savings to its users.

## The arm the consumer would have received

An intervention that needs structured input is tempted to ask for it: add the
tool's machine-readable flag, parse the structured form, emit something
smaller. Then it measures itself against what it ran. That arm is the
intervention's own input, and structured forms are routinely an order of
magnitude larger than the form the consumer would have read.

Measured on the source tree, on one small failing test suite and one small
lint run:

| Command | Plain output | Injected form | Intervention emitted | Booked saving |
| --- | --- | --- | --- | --- |
| test runner | 73 bytes | 3,024 bytes (41x) | 224 bytes | 95.1% |
| linter | 3,349 bytes (default), 1,133 (concise) | 13,782 bytes | 1,313 bytes | 90.5% |

Against the untouched path the test runner's saving was not 95%; the
intervention emitted three times the bytes the consumer would have read. The
lint saving was real against the default form and negative against the
tool's own concise form. The booked numbers were computed correctly over the
wrong arm, which is the failure a reviewer cannot see in the arithmetic
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

The same tree shows the remedy is payable: for one command it ran the plain
form separately, purely to have an honest baseline. That is the rule, with
the cost stated:

- **Name the untouched path** - the request as the consumer issued it - before
  measuring anything, and write it beside the figure.
- **Measure that path**, not the intervention's input. Where producing it
  costs a second run, run it on a sample and carry the measured ratio for
  that tool; never substitute the intervention's own request because it was
  already in hand.
- **A guard that compares arms inherits the same error.** A "never emit more
  than the original" check run against the injected form cannot fire when the
  intervention emits more than the consumer would have read - the guard and
  the booking fail together, silently, on the same comparison.

## A ratio of estimates holds in the aggregate, not per item

When both arms are counted with the same approximate estimator - a length
divided by a constant, standing in for a tokenizer - the common claim is that
the error cancels in the ratio. It cancels only if the estimator is equally
wrong about what was removed and what was kept, and an intervention that
removes material selectively removes it by content class: whitespace,
punctuation, repeated keys, progress lines, non-ASCII text. Those are exactly
the classes a length estimate gets wrong in different directions.

Measured on the same tree's own paired test cases (84 pairs of an original and
the intervention's expected output), comparing the length estimate to a real
subword tokenizer:

- The **mean** saving was 50.6% by the estimate and 51.2% by the tokenizer -
  within a point. In aggregate, on this workload, the claim held.
- **Per pair**, the estimate's error ran from 29.7 points under to 16.6 points
  over, and its sign followed what was removed: stripping download lines was
  overstated, stripping status lines understated. Two tokenizer families
  gave the same shape.
- The **absolute** counts were off in one direction: 1.17 real tokens per
  estimated token on the original side.

So the estimate is fit for one use and not for the other. An aggregate claim
over a mixed workload may carry it, with its measured spread stated beside
it. A **per-item decision** - a guard deciding which arm is smaller, a
per-filter acceptance bar, a ranking of interventions - may not, because a
per-item error does not average away inside the item it decides. Use the
consumer's instrument there, or measure the estimator's error on that item's
content class first.

## The figure carries its arm

A saving published without its control arm and its instrument is a number
that will be compared against one measured differently
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
"95% saved, against the structured form the tool was asked for, by length
estimate" is a finding a reader can evaluate. "95% saved" is a claim about the
consumer the measurement never observed.

## Decision rules

- Define the control arm as the request the consumer issued, measured on the
  consumer's instrument, before measuring the intervention.
- Never measure an intervention against an input it constructed for itself;
  where the untouched path is costly, sample it and carry the ratio.
- Run any arm-comparing guard against the same untouched path the accounting
  uses.
- Treat a ratio of two estimates as aggregate-grade only: publish its spread,
  and decide nothing per item on it without measuring the estimator's error
  on that item's content.
- Publish every saving with its control arm and its instrument named.

## When not to use it

Where the intervention changes nothing about the request and the consumer's
instrument is the one counting both arms - a billed usage figure with and
without the intervention, on the same requests - the control arm is already
the untouched path and the ratio is exact. And a comparison between two
interventions, both measured against the same honest baseline, needs no
second baseline; it needs the first one stated.
