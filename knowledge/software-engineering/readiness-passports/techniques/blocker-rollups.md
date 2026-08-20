---
layer: technique
type: technique
subject: readiness-passports
technique: blocker-rollups
status: forged
laws: [count-carries-predicate, identity-survives-reuse, failure-not-empty-success]
shared_with: []
use_when: [a portfolio view lists projects but nobody acts on it, sizing shared platform work, ranking what to fix once for many projects]
---

# Blocker rollups

A portfolio of fingerprints displayed as a list of projects and their rungs is
a reference table: correct, dutiful, and rarely the cause of any action. The
read that causes action inverts the axis of the table — from *projects, each
with its blockers* to **blockers, each with its projects**.

The output sentence is the point: *31 of 40 projects are blocked on the same
missing capability, and it is one afternoon of platform work.* Nobody can see
that in a per-project view, no matter how carefully it is rendered. Forty
separate remediation efforts become one, and the rollup is the only thing that
made the shared cause visible.

## The grouping key is a stable identity

Group by a **stable blocker identifier**, minted where the finding is defined
and carried unchanged through the assessment, the fingerprint and the rollup
([identity-survives-reuse](../../_laws.md#identity-survives-reuse)).

Grouping by rendered message text is the standard defect and it fails in both
directions. It **splits** one blocker into several when the message
interpolates anything project-specific — a path, a count, a name — so the
largest shared problem in the fleet appears as thirty singletons and is ranked
last. And it **merges** distinct blockers whose messages happen to coincide
after truncation. Both failures are silent: the rollup renders beautifully and
ranks wrongly.

Where a blocker is legitimately parameterised, the identity is the blocker
kind and the parameters live in a payload that the rollup may show but never
groups on.

## What counts as a blocker

Restrict the rollup to findings that **block a stated transition** — the next
rung on an axis, an admission gate, a launch decision — and say which one. A
rollup over "all findings" degenerates into a frequency table of whatever the
assessor happens to emit most, which is a property of the assessor, not of the
fleet.

Two consequences. A finding that blocks nothing is an observation and belongs
in the per-project view only. And the same finding may be a blocker for one
transition and not another, so the rollup is scoped: *blockers to delegate-rung
3*, not *blockers*.

## Count discipline

The arithmetic here is deliberately humble, and the temptations are all
upgrades that would make it dishonest.

- **Counts, not averages.** Rungs are ordinal; a mean over them is arithmetic
  on a scale that does not support it, and the resulting figure is quoted
  precisely because it looks precise.
- **Every number carries its predicate**
  ([count-carries-predicate](../../_laws.md#count-carries-predicate)). "31 of
  40" is not a finding. "31 of 40 projects, assessed within the last 30 days,
  under assessor v4, blocked on B for delegate-rung 3" is. A rollup number
  reaches a planning document within a week of being rendered, and it will be
  reused for whatever claim the reader needs unless the predicate travels with
  it.
- **The denominator is the assessed population, and it is printed.** A rollup
  whose denominator silently excludes unassessed or expired projects overstates
  coverage. Say "31 of 40 assessed; 12 further projects not assessed".
- **Distinct projects, not distinct occurrences.** One project reporting a
  blocker five times is one blocked project. Deduplicate on project identity
  before counting or the ranking measures verbosity.

## Ordering by unlock value

Rank by **how many projects the fix unlocks**, not by how many mention it.
Those differ whenever a project has multiple blockers on the same transition:
fixing the most-mentioned blocker may unblock nobody, because every project
carrying it also carries another.

The useful ordering therefore distinguishes two figures per blocker:

- **Incidence** — projects affected.
- **Sole-blocker count** — projects for which this is the *only* remaining
  blocker on the stated transition.

Sort by sole-blocker count, show incidence beside it. The first is what
converts into movement this quarter; the second is what justifies the platform
investment. Where effort estimates exist, order by unlocked-projects per unit
of effort — but only where the estimate is a real input, not a number invented
to justify the ordering.

Ties are broken deterministically — by blocker identity, never by iteration
order — so re-running the rollup over an unchanged portfolio produces the same
list. A ranking that reshuffles on identical inputs generates churn and teaches
readers that the top of the list is arbitrary.

## Projects the rollup could not read

Three populations must be distinguishable in every rollup: assessed, **not
assessed**, and **assessed but unreadable or expired**
([failure-not-empty-success](../../_laws.md#failure-not-empty-success)).

Folding the last two into "not blocked" is the rollup's most dangerous
failure, because it makes the shared problem look smaller exactly when
instrumentation is degrading, and the report gets quieter as the fleet gets
darker. Render them as their own bucket with its own count, and make a growing
unassessed bucket as visible as a growing blocker.

Declines are also shown beside the counts, never subtracted from them: "31
blocked; 4 have accepted this deliberately." Subtracting would let the rollup's
headline drift for reasons unrelated to the blocker.

## Staleness is a property of each row

The projects behind one blocker were assessed at different times. A rollup
that prints one figure over a mixed-age population is claiming a coherence it
does not have. Carry the oldest contributing assessment date per blocker row,
or filter the whole rollup to a freshness window and state the window. The
second is usually better: a stated window is a predicate a reader can check.

## When not to use this

- **A handful of projects.** Below roughly ten, the per-project view is
  readable and the rollup adds indirection without revealing anything the
  reader could not already see.
- **Heterogeneous fleets with no shared platform.** If nothing can be fixed
  once for many projects, the shared-cause insight has no action attached and
  the rollup becomes a chart nobody owns.
- **Where blockers have no stable identities yet.** Fix the identity first; a
  rollup over unstable keys ranks wrongly and confidently, which is worse than
  not ranking.
