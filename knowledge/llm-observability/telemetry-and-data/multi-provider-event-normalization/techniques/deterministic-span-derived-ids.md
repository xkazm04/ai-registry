---
layer: technique
type: technique
subject: multi-provider-event-normalization
technique: deterministic-span-derived-ids
status: forged
laws: [no-retroactive-restatement, server-owns-the-accounting-clock, never-present-absence-as-an-answer]
shared_with: []
use_when: [making ingestion idempotent against sender retries, choosing event identity for mapped telemetry spans, debugging double-counted spend, resolving a duplicate-id collision by reading the stored row back]
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

## The collision read-back has three answers, not two

Deterministic ids turn a duplicate-key collision into a question rather than
a failure: *is this the same event arriving twice, or a different event
wearing the same id?* The only way to answer it is to read the stored row
back and compare. That read is itself a store operation, and it can fail —
which makes the outcome three-valued, not two:

- **Same payload** → acknowledge as a duplicate. Nothing was double-counted.
- **Different payload** → a genuine conflict. The sender has an identity bug
  and must hear so.
- **The read failed** → *we do not know*, and that must be what the sender is
  told: a retryable internal error, logged, with the raw store detail kept
  off the wire.

Collapsing the third case into the second is the defect, and it is
attractive because the code is shorter: discard the read's error, treat an
absent row as "not the same", fall into the conflict arm. The result is a
verdict about a row nobody looked at. A conflict verdict is an instruction —
it tells a well-behaved client that this id is spoken for and a *new* one is
needed for its event. So a transient store failure, on the path whose entire
purpose is making retries safe, becomes the trigger for minting a second id
for an event that is already recorded: the exact double-count deterministic
identity exists to prevent, produced by the mechanism that prevents it. The
asymmetry is decisive — an unnecessary retry costs one request, and a
wrongly-issued conflict costs a permanent duplicate row and the spend
attached to it. Where the answer is unknown, the retryable error is the only
honest reply.

Two follow-ons worth designing for:

- **The replay decision is pipeline logic, not per-endpoint logic.** It gets
  re-implemented wherever a second ingest shape appears — a batch variant
  beside a single-event one is enough — and the two copies drift on exactly
  this branch, because the error is invisible until a store is unhealthy.
  One handler propagating the read failure while its sibling reports a
  conflict is a difference in *retry semantics*, which is the one property
  the idempotency contract is made of. Share the function; see
  [two-doors-one-pipeline](./two-doors-one-pipeline.md).
- **Absent is not the same as different.** If the uniqueness constraint is
  broader than the read's visibility scope — a globally unique id read back
  under one tenant's scope, say — a collision with another tenant's row
  returns *no row* rather than a differing one. Decide that case
  deliberately and state it, rather than letting it fall through whatever
  arm catches everything else.

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
