---
layer: technique
type: technique
subject: structured-interview-scorecards
technique: evidence-quote-requirement
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [defining what a scorecard field must contain, a model drafts scorecards from a transcript, an adverse decision has to be explained from the record]
---

# Evidence quote requirement

Every rating on a scorecard carries the thing the candidate said or did that
produced it, recorded close enough to the original that the candidate would
recognise their own words. This is one requirement, not two: the quote is not a
supporting note beside the rating, it is the rating's licence to exist.

## Why near-verbatim, and not a summary

Summaries drift in one direction. A rater who has already chosen a level writes
the summary that supports it, and each retelling — scorecard, debrief, decision
memo — moves further from what happened toward what was concluded. Three
retellings later the evidence field says "showed limited ownership", which is the
rating restated, and the observation that produced it is gone for good.

Near-verbatim capture stops the drift at the first step. It is also the only form
of evidence that is *contestable*: a quote can be checked against a recording, a
conclusion cannot. When an adverse decision must be explained later,
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
is only satisfiable if the record holds the candidate's words rather than the
panel's adjectives.

The secondary effect is the one practitioners underrate: the requirement is a
live check at write time. A rater reaching for a quote and finding none has
discovered, in the act of reaching, that they are rating an impression. That is a
useful thing to discover before the debrief rather than after the offer.

## The rules

- **One rating, one piece of evidence, minimum.** A competency scored without a
  quote is not scored; it is unassessed (see unassessed-competency-handling).
- **The quote is the candidate's, not the interviewer's.** "I asked about scaling
  and they struggled" is a note about the interview, not evidence about the
  candidate.
- **Behaviour counts as evidence where it is observable and recorded as an act.**
  A live exercise yields "rewrote the query after noticing the index was unused",
  which is admissible; "seemed uncomfortable" is not — it is a reading of a
  person, and readings do not get the grammar of measurement
  ([inference must look like inference](../../_laws.md#inference-must-look-like-inference)).
- **Length is bounded but not truncated mid-claim.** A fragment that ends before
  the candidate's point lands is worse than no quote, because it reads as
  evidence of the opposite.
- **Where evidence exists but is not quotable — a whiteboard, a demonstration —
  the field records the act and says what it is.** Naming the modality keeps a
  demonstration from being mistaken for a statement, and a statement from being
  credited as a demonstration.

## Boilerplate must never occupy the evidence field

The most damaging bug in this area is silent: a placeholder string — the
system's own "not assessed" text, a template prompt, a default sentence — renders
in the evidence field and is read downstream as something the candidate said. It
then propagates: into the debrief pack, into a summary, into an explanation given
to the candidate. A fabricated quote is the worst artifact a hiring record can
contain, and this is the mechanism that produces one without anyone lying.

Two defences, and both are needed:

1. **The unassessed state has its own representation**, distinct from the
   evidence field being filled with prose that explains the absence. Absence is a
   flag, not a sentence
   ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
2. **A rendering check that boilerplate never appears as a verbatim quote.**
   State the placeholder contract once, in one place, and test that the
   candidate-visible and panel-visible renderings both honour it. This is the
   kind of contract that holds in the runtime it was written in and breaks in the
   second one.

The detail that decides whether defence 2 works: **match the placeholder by
prefix, not by exact string.** A producer that emits several spellings of the
same absence — one for a plain skip, one naming why the synthesis was
unavailable, one localised — will defeat an equality check on the first day
someone adds a variant, and the failure is a fabricated quote. Fix the prefix as
the contract, mirror it in every runtime that reads the field, and pin it with a
test.

## Machine-transcribed conversations need a confirmation turn

When the transcript comes from speech recognition, a near-verbatim quote can
faithfully reproduce a mishearing. Technology names, product names and proper
nouns are the reliable casualties, and a scorecard that credits a skill the
candidate never claimed is a fabricated finding arrived at honestly.

The craft response is structural: **close the interview with a read-back** — the
interviewer states back the specifics they heard and the candidate confirms or
corrects them — and treat that exchange as the authoritative record where it
conflicts with an earlier mention. Three states follow, and they must stay
distinct: confirmed, corrected (recording both what was heard and what was
meant), and *mentioned but never reached in the read-back*, which is flagged as a
possible transcription error rather than asserted as a skill. Where no read-back
happened, the structure is absent — never invented to fill the shape.

## When a machine drafts the scorecard

Model-drafted scorecards make the quote requirement *stricter*, for one reason: a
model's paraphrase is fluent, plausible, and indistinguishable in tone from a
transcript excerpt. It is the most convincing wrong evidence available.

- **Require near-verbatim extraction, and say so in the instruction.** Ask for
  the candidate's words from the transcript, not a characterisation of them.
- **Prefer verifiability over polish.** A slightly awkward true fragment beats a
  clean invented one, and the instruction should say which way to err.
- **An unassessed competency yields an empty evidence field, not an explanation
  of why it is empty.** A model asked to justify an absence will write prose that
  reads like evidence.
- **A drafted rating is a hypothesis until a person adopts it.** The provenance
  travels with the scorecard; a degraded or partial run downgrades that
  provenance rather than presenting a thin verdict as authoritative.
- **Spot-check against the source.** Sample drafted scorecards and check quotes
  against transcripts on a standing cadence. The failure mode here is not loud;
  it is a slowly rising rate of quotes that are almost right.

## When not to use this

- **Do not require a quote where the interview format cannot produce one** — a
  timed silent exercise, a portfolio walkthrough recorded only as an outcome. The
  right response is to record the artifact reference instead, not to accept a
  narrated impression in the same field with the same weight.
- **Do not let the requirement become a compliance ritual.** A scorecard where
  every quote is one clipped sentence chosen to match a level already picked is
  formally compliant and epistemically empty; calibration on real fragments is
  what catches it.
- **Do not store more of the transcript than the decision needs.** The evidence
  field is a targeted excerpt bound to a rating, not a retention mechanism for
  the whole conversation; consent and retention are governed elsewhere and this
  technique does not override them.
