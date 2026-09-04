---
layer: technique
type: technique
subject: eval-harness
technique: outcome-conditioned-cost
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [comparing tokens time or tool calls between arms that can fail, an efficiency delta computed over trials that never reached an answer, a cheaper arm turns out to have given up earlier, deciding which trials a resource comparison may include]
---

# Outcome-conditioned cost

Quality metrics and cost metrics look alike in a results table and behave
nothing alike when a trial fails. A failed trial's *score* is a real
observation — the system did not solve it, and that is the finding. A failed
trial's **cost** is not an observation about efficiency at all. It is the
price of a trajectory that went wrong, and trajectories go wrong in two
directions that move the number in opposite ways:

- **Premature stopping.** The candidate gave up, answered from nothing, or
  hit a refusal. It spent very little. Its cost enters the mean as an
  impressively cheap trial.
- **Unfocused searching.** The candidate could not resolve the task and
  thrashed until a budget cut it off. It spent the maximum. Its cost enters
  the mean as a catastrophically expensive one.

Both are contaminating the cost comparison with the *outcome* distribution.
An arm that fails more often looks cheaper or dearer than it is depending on
which failure shape dominates, and neither tells you what a token or a tool
call bought when the work actually got done.

## The rule

**Compute cost deltas over the subset where every arm succeeded; publish
them beside a primary that includes every completed trial.** Both halves are
load-bearing and neither replaces the other.

- The **conditioned view** is the one that answers "what did this cost when
  it worked". Its denominator is comparable across arms because every trial
  in it reached the same kind of end state.
- The **unconditioned primary** stays because conditioning on the outcome is
  selection on a post-treatment variable. If the treatment changes *which*
  tasks succeed — and a capability worth testing usually does — then the
  both-succeeded subset is a different task mix for each arm, and a report
  that shows only the conditioned number has quietly changed its population
  to the one that flatters it.

State the subset size next to the conditioned figures, always
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
`294 of 300 paired trials` is part of the number, not a footnote. A
conditioned delta whose subset is most of the population is a refinement; one
whose subset is a third of it is a different study, and the reader can only
tell from the count.

## Read the two views against each other

The pair is more informative than either, and the comparison is the point:

- **Conditioned and unconditioned agree.** The cost effect is real and not an
  artifact of differing success rates. This is the common case and the
  boring one.
- **The unconditioned delta is better than the conditioned one.** Some of the
  apparent saving is the cheaper arm failing early. The efficiency claim
  shrinks to the conditioned figure.
- **The conditioned delta is better than the unconditioned one.** The arm
  pays extra on the tasks it fails — usually the thrashing shape — and the
  headline understates what it does when it works. Worth saying out loud,
  because it is the reading teams do not expect and it points at a budget or
  a stopping rule rather than at the capability.

## Outcome must be a verdict, not a proxy

The whole technique rests on a per-trial success predicate, so it inherits
that predicate's quality. Conditioning on a loose one produces a subset that
includes trials nobody would call successful, and the conditioned number then
carries the same authority as the primary while measuring less
— [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
applied to the trial rather than to the harness: a trial that could not run,
a trial that ran and failed, and a trial that ran and succeeded are three
states, and only the third belongs in the conditioned denominator. A trial
that errored, timed out at the harness level, or was cut by a budget before
producing an answer is neither a success nor an informative failure; it is
**incomplete**, and it belongs in neither view. Report its count separately
or the primary silently absorbs infrastructure noise as candidate behaviour.

## What this cannot do

Conditioning repairs the denominator; it does not make cost and quality
commensurable. An arm that is 40% cheaper on the both-succeeded subset and
one percentage point worse on accuracy has not been shown to be better — the
trade is a decision, and this subject's
[metric-role-contract](./metric-role-contract.md) requires it to have been
declared before the run rather than argued from the result. Nor does the
technique say anything about *variance*: two arms with identical conditioned
means can differ enormously in how often they blow a budget, and that is a
distribution question the per-case surface answers
([comparison-modes](./comparison-modes.md)), not a mean.
