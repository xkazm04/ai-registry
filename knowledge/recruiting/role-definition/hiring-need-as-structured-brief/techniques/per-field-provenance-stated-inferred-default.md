---
layer: technique
type: technique
subject: hiring-need-as-structured-brief
technique: per-field-provenance-stated-inferred-default
status: forged
laws: [absence-of-evidence-is-not-evidence, inference-must-look-like-inference, say-only-what-the-record-holds]
shared_with: []
use_when: [designing the field model of a hiring brief, an extractor fills fields the requestor never discussed, a reviewer cannot tell which lines are theirs to defend]
---

# Per-field provenance: stated, inferred, default

Every field in a hiring brief carries a **basis** alongside its value: how the
value came to be there. Three states, and the discipline lives entirely in
keeping them apart.

| Basis | Means | Carries |
| --- | --- | --- |
| `stated` | the requestor actually said it, or was shown it and confirmed it | a pointer to the moment |
| `inferred` | a reading between the lines of what they said | an honest confidence, and a pointer to what was read |
| `default` | nobody has touched this — it is what the schema initialises to | nothing; it is not a claim |

The basis is per field, not per record. A brief is a mosaic: the title was
stated, the seniority was inferred from a description of scope, the work mode
is still the schema's default because nobody raised it. A record-level "source:
conversation" flag tells a reviewer nothing about which of those three the line
in front of them is.

## Stated means stated

The bar is deliberately narrow: the requestor said it in their own words, or
the system proposed it back to them and they confirmed it. Nothing else
qualifies.

The pressure to widen it is constant, because a brief full of `stated` looks
authoritative and a brief full of `inferred` looks weak. Resist it precisely
because that appearance is the information. A reviewer skimming a brief is
looking for the lines that are *not* theirs — the ones an extractor
constructed — and the only way they can find them is if the two are marked
differently. Widening `stated` to include "obviously implied" destroys the one
signal review runs on, and does it silently.

An extractor's own reading-between-the-lines is `inferred` **even when it is
almost certainly right**. Confidence is the field for that. This is
[inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
at its most literal: certainty is expressed by the confidence number, never by
promoting the basis.

## Default is a state, not a value

The state teams try to drop, and the drop is always disguised as
simplification: "an untouched field is the same as an inferred one, we
initialised it sensibly". It is not the same. A default is the absence of any
evidence at all — nothing was said, nothing was read. An inference is a claim
about evidence. Collapsing them writes a claim the system never made, which is
the ordinary form of
[absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence).

The rule extends to the spine scalars, which is where it is usually broken. A
seniority enum that initialises to its middle value, a work mode that
initialises to the organisation's usual, an employment type that initialises
to full-time: each of these is `default` until someone says otherwise, and each
must render to a human as *not established*, never as a chosen value with
ordinary styling. If it renders like a decision, it will be defended like one.

Downstream, the three bases license different things:

- `stated` may drive a hard gate, appear in a published requirement, and be
  cited in an account of what the role required.
- `inferred` may shape a search, a ranking, a suggestion or a follow-up
  question, and must be shown as a reading when a human reviews. It may not,
  on its own, disqualify a person.
- `default` may drive nothing. It is a form's placeholder. A consumer that
  cannot distinguish it from a value must be given the distinction, not a
  cleaner-looking record.

## The basis map is what tells the session what to ask next

The most useful consumer of provenance is not the audit — it is the intake
itself. A "what is still missing" digest built on *values* asks about nothing,
because every spine scalar already holds its default and looks filled. Built on
*bases*, it asks the right questions: seniority counts as captured when its
basis is `stated`, not when the enum is non-empty. The same map drives what a
review surface flags and what an export marks: a defaulted seniority must be
visibly flagged wherever the brief is read, because that is the field a reader
is most likely to mistake for a decision.

This is the practical argument for keeping the basis of the spine scalars in
its own map rather than inferring it from the value. Two fields cannot be
distinguished by value alone once a legal value and the schema default are the
same token.

## Degradation should cost inferences, not honesty

When the extracting model is unavailable — no key, an offline run, a failed
call — the honest degradation is a brief whose values are only `stated` (what
the requestor literally typed into a scripted slot) and `default` (everything
untouched). The `inferred` tier simply does not populate. That is the correct
shape: a degraded run produces a *thinner* brief, never a brief whose readings
are quietly worse while looking identical. A system that fills the same fields
with weaker guesses under degradation has made its failure invisible, which is
the only kind of failure that reaches a candidate.

## Confidence belongs to inference alone

A confidence on a `stated` field is meaningless — the person said it — and
attaching one invites a downstream consumer to discount what a human actually
asserted. A confidence on a `default` is worse: it dresses an untouched
placeholder as an estimate. Model confidence on inferred fields, and be honest
about the scale: it expresses how firmly the evidence supports the reading, not
how good the requirement is.

Honest also means *low is allowed*. An extractor that never emits a low
confidence is not calibrated, it is agreeable; and the low-confidence entries
are the highest-value ones on a review surface, because they are where a human
minute is best spent.

## Decision rules

- **When a question is skipped or declined, write nothing.** A non-answer is
  never data; it leaves the field at `default`. Recording "no" for a declined
  budget question invents a stated constraint out of a refusal to discuss one.
- **When an answer does not fit the field's vocabulary, do not force it.**
  Store the answer verbatim as a stated attribute alongside, and leave the
  typed field unset. A pay-grade band name is not a seniority level; snapping
  it to the nearest enum value fabricates a `stated` fact with the enum's full
  downstream authority, and the original — the thing the requestor actually
  meant — is gone.
- **When a human edits a field, that field becomes `stated`.** Only that
  field. Saving a form does not confirm everything on it; see the merge
  technique for why blanket promotion on save is the most damaging shortcut
  available here.
- **When the system proposes a value and the human accepts it explicitly**,
  it becomes `stated` — confirmation is an assertion. Silence in the presence
  of a proposal is not.
- **When a value is displayed anywhere a decision is made**, display its
  basis with it. Provenance stored but never rendered protects the database
  and nobody else —
  [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)
  binds the surface, not just the schema.

## When not to use this

- **On free-text notes with no downstream consumer.** A meeting note that
  nothing reads does not need a per-field basis; the machinery is for values
  that will be acted on.
- **On candidate-facing renderings.** Publishing "inferred, confidence 0.4"
  to applicants misrepresents an internal working state as a stated
  requirement of the role and invites litigation of an artifact that was never
  meant to be a promise. Render only what is stated, and render it as prose.
- **As a substitute for asking.** Provenance makes an unconfirmed value safe
  to hold; it does not make it safe to rely on. Where a field is
  consequential and inferred, the correct move is a question, not a
  well-labelled guess.
