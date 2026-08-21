---
layer: technique
type: technique
subject: peer-benchmarking-under-k-anonymity
technique: normalise-each-contributor-to-its-own-process
status: forged
laws: [meaning-does-not-live-in-a-label, a-claim-carries-its-sample-and-its-basis]
use_when: [pooling funnel data across organisations, comparing stage progression between companies, combining cost or duration figures from different sources]
shared_with: []
---

# Normalise each contributor to its own process

Before any cross-organisation arithmetic, every row is judged against **its own
organisation's** process definition — its own stage ordering, its own terminal
states, its own units — and only the normalised position travels into the pool.
Raw labels never cross the boundary.

The reason is that a stage name is a local string. One organisation's
"screening" is another's "recruiter call" is another's "HM review", and the
positions those names occupy in their respective funnels are not the same. A
benchmark that buckets by label is performing correct arithmetic over incoherent
groups: it compares naming conventions and reports the result as performance.
This is the most persuasive class of wrong, because nothing about the output
looks broken — the counts are right, the percentages sum, the chart renders.
[Meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label).

The same failure appears in every dimension where contributors differ:

- **Stage vocabulary and depth.** A five-stage process and a nine-stage process
  are not comparable stage-by-stage; a candidate "at stage 3" means different
  things in each.
- **Terminal-state semantics.** One organisation marks a withdrawn candidate as
  rejected; another keeps a separate state. Pooled, the first looks more
  selective.
- **Units and denominations.** Currencies, hours versus days, calendar versus
  business days, gross versus total compensation.
- **Metric definitions.** Time-to-hire from requisition open, from first
  application, or from first interview — three numbers that differ by weeks.

## Procedure

1. **Define a shared abstract axis** that every process can be projected onto:
   how far through *its own* funnel a candidate reached, expressed as an ordinal
   depth or a normalised fraction, plus a small closed set of outcome states
   (in progress, rejected, withdrawn, hired) that every contributor maps into.
2. **Project each row using its own organisation's configuration**, resolved
   once per contributor and reused across that contributor's rows rather than
   assumed from a default or looked up per row. A row whose organisation has no
   usable process definition does not get a default — it is excluded, and its
   exclusion is reflected in the counts.
3. **Compare only on the shared axis.** The pooled computation never sees a
   label, a stage identifier, or anything else that only means something inside
   one organisation.
4. **Partition by denomination rather than converting silently.** Where units
   differ, either convert on a stated basis, or split the benchmark so each
   partition is internally consistent and clears the floors on its own. Never
   sum across denominations.
5. **State the normalisation in the basis.** A reader comparing themselves
   against a benchmark needs to know their nine-stage process was projected onto
   a common depth axis, because that projection is where they will disagree —
   and a visible projection can be argued with, while an invisible one is just
   acted on.

## The currency rule, stated as a rule

When figures denominated in different currencies are summed, the result has no
interpretation and cannot be recovered. It will not look wrong: currencies
within an order of magnitude of each other produce totals that pass every
sanity check a reviewer applies, which is why this defect survives to
production more reliably than a small sample does.

The same rule governs rows that cannot be denominated at all. An observation
whose unit or price is unknown must be **counted separately, not summed as
zero** — an unpriced row folded into a total does not make the total slightly
incomplete, it makes it confidently low, and the aggregate then carries a
denominator that includes observations it could not value. Report the total over
the rows that could be denominated, plus the count of the rows that could not,
and let the reader judge whether the gap matters.

So: a cost benchmark either converts every figure to a single stated currency at
a stated rate and date, or it partitions by currency and applies every floor to
each partition independently. There is no third option, and "most of our
customers use the same currency" is not one — the exception is exactly the
customer who will read the number and act on it.

## Decision rules

- When contributors' process definitions differ in depth, normalise to a
  fraction of their own funnel rather than to an absolute stage index. Absolute
  indices reward long funnels with apparent thoroughness.
- When an organisation's process changed mid-history, its old rows are
  normalised against the definition in force when they were recorded, not
  against today's. Retro-projecting a current definition onto old rows silently
  rewrites history in the pool.
- When a contributor cannot be normalised — no process definition, an
  unmappable outcome vocabulary — exclude the contributor, do not guess. A
  guessed mapping is indistinguishable from data in the output and biases the
  benchmark in an unknown direction.
- When exclusions drop the contributor count below its floor, withhold. The
  normalisation requirement composes with the floors; it does not override them.
- When two metrics with the same name have different definitions across
  contributors, they are two metrics. Publish the one that can be computed
  identically everywhere, and say which definition it is.

## When not to use this

Do not normalise when the *label itself* is the subject of the comparison — a
benchmark about how many stages organisations typically run, or which outcome
vocabularies are common, is legitimately about structure. State clearly that it
measures process shape, not performance, so nobody reads it as the latter.

Do not use normalisation as a way to force incomparable things into comparability.
If two contributors' processes genuinely cannot be projected onto a shared axis
— different hiring modalities, different regulatory regimes, fundamentally
different roles — the honest output is two benchmarks, or none, not a shared axis
with a heroic mapping. A projection that needs a paragraph of caveats has already
told you the comparison does not exist.

Do not let normalisation quietly change what a figure is computed over without
saying so. The transformation is part of the basis
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)),
and a benchmark whose basis omits its normalisation is not reproducible by the
team being measured.
