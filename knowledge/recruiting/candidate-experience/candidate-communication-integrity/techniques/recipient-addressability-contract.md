---
layer: technique
type: technique
subject: candidate-communication-integrity
technique: recipient-addressability-contract
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, every-decision-names-its-actor]
shared_with: []
use_when: [resolving who a candidate-facing message goes to, a candidate record has no contact address, designing fallbacks in a dispatch path]
---

# The recipient addressability contract

## The concern

"Send it to the candidate" assumes a candidate address exists. Often it does not:
a sourced profile with no contact detail, an anonymised or redacted record, a
person whose data was erased on request, an import that dropped a column, a
fixture. What the code does in that case is decided in a hurry, usually inline,
and the options a hurried author reaches for are all bad — the recruiter's
address, the workspace owner's, a no-reply mailbox, an empty string, or a
stringified null that leaves the literal word *undefined* in a mail log.

Two harms follow. A candidate-facing message misroutes to a staff member, who
reads a letter written to somebody else and reasonably assumes the candidate got
it too. Or the send fails in a way nobody can attribute, because the failure
record names an address that never belonged to anyone.

Replace the improvisation with a **contract**: an ordered, exhaustive, single-
implementation resolution whose last tier is an explicit unaddressable marker.

## The tiers

Resolve in order; the first tier that yields a value wins.

1. **The candidate's own recorded contact address** for this candidature. The
   only tier that may receive candidate-facing content.
2. **A verified alternate address on the durable person identity** — the same
   human's address recorded on an earlier candidature, where your consent and
   data model permits its reuse. Skip this tier entirely if it does not.
3. **An explicitly configured operational recipient** for messages that are *not*
   candidate-facing (internal notifications, digests). Never reached by a message
   addressed to a candidate.
4. **The unaddressable literal.** A single, deliberately impossible value —
   chosen so it can never be mistaken for a real address, is greppable in a log,
   and is recognised by the dispatcher as an instruction to dead-letter rather
   than attempt.

Tier four is not an error. It is a legitimate outcome of a correctly functioning
system meeting a record that has no address, and it must be *reachable, named,
and countable*. What is forbidden is arriving there silently
([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

## Procedure

1. **One resolver, no inline fallbacks.** Every dispatch path calls it. Ban the
   `??` of an address literal at call sites in review; that operator is where
   this contract dies.
2. **Return the tier alongside the address.** The record stores which tier
   answered, so a later reader knows whether a message went to the person or to a
   substitute — that is the actor question applied to routing
   ([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)).
3. **Make the unaddressable literal fail loudly at the boundary.** The dispatcher
   recognises it before any transport call, writes a dead-letter record carrying
   the intended recipient identity and the reason, and never attempts a send.
   Traceable non-delivery, not a silent drop.
4. **Preserve intent on the dead letter.** The record names *who this was for*
   (the candidate identity, the stage, the template) even though no address
   existed. Otherwise the escalation queue is a list of failures with no way back
   to a person.
5. **Validate shape at the boundary too.** An address that is syntactically
   impossible is unaddressable, resolved at tier four, not handed to a relay to
   discover.

## Decision rules

- **When the message is candidate-facing and tier one is empty, go straight to
  tier four.** Never substitute a staff address for a candidate address. The
  content is written to the person; routing it elsewhere discloses a hiring
  outcome to someone who was not its subject.
- **When an adverse action is involved and addressability is uncertain, do not
  send and do not close the loop.** Hold the candidate in a state that a human
  must resolve; the uncertain case resolves toward the person
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When a record was anonymised or erased on request, unaddressable is the
  correct and final answer.** Do not attempt reconstruction from a related
  record; the erasure was the point.
- **When tier two would reuse an address from another candidature, check consent
  at the person identity first,** not at the current record — a fresh record
  carries no history of a person's earlier objection.
- **When a bulk action encounters unaddressable records, report them as a
  distinct bucket in the preview** the approver signs, never folded into a
  success count.
- **When no transport is configured at all, do not warn about addressability.**
  With nothing delivering anything, a missing address is not this message's
  problem, and flagging it blames the record for a condition that belongs to the
  whole channel. A warning is a claim too, and an unnecessary one is the same
  defect pointed the other way.
- **When the tier is not known — a legacy record, an unprojected field — stay
  silent.** Unknown is not unaddressable and not deliverable; it renders as
  neither. One predicate, called by every surface, decides when the warning
  appears, or two screens will show one candidate two different answers.

## When not to use this

- **Internal, staff-only messages** have their own routing rules and legitimately
  default to an operational recipient; do not force them through the candidate
  contract.
- **Channels where the address is the identity** (an in-product inbox keyed by
  account) need no resolution — but they need the honesty half of the rule: a
  candidate with no account has no such channel, and must not be recorded as
  contacted through it.
- **Do not extend the tier list to buy delivery rates.** Every additional tier is
  another way for a message about a person to reach somebody else.
