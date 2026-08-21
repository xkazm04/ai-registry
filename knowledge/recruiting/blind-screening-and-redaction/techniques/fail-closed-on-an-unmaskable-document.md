---
layer: technique
type: technique
subject: blind-screening-and-redaction
technique: fail-closed-on-an-unmaskable-document
status: forged
laws: [uncertainty-resolves-toward-the-candidate, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [a document cannot be parsed or masked, blind mode meets an image-only or unusual file, deciding whether to route an original to an outside service]
---

# Fail closed on an unmaskable document

Blind mode has one asymmetry that settles every hard case: **you cannot un-see a
leaked identity, but you can always discard an assessment you were not confident
in.** A leak is irreversible in the direction that matters — once identity is in
front of the assessor, no downstream control recovers the blind claim. A refusal
costs a review.

So when the redactor cannot vouch for a document, the blind run refuses. It does
not do its best. A best-effort blind run is the single most dangerous artifact in
this subject, because it wears the label of a blind assessment while carrying
whatever leaked.

## The refusal conditions

Refuse when any of these holds:

- **The document yields no reliable text.** An image-only scan, a photograph of
  a page, a layout the parser flattens into unusable order. A redactor cannot
  mask spans it cannot locate.
- **The extracted text is implausibly short or structurally broken** relative to
  the document's apparent size — a signal that extraction failed and that
  whatever was masked was masked against a fragment.
- **The document's language is outside the vocabularies the masker covers.**
  Running one language's patterns over another's text produces a mask that is
  wrong in both directions at once.
- **The format would require handing the original to a channel the redaction
  does not control.** This is the condition teams most often waive and least
  often should. A format the local redactor cannot process is sometimes
  processable by uploading the unmasked original to an outside service that
  handles documents natively. That path is *exactly* the leak: the identity
  reaches a reader through a route the mask never touched. Blind mode must
  refuse the upload rather than take the convenient path, and the refusal must
  be enforced at the boundary that performs the send, not merely intended by the
  caller.
Do **not** refuse when the document masked but the mask is known incomplete —
zero name matches on a document that plainly belongs to a person, a category the
vocabulary could not reach. That is the third state, and it has a different
remedy: proceed, and withhold the redaction claim. Refusal is for the case where
you cannot mask at all; partial masking is a disclosure problem, not a refusal
one, and conflating them either strands candidates whose documents were 95%
masked or ships false blind claims for the ones that were 5% masked.

## What a refusal must and must not do

[Uncertainty resolves toward the
candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate) is the
first half: where the system is unsure and the downstream action is adverse, it
fails toward the person. An unmaskable document does not become a low score, an
incomplete assessment, or a silent drop. It becomes a stated *cannot assess
blind*.

[A candidate's process never stalls on your
constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
is the second half, and it is the one that turns a good control into a bad one
when forgotten. A refusal that leaves an application sitting in a queue has
converted a fairness control into a new unfairness, and one that falls hardest on
candidates whose documents are unusual — older formats, scans, non-dominant
languages, assistive-technology exports. That is precisely the population the
control existed to protect.

So the refusal routes, it does not park:

1. **Emit a typed refusal**, naming the condition, not a generic error.
2. **Route to an identified human path** — an unblinded review by a named
   reviewer, or a request to the candidate for a different format, chosen by
   policy in advance rather than improvised per case.
3. **Never silently downgrade to an unblinded automated run.** If the fallback
   is an unblinded assessment, it is labelled unblinded and it is not
   interchangeable with a blind one anywhere downstream.
4. **Record the refusal in the decision trail.** A refusal rate that climbs is a
   redactor regression or an intake regression, and it is invisible unless
   counted.

## Decision rules

- **When confidence in the mask is uncertain, refuse; when confidence in the
  *substance* is uncertain, disclose.** These are different failures with
  different remedies. A possibly-leaky mask cannot be repaired downstream. A
  heavily-masked but clean document can still be assessed, provided the
  assessment says how much was removed.
- **When a refusal path would take longer than the pipeline's own commitment to
  the candidate, the human path is under-resourced, not the threshold too
  strict.** Do not solve a staffing problem by loosening a leak control.
- **When someone proposes a per-requisition override to allow best-effort
  blinding, decline.** An override makes the procedural claim unverifiable
  across the corpus: nobody can then say what "blind" meant for any given
  assessment.
- **When the enforcement point is far from the decision point, move it.** The
  check belongs where the original could actually leave — the send itself —
  because that is the only place that cannot be bypassed by a new caller.

## When not to use this

Fail-closed applies to the *blind* path only. A pipeline that is not making a
blind claim should process the difficult document normally rather than refuse:
the refusal buys nothing and costs the candidate a stage. And do not extend the
reflex into unrelated degradations — a slow or unavailable model on a blind run
is a degradation to handle honestly on the assessment side, not a reason to
refuse the candidate.
