---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: deterministic-span-derived-ids
status: forged
laws: [no-retroactive-restatement, server-owns-the-accounting-clock]
shared_with: []
use_when: [making ingestion idempotent against sender retries, choosing event identity for mapped telemetry spans, debugging double-counted spend]
---

# Deterministic span-derived ids

Derive the identity of a mapped event **deterministically from the span's
own identity** — trace id joined with span id — instead of minting a random
id at mapping time. Identity that is a pure function of the input makes
redelivery idempotent: the same span, exported twice, maps to the same
event id and lands in the existing duplicate-acknowledgement path instead
of becoming a second row of spend.

## Why senders you don't control make this mandatory

Telemetry exporters retry by design: a timeout mid-batch re-exports the
whole batch; a sender restart replays a queue; a network partition heals
and delivers twice. None of this is misbehavior — at-least-once delivery is
the exporter contract. Under at-least-once delivery, a random id at the
mapper converts every retry into phantom cost: duplicated tokens,
duplicated spend, duplicated cap pressure, and — worst — a usage limit that
admits the first copy and *rejects the retry of something already
recorded*, teaching the sender's backoff loop exactly the wrong lesson.

Dedup-by-content (hashing the payload) is the tempting alternative and the
wrong one: two genuinely distinct calls can carry identical payloads
(same prompt, same usage), and one retried span can arrive with a
re-serialized payload that hashes differently. The span's identity fields
are the only thing the sender *asserts* is identity; use them as such.

## Procedure

1. **Compose the id as trace-id + separator + span-id.** Both come straight
   from the span. The composite is unique per span (span ids are unique
   within a trace) and stable across re-export.
2. **Canonicalize before composing.** Trim, drop empties, and normalize
   case through the *one shared canonicalization rule that every ingestion
   door uses* — and treat the standard's invalid sentinel, the all-zeroes
   trace or span id, as absent rather than as identity. Misconfigured
   propagators emit the zero id in volume; composing on it would collapse
   unrelated senders' spans onto one event id and silently deduplicate real
   spend — the inverse of the double-count this technique exists to prevent. Two doors normalizing differently produce case-variant ids
   for the same trace — the same defect idempotence was meant to prevent,
   one layer up: a mixed-instrumentation trace splits into halves that
   never join.
3. **Degrade explicitly, not randomly.** If the exporter omitted the trace
   id but supplied a span id, the span id alone still gives determinism.
   Only when *both* are absent — which no conforming instrumentation
   produces — fall back to a fresh random id, accepting that such orphan
   spans cannot be deduplicated because they carry no identity to
   deduplicate on.
4. **Let the duplicate path acknowledge, not error.** A replayed id must
   read as success to the sender — the goal is convergence, and an error
   response to a retry provokes another retry.

## The accounting consequence

Deterministic identity is what makes ingest-time accounting *final*. Spend
is stamped once, at first receipt, on the server's clock; a re-export
neither restates it nor doubles it. Without this property, every
sender-side incident (and exporter retries spike exactly during incidents)
retroactively inflates windows that budgets and caps already evaluated —
accounting that changes after the fact is not accounting.

## Decision rules

- **When the native (non-span) door lets clients supply ids**, apply the
  same posture: honor a client-supplied id as the idempotency key,
  canonicalized by the same shared rule.
- **When two spans legitimately share an id** (a sender bug emitting
  duplicate span ids), the deterministic rule keeps the first and
  acknowledges the second — surface the collision rate as a sender-quality
  metric rather than trying to out-guess broken instrumentation.
- **When id semantics must change** (a new composition scheme), old and new
  ids will not collide but also will not dedup across the boundary; plan
  the change for a moment when in-flight retries have drained.

## When not to use it

Do not extend span-derived identity to records that *aggregate* spans
(roll-ups, windows, scores) — those have their own natural keys, and
borrowing a member span's id couples an aggregate's identity to an
arbitrary member. And where a sender population genuinely supplies no
stable identity (hand-posted events with no ids from ephemeral scripts),
deterministic derivation has nothing to stand on — there, rate caps and
short-window content heuristics are honest mitigations, and the residual
double-count risk should be documented rather than hidden behind a hash
that pretends to be identity.
