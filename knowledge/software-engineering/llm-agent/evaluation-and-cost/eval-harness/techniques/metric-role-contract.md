---
layer: technique
type: technique
subject: eval-harness
technique: metric-role-contract
status: forged
laws: [count-carries-predicate, gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [declaring what an eval run decides before it runs, a result improves one metric and worsens another, a composite is about to average metrics with different consequences]
---

# Metric role contract

Before a harness measures anything it must answer a question that is not
about measurement at all: **what decision are these numbers for?** A suite
that skips it produces a row of numbers all wearing the same hat, and the
first result that moves two of them in opposite directions has to be settled
by argument — in a meeting, after the fact, by whoever is most invested in
shipping.

The contract that prevents this is small and it is declared once, before the
first run:

> **Exactly one metric is optimized. Every other metric is a threshold that
> is either cleared or not.**

That is the whole rule. The rest of this technique is what it costs to hold
it.

## One optimized metric, N satisficing constraints

Metrics arriving from a real product fall into two kinds, and only two:

- **The optimized metric.** The one the work exists to move. There is exactly
  one, and "exactly" is load-bearing — the moment a suite has two, every
  result that trades them is un-decidable by the suite and gets decided by a
  person instead.
- **The constraints.** Everything else. Each carries a declared threshold and
  a direction, and it contributes nothing to the verdict as long as it is on
  the right side of that threshold. A constraint does not get partial credit
  for being *comfortably* clear, and it does not get forgiven for being
  *narrowly* breached.

Constraints come in two flavours worth separating in the report even though
they behave identically in the verdict. **Quality constraints** are the
errors the system is allowed to make, bounded: the class of mistake that is
worse than the one being optimized away. **Operational constraints** decide
whether a result is deployable at all — latency, cost per unit of work,
reliability, compatibility with the pipeline that will host it. A change that
improves the optimized metric and doubles the response time has not produced
an improvement; it has produced a different product.

## Which metric is the constraint is an irreversibility question

The choice is not "which number is bigger" or "which does the team care about
more". It is:

> **Which of these errors cannot be taken back?**

An error a person can notice and undo costs attention. An error that
silently removes something — a suppressed real signal, a discarded record, an
irreversible action taken on a wrong classification — costs whatever that
thing was worth, and the system's user never learns it happened. The
reversible error is the one you optimize away; the irreversible one is the
constraint, however small its rate. This is why a pair of metrics that are
mathematically symmetric are almost never symmetric in a product, and why
treating them as interchangeable is the specific failure this technique
exists to prevent.

The consequence is uncomfortable and correct: **a large gain on the optimized
metric that breaches a constraint does not advance.** Not "advances with a
caveat", not "advances pending discussion" — the constraint was declared as
the price of running the experiment at all, and renegotiating it after seeing
a result you like is the same move as choosing an aggregation after seeing
the data.

## The thresholds are declared once, in one place, before the run

A threshold that lives in a reviewer's head is not a constraint, it is a
preference. Each one is written down with the suite — the metric, the
direction, the number, and one sentence on why that number and not a
different one — and every consumer of a verdict reads it from there
([_laws: one-authority-per-vocabulary_](../../../../_laws.md#one-authority-per-vocabulary)).
Two copies of a threshold drift the first time someone tightens one of them.

Declaring it early has a second effect that is worth more than the
bookkeeping: it forces the team to name an acceptable amount of the bad
outcome, in advance, when nobody has a result to defend. That conversation
is much cheaper before the first run than after a promising one.

## What the contract forbids: the composite

The failure mode this technique is aimed at is a single number. Averaging or
weighting metrics with different roles produces a score that is higher for a
result that breaches a constraint than for one that does not, and a gate
reading that score is gating a proxy for the decision rather than the
decision
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)). The
weights feel like they encode the priorities; they encode a *rate of
substitution*, which is a claim that enough of the optimized metric buys back
any amount of the constraint. That claim is false wherever the constraint is
the irreversible error, which is exactly where it was placed.

Composite arithmetic over criteria that genuinely *are* commensurate is a
legitimate and separate problem, owned by the scoring-rubrics subject. The
line between the two is this technique's job: decide the roles first, and
only what shares a role is ever eligible to compose.

## Reporting: a verdict, not a table

Every run reports the optimized metric with its movement, each constraint
with its threshold and its margin, and a single advance / do-not-advance
verdict derived from them by the declared rule. A number that travels out of
the harness carries its role
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate));
a precision figure quoted without saying whether it was the objective or the
floor will be reused for the claim it does not support.

The margin matters even when the verdict is clean. A constraint cleared by a
hair across several consecutive runs is a constraint about to be breached,
and it is the only early warning the contract produces.

## What this technique does not own

Deciding whether a movement is *real* — whether a drop is signal or the noise
of a thirty-case run — is a statistical question, and it is settled after
this contract, not by it. The contract says which metrics may block and at
what level; it says nothing about whether this run's number differs from the
last one's for a reason. A harness that declares roles and then compares raw
means has done half the work: the roles decide *what would count*, the
statistics decide *whether it happened*. Both are required, and neither
substitutes for the other.

## Where it fails

- **Two optimized metrics.** The commonest violation and the hardest to see,
  because it usually arrives as a genuine product ambiguity rather than an
  error. It is still a violation: pick one, demote the other to a constraint
  with a threshold, and write down what that demotion cost.
- **A constraint with no threshold.** "Keep an eye on latency" is not a
  constraint. Unthresholded metrics are decoration; either give it a number
  or stop reporting it as though it gates anything.
- **A threshold set from the first run's result.** Deriving the floor from
  the baseline you are trying to beat guarantees it will never bind, which is
  the point at which the constraint has been removed without anyone deciding
  to remove it.
