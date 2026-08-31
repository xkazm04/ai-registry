---
layer: technique
type: technique
subject: eval-harness
technique: resolution-precondition
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [a matrix run produced a ranking, publishing an order over models or prompts or configurations, a small margin is about to decide which variant ships, a benchmark's headline is a sorted list]
---

# Resolution precondition

The golden path already requires variance to be reported beside the mean.
That is a *reporting* rule, and it is not the one that binds, because the
number people act on is not the variance — it is the order. A table sorted
best-to-worst is read as an order no matter what the caption underneath it
says, and the caption is where the variance went.

So the discipline needs a step earlier than reporting: a precondition on
whether an order may be published at all.

> Before emitting a ranking, compare the **within-condition** standard
> deviation against the **between-condition** spread of the full compared
> set. If the entire best-to-worst spread sits inside one within-condition
> SD, the harness has not produced an order. It has produced a draw with a
> sort applied to it.

## The number that makes this concrete

On one optimization task run at unusually generous trial counts, the
run-to-run standard deviation *within* a single model-and-effort condition
was 0.075 on the score scale. The spread from the best-tested condition to
the worst — across model families, across vendors, across every effort level
— was 0.069.

Every ranking that matrix could produce sat inside the noise of one of its
own cells. Not the close pairs: all of them. And this was with more trials
per cell than a reader forming an opinion will ever run, which means the
published orderings were the *best-resolved* version of the comparison
anyone had.

The consequence for a single run follows directly and is worth stating in
the form practitioners meet it: for every task, whatever the best condition
is, an individual run of it will frequently score below an individual run of
the worst. This is why single-run anecdotes about conditions reproduce every
possible conclusion — one can find honest support for "A beats B", "B beats
A", and "B is cheaper for equal quality" from the same matrix — and why the
people producing them are not being careless. They are reporting draws.

## What to do when the precondition fails

**Report the tie as the finding.** A tie is a real, expensive and frequently
actionable result: it says the choice does not matter on this suite, which
is often the most useful thing a matrix can say and the one thing a sorted
list can never express. It also converts a live question into a closed one —
nobody needs to re-litigate a choice that has been measured not to matter.

What must not happen is the sorted list with a hedge attached. And precision
is part of the same claim: reporting a margin to more digits than the SD
supports asserts a resolution the run does not have, and the digits are what
survive into the next conversation
([_laws: count-carries-predicate_](../../../../_laws.md#count-carries-predicate)).
A number carries its trial count, its aggregation *and* the spread it had to
clear.

The correct escalation, where the order genuinely matters, is not more
trials at the same suite — it is a suite that discriminates on the axis in
question. A tie is evidence of the suite's indifference, never of the
candidates' equivalence: the same pair can sit inside the noise on one
scenario set and separate cleanly on one built to stress what actually
differs between them. Selecting scenarios the population is split on is
[discriminating-task-selection](./discriminating-task-selection.md); this
technique is the check that tells you when you need it.

## The floor has two contributors, and the larger one binds

There are two independent sources of unresolvability and a harness needs
both numbers:

- **The candidate's spread** — the system under test producing different
  results on identical inputs. That is what this technique measures.
- **The instrument's spread** — the judge disagreeing with itself, and the
  wider swing across defensible judge-and-rubric stacks
  ([judge-stability](./judge-stability.md)).

They are separate quantities with separate causes, they are measured by
separate procedures, and the binding constraint is whichever is larger. A
margin that clears the judge's self-agreement but not the candidate's
run-to-run SD is as unpublished as one that fails the other way. Report both
beside the margin; a harness that reports one has demonstrated only that it
knows about one.

## Corollary: an unchecked monotone axis is an assumption

The same variance discipline kills a convenience assumption that rankings
quietly rest on — that the ordered knobs are ordered. Within a single model
family, additional reasoning effort was measured to make results
monotonically *worse* on some tasks while improving them monotonically on
others, and a higher tier was in places both better and cheaper than the
tier beneath it.

An axis assumed monotone is an axis nobody measured. Where the assumption is
load-bearing — a routing rule that escalates effort on failure, a cost model
that treats a tier as a quality dial — it is established per task rather than
inherited from the axis's name. "More" is not a direction until a run says
it is.

## When not to use it

A gate comparing one system against its own past under a fixed suite is
asking a different question — did this change regress — and its precondition
is the regression threshold, not a between-condition spread there is only
one of. And where the between-condition spread is enormous relative to the
noise, the check passes in one line and costs nothing; run it anyway, because
the cases where it would have failed look identical from the outside until
the numbers are put side by side.
