---
layer: technique
type: technique
subject: pre-boarding-and-first-day-handoff
technique: signature-seam-declared-not-implied
status: forged
laws: [every-decision-names-its-actor, say-only-what-the-record-holds, inference-must-look-like-inference]
shared_with: []
use_when: [building or reviewing a document-signing step in onboarding, labelling a completion state on a contract, planning an upgrade to a real electronic-signature provider]
---

# The signature seam is declared, not implied

Almost every pre-boarding flow acquires a document step, and almost every one begins
as an internal completion mark: someone on the people team marks the contract as
signed. That is a defensible first implementation. Labelling it a *signature* is not,
because the documents moving through this step are employment contracts, non-disclosure
agreements and intellectual-property assignments — the documents most likely to be
produced in a dispute years later.

The technique is to name the seam in the vocabulary the user reads, so that what the
system actually holds and what it appears to hold are the same thing.

## The failure this prevents

The shape is always the same. A recruiter-side control marks a document signed, with
the *new hire's name* recorded as the signer. The hire's own surface deliberately
exposes no signing action, so there is no path by which they could have signed. The
stored state calls itself audit-stamped. The caveat that this is not a qualified
electronic signature lives in a source comment, where the person clicking the button
will never see it.

What the record now holds is: a document, a name, a timestamp, and no evidence
whatsoever that the named person ever saw the document. What the record *appears* to
hold is an executed contract. That distance is the defect — it is
[inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
applied to provenance rather than to a model's guess: an internal assertion rendered
in the grammar reserved for an executed instrument.

## The three levels, and saying which one you are at

- **Internal completion mark.** A member of the organisation asserts that a document
  step is done. Evidentiary value: it records that an employee said so. Correct label:
  *marked complete*, with the marker's name.
- **Audit-stamped acknowledgement.** The other party themselves acted — clicked,
  typed a name, ticked a box — from an authenticated surface, and the system captured
  who, when, from where, against which document version, and what they were shown.
  Evidentiary value: real but jurisdiction-dependent. Correct label: *acknowledged*
  or *accepted*, never bare "signed" unless local law supports it.
- **Qualified electronic signature.** A provider under the relevant jurisdiction's
  regime performs identity assurance and issues an instrument with its own evidentiary
  standing. Correct label: whatever the regime calls it.

The rule: **the interface says which level it is at.** Not the documentation, not a
comment, not an onboarding call — the label on the state, on the screen where someone
acts on it.

## Every stamp names its actor, and it is the actor who acted

The record stores the identity of **the person who performed the action**, and never
substitutes the person the document is about. Recording the hire's name as the signer
of a stamp a recruiter applied is a misattribution of accountability, which is the one
failure an audit surface may never have.
[Every decision names its actor](../../../_laws.md#every-decision-names-its-actor).

The minimum a stamp holds, at any level:

- **Who** acted, as a real identity in the system, plus their role at the time.
- **When**, on the server clock.
- **On what** — a stable reference to the exact document *version*, ideally a content
  hash, so a later edit cannot inherit an earlier stamp.
- **What they were shown** — the document as rendered to them, or a reference that can
  reproduce it.
- **At which level** — completion mark, acknowledgement, or qualified signature —
  stored as a value, not inferred from which code path happened to run.

Do not overclaim in the stored vocabulary either. If no signer authentication,
network origin, consent text or document hash was captured, the stored state must not
be named as though they were.
[Say only what the record holds](../../../_laws.md#say-only-what-the-record-holds).

## The seam is an interface, not a comment

An upgrade path that exists only as a note saying a real provider "wires in here" is
not a seam; it is an intention. Make it a real boundary:

- A named interface with the operations a provider actually has — create an envelope
  for a document and a set of parties, receive a completion callback, fetch the
  resulting evidence artifact.
- The internal completion mark implemented *as one implementation of that interface*,
  clearly named as the internal one.
- The level recorded per document, so a workspace that upgrades mid-flight has a
  record that honestly reports which documents were stamped under which regime. Never
  retro-label old stamps as signatures because the provider is now wired in.

With that in place, an upgrade is a configuration change and a provider
implementation. Without it, the upgrade is a schema migration performed under legal
pressure.

## Let the hire sign, if anyone is going to

The cheapest path to the middle level is usually already available: the hire has an
authenticated surface of their own in this window. Presenting the document there,
capturing their action against a specific version, and stamping *their* identity turns
a self-attestation into a genuine acknowledgement without any provider at all.

The constraint is that the hire's surface must still expose only their own side —
their documents and their acknowledgement, never the internal checklist, the internal
task list or the offer terms. Adding a signing action is not permission to open the
workflow.

## Decision rules

- **When the person named as signer did not act, the state is not "signed."** No
  exceptions, no matter how routine the document.
- **When the document changes, the stamp does not carry over.** Re-issue and re-stamp
  against the new version.
- **When the jurisdiction or the document class requires a qualified signature —
  employment contracts in some jurisdictions, anything with statutory form
  requirements — do not ship the internal mark for it at all.** Route it out of the
  product to whatever process is actually valid.
- **When surfacing the state to a recruiter, put the caveat next to the control.**
  A tooltip on the button that says what this does and does not constitute is the
  entire mitigation, and it costs nothing.
- **When a document step gates provisioning, gate on the recorded level, not on a
  boolean.** "A completion mark exists" and "an executed contract exists" must not be
  the same predicate.

## When not to use this

- **Where a qualified provider is already wired in end to end.** Then the level is
  known and constant; the vocabulary discipline still applies to any *other*
  completion marks in the same checklist.
- **For genuinely internal checklist items** — equipment ordered, account created,
  buddy assigned. These are completion marks by nature and nobody mistakes them for
  instruments; do not burden them with signature machinery.
- **As a reason to delay the document step entirely.** An honest completion mark
  shipped today is better than a signature provider promised for next quarter. The
  technique asks for accurate labels, not for a bigger build.
