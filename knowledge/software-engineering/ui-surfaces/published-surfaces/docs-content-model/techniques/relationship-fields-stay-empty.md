---
layer: technique
type: technique
subject: docs-content-model
technique: relationship-fields-stay-empty
status: forged
laws: [failure-not-empty-success]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [adding a related or see-also field to a record schema, a read-next panel or graph view built on author-filled metadata, predicting which optional fields of a record will be filled]
---

# Relationship fields stay empty

A record schema usually offers its authors two kinds of field that look alike and
behave nothing alike. A **provenance** field asks where this record came from: what
it is based on, what it cites, which subject owns it. A **relationship** field asks
what else in the corpus this record belongs beside: related entries, see-also,
alternatives. Both are lists of identifiers, both are usually optional, and a
specification that offers both usually promises a view built from the second - a
read-next panel, a graph.

Measured, the fill rates are not close. In a catalogue of 193 pattern records, the
based-on field was filled in 190 and the related field in 15. The relationships
usually exist all the same: authors write them where they are using them - a link in
the prose, a citation - and not in the field that asks for them.

## Why the split is predictable

**Authors fill the fields whose answer they hold while writing.** Provenance is in
hand: the author just read the thing the record is based on, and the citation is part
of the act of writing. A relationship field asks for a view of the whole corpus -
which of the other few hundred or few thousand entries belong near this one - that
nobody writing one record holds, and that changes every time someone else adds a
record. It is a question about the corpus put to the author of one entry, and it goes
unanswered at that rate.

So the fill rate of a proposed field can be predicted before it ships, with one
question: **does the author hold this answer at the moment of writing?** Where the
answer is no, expect the field to stay mostly empty.

## What it costs a view built on it

A panel or a graph drawn from a relationship field renders an unfilled field as
"this entry stands alone". That is a gap in the authoring presented as a fact about
the record ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)),
and on a field filled in one record of thirteen it is what most readers will see.
Count the field, or predict it with the question above, before building a view on
it. Where the edges should come from instead - the references authors already make -
is [derived-navigation-projection](./derived-navigation-projection.md)'s discipline;
what an empty optional field must be declared to mean is
[per-topic-freshness-metadata](./per-topic-freshness-metadata.md)'s.
