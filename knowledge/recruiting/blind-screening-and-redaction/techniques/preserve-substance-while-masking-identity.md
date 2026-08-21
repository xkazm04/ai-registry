---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: preserve-substance-while-masking-identity
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [tuning a redactor that is scoring candidates lower, deciding whether a span carries capability, pinning what a mask must not remove]
---

# Preserve substance while masking identity

The half of redaction nobody tests is the half that decides whether the
assessment is still worth anything. A mask is a lossy transform applied to the
exact evidence the verdict depends on, and its damage is invisible: the document
still reads fluently after mutilation, the assessment still comes back
confident, and the only symptom is a score that is quietly, unaccountably lower.

State the failure plainly, because it is the one that gets shipped:
**over-masking is an adverse action with no author.** A candidate whose tenure
was erased along with their birth year has been marked down by a transform, not
by an assessor, and no one in the process can name the decision or reverse it.

## What must survive

Pin these as contracts, in tests, alongside the removal contracts:

- **Team, group and programme names that are not the employer's identity.** An
  internal team name says the scale and the domain of the work. It binds to an
  organisation at most, not to a person.
- **Durations and tenures.** "Four years", "since the second year of the
  programme", "an eighteen-month migration". Duration is the single most
  load-bearing quantity in a career document and it is the one most often
  destroyed by a date-masking rule aimed at birth years.
- **Numbers and scale.** Headcount led, request volumes, budget, cohort sizes,
  percentage movements. These are the only quantitative evidence most documents
  carry.
- **Verbs, seniority language and scope.** Who decided, who built, who owned,
  who advised. Masking a role headline as if it were a name takes this out
  wholesale.
- **Qualification level and field, when the institution name is masked.** Mask
  the name; keep "a master's degree in a quantitative field".
- **Technology, method and domain vocabulary.** The substance of a technical
  document is almost entirely here.
- **Sentence structure around a masked attribute.** Mask the marker inside the
  sentence, keep the sentence.

## Decision rules

- **When a span carries both a binding and a capability, split it rather than
  choosing.** The default reflex is to drop the whole span because it is easier;
  the correct move is to emit a typed placeholder for the identity part and
  leave the rest of the sentence intact.
- **When a mask would remove a quantity, stop.** Quantities are almost never
  identifying on their own. A rule that eats numbers has been written at the
  wrong altitude — it is matching a format, not a meaning.
- **When a masking rule is generalised to catch a miss, re-run the preservation
  contracts first.** Every widening in this craft pays for its recall in
  substance, and the payment is silent unless it is pinned.
- **When two spans in a document are the same masked category, mask them to
  distinguishable placeholders where the document's coherence depends on it.**
  A career that names three employers must still read as three, or the assessor
  loses the shape of the progression.
- **When the document is short, mask more conservatively, not less.** A
  two-hundred-word document has no redundancy: one over-removal takes a
  proportionally larger share of the evidence. Long documents can absorb a
  clumsy mask; short ones cannot.

## Typed placeholders, not holes

A removed span leaves a typed marker naming its category. This is
[absence of evidence is not
evidence](../../_laws.md#absence-of-evidence-is-not-evidence) at document
altitude: a hole reads as an absence, and an absence in a hiring document reads
as a deficiency the candidate must answer for. "An employer name stood here" and
a blank line instruct a reader completely differently, and only one of them is
true.

The same law governs what the assessment may then *say*. An assessment that
reports "no evidence of team leadership" against a document whose organisational
context was masked is asserting something the record does not hold — the record
holds *masked*, not *absent*. Where a category was removed, the assessment's
silence in that area must be reportable as unknown rather than negative, which
is why the manifest travels with the verdict and why
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds)
constrains the wording of a blind assessment more tightly than an ordinary one.

## Detecting over-masking

Do not rely on inspection; masking damage is designed to be invisible. Two
cheap instruments:

- **A retained-substance ratio per document.** Track the share of the document
  replaced by placeholders, and flag documents past a threshold set from your
  own corpus rather than a borrowed number. An outlier is almost always a
  layout the redactor misread, not a candidate who wrote an unusual document.
- **A masked-versus-unmasked score comparison on a held-out sample, run
  offline.** If masking a corpus systematically shifts scores in one direction,
  the redactor is removing capability, not identity. Run this as a periodic
  calibration exercise on documents outside a live decision, never as a live
  second pass on a candidate in flight — a live second pass is exactly the
  unblinded re-run the ordering rules forbid.

## When not to use this

The preservation half does not apply to stored-record redaction, where the goal
is minimisation and losing substance is the point. Nor does it license keeping a
tier-1 identifier because it "carries context": a name is never substance. The
technique governs the middle — spans that genuinely do both — and its job is to
make that middle a decision rather than a default.
