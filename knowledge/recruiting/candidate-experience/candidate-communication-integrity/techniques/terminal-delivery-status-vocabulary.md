---
layer: technique
type: technique
subject: candidate-communication-integrity
technique: terminal-delivery-status-vocabulary
status: forged
laws: [say-only-what-the-record-holds, meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [a surface renders a delivery state to a human, unifying send status across screens, choosing the words a status enum may use]
---

# Terminal delivery status vocabulary

## The concern

A delivery status is not a label. It is an **assertion boundary**: the point at
which your system commits, in public, to a claim about a human interaction. The
moment two parts of a product use the same word for different underlying facts,
the product loses the ability to state what happened — and the loss always
resolves optimistically, because the optimistic reading is the one that looks
finished.

The vocabulary must therefore be closed, owned in exactly one place, and
constructed so that **no member of it can be reached by an event internal to your
own process alone.**

## The vocabulary

Three states carry all the weight. Resist the fourth, fifth and sixth until an
external system genuinely reports them.

| State | Licensed by | What a human may be told |
| --- | --- | --- |
| **sent** | an external relay accepted custody of this exact message | "we emailed you", "sent on the 14th" |
| **queued** | the message was recorded, and is not out of your process | "recorded, not delivered" — a promise of nothing |
| **failed** | an external system refused it, or the attempt terminated | "we could not deliver this" |

Two refinements earn their place once the base is solid:

- **bounced** as a distinguishable failure whose cause is the recipient rather
  than the transport — it drives a different human action (fix the address) than
  a transport failure (wait, or escalate).
- **suppressed** or **refused** for a message deliberately not sent by a gate.
  This is not a failure and must not be counted as one, but it is emphatically
  not a *sent*.

Anything else — *processing*, *pending*, *submitted*, *dispatched*, *complete* —
is a synonym for queued wearing better clothes, and it exists to let a screen
imply delivery. Delete it.

## Is your queued terminal or pending?

Ask this before writing any copy for it, because the two need opposite words and
opposite alerts.

- **Terminal queued** — no transport is configured, so the row is recorded and
  nothing will ever move it. There is no worker, no dequeue, no retry. Offline,
  this is the *success* outcome of the local path and simultaneously a guaranteed
  non-delivery. Copy: "prepared — delivery is not configured", never "sending".
- **Pending queued** — a transport exists and a worker will attempt the message.
  Copy may say "not yet delivered". And the invariant to alert on: a pending row
  that persists while the transport is healthy is a **bug**, not a send in
  flight. Nothing should be able to sit there.

The two must be distinguishable from the state itself plus the channel's
capability bit, never from a screen's guess.

## The blind case

Some surfaces have no per-message record to consult — an aggregate, a
just-triggered action, a summary line. They still speak in the past tense, so
they still need a licensed claim. Resolve it from the **capability bit**: if a
transport is configured and the send path records success and failure
explicitly, the un-recorded case is the one that went fine, and the claim is
*sent*; if no transport is configured, the claim is *queued*, because by contract
nothing left. One function takes the capability bit and an optional record status
and returns a claim; every surface calls it, including the blind ones. A surface
that has no record and no capability bit is not entitled to a past tense at all.

## Procedure

1. **Name the external acceptance.** Write down, for your transport, the exact
   event that constitutes something outside your process taking custody: a relay
   returning success with an identifier, a provider acknowledging receipt of the
   payload. That event, and only that event, promotes a record to *sent*.
2. **Make the enum unavoidable.** Put the vocabulary in one module every producer
   and every consumer imports. Producers may not write a string; consumers may
   not switch on one. If a status can be constructed by concatenation anywhere,
   the vocabulary is advisory and will drift within two quarters.
3. **Audit every surface that speaks in the past tense.** Grep the product for
   the words *sent*, *emailed*, *notified*, *informed*, *contacted*, *delivered*
   and their translations. For each occurrence, name the state that licenses it.
   Expect to find several surfaces that translate "a row exists" into "we have
   emailed you"; count them, fix them all in one change, and record the count —
   it is the honest measure of how far the drift had gone.
4. **Give queued its own copy, everywhere.** The hard part is not the enum, it is
   writing copy for the honest state that does not read like an error. "Recorded
   — we will confirm once it leaves" is a sentence a product can ship.
5. **Default unknown to the pessimistic member.** A record with no resolvable
   state renders as queued or as unknown, never as sent — the unmeasured state is
   a type, not a flattering constant
   ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

## Decision rules

- **When a write to your own store succeeds, the status is queued** — always,
  with no exception for "the relay is basically always up". Local success is
  local.
- **When you cannot map a transport result onto the vocabulary, treat it as
  failed, not as sent.** An unrecognised outcome resolving to the adverse-for-you
  reading is the only version that keeps the candidate safe.
- **When a count is displayed, display the pair.** Never "142 sent" alone; "142
  sent, 6 could not be delivered" or the number is propaganda. A single figure
  with no denominator is a claim without its sample
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
- **When a stakeholder asks for a friendlier word for queued**, the answer is to
  make delivery faster, not to rename the state. The word is the only thing
  standing between the record and a lie.
- **When a status must cross a language boundary**, persist the enum member and
  compose the sentence at render time. Prose frozen at production time is
  unreadable to the next reader
  ([meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)).

## When not to use this

- **Internal-only notifications** to staff members inside your own product, where
  the delivery surface is the product itself and there is no external transport,
  need no vocabulary — there is no claim to a third party being made.
- **Where a transport genuinely reports richer terminal states** (read receipts,
  per-recipient device acknowledgements), do not flatten them into three; extend
  the vocabulary deliberately, keeping the rule that each member names an
  external event.
- **Do not use this vocabulary to model the candidate's engagement.** Opens and
  clicks are a different subject with different consent implications, and folding
  them into a delivery enum tempts a product to treat "not opened" as "not sent",
  which is a second lie in the other direction.
