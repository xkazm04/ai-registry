---
layer: technique
type: technique
subject: regulated-credential-gating
technique: required-but-missing-as-a-blocking-gate
status: forged
laws: [absence-of-evidence-is-not-evidence, no-adverse-outcome-is-solely-automated, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [a requisition requires a licence the candidate's record does not show, deciding what a blocking credential gap may and may not do, wiring a knockout reason into a match result]
---

# Required but missing as a blocking gate

When a requisition requires a regulated credential and the candidate's structured
credentials do not include it, the system has learned something specific and limited:
**the record does not evidence eligibility**. This technique specifies exactly what that
fact is allowed to do.

## What "blocking" blocks

A blocking gap has three effects and no others:

1. **It forbids a favourable conclusion.** No strong-fit verdict, no high-confidence
   recommendation, no auto-advance. The candidate may not be rated a strong match on
   skills alone while a legal precondition is unevidenced — that is the single most
   important sentence in the subject, because it is the one a scoring model will violate
   by default.
2. **It surfaces as a risk flag with a named reason**, at the top of the result rather
   than buried inside a rationale paragraph. The reason states the credential, the
   requisition line that required it, and the state (not evidenced / expired / wrong
   jurisdiction) — three facts a recruiter can act on in one read.
3. **It creates a verification task** with an owner and a route: which register or
   authority answers this, and by when.

And what it does not do: **it does not reject.** Not automatically, not after a delay,
not through a bulk sweep. The route vocabulary the automation may execute admits advance
and hold; this gate produces hold with a reason attached
([no adverse outcome is solely automated](../../../../_laws.md#no-adverse-outcome-is-solely-automated)).
It also does not zero the skills assessment, does not remove the candidate from the
list, and does not suppress the rest of the analysis — a hiring manager weighing a
reciprocity route needs everything else the system found.

## Three states, and the middle one is the common case

The gate must distinguish:

- **Not evidenced** — the record says nothing about this credential. Overwhelmingly the
  most frequent state, and *not* a finding about the person. A licensed professional who
  omitted their registration number is indistinguishable, at this layer, from someone who
  never held it. Resolve toward the candidate: block the favourable conclusion, ask.
- **Evidenced but not current** — the record shows the credential with an expiry in the
  past. Blocks equally hard, because practising on a lapsed licence is the same legal
  situation as practising without one — but the *conversation* is different, and often
  short: a renewal in progress resolves it in days.
- **Evidenced and disqualifying** — a register or document actively says not held,
  suspended or revoked. Rare from documents, common from verification. This is the only
  state that is a fact about the person, and even here the outcome is a human decision.

Collapsing the first into the third is the failure this technique exists to prevent
([absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)).

## Procedure

1. **Derive the required set from the requisition** at ingest, through the catalog, and
   store it — do not re-read the prose at match time.
2. **Compare structured record against structured requirement**, on kind, jurisdiction
   and currency. Never compare a requirement to a narrative paragraph.
3. **Emit one gap object per unmet precondition**, carrying the credential, the state,
   the requisition source line and the verification route. One object per gap, not one
   summary sentence — the presentation layer composes the sentence, and a structured gap
   survives translation, re-render and audit.
4. **Cap the verdict** in the same pass that produces it, so no consumer can read a
   strong-fit value that the gate would have removed.
5. **Route to hold and name the actor** for whatever happens next. A gap that lands in
   an unworked queue is a rejection with a longer fuse
   ([uncertainty resolves toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate)
   is not satisfied by a queue nobody reads).
6. **Ask the candidate before concluding.** A single targeted question — do you hold
   this, in this jurisdiction, and is it current — resolves most gaps at a cost far below
   a lost qualified applicant, and it is the only step that can convert *not evidenced*
   into a fact.

## A screen, not a verdict — and the finding should say so

The gap object's own text carries its status. A finding that reads "this candidate lacks
the licence" is a verdict; one that reads "the role appears to require this licence, not
found in the candidate's record — verify before advancing" is a screen, and the
difference survives every downstream reader, including the ones who only ever see the
rendered line. Making the review instruction part of the finding rather than part of the
surrounding interface is cheap insurance against the day the finding is exported,
summarised, or read in a context the designer never saw.

Fold credential findings into **the same review ledger as the pipeline's other
deterministic screens** — authenticity, grounding, injection detection. One ledger means
one place a reviewer looks and one count that drives the review flag, rather than a
credential warning that lives in its own corner and is discovered by whoever thinks to
scroll.

## Decision rules

- **When a required credential is not evidenced, cap and ask; never reject.**
- **When it is evidenced in a different jurisdiction, treat it as a reciprocity question,
  not a gap.** The gap object records the mismatch; the verdict is still capped, but the
  recruiter sees a route rather than a wall.
- **When the requirement was stamped by a default policy rather than asserted by the
  requisition, it may never gate.** A field a normalisation step filled in because the
  ad was silent is a *phantom* — the employer never stated it, so nobody is accountable
  for it, and a candidate excluded by it was excluded by a default. Track which
  requirement fields were defaulted and exclude them from every hard gate, credential
  gates included.
- **When the requisition's requirement is a preference rather than a precondition, it
  does not reach this gate at all** — it scores, and a shortfall is offsettable.
- **When multiple preconditions are unmet, emit them all.** Truncating to the first one
  produces a candidate who resolves one gap and is knocked back by the next, which is a
  cruelty the system had the information to avoid.
- **When the gate fires, record the decision with its actor and its rule**, so the file
  reads as something that happened rather than as an unexplained low ranking.

## When not to use this

- **Do not use it for soft certifications.** A blocking gate on a preferred badge is
  requirement inflation with automation attached.
- **Do not use it as a filter that removes candidates from the recruiter's view.**
  Hiding a capped candidate makes the gate an automated rejection wearing a UI.
- **Do not use it where the requisition itself is unreliable** — a scraped or
  auto-generated requirement list has not been reviewed by anyone accountable, and
  gating on it exports the authoring error onto candidates. Gate on reviewed
  requirements only.
