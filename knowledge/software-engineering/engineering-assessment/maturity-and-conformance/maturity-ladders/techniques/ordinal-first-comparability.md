---
layer: technique
type: technique
subject: maturity-ladders
technique: ordinal-first-comparability
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [storing an assessment result, aggregating maturity across a portfolio, comparing assessments over time]
---

# Ordinal-first comparability

The rung is the unit that survives. Code is rewritten, rubrics are re-weighted,
dashboards are replaced — but "this project was `curated` in the second quarter"
remains legible to a human years later, provided the vocabulary was singular and
the record said which ladder produced it. This technique is the set of rules that
keep that true, and the arithmetic prohibitions that follow from the scale type.

## Store the ordinal, derive the number

Where both a rung and a score exist, the **rung is persisted** and the score is
persisted alongside it as supporting detail — never the score alone with the rung
re-derived on read. Re-derivation on read means every historical record silently
re-labels itself whenever the bands or the rubric move, which converts a history
into a rolling opinion. Persist, at minimum:

- the rung (as its stable symbolic name, not its integer position),
- the ladder version that defined it,
- the timestamp of assessment,
- optionally the underlying signal and any cap that was applied.

Persisting the **name** rather than the index matters more than it looks. Indices
shift when a rung is inserted; names do not. A stored `3` is a claim whose meaning
depends on a rung list you must reconstruct; a stored `governed` is a claim that
still parses. Integers are for sorting at read time, produced from the current
ladder's ordering — one authority for the vocabulary, every consumer deriving
from it
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
never a second hand-maintained mapping in the reporting layer.

Any derived display value — a percentage, a badge, a colour — names how it is
recomputed from the stored rung
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)),
so a stale badge can be proven stale rather than argued about.

## The arithmetic the scale forbids

Rungs are ordinal: they are ordered, and the spacing between them is unknown and
almost certainly unequal. The step from ad-hoc to defined is a policy decision
and a document; the step from measured to optimising is a cultural change over
quarters. Treating them as equal units produces confident nonsense.

**Forbidden:**

- Means. "Average maturity 2.7" corresponds to no state any subject can occupy,
  and its plausibility is precisely the danger.
- Differences of means. "We improved 0.3 this quarter" subtracts two quantities
  measured in nothing.
- Sums across dimensions. Adding a delegation rung to an artifact rung produces a
  number in units of neither.
- Weighted blends of rungs into a "maturity index". If you want a cardinal
  measure, build one from the underlying signals under a rubric — that is the
  [scoring rubrics](../../../../operations/service-operations/scoring-rubrics/scoring-rubrics.md) subject's job — and
  do not launder ordinals into it.

**Licensed:**

- The **distribution**: how many subjects at each rung. This is the honest
  portfolio summary and it is more informative than any average, because it shows
  the shape (bimodal populations are common and a mean hides them entirely).
- The **median** and **mode**.
- **Counts at or above a rung**: "11 of 40 at `governed` or above" is the
  sentence executives actually want, and it is scale-legal.
- **Transition counts**: how many subjects moved up, down, or stayed, between two
  dated assessments. Movement is the real signal of a working programme.
- **Minimum across dimensions**, where a composite posture is genuinely
  bottlenecked by its weakest ladder — a defensible ordinal aggregation, unlike
  a mean, because it names an existing state.

## Comparability across subjects

Two teams comparing rungs are comparing definitions, not numbers. Comparability
requires:

1. **One vocabulary.** The rung names and their criteria have exactly one
   authoritative definition that every assessment derives from. Two teams each
   maintaining "their version" of a five-rung ladder produce values that compare
   syntactically and mean different things — the most expensive kind of
   incomparability, because nothing looks wrong.
2. **One evidence standard.** Identical criteria assessed under different
   evidence classes (one team inspecting content, another accepting
   self-report) yield systematically different distributions. The evidence class
   is part of the definition, not a local implementation choice.
3. **Named scope.** A rung is always a rung *of something*. "Maturity: governed"
   without saying governed at *what* invites the reader to generalise it across
   the whole subject, which is how a narrow ladder becomes an organisational
   verdict.

Where a shared vocabulary genuinely cannot be imposed — an acquired team, an
external partner — do not silently translate. Publish an explicit crosswalk that
maps their rungs onto yours, mark translated values as translated, and accept
that the mapping is lossy in at least one direction.

## Comparability across time

The rule: a rung is comparable to another rung of the **same ladder version**,
and comparable across versions only through a declared mapping
([migrate-on-read](./migrate-on-read.md)). Trend rendering follows:

- A series that crosses a ladder version boundary either shows the boundary
  visibly (a marked break) or is recomputed end to end under one version. The
  unmarked splice is the failure — a step change appears at the boundary and is
  investigated as a real event, or worse, claimed as progress.
- Prefer recomputing history under the new ladder **when the raw evidence was
  retained**. Stored rungs are cheap to re-derive; raw evidence is
  irrecoverable. This is the strongest argument for keeping the evidence, not
  just the verdict.
- Where evidence was not retained, mapping is the only option and its lossiness
  is disclosed on the chart, not buried in a changelog.

## When not to use this

Nothing here forbids a cardinal score existing. If the consumer's question is
genuinely "how much" — budget allocation proportional to gap size, an
impact-per-effort ranking — build the cardinal instrument properly rather than
straining ordinals to answer it. The prohibition is on *converting* rungs into
quantities, not on measuring quantities.
