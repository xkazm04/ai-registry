---
layer: technique
type: technique
subject: codebase-scanning
technique: causes-beside-the-finding-count
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
applied: code
ab_verdict: better
use_when: [publishing how many findings a scan produced, a backlog number is being read as a count of work, one fix would close several findings at different sites, a population of generated candidates is reported by its size, a discovered root cause is subtracted from a report by hand, deciding whether two findings are one remediation]
---

# Causes beside the finding count

[finding-lifecycle](./finding-lifecycle.md) builds an identity out of rule,
normalized location and a digest of the matched content, then deduplicates on two
horizons: within a sweep, so one defect matched by overlapping patterns files
once, and across sweeps, so a re-found finding refreshes rather than spawns a
sibling. Both horizons ask the same question — *is this the same finding?* — and
the key is built so that the answer is no whenever the rule, the site or the
matched text differs. That is correct, and it is one axis.

The report's total runs on a second axis the key cannot see.

> **A finding count counts emissions. Beside it, publish how many independent
> causes the population contains, and read the gap's direction as the diagnosis
> rather than closing it.**

## Three correct findings, one remediation

A reachability sweep reports a module no entry point reaches. A reference scan
reports its exports as unreferenced. A manifest check reports the dependencies
only that module imported as unused. Three rules, three sites, three digests —
three distinct identities by construction, each emitted correctly, none of them a
duplicate of another. Deleting the module clears all three.

Nothing upstream is wrong. The defect is in the number: a total of three is read
as three pieces of work, three decisions, three chances to be wrong, and it is
one. The same shape appears wherever findings derive from each other — a
misconfigured root and everything behind it, a schema change and every consumer
that now fails validation, a renamed symbol and every stale reference to it.
[excess-indicts-the-instrument](../../../standards-and-gates/quality-gates/techniques/excess-indicts-the-instrument.md)
sees one edge of this when it separates root-sensitive from locally-derived
finding classes and observes that *one missing root condemns everything behind it
at once*; it uses the observation to doubt the instrument's scope. This technique
uses the same dependency to qualify the count even when the scope is right.

## The same axis at the other end of the pipeline

A generator that proposes candidates reports N proposals, and N is a count of
submissions. In a measured population of roughly 150 automatically proposed
mitigation methods, the overwhelming majority were one already-published
technique re-instantiated: the search had covered one point in the method space
and reported a hundred and fifty attempts. The number is true and the breadth it
implies is not.

[selection-over-noise](../../../../llm-agent/evaluation-and-cost/eval-harness/techniques/selection-over-noise.md)
prices what taking the maximum over N noisy draws does to a headline, and
requires N to travel with the number. This is the prior question: whether the N
draws were different draws. A best-of-N over a population with one distinct
approach is not a search that got lucky — it is one approach, measured 150 times,
and its N has to be reported as *distinct approaches* before its maximum means
anything.

## The procedure

1. **State the cause relation before counting.** The relation is *would one
   action resolve both*, and it is instrument-specific: a containment between two
   artifacts, a shared unreachable root, a derivation edge the emitter already
   knows. Write it down. A collapse with no stated relation is a taste, and it
   will be argued every time the number is read.
2. **Compute the relation on every run; never remember its result.** A relation
   discovered once and written into the consumer as a literal is a derived value
   with no recomputation path
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
   It was right on the day it was written and it silently stops being right.
3. **Attribute; do not delete.** Every finding stays in the artifact carrying its
   cause identifier. Collapsing by removal destroys the evidence for the collapse
   and makes the claim unauditable — and the removed rows are exactly the ones a
   reviewer would want to see.
4. **Publish the pair.** Findings, distinct causes, and how many findings the
   multi-finding causes account for — in the same row, in the same record
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
   Either number alone is a claim the population does not support.
5. **Read the direction.**

## The direction is the diagnosis

- **More findings than causes.** Instances are being counted as work. The backlog
  overstates the remediation it represents, the ordering is wrong (a cause
  covering seven findings outranks a cause covering one), and progress reported
  as findings-closed will jump whenever a cause is fixed.
- **More causes than the published number.** A cause was discovered, used to
  suppress its findings, and then counted nowhere. This is the failure the
  drafting rule for this technique did not predict — the collapse is supposed to
  lower the number, and here it raises it, because subtraction is not attribution.

Measured on a scanner emitting one candidate row per (scope, artifact-pair) over
an 83-row escalated backlog. A detector run earlier in the project's history had
established that one artifact's whole change set was carried inside another's, so
the two collided in every scope they shared — seven rows, one fact — and it
published that relation, with two siblings, in a register. The consumer of the
backlog absorbed the result as a literal pair of identifiers. The seven rows were
removed and the fact was then counted nowhere, so the shipped backlog number, 76,
was wrong in both directions at once: it presented 76 rows as 76 independent
findings, and it had already deleted the one cause it knew about. Reading the
register instead of the constant gave 83 rows, 77 distinct causes, 7 rows
explained by one relation, and no row leaving the artifact. **The count went up.**
The register's second relation, which a constant cannot express, now applies with
no code change. Floor: the (scope, artifact-pair) set was identical across the
arms and the project's unit lane stayed green.

## Over-collapsing is the live risk

Two findings that share a participant do not share a cause. In the same backlog,
one artifact appeared against four others across four scopes; those are four
relationships and four remediations, and collapsing on the shared participant
would have turned four real findings into one. What separated the two situations
was not size, position or intuition — it was the stated relation, computed:
verbatim overlap of the two artifacts' change sets, above a threshold set from the
observed distribution, with unrelated control pairs measuring zero. Where that
relation is unavailable or expensive, the honest output is the finding count with
"cause relation not computed" beside it, not a guessed collapse. A wrong collapse
is worse than no collapse, because it removes work while claiming precision.

## What this does not do

It does not change which findings are true, and it is not a substitute for
identity dedup — a population can be perfectly deduplicated on identity and still
contain one cause. It says nothing about severity: a cause explaining one finding
can outrank a cause explaining twenty. And it cannot be inferred from the shape of
a report; a finding population whose causes were never computed reports the same
way as one whose findings are genuinely independent, which is precisely why the
cause count has to be printed rather than assumed.
