---
layer: technique
type: technique
subject: candidate-ai-disclosure-and-explanation
technique: disclosure-at-the-point-of-submission
status: forged
laws: [no-adverse-outcome-is-solely-automated, say-only-what-the-record-holds]
use_when: [writing the AI notice on an application form, deciding what a candidate must be told before they submit, reviewing disclosure copy that may assert the wrong jurisdiction]
shared_with: []
---

# Disclosure at the point of submission

The notice a person reads before handing over their career history is the only
disclosure guaranteed to reach every applicant, including the ones who are
declined in the first hour and never see another surface. Everything downstream
— status pages, explanation views, review requests — reaches a shrinking subset.
This one reaches all of them, so it carries the load.

## What it must contain

Four clauses, in plain language, above the submit control rather than behind a
link:

1. **Automation is used, and at what.** Name the function in the candidate's
   terms — the application is read and organised, responses are assessed against
   the role's requirements — not the technology.
2. **A person decides.** State explicitly that advance, offer and rejection
   decisions are made by a human and that nothing adverse is decided
   automatically. This is the clause that carries legal weight and it is the
   clause that must be *true of the pipeline*, not aspirational.
3. **What is assessed.** The qualifications and characteristics the assessment
   looks at — skills, experience, fit against the stated requirements — and by
   implication what it does not look at. Several regimes require exactly this
   enumeration, and a candidate reading it can tell whether something
   irrelevant is being scored.
4. **Data terms.** How long the record is held, and a self-service route to
   erasure. The retention figure must be the one the system *enforces*, not the
   one the policy aspires to; a number that no deletion job honours is a false
   statement made at the moment of collection.

A fifth clause is required in some regimes and is good practice everywhere: how
to request an alternative process, an accommodation, or a human review.

## Decision rules

- **Only promise what the pipeline enforces.** Before writing "a human decides
  every rejection", confirm that no threshold, no batch policy and no timeout
  can produce a decline without a human act. If one can, either close it or
  weaken the sentence. Copy is the cheapest place to make a promise and the
  most expensive place to break one.
- **State the enforced retention window, not the intended one.** Read the number
  from the same configuration the deletion path reads, so the two cannot drift.
- **Legal assertions never render from a default.** If the applicable regime is
  determined by a lookup, show the minimal universally-true text until the
  lookup resolves, and keep showing it if the lookup fails. A failed regime
  lookup means *unknown*, not *home jurisdiction*. The observed failure this
  guards against: a component seeded with a home-regime default, painting the
  wrong jurisdiction's legal claim on first render and permanently whenever the
  compliance endpoint returns unauthorised — no error, no log, a false legal
  statement served to every candidate in that workspace.
- **Disclosure is not consent.** The notice informs; the lawful basis and the
  consent record are a separate artifact owned by the consent-and-retention
  practice. Do not conflate a rendered paragraph with a recorded agreement.
- **The register is plain and short.** A notice nobody finishes reading is a
  notice nobody received. Three to five sentences beats a page, and a page that
  needs a lawyer to parse fails the intelligibility standard on its face.

## Placement and timing

The notice belongs where the decision to disclose is made — adjacent to the
submit control on the application form, and repeated in the acknowledgement the
candidate receives, so it survives in their own records rather than only on a
page they will not revisit. Where a regime requires advance notice measured in
days before the tool is used, publish the same text on the job posting: for
rolling applications, posting-time plus submission-time is the only
implementable reading of "in advance".

## When not to use this

- **Do not use it as the explanation surface.** This notice describes the system
  prospectively. A person who has been declined needs the facts of *their*
  decision; pointing them back at the general notice is the classic
  description-instead-of-explanation failure.
- **Do not stretch it into a full privacy policy.** Enumerating every processing
  purpose here defeats the brevity that makes it readable. Link outward for
  detail; keep the four clauses in the eye line.
- **Do not render it at all if the four clauses cannot be made true.** An absent
  notice is a compliance gap; a false notice is a misrepresentation made at the
  moment of data collection, and it is worse.
