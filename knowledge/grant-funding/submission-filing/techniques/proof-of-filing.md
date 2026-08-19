---
layer: technique
type: technique
subject: submission-filing
technique: proof-of-filing
status: forged
laws: [clean-is-not-ready, provenance-per-field, never-fabricate-a-figure]
shared_with: []
use_when: [deciding what evidence a filed status requires, building surfaces that promise on submission facts, handling filings whose confirmation never arrived]
---

# Proof of filing

"Filed" is a claim the user makes; proof is evidence the funder issued. The
technique models a submission's filed-ness as two independent facts and
refuses to let any surface conflate them:

- **filed** — the record reached a filed state (the one-way transition
  happened). An honor-system fact: true because someone said so.
- **verifiable** — the filed record carries funder-issued evidence: a
  confirmation or tracking number, or a reference to an uploaded receipt.
  A countersigned fact: true because the world said so back.

`verifiable` is derived, never stored as its own flag: it is `filed AND
(confirmation number present OR receipt present)`. Deriving it in exactly one
pure function — taking the record's status, filing timestamp, and captured
evidence — is what keeps every badge, report, and guarantee reading the same
verdict without re-parsing anything. Evidence on an unfiled record proves
nothing (a number typed in advance is not a receipt); a filed record without
evidence stays a claim. The distinction is the domain's version of "no issues
found" vs "not checked" — two states that must be impossible to confuse.

## What counts as evidence

Real submission systems issue identifiers at the moment of receipt: a
tracking number, a validation receipt, a confirmation email with a stamped
submission instant. Norms worth building to:

- **The funder's clock is the clock.** Portals decide on-time by their own
  timestamp, in their own timezone — the applicant's local send time is
  irrelevant. Store the evidence's stamped instant when available; the local
  filed-at is a fallback, and the two should not be silently interchanged.
- **A confirmation number proves receipt, not acceptance.** Federal-style
  portals validate after submission and can bounce a package days later.
  Where the funder exposes a post-submission validation state, track it as a
  third fact; never let "we have a number" imply "the application is in
  review."
- **Capture evidence as opaque strings.** Confirmation formats vary by
  funder and change without notice. Trim, store, display; never parse
  meaning out of them, and never *generate* one — a placeholder that looks
  like a confirmation number is a fabricated figure in its most dangerous
  costume.
- **Receipts are references, not blobs in the record.** The filing record
  holds an opaque reference to the stored receipt artifact; the evidence
  model should not couple to any particular file infrastructure.

## Procedure

1. **Ask for evidence at the mark-filed moment,** in the same capture gesture
   as the rest of the filing contribution — optional, never blocking. A
   mandatory evidence field teaches users to type garbage into it, which is
   worse than an honest blank.
2. **Derive the proof object on read.** One pure function maps a submission
   record to `{filed, filedAt, confirmationNumber, receiptRef, portalUrl,
   verifiable}`. Every surface renders from this object.
3. **Render the two states distinctly.** "Filed" and "Filed · verified" are
   different badges. The unverified state is not shamed — most manual
   filings start there — but it is never dressed as the verified one.
4. **Key promises on `verifiable` only.** Deadline guarantees, success-fee
   triggers, compliance attestations, and any externally-facing claim about
   submission counts read the derived flag. Internal progress views may key
   on `filed`.
5. **Offer an upgrade path.** A filed-unverified record accepts evidence
   later (the confirmation email found the next morning). The status does
   not change; the evidence does, and `verifiable` flips by derivation.

## The missing-confirmation case

A dropped connection at the submit instant can leave the filing received by
the portal while no confirmation reached the applicant. The playbook the
proof model must support: the user checks the portal's own status page
*before* re-filing — blind resubmission risks a duplicate application, and
blind assumption of success risks a phantom filing. The system's honest
representation meanwhile is exactly filed-unverified, which is why that state
must exist and must not be punished: it is sometimes the truthful description
of a successful filing whose paperwork lagged.

## Decision rules

- **When an analytics surface counts submissions, disclose which flag it
  counts, because** a win rate over `filed` and a win rate over `verifiable`
  are different populations, and mixing them mid-chart is a silent
  definition change.
- **When a user edits or removes evidence, keep the audit trail, because**
  evidence that can vanish without trace converts the verified badge into a
  mood ring.
- **When designing for automated filing, hold it to the same bar, because**
  an automation that marks records filed without capturing the portal's
  confirmation has scaled the honor system, not eliminated it.

## When not to use this

Do not extend the two-boolean model into a general workflow engine — it
models exactly one moment (did this leave the building, provably) and its
value is its smallness. Downstream lifecycle (under review, awarded,
declined, reporting due) is outcome tracking, a different concern with
different reversibility rules. And skip the evidence machinery entirely for
submissions with no external counterpart — an internal letter of intent that
never touches a funder system has nothing to verify.
