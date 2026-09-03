---
layer: technique
type: technique
subject: correlated-exchange-over-broadcast
technique: terminal-status-set
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [deciding when a correlated wait may return, a status string arrives in unexpected spelling, a long-running goal needs an end condition]
---

# The terminal status set

A correlated wait needs an answer to one question that the transport cannot
answer for it: **is this exchange over?** A request/reply exchange gets that
almost for free — the reply is the end. A goal that emits feedback for two
minutes does not: feedback and result arrive on the same edge, carry the same
identifier, and are distinguished only by a status value. That value is the
end condition of the entire pattern, and everything about how it is defined,
matched and mismatched is this technique.

## The set is closed, small, and enumerated

A goal ends in exactly one of three states: **succeeded**, **aborted**,
**canceled**. Succeeded is the work completing. Aborted is the executor
deciding it cannot finish — a fault, an impossible target, a precondition
that stopped holding. Canceled is a *requester's* decision arriving mid-flight
and being honored. Everything else a goal emits — accepted, executing,
feedback at 20 Hz — is non-terminal, and a wait that sees it keeps waiting.

The three are not interchangeable and collapsing them costs behavior, not
just reporting. Aborted is the executor's failure and usually retryable
against the same peer; canceled is the caller's own intent coming back and
must never be retried, because retrying a cancellation is the caller
overriding itself; succeeded is the only one that may release the resources
the exchange was holding. A caller that receives one classification and acts
on another has lost the verdict at the boundary that mattered
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

Keep the set closed. Every proposal to add a fourth state is really a
proposal to move information that belongs in the result payload into the
control vocabulary, where every participant in every binding must now
understand it.

## Matching is exact, and case is part of the contract

The status crosses the wire as a string, and string comparison is where this
technique is quietly lost. **Matching is case-sensitive and exact**, and the
spelling is fixed by the vocabulary authority rather than by whichever
endpoint was written first
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Case-insensitive matching sounds generous and is not: it hides the exact
defect it papers over — a peer emitting a spelling nobody agreed on — and it
lets two peers with two spellings coexist until a third layer, written
strictly, disagrees with both.

The place this bites is a bridge. A translator between this bus and any other
ecosystem maps a foreign status enumeration onto these three strings, and it
is the mapping table, not the emitting node, that decides what the local
vocabulary sees. Put the mapping in one place, next to the vocabulary, and
test it in both directions.

## An unrecognized status is the failure value

The rule that separates a correct implementation from one that hangs in
production: **a status value outside the set is treated as the failure value
— aborted — never as success and never as "not yet terminal."**

The reasoning is asymmetric risk
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). If an
unknown value is read as non-terminal, a caller that has been told the work is
over waits until its deadline, holding whatever the exchange held, and then
reports a timeout — a diagnosis that points at latency when the actual defect
is a spelling. If it is read as success, the caller proceeds on work that
failed, which is the worse of the two by a wide margin. If it is read as
failure, the caller takes the recovery path it already has for aborted goals,
and the mismatch surfaces as an abort that nobody can explain — which is
loud, local, and fixable.

The rule pairs with an obligation on the emitting side: the executor sets a
status from the enumeration on every message it sends for that goal, including
feedback. A message with the goal identifier and no status is
indistinguishable from a message whose status the receiver failed to parse,
and the receiver has no way to tell "still running" from "malformed."

## The responder echoes; it does not re-mint

The terminal message must carry the requester's identifier, and the only
reliable way to guarantee that is a mechanical one: **the responder copies the
request's metadata onto its reply** and then sets its own fields on top,
rather than constructing fresh metadata and remembering to include the id. The
copy is the technique; the discipline of "remember to set the id" is what the
copy exists to replace, and it fails first on the error path, where a
hand-built failure reply is exactly the one nobody tested.

Echoing whole metadata has a second benefit that pays off later: unrelated
keys a requester attached — a trace identifier, a deadline hint, a tenant tag
— survive the round trip without the responder knowing what they are.

## Deadlines are not terminal statuses

A wait that ends on its own deadline has *not* observed a terminal status, and
the difference must reach the caller as a different outcome. The exchange is
still live from the executor's point of view; the goal may still succeed
afterward, feedback may still arrive, and a subsequent terminal message
carrying that identifier will be delivered to a caller that has stopped
listening. A timeout therefore obliges the caller to do one of two things:
issue a cancellation for the identifier it gave up on, or record the
identifier as abandoned so that its late reply is discarded deliberately
rather than matched against a fresh wait.

## When not to use this

An exchange with exactly one reply and no intermediate messages does not need
a status vocabulary — the arrival of the reply is terminal, and its payload
carries success or failure in the shape the domain already uses. Introducing
a three-state control vocabulary there adds a second failure channel beside
the one that already works. This technique starts earning its place when an
exchange emits more than one message under a single identifier, because that
is the first moment a receiver has to decide whether what it just got was the
end.
