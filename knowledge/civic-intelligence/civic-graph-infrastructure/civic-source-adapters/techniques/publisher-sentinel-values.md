---
layer: technique
type: technique
subject: civic-source-adapters
technique: publisher-sentinel-values
status: forged
laws: [missing-is-not-zero, disclose-never-repair]
shared_with: []
use_when: [mapping a source vocabulary to product categories, handling magic dates or "not stated" fields, deciding whether a metric can be computed from merged source codes]
---

# Publisher sentinel values

Legacy public registries encode "we don't know" inside the value space itself: a
fixed ancient date meaning the birth date was never recorded, a literal "not stated"
string in a monetary column, a code that the institution itself stopped
distinguishing from its neighbor decades ago. These sentinels are not dirty data.
They are *assertions by the publisher* — usually documented on the publisher's own
schema pages — and the technique is to model them as first-class unknowns rather
than cleaning them into plausible values.

## Detect sentinels, emit explicit unknowns

The procedure per field:

1. **Hunt the documentation first.** Sentinel conventions are usually written down
   somewhere on the publisher's schema or FAQ pages. Read them before ingesting;
   discovering a sentinel from impossible aggregates later means it already
   shipped.
2. **Name the sentinel as a constant** at the adapter, with a comment citing where
   the publisher documents it. An inline magic literal will be "cleaned up" by a
   future refactor that doesn't know what it means.
3. **Map to null plus an explicit flag**, never to the raw value and never to a
   bare null. The flag matters: null-because-sentinel ("the publisher says
   unknown") and null-because-absent ("the column was empty") and
   null-because-rejected ("our coercer refused it") are three different facts, and
   coverage reporting needs to count them separately —
   [missing is not zero](../../../_laws.md#missing-is-not-zero), and each kind of
   missing has its own story.

The canonical horror is the magic birth date: surfaced as a real value it produces
phantom 126-year-olds in the corpus; averaged, it silently drags every age
statistic. Monetary "not stated" is worse when coerced to 0 — a zero-value public
contract is a *claim*, and a wrong one.

## Closed vocabularies map through one explicit table

When a source column is a code vocabulary (vote result, record kind, outcome), map
it through a single exhaustive switch with a required `unknown` arm:

- **Quote the publisher's meanings** next to each arm. The mapping is a
  translation of an official vocabulary and must be auditable against it.
- **Never default an unrecognized code to a real category.** A new code appearing
  in the feed means the vocabulary changed; it maps to `unknown` and should be
  countable, so a spike surfaces the change. Defaulting it to the most common
  category repairs silently, which
  [disclose-never-repair](../../../_laws.md#disclose-never-repair) forbids.
- **One mapping, imported everywhere.** Two call sites each hand-rolling the
  switch will drift on exactly the rare codes.

## When the publisher merged categories, the split is uncomputable — say so

The hardest sentinel is institutional: a source that once distinguished two
categories (say, "abstained" versus "present but did not vote") and then merged
them by a rules change, so modern records carry only the merged code. The merged
code is not ambiguity to resolve — it is a fact about what the institution records.
The discipline:

- Give the merged state **its own category** in your vocabulary
  (`abstain_or_not_voting`, not a guess at either half).
- Any metric that needs the split **declares itself uncomputable** for the merged
  period. The product copy says so. Splitting the number by assumption — even a
  well-reasoned 50/50 or historical-ratio assumption — manufactures a figure the
  source cannot support, and it will be quoted without the assumption attached.
- Derived sets (who counts as "present", which choices are "positional") are
  defined once over the vocabulary and exported, so every metric draws the same
  boundary.

The same honesty extends to measured blind spots that are not sentinels but behave
like them: a free-text self-declared field that turns out to be self-referential
for half the population you care about is a structural gap. Measure the fraction on
real data, write it into the adapter's documentation, and report metrics built on
that field with the blind spot attached — never tune a classifier until the gap
becomes invisible.

## When not to use this

Do not invent sentinels the publisher does not have — treating every extreme or
repeated value as a suspected sentinel is repair in the other direction, discarding
real data on a hunch. A value is a sentinel when the publisher documents it, or
when its impossibility is provable (a birth date before human lifespan allows) —
and in the provable-but-undocumented case, record the inference and its evidence
where the constant is defined, because that judgment is part of the pipeline's
method and must be auditable.
