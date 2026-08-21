---
layer: technique
type: technique
subject: candidate-consent-and-retention
technique: anonymise-but-retain-the-aggregate-signal
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [expiring a candidate record, keeping funnel and fairness statistics intact, deciding between deletion and de-identification]
---

# Anonymise, but retain the aggregate signal

## The concern

When a retention window closes, the naive action is to delete the row. That is
defensible for privacy and quietly destructive everywhere else: the funnel for
last year loses its denominator, the selection-rate comparison loses part of
its cohort, the time-to-hire series develops a hole, and every one of those
numbers changes retroactively without anyone being told. Worse, the ranking
surfaces that still reference the deleted person now show a gap where a record
was, which reads as an error and prompts someone to go looking.

The better action is a **transformation**: reduce the person out of the record
while keeping the record. What leaves is identity. What stays is shape — the
stage the person reached, when, under which requisition, with which outcome,
and any quantities that were already non-identifying.

## What survives, what goes

**Goes.** Name, contact details, the source document and everything parsed from
it, free-text rationales and notes, transcripts, and any attribute specific
enough to single the person out: employer plus dates, an unusual
qualification, an exact salary figure, a precise location.

**Stays.** A stable surrogate identifier so linked rows remain joinable. The
requisition. The stage reached and its transition timestamps. The outcome in
the closed vocabulary. Coarse buckets rather than exact values where a
distribution is needed. And a display handle — **initials** — so a recruiter
looking at a historical pipeline sees a legible entry rather than a blank.

The initials are worth defending as a design choice. A retained record shown as
an empty row is confusing and gets clicked on; shown as a two-letter handle it
reads immediately as "a person who was here, deliberately reduced". Legibility
without identification is the goal, and it is a real usability property, not a
concession.

Masking is a text transform on untrusted input, so specify its degradations
rather than discovering them:

- The label is often not a name. Documents whose first line is a section
  heading produce handles like "Curriculum V." unless a small stoplist of
  document-structure words and generic person-words is filtered out first — in
  every language the deployment ingests, not just the interface's.
- A single-token label has no surname to reduce to an initial; keep at most the
  first one or two characters plus a period rather than passing the whole token
  through.
- An empty label, or one that is entirely stoplist words, becomes a neutral
  placeholder. The function never throws and never returns the input unchanged
  on a path it did not anticipate — a masking routine that fails open has
  published a name.

## Say which transformation you actually achieved

Initials plus a surrogate id plus a requisition and a stage is **not**
anonymous. If a small cohort applied to that requisition, initials and a date
can re-identify someone to anyone holding the original roster. Calling that
record anonymous is a claim you cannot defend the moment it is tested.

**Decision rule.** Reserve the word for the case where the transformation is
irreversible, the surviving attribute combination cannot single out an
individual against realistically available external information, and you have
written down the assessment. Otherwise call the record **de-identified and
retained**, and continue to treat it as personal data — access-controlled,
inside the erasure inventory, and not exported freely. This distinction is the
difference between a state you can defend and a label you applied to a null
column.

## Keep the aggregate honest about what it now contains

A de-identified record must remain countable, and it must remain
*distinguishable* from a record that never existed and from a record whose
value was never measured. Three states, three renderings:

- **Present and measured** — the value.
- **Present but de-identified** — counted in the denominator, excluded from any
  statistic that requires the destroyed attribute, and labelled as such.
- **Never measured** — not a zero.
  [Absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence):
  a de-identified candidate whose score was destroyed must not be coerced to
  zero and dragged through an average, and must not silently vanish from a
  denominator it belongs in.

Every rate computed over a partly de-identified cohort therefore states its
sample and its basis: how many records, how many of them reduced, and which
statistic the reduction made uncomputable. A selection-rate comparison whose
cohort is half de-identified may still be valid on stage counts and invalid on
score distributions, and it must say which.
[A claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
is doing real work here: the transformation changes what the data can support,
and the presentation has to move with it.

## Anonymised means unreachable

A de-identified record is not a candidate any more. It must be excluded from
every path that would treat it as a person: rediscovery sweeps, outreach lists,
shortlist comparisons, and any surface offering to open a profile. Encode the
exclusion as a *reason* attached to the record, not as a filter each caller
remembers to apply — the reason is what lets an operator understand why someone
is absent from a search they expected them in, and it distinguishes
"de-identified" from "rejected" and from "consent expired", which are three
different suppressions with three different reversibility properties.

Rejection is reversible: a rejected candidate can be re-contacted, because
rejection is a hiring outcome, not a data instruction. De-identification is
not: there is no longer a person there to contact, and re-identifying from a
backup to re-contact someone is the exact abuse the transformation exists to
prevent.

## Aggregates that resolve to one person are not aggregates

The same k-threshold discipline that governs benchmark publication governs
this: a "cohort" statistic over a requisition with three applicants, two of
them de-identified, describes one identifiable person. Suppress below a
threshold, and suppress the complement too — publishing "4 of 5" alongside a
total of 5 discloses the fifth.

## When not to use this

- **Do not use de-identification where erasure was requested.** A person
  exercising an erasure right is not asking to become a statistic; the shell
  that survives is justified by the pipeline's coherence and the enumerated
  carve-out, and it must be minimal, not the full analytic payload.
- **Do not de-identify records still needed under an active legal hold.**
  Destroying the attributes that would answer a claim is not privacy, it is
  spoliation.
- **Do not treat de-identification as a reason to relax access control.**
  Pseudonymised data is personal data. If a table full of surrogate ids and
  stages is exposed more widely than the original because "it's anonymised",
  the transformation has increased exposure rather than reduced it.
