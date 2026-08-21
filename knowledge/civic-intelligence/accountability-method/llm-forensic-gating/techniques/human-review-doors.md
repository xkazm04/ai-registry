---
layer: technique
type: technique
subject: llm-forensic-gating
technique: human-review-doors
status: forged
laws: [lead-not-finding, incident-anchored-doctrine]
shared_with: []
use_when:
  - deciding how a gated model output becomes a published claim
  - designing the review state machine and its audit trail
---

# Human review doors

A human review door is the single, audited passage through which a machine-
produced claim may become a published one. Everything upstream — schema
validation, membership gates, citation checks, register gates — only earns a
verdict the status of *lead pending review*. The door is where a human takes
responsibility for the assertion, and the technique is about making that
event real: one write path, an immutable record of every decision, a state
machine that cannot drift toward publication by accident, and published copy
that says which kind of review actually happened.

## Procedure

1. **Land every passing verdict in a pending state, structurally.** The
   pipeline's success path writes `pending_review`, never `published` — there
   is no code route from "all gates green" to "readers see it" that does not
   pass through a human decision. Gates filter leads; they do not promote
   them.
2. **Make one code path the only writer of review state.** Every other module
   treats review state as read-only. A second writer — a migration script, a
   convenience endpoint, a batch fixer — is how "verified" comes to mean
   nothing; when bulk operations are needed, they go through the same door
   with a reviewer identity attached.
3. **Audit first, then update, in one transaction.** Each decision appends an
   audit row — who, what, when, the decision, the prior state — before the
   state change is applied, and both happen atomically. Chain the audit rows
   (each carrying a hash over its content plus the previous row's hash) so
   the record is append-only in a verifiable way, not merely by convention:
   the one public trust surface of a review system is the ability to prove
   the decision history was not edited.
4. **Design the state machine around irreversibility asymmetries.** Confirm
   moves a lead to verified; reject is terminal — a rejected claim must not
   re-enter the pending queue forever, and must never flip to verified;
   needs-more-evidence legitimately returns a decided claim to pending. The
   dangerous transitions are the ones toward publication; make those the
   narrowest.
5. **Serialize concurrent decisions.** Two reviewers deciding the same claim
   concurrently is a lost-update race in which whichever write lands last
   silently discards the other's decision. Run read → audit-append → update
   inside one transaction on a serialized path, so the second decision sees
   the first's committed state.
6. **Say which review happened, at the published surface.** Machine review is
   not human review. Copy over a machine-gated, human-unreviewed lead must
   read as a lead; the verified badge belongs only to claims that passed the
   door. Blurring the two asserts a verification level no one performed.

## Decision rules

- **When review throughput becomes the bottleneck, tighten upstream gates —
  never widen the door.** The correct response to a flooded queue is better
  triage and stricter automated rejection, not auto-approval above a
  confidence score. A confidence score is the model's self-report, and
  self-reports do not carry legal responsibility.
- **When a decision needs undoing, decide forward.** Append a new decision
  that supersedes the old one; never edit or delete the audit record. The
  history including the mistake is the trustworthy artifact.
- **When legacy records predate the audit chain, pass their gaps through as
  nulls** — never backfill fabricated chain positions. A partially chained
  history honestly disclosed beats a fully chained history partly invented.
- **When the queue must be sampled, ship the population size.** "Reviewed 40
  of 612 pending" is a floor and must read as one; a review page that hides
  the denominator converts sampling into implied completeness.

## When not to use it

Do not put a human door on outputs that never assert anything about a named
party — internal quality scores, corpus statistics, triage rankings that only
order the machine's own work. Routing those through human review dilutes the
reviewers' attention on exactly the class of claims where their judgment is
irreplaceable, and a review queue full of trivia is how real accusations get
skimmed. Conversely, never let the inverse creep in: if a surface renders a
model's interpretation about a person to the public, it takes the door, no
matter how well-gated the pipeline that produced it was.
