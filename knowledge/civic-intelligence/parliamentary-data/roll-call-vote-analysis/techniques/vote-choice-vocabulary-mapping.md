---
layer: technique
type: technique
subject: roll-call-vote-analysis
technique: vote-choice-vocabulary-mapping
status: forged
laws: [disclose-never-repair, one-definition-one-import]
shared_with: []
use_when: [ingesting per-ballot vote codes, a source merges or renames vote categories, deciding what an unknown ballot code means]
---

# Vote-choice vocabulary mapping

Every roll-call source publishes per-ballot choices as terse codes — single
letters, digits, local-language abbreviations — defined on a schema page that
is itself part of the primary source. The first act of analysis is to map
those codes onto a stable, documented, semantically honest vocabulary that the
rest of the pipeline consumes. This mapping is the foundation every metric
stands on, which is why it lives in exactly one function, quotes the
publisher's own definitions in its documentation, and is imported by every
consumer rather than restated anywhere.

## The procedure

1. **Enumerate from the publisher's schema, not from observed data.** The
   source's documentation defines the codes; data-driven discovery finds only
   the codes that happen to occur in your sample and misses rare ones (a
   pre-oath vote, a non-public division) until they arrive in production.
2. **Map to meanings, not to metrics.** The output vocabulary describes what
   the legislator *did* — voted yes, voted no, abstained, was logged in but
   pressed nothing, was not logged in, was excused, had not yet taken the
   oath. Which of these count toward which denominator is a separate decision
   (positional-vs-participation-bases); baking it in here couples every metric
   to one reading.
3. **Reserve an explicit `unknown`.** An unrecognized code maps to unknown —
   never to a default bucket, never dropped silently. Unknown is countable and
   surfaceable; a silent default is a wrong number waiting for a schema
   change.
4. **Detect sentinels.** Sources encode "value not known" as magic values — an
   impossible date, a reserved code. Each documented sentinel is detected at
   the mapping layer and recorded as *unknown plus a flag*, never passed
   through at face value. Surfacing a sentinel as data manufactures facts
   (the phantom 126-year-old legislator whose "birth date" was the unknown
   sentinel).

## Merged categories: the ceiling rule

The hardest case is a source that *changed its own ontology*. When a chamber's
rules of procedure stop distinguishing two choices — merging "abstained" and
"did not press" into one recorded code from some date forward — the honest
vocabulary contains the merged category as its own first-class value
(`abstain_or_not_voting`), alongside the separate values for the era that had
them.

The decision rule: **a metric that requires the split cannot be computed for
the merged era. Say so; do not split the number.** No historical ratio, no
model, no "abstentions are usually about 60% of this bucket". The merge is the
source's act, performed under its own rules; disclosing it costs one sentence
of copy, while decomposing it by assumption produces a figure no one can
verify and the source itself would not endorse. This is the
disclose-never-repair law applied to ontology rather than to a broken row:
the source's category system keeps the blame, and the reader is told what
cannot be known.

The corollary for comparisons: a metric computed on the pre-merge vocabulary
and the same metric on the post-merge vocabulary are *different metrics*.
Charting them as one series across the boundary is a silent redefinition;
either compute both eras on the coarser common vocabulary, or break the
series and label the break.

## One definition, imported everywhere

The mapping function and the choice type it returns are defined once, in a
pure module, and imported by the ingest layer, every analysis function, every
rendering surface, and the tests. The failure this prevents is not
hypothetical: two mapping tables drift the day a source adds a code, and the
drift is invisible — both tables still "work", they just disagree about a few
thousand ballots, and the disagreement surfaces as two pages publishing
different rates for the same person.

The same rule covers the sets built *on* the vocabulary (the positional set,
the present set): they are exported constants next to the mapping, never
re-listed at call sites.

## When not to use it

- Do not build the vocabulary for outcome codes, procedural-motion types, or
  member-role names into the same table — same technique, separate
  vocabularies, because they version independently.
- Do not normalize across chambers or countries at this layer. A cross-source
  comparative vocabulary is a second mapping *on top of* per-source ones;
  collapsing them into one table loses each source's distinctions and
  reintroduces the merged-category problem by your own hand.
