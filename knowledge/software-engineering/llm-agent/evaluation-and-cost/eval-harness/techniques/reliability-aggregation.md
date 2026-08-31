---
layer: technique
type: technique
subject: eval-harness
technique: reliability-aggregation
status: forged
laws: [count-carries-predicate, gate-sees-target]
shared_with: []
use_when: [choosing the aggregation rule for repeated trials, a headline score looks strong and the feature is unreliable in production, deciding whether a capability is good enough to run unattended]
---

# Reliability aggregation

The golden path establishes that a non-deterministic result is a
distribution, that N is declared, and that the aggregation rule travels with
the number. It then lists the rules available: mean, median, worst-of-N,
pass-rate against a threshold. That list has a hole in it, and the missing
entry is the one most decisions actually need.

**Any-of-N and all-of-N are both computable from the same trials, they answer
opposite questions, and they diverge most exactly where the stakes are
highest.**

- **Any-of-N** — the probability that at least one of N attempts succeeds.
  It answers *is this achievable at all* — a capability question, and the
  right one when a human will retry, when the harness itself retries, or when
  you are asking whether a system can reach a solution rather than whether it
  reaches one dependably.
- **All-of-N** — the probability that every one of N attempts succeeds. It
  answers *can this be relied upon* — the question behind shipping something
  unattended, putting it behind a gate, or letting it run without a person
  ready to notice the bad case.

Same trials. Different question. The gap between them is not a rounding
difference: at two successes in three trials, any-of-3 sits near 96% and
all-of-3 near 30%. A harness reporting the first has not lied — it declared
its aggregation, as the golden path requires — and it has still told a team
deciding whether to automate something that a capability succeeding
end-to-end under a third of the time is a 96%.

## Why declaring the rule is not enough

[count-carries-predicate](../../../../_laws.md#count-carries-predicate)
requires the aggregation to travel with the number, and that requirement is
usually read as a *labelling* obligation: say which rule you used and the
reader can interpret it. For these two rules that is insufficient, because
the reader is rarely comparing the number against another number. They are
comparing it against a decision — ship it, gate on it, run it unattended —
and the decision has a rule that is correct for it.

So the selection is upstream of the labelling, and it belongs where the
subject already puts decisions of this kind:
[metric-role-contract](./metric-role-contract.md) requires the harness to
state what decision the numbers are for *before it measures*. Reliability
aggregation is that contract's answer for repeated trials. Name the decision
first; the rule follows from it, and is then declared as the law requires.

The default drifts toward any-of-N for a reason worth naming: it is the more
flattering number, it rises with N, and adding trials makes it rise further.
All-of-N moves the other way — more trials can only lower it — which reads as
the harness getting worse while the system stays the same. That asymmetry is
correct and it is the point. Confidence that something works every time is
harder to earn from more evidence, not easier.

## Report the pair, and let the spread be the finding

Neither rule is the honest one on its own; the informative object is both,
over the same trials, side by side. The spread between them *is* the
system's instability, expressed in the units of the decision rather than as
an abstract variance figure — which is what makes it legible to someone who
is not reading the harness.

Three readings, and each prescribes different work:

- **Both high.** Capable and dependable. The only combination that supports
  unattended operation.
- **Both low.** The system cannot do this. A capability problem, and the work
  is upstream of reliability entirely.
- **High any-of-N, low all-of-N.** The system knows how to do this and does
  not do it consistently — and this is the cell that is invisible to a
  single-rule report, gets shipped, and fails in production at a rate nobody
  predicted from a green dashboard. The work it prescribes is neither a
  better model nor a better prompt: it is a retry path, a verification step,
  or an admission that a person stays in the loop.

That third row is the whole argument for carrying two numbers. It is a
distinct diagnosis with a distinct remedy, and a harness reporting one
aggregate cannot express it — under any-of-N it looks like the first row,
under all-of-N like the second, and it is neither.

## Trial count binds what can be claimed

Both rules are estimates over the trials actually run, and neither can be
computed for a sample size larger than N. An all-of-5 claim from three trials
is not a conservative extrapolation; it is unavailable, and a harness that
produces one has substituted a model for a measurement. State the rule with
its N attached — the law's requirement, and here it is also a hard
availability constraint rather than a formatting convention.

The corollary is a budget question the subject already prices
([eval-economics](./eval-economics.md)): the reliability claim a decision
needs sets the minimum trial count, so N is chosen from the decision and not
from what the run happens to afford. A decision requiring confidence across
five consecutive attempts cannot be made from a three-trial grid at any level
of care, and the cheapest honest response is to narrow the scenario set and
raise N on what remains rather than to report a wider grid at a sample size
that cannot answer the question asked of it.

## What this cannot do

Both rules read a boolean per trial, so they inherit whatever decided it. A
scenario whose pass predicate is loose reports a reliable system reliably
meeting a weak bar
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and the pair of
numbers makes that failure *more* convincing rather than less, because two
agreeing statistics look like corroboration when they are one predicate
counted twice. The pair measures consistency of the verdict, never the
verdict's quality; that remains the scenario's job, and a high all-of-N over
a bad predicate is the most confident wrong number this subject can produce.
