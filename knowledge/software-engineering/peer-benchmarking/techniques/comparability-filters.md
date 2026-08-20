---
layer: technique
type: technique
subject: peer-benchmarking
technique: comparability-filters
status: forged
laws: [one-authority-per-vocabulary, count-carries-predicate, deletion-is-not-repair]
shared_with: []
use_when: [deciding which measurements may enter a ranking, a scoring engine gains a fallback path, a rubric version ships]
---

# Comparability filters

Before anything is sorted, one question must be answered: **which
measurements are allowed onto this axis at all?** A position is a claim that
the numbers being ordered were produced the same way. That claim is not
implied by the numbers sharing a range, a column name, or a type. It has to
be *enforced*, by a predicate applied to every candidate row, and the
predicate is this technique.

## The two things that break comparability quietly

Most incomparability is loud — different metric, different units, obviously
wrong. The two that survive review are the ones where the numbers still look
right:

**1. A different engine produced it.** Scoring paths acquire alternates:
a degraded path for when the primary is unavailable, a cheaper path under
load, a deterministic stand-in used when a credential is missing, a cached
result from an older pipeline. Every one of these is a *different scoring
function*. It may correlate well with the primary; correlation is not
identity. A stand-in that produces stable, plausible mid-range numbers is
the most dangerous of all, because it is invisible in aggregate and
systematically compresses the distribution it contaminates. The rule: the
engine that produced a measurement is **recorded on the row at write time**,
and only rows from the ranking engine enter the ranking.

**2. The instrument version changed.** When a rubric, weight set, or model
version changes, previously persisted scores are not retroactively updated —
re-basing would mean re-running every historical input, which nobody does
and nobody budgets for. So the moment version N+1 ships, the table holds two
scales. An old-version row is a valid historical measurement and an invalid
comparand: it is a number from a retired instrument. Rank only within a
version, and treat a version bump as a **corpus reset**, not a continuation.

The corollary is the rule practitioners resist: **unknown provenance is
excluded.** A row with a null engine field or no recorded version is not
"probably fine" — and unlike in a summary statistic, a doubtful row in a
ranking is not merely diluted. It moves every position. Include-if-unsure is
a decision to let unaudited data set other people's ranks.

## Both sides, always

The error that survives the first fix is applying the filter to the corpus
and not to the subject. It feels like rigor — the peer data is the untrusted
side, so it gets cleaned — and it produces exactly the defect the filter
existed to prevent: the subject's number comes from one instrument, the
distribution from another. If the subject's own recent measurement was
produced by the fallback path, filtering the corpus makes the mismatch
*worse*, because now the contaminated value is being ranked against a
scrupulously clean population.

Write the predicate once and apply it symmetrically. In practice this means
the filter is a named, shared construct — one definition of "comparable",
consumed by the subject-side query, the corpus-side query, and any later
surface that quotes either
([one-authority-per-vocabulary](../../_laws.md#one-authority-per-vocabulary)).
Two hand-written copies of the same predicate drift the day someone adds an
engine variant and updates one of them.

## Filter before you pick the representative, not after

Most corpus members contribute many measurements and must be reduced to one —
usually "the latest". The order of *filter* and *pick latest* is not
cosmetic, and getting it backwards silently shrinks the corpus in a biased
way:

- **Pick-then-filter**: take each member's most recent measurement, then drop
  the ones that fail the predicate. A member whose most recent run happened
  to degrade to the fallback path now contributes nothing at all — even
  though it has a perfectly comparable measurement from last week. The
  members most affected by instability disappear from the corpus, which is
  the population least likely to be missing at random.
- **Filter-then-pick**: restrict to comparable measurements first, then take
  each member's most recent *comparable* one. The member stays in,
  represented by its last real number.

The second is right. The same reasoning applies to any bounded read: when a
cap limits how many candidate members are materialized, the eligibility
predicate belongs *inside* the capped query, so the budget is spent on
comparable members rather than on rows that will be discarded afterwards.

## The alignment dimensions

Instrument and version are the two that break silently. The full predicate
also covers:

- **Window.** Both sides measured over comparable spans. A subject's
  trailing-90-day mean against a corpus of all-time means compares a recent
  snapshot with an era.
- **Unit.** Both sides at the same level of aggregation — the
  [population-vs-scalar-ranking](population-vs-scalar-ranking.md) technique
  owns this dimension in full.
- **Scope definition.** What counts as an in-scope item. If one side counts
  every artifact and the other only reviewed ones, the axis is two different
  denominators.
- **Recency.** A corpus of stale rows is a corpus of a former population.
  Bound how old a row may be and state the bound.

## Excluded is not deleted

Excluding a measurement from the *ranking* is not a licence to hide it from
the *surface*. The mature pattern, on any board or list, is two sections: the
ranked set, and an explicitly labelled "not independently comparable" set
carrying the same rows with their scores and a stated reason. Interleaving
the two is the defect. Deleting the second is a different defect — the owner
of an excluded row is the person most entitled to know that their measurement
exists but did not qualify, and silently vanishing them generates exactly the
support conversation the filter was supposed to prevent
([deletion-is-not-repair](../../_laws.md#deletion-is-not-repair)). The same
qualifier should appear wherever that row's number is shown elsewhere — a
badge, a card, an embed — so one row does not read as provisional in one
place and authoritative in another.

## Decision rules

- **When a row lacks a recorded engine or instrument version, exclude it.**
  Absence of provenance is not evidence of comparability.
- **When a fallback or degraded scoring path exists, mark its output at
  write time** — a boolean is enough, a version string is better. Retrofitting
  provenance is impossible; the information exists only at production time.
- **When a rubric version ships, rank within versions only.** If that empties
  the corpus below the floor, the honest output is a suppression, not a
  cross-version rank.
- **When you filter, filter both sides with the same predicate object.**
- **When the filter is applied, its terms become part of the basis** that
  ships with the number
  ([count-carries-predicate](../../_laws.md#count-carries-predicate)) —
  a filtered rank whose filter is undisclosed is unfalsifiable.

## When not to use this

- **Within-tenant trend lines.** Comparing an organization to its own past
  needs the version story told, but exclusion may not be right: the honest
  rendering of a rubric change on a trend is a *marked discontinuity*, not a
  truncated history. Deleting history to make a line smooth is
  [deletion-is-not-repair](../../_laws.md#deletion-is-not-repair).
- **Descriptive corpus statistics.** "How many analyses ran last month"
  legitimately counts fallback and old-version rows; it is counting events,
  not comparing scales. Keep the two queries visibly separate so nobody
  reuses the descriptive one as a ranking source.
- **When strictness would empty the corpus every time.** That is a signal
  the instrument is versioning too fast to support peer comparison at all —
  fix the cadence or stop shipping the comparison; do not relax the filter.

## Smells

- A ranking query whose `where` clause names the metric but not the engine
  or the version.
- Provenance columns that exist and are nullable, with nobody enforcing the
  write.
- Two similar filter expressions in two files, one of them with an extra
  condition.
- A benchmark that got noticeably kinder to everyone the week a fallback
  path shipped.
