---
layer: technique
type: technique
subject: candidate-identity-and-staleness
technique: shared-artifact-across-claimed-identities
status: forged
laws: [uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [one submitted document or one contact channel appears on records that claim different people, designing duplicate or merge handling on an application intake, deciding what a fraud or impersonation indicator may do to an application]
---

# Shared artifact across claimed identities

Content addressing answers "is this the same document?" exactly, and the rest
of this subject is careful to say what that answer is *not*: equal digests are
not the same person. This technique covers the inverse case, which the forward
rules leave unaddressed. **One artifact, or one contact channel, appears on
records that claim to be different people.**

Two situations produce it, and they need opposite handling if you guess:

- **Benign sharing.** A staffing agency submits several real people and puts
  its own address and phone on every submission. A career office or a bootcamp
  hands a cohort one template. A household shares one inbox. A recruiter
  re-uploads a colleague's file under a name of their own choosing.
- **Impersonation.** One operator applies under several invented or borrowed
  identities, reusing the same document and the same few phone numbers and
  addresses. Law-enforcement guidance published in 2025 names exactly this as
  an indicator for employers to cross-check: the same resume content or contact
  information under different applicants. Independent industry investigation
  has since documented operators holding a real developer's resume beside a
  near-identical copy under another name.

A system that guesses gets one of these wrong. If it merges on the shared
channel, it builds the composite person, with one applicant's history under
another's name. If it rejects on the shared artifact, it charges a real person
for an agency's address book. The technique is to do neither. Surface the fact,
route it to a person, and let identity verification (which sits outside this
subject) settle it.

## What the check can and cannot see

**It needs a claimed identity held outside the bytes.** A content digest can
only notice that one document is attached to two claims if the claim lives
somewhere other than the document: a name typed into an application form, an
account, a sender address, an invitation. In a pipeline where the only claim of
identity is the name inside the document, or a label derived from the upload,
identical bytes always carry the same claim. The check then finds only renames,
and running it there produces noise. Put the digest where the external claim is
recorded, usually the inbound application, not the recruiter's own upload tool.

**It sees exact copies only.** An operator who edits the name inside the
document produces new bytes and a new digest. The documented pattern is
*near*-identical documents, and catching those is a similarity problem this
technique does not solve. Its signal is narrow and exact. Do not present it as
fraud coverage.

**Contact reuse is the weaker half.** Shared phone numbers and addresses across
applicants are named by government guidance, and by nothing independent of it.
Treat a shared channel as a prompt for review only, and treat it as expected
when the channel belongs to a known intermediary.

## The procedure

1. **Record the digest where the external claim is recorded.** Hash the file at
   the application intake and store the digest beside the claimed name and
   contact channel. Without that pairing there is nothing to compare.
2. **Separate known intermediaries first.** Agencies and other submitters acting
   for candidates are recorded as the submitter, and their channels are excluded
   from matching. A shared agency address is expected, not a signal.
3. **Count distinct claimed identities per artifact and per channel.** More than
   one is the fact. Normalise the comparison so that case and padding differences
   in the same name do not count as two identities.
4. **Split same-claim from different-claim before anyone sees it.** One channel
   on two records under the *same* name is a fragmented record, which is a merge
   question for a human under the forward rules. One artifact or channel under
   *different* names is the identity question, which this technique owns.
5. **Show both records side by side.** Show each claimed identity, the shared
   artifact or channel, and how each record arrived (direct, agency, import). A
   reviewer needs the provenance to tell the agency case from the operator case.
6. **Record who resolved it and how.** Name the actor and the outcome:
   verified, explained, or escalated. An unresolved flag stays visible on both
   records, and neither record is dropped.

## Decision rules

- **Never auto-merge.** Different claimed names on one shared channel is the
  strongest evidence available that the records are *not* one person. A
  merge rule that picks the most recently active profile builds exactly the
  composite that
  [uncertainty resolves toward the
  candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate) forbids.
- **Never auto-reject or suppress.** The flag raises verification. It does not
  lower a score, drop a record, or block a stage. The guidance that names the
  indicator asks for additional review, never for rejection.
- **Apply it uniformly.** Run the check the same way for every application,
  never by name, accent, claimed nationality or location. A fraud check that
  runs on a subset of applicants is a national-origin screen.
- **Say only what the record holds.** "This document was also submitted under
  another name" is a fact. "Possible fraud" and "duplicate person" are
  conclusions that only a person may reach
  ([say only what the record
  holds](../../../_laws.md#say-only-what-the-record-holds)).
- **Do not copy analyses across the claims.** A stored reading of the shared
  document is not evidence about either claimed person until the identity
  question is settled.
- **Keep the claimed name a label.** The names being compared are labels, which
  is why the check routes to a person and never keys anything on them
  ([meaning does not live in a
  label](../../../_laws.md#meaning-does-not-live-in-a-label)).

## When not to use it

- **Where no external identity claim exists.** A recruiter-side upload tool whose
  only identity is the filename or the name inside the file has nothing to
  compare. The check reports renames there, and people learn to dismiss it.
- **Across an anonymisation boundary, or across legal entities and tenants.** An
  erased record's digest must already be gone. Two organisations each received
  their own application, and matching between them assembles a footprint that
  neither is entitled to.
- **Inside a blind screen.** The flag names the claimed identities, which is
  exactly what the redaction removed. Resolve it outside the blind surface,
  before or after the blind stage.
- **As a score feature.** "Shared a channel with another applicant" feeds
  verification, never ranking. Once it becomes a weight, it penalises everyone
  who applied through an agency.
