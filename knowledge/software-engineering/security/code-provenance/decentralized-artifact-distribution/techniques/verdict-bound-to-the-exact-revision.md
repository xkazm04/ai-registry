---
layer: technique
type: technique
subject: decentralized-artifact-distribution
technique: verdict-bound-to-the-exact-revision
status: forged
laws: [verdict-survives-boundary, gate-sees-target, identity-survives-reuse]
shared_with: []
use_when: [designing how an approval or a block names what it applies to, a publisher edited a listing after it was approved and it stayed approved, deciding what a user's install consent is consent to, a moderator has to re-review every edit and you are asked to make approval sticky]
---

# Verdict bound to the exact revision

A third-party statement about an artifact — approved, blocked, pending, under
review — has a subject, and the choice of what that subject *is* decides whether
the statement can be stolen. Bind it to a name and it is transferable: the
publisher gets a benign revision approved, edits the record, and the approval
follows the name onto content no approver saw. Bind it to a **content
identifier** and the theft is structurally impossible, because the statement in
hand no longer describes the revision in hand.

This is the artifact-signing discipline — identity is content, not location —
applied one level up, to assertions *about* an artifact made by parties who are
neither the publisher nor the consumer.

## The rule

**Every statement names the exact content identifier it judged, and applies only
to that revision.** A statement whose subject is a name, a slug, a package
identifier, or a version string does not apply to anything; it applies to
whatever that pointer currently resolves to, which is a different thing on every
read.

The consequence people find surprising, and which is the reason to adopt this:
**approval expires on edit, with no action by the approver.** The publisher
revises the record; the revision has a new content identifier; the standing
approval matches the old one; the listing drops out of the approved projection
by arithmetic. No moderator queue entry, no revocation, no race between an edit
and a takedown. The same is true in the other direction — a block placed on one
revision does not follow the publisher's next edit — which is the cost, and is
addressed below rather than by weakening the binding.

## The two sides, and why both are needed

The binding has to hold at both ends of the distribution path, and a system that
implements one end is not half-safe, it is differently exposed.

**At the index.** A statement is applicable to the listing under evaluation only
when the statement's subject *and* its content identifier both match the
revision being evaluated. Written as a predicate this is two equality checks and
one line of code, and its absence is invisible in every test written against a
single unedited fixture — which is why the fixture set has to include *the same
subject at two revisions* as a first-class case.

**At the consumer.** The user sees a listing and consents to install it. Between
that consent and the fetch, the record can change. The consent must therefore be
**pinned to the identifiers that were displayed**: the client sends back the
content identifiers it saw, the server re-resolves the current record, and a
mismatch is an explicit, named drift error — *the records changed after review,
verify them again* — not a silent substitution and not a generic failure.

That second half converts a time-of-check/time-of-use window into a typed
outcome the caller can branch on
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)). The
naive alternative — re-read the record at commit time and proceed — is precisely
the gate that observes a proxy rather than its target
([gate-sees-target](../../../../_laws.md#gate-sees-target)): what was reviewed and
what is installed are two different reads, and the gap between them is the
attack.

Three consent states, and they must be distinguishable: **no identifiers
supplied** (the client never verified; refuse and say so), **identifiers supplied
and matching** (proceed), **identifiers supplied and not matching** (drift;
refuse, and re-display). Collapsing the first into the third produces a
confusing error for a client that simply has not implemented the flow; collapsing
either into a generic failure loses the only information that tells a user
whether they are looking at an attack or at a publisher who pushed an update
thirty seconds ago.

## What the binding does *not* cover, and how to cover it

Revision-binding is precise, and precision has costs that must be paid
explicitly rather than by loosening the rule.

- **A blocked publisher republishes with one byte changed.** The block does not
  follow. The answer is not to bind the block to a name — that reintroduces
  transferability in the direction that matters most — but to have a second
  grant that acts on the *publisher identity* rather than on a revision. Two
  instruments, two scopes, stated separately
  ([split-admit-state-and-redact-authority](./split-admit-state-and-redact-authority.md)).
- **Re-review cost scales with edit frequency.** Every typo fix returns the
  listing to unapproved. This is a real operational load and the honest
  mitigations are operational: make re-assessment automatic and fast for the
  common case, let the assessment pipeline run on the new revision the moment it
  is ingested, and reserve the human decision for the cases the automated pass
  cannot clear. What is *not* an acceptable mitigation is approving a name.
- **The identifier must be canonical.** Two spellings of the same content that
  hash differently reintroduce the mismatch as a false positive; two contents
  that hash identically reintroduce it as a false negative. The canonicalization
  rule is the signing neighbour's, and it must be the same rule on every side —
  the publisher's store, the index, the assessing party, and the client
  ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Decision rules

- **A statement without a content identifier is not evidence about a revision.**
  Treat it as inapplicable rather than as weak evidence; there is no honest way
  to weight it.
- **Applicability is subject equality *and* revision equality.** Both, in the
  same predicate, at the point of evaluation — never one at query time and the
  other in a later filter that someone will move.
- **Consent is to a revision, re-checked at commit.** The client returns what it
  saw; the server compares and refuses on drift with a distinct code.
- **Never make approval sticky across edits, however loudly it is requested.**
  Fix the re-approval latency instead. Stickiness is not a usability
  improvement; it is the transferability the technique exists to remove.
- **Include a two-revision case in the fixture set** for every applicability
  predicate. A single-revision fixture passes whether or not the binding exists.

## When not to use it

- **When the artifact is immutable by construction** — a released version that
  can never be re-published under the same coordinates. Then the version string
  *is* a content identifier and the second one adds ceremony without adding a
  property. Note that this exemption almost never covers the *listing metadata*
  around the artifact, which is usually mutable even when the artifact is not,
  and which is what most display-safety statements are actually about.
- **When the statement is genuinely about the publisher, not the artifact** — a
  verification claim, an account-level suspension. Those bind to the identity and
  to whatever else makes them stale, and forcing a revision binding onto them
  produces a statement that expires for the wrong reason.
- **When there is no third party.** If the only party making statements is the
  operator whose database is the listing, the whole apparatus collapses into a
  status column, correctly.
</content>
