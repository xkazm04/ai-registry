---
layer: technique
type: technique
subject: hiring-policy-defaults-and-tiering
technique: policy-version-sealed-into-every-decision
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, say-only-what-the-record-holds, every-decision-names-its-actor]
shared_with: []
use_when: [a human approves a batch of decisions under a policy that could change, sealing a decision record, adding a new dimension to hiring policy configuration]
---

# Policy version sealed into every decision

## The concern

Thresholds move. Automation gets enabled. A required gate is added. Each change is
legitimate and each one silently rewrites the past of every decision that referenced the
policy by name rather than by version. A year later the record says the candidate was
below the bar, and the bar in the system is not the bar that decided anything.

Worse, there is a live-window version of the same problem: a reviewer opens a cohort, reads
it, and approves. Between the reading and the approval, someone moves a threshold. The
approval is now about a set that no longer exists, and the reviewer's judgment has been
applied to a decision they did not see.

The technique is a **canonical, content-derived policy version** — computed from the
effective configuration, signed alongside what was reviewed, sealed into every decision
record, and checked at the moment an approval is redeemed.

## The canonical form, and the two properties it must have

The version is a digest of a canonical serialisation of the effective policy — baseline
merged with overrides, exactly as the decision path resolved it. Canonical means
deterministic: fixed key order, fixed number formatting, no map iteration order, no
locale-dependent rendering. Two runs over the same effective policy produce the same bytes
on any machine, or the version is noise.

Two opposing properties must both hold, and getting one without the other is the common
failure:

- **Adding a new policy dimension must leave existing versions byte-identical.** Achieve
  this by **omitting absent values from the canonical form** rather than serialising them as
  null or as a type default. If every field is serialised, shipping a new knob changes the
  digest for every organisation that has never set it, invalidating every in-flight approval
  and forcing re-review of work nobody touched. Recruiters learn that the system randomly
  discards their approvals and stop trusting the mechanism that exists to protect them.
- **Changing a dimension that is in use must change the version.** The mirror property, and
  the reason the version is derived from content rather than being an integer someone
  remembers to increment. A bar that moved between review and approval must break the seal.

State the rule as one sentence in the code that computes it: *absent means omitted, present
means included, so a new dimension is invisible until someone sets it and a live dimension
is decisive the moment it changes.*

## The procedure

1. **Resolve the effective policy first, version second.** The digest is over what actually
   governed the decision — after inheritance, after role-family resolution — not over the
   baseline row. Versioning the baseline while a team override did the deciding produces a
   version that identifies the wrong rulebook.
2. **Include only what can change an outcome.** Display preferences, labels, notification
   settings and cosmetic fields do not belong in the digest; including them makes the version
   churn for reasons that have nothing to do with any candidate, which trains everyone to
   ignore a version mismatch.
3. **Sign the version alongside the reviewed cohort, not separately.** The artifact a human
   approves binds three things at once: the identity of the cohort, the version of the policy,
   and the actor. A token that carries the cohort but not the version can be redeemed under a
   changed rulebook; one that carries the version but not the cohort can be redeemed against a
   different set of people. The bulk-adverse-action subject owns the token mechanics; what
   this technique supplies is the version that goes into them.
4. **Verify at redemption and refuse on mismatch.** When the approval is executed, recompute
   the version from the current effective policy and compare. On a mismatch, do not execute
   and do not silently re-scope: return the reviewer to a fresh review, stating plainly what
   changed. A refusal here is cheap; an execution is not
   ([a verdict is bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged)).
5. **Seal the version into the decision record itself**, next to the actor, the timestamp and
   the decisive inputs, so the decision can be replayed against the rules in force. Store the
   version identifier *and* retain the configuration it identifies — a digest whose
   preimage was deleted proves that something was in force and cannot say what.
6. **Keep every version's content addressable.** Policy configurations are small and
   append-only history of them is cheap. Overwriting a configuration in place destroys the
   ability to answer the only question the version was created to answer.
7. **Expose the version to the reader, not only to the machine.** An audit surface that shows
   a decision should be able to render "decided under policy version X, which differs from
   today's in these two values". A version nobody can dereference is a checksum, not an
   explanation, and
   [say only what the record holds](../../../_laws.md#say-only-what-the-record-holds) requires
   that the difference be shown rather than asserted.

## Decision rules

- **When any consequential decision is recorded, the policy version is a required field, not
  an optional one.** A record without it can be defended only with today's rulebook, which is
  not the one that decided.
- **When the version changes while a human is reviewing, invalidate the review.** Not a
  warning, not a merge — a fresh review. The reviewer's judgment was formed over a set the
  new policy may reshape.
- **When adding a configuration field, verify that the version of an untouched organisation
  does not move.** Make this a test, because the regression is silent and its symptom appears
  in a different system a week later.
- **When a field is removed from policy, treat it like a change to a live dimension for
  anyone who had set it, and like nothing for everyone else.** The omit-absent rule gives you
  this for free, which is the second argument for it.
- **When two systems compute the version — say a pipeline and an application layer — pin
  byte-equality with a shared fixture tested from both sides.** A canonical form implemented
  twice is two canonical forms until proven otherwise, and the divergence appears as
  approvals that mysteriously never redeem.
- **When someone proposes making the version a human-readable label, refuse and add the label
  as a separate field.** Names are stable while their contents change, which is the worst
  possible property for an audit field; a friendly name beside a content digest gives both
  properties without either contaminating the other.

## Where the boundary is

This technique produces the version and defines its guarantees. It does not own what else a
decision record contains, how the record is chained, or what the chain proves — that is the
decision-audit subject, and its rule that a record snapshots rather than references is the
reason this version must exist at all. Nor does it own the approval token's expiry, scope or
single-use semantics, which belong to the bulk adverse action subject. The seam is clean: a
version is a fact about the rulebook, and the neighbours are the mechanisms that carry it.

## When NOT to use it

- **Not for every configuration in the product.** Only policy that can change a candidate's
  outcome earns a version. Versioning display settings dilutes the mismatch signal until
  people route around it.
- **Not as a substitute for retaining the decisive input values.** The version says which
  rulebook; the snapshotted score, threshold and flags say what was compared. A record with
  the version alone still requires a live lookup to be understood, which is the
  reference-decay failure with an extra step.
- **Not as a change-management process.** The version detects that policy moved; it does not
  review the move, notify anyone, or judge whether it was wise. Those are separate controls,
  and a team that has the digest and believes it has governance has a very precise record of
  changes nobody examined.
