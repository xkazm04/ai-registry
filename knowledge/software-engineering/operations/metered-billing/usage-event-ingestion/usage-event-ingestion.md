---
layer: golden-path
type: golden-path
subject: usage-event-ingestion
status: forged
use_when: [building the endpoint a customer's service posts usage to, deciding what ingest validates now versus later, debugging duplicate or missing billable events, adding a second higher-throughput ingest lane]
techniques:
  - thin-ingest-deferred-validation
  - dedupe-key-survives-soft-delete
  - late-event-subscription-resolution
  - ingestion-contract-parity
---

# Usage event ingestion

This subject owns the **front door of a metered billing system**: the endpoint a
customer's production service posts usage to, and the admission decision made
about each thing it posts. Three questions belong here and nothing else does.
Is this event well-formed enough to be stored and routed later? Have we seen it
before? Which subscription does it belong to? Fold those answers into a billable
quantity and you have left this subject; attach a price to that quantity and you
left it two subjects ago.

What makes admission hard is not the shape of the payload. It is the identity of
the caller. **The client is somebody else's production service**, usually
emitting from a request path they cannot afford to block, usually fire-and-forget
with a small in-process buffer, and usually operated by a team that will discover
your rejection semantics during an incident rather than during integration. Every
design decision in this subject follows from that: the door must be fast, its
latency must not depend on how complicated the customer's account is, its
refusals must be terminal or retriable but never ambiguous, and anything it
cannot decide cheaply must be decided later *and visibly* rather than guessed at
now.

The other constant is that **every admitted event may become money.** Not all of
them will — many will be filtered out by a metric definition that does not match,
and that is normal — but the ones that do become line items on an invoice a human
will read, dispute, and pay. This makes ingest asymmetric in a way most write
paths are not. A dropped event is under-billing that nobody detects, because the
absence of revenue looks exactly like a quiet month. A double-counted event is
over-billing that the customer detects, in public, after you have already
collected. Neither error is acceptable, but only one of them has a reporter.

## The event, and the two clocks it carries

A usage event is a **claim about something that already happened**, not a command
to do something. It carries five things that matter to admission: an identifier
the emitter chose for this transmission, an identifier for the subject the usage
belongs to, a code naming what kind of usage it is, a timestamp for when the
usage occurred, and an open bag of properties the aggregation will later read.

Two of those repay attention immediately.

**The subject identifier must be one the emitter already has.** If the door
demands an identifier that your system minted, every emitter has to perform a
lookup on their hot path before they can report usage, and they will cache that
lookup badly. Accept the customer's own identifier for their own customer, and
carry the mapping on your side. This is not a convenience; it is what keeps the
integration a single fire-and-forget call.

**There are always two timestamps, and confusing them is a billing defect.**
When the usage occurred is the emitter's clock and it is the one that decides
which billing period the event lands in. When the event arrived is your clock and
it is the one that measures how far behind the emitter is running. Substituting
arrival for occurrence is the single most common way a metered system silently
moves revenue between periods, and it is invisible until a customer reconciles
their own logs against your invoice. Store both, always. Emitter clocks skew and
occasionally lie; clamping an implausible occurrence time is legitimate, but
clamping is a **policy that moves money**, so it is declared, bounded, recorded
on the event, and countable — never a silent `min()` in a parser.

## Validate at the door only what the door can answer cheaply

The tempting design is one thorough validation: resolve the event's code to a
metric definition, confirm the property the aggregation needs is present and
numeric, check the filter dimensions, and refuse anything that fails. It is
tempting because it gives the emitter an immediate, specific error, which is a
genuinely good property.

It is still wrong, for two independent reasons. The first is cost: those checks
read the customer's entire metric and filter graph, so **the door's latency
becomes proportional to how elaborate the customer's account is**, and the
largest, most valuable account gets the slowest door. The second is deeper: those
answers are *not stable*. A customer can define a new metric tomorrow that gives
meaning to a property you rejected today, or edit a filter so that events you
admitted no longer match. A synchronous verdict on a retroactively mutable
question is not merely expensive, it is frequently wrong, and it is wrong in the
direction of refusing revenue.

So the split: the door refuses only what makes the event **unroutable** — no
identifier for the subject, no code, no usable occurrence timestamp, no
deduplication key — or what would **corrupt the machinery that later reads it**,
which in practice means a value in a position the aggregation must treat as a
number that cannot be treated as one. Everything else is admitted, stored, and
examined by a later pass that reads the same events in bulk against the current
metric definitions.

The part teams get wrong is not the split; it is the second half. **Deferred
validation is only honest if its findings are addressable.** A background pass
that logs "event 41f2 has no matching metric" into a stream nobody reads has
converted a loud refusal into a silent revenue leak, which is strictly worse than
the thorough door it replaced. The deferred pass owes a per-event defect record
with a reason code, a surface the customer can see it on, and a distinction
between "found no defects" and "could not run" — a run that reports the second as
the first is
[failure spelled the same as empty success](../../../_laws.md#failure-not-empty-success).
The staging, the refusal set, and the obligations of the deferred pass are the
[thin-ingest-deferred-validation](./techniques/thin-ingest-deferred-validation.md)
technique.

## De-duplication is the emitter's promise, enforced by your store

The delivery contract between an external emitter and this door is at-least-once
and cannot be anything else. An emitter whose request timed out **does not know
whether the event landed**, and its only correct move is to send it again. If the
door is not idempotent, every network hiccup in the customer's infrastructure
becomes an over-charge on your invoice.

Three commitments make it idempotent, and each of them rules out a plausible
alternative.

**The key is chosen by the emitter, not derived from content.** Two genuinely
distinct API calls in the same millisecond with identical properties are two
billable facts; only the emitter knows that. A content hash cannot tell them
apart and will silently under-bill exactly the customers with the highest
throughput. The emitter supplies a transmission identifier it can reproduce on
retry, which is
[identity minted once at creation and carried](../../../_laws.md#identity-survives-reuse).

**Uniqueness is enforced by the store, not by application code.** A read-then-
write check races under exactly the conditions it exists for — a retry storm,
where the duplicate and the original are in flight together. The constraint lives
in the storage layer, on the tuple of tenant, subject and transmission
identifier, and the insert either succeeds or is refused by the store.

**A duplicate is a terminal outcome, never a server error.** Answering a repeat
with a failure the emitter reads as retriable produces an infinite retry against
a door that will never accept it. Whether the answer is a success or an explicit
conflict is a taste question; that it is terminal is not. What is *not* a taste
question is which submission survives: a write-time constraint keeps the first
and refuses the second, a read-time collapse keeps the last and tells nobody,
and those are two different products wearing one contract. State the winner
rule.

The sharp edge, and the reason this has its own technique, is what happens when
an event is **deleted**. The intuitive rule — a deleted event frees its key — is
wrong, and it is wrong in a way that only shows up in production. Deleting is a
correction of *your* record; it does not travel backward and un-happen the
emitter's transaction, and the emitter has no way to learn that the key is free
again. Free the key and a routine retry, days later, re-inserts an event you
deliberately removed and re-bills it, with no signal anywhere that it happened.
The key therefore survives deletion, and a legitimate re-submission needs a new
identifier or an explicit administrative purge — a real cost, deliberately
chosen, and one that must be written at the boundary because it surprises every
integrator exactly once. This is
[deletion not being repair](../../../_laws.md#deletion-is-not-repair) applied to
an identifier, and it is the
[dedupe-key-survives-soft-delete](./techniques/dedupe-key-survives-soft-delete.md)
technique.

## The late event is the interesting case, and its answer depends on the metric

Resolution asks which subscription an event belongs to: find the subject, find the
subscription whose window contains the occurrence timestamp. The happy path is
uninteresting. Two failures are not.

If the subject has **no subscription at all**, the event can never become money
and the emitter has a bug. Refuse it at the door and say why, loudly enough that
their integration test catches it.

If the subject has subscriptions but **none of them covers the occurrence
timestamp**, you are holding a late or backdated event, and the naive answer —
refuse it, the period is closed — is right for some metrics and quietly
catastrophic for others. The distinction is what the metric measures:

- A metric that **counts occurrences** (requests served, messages sent, bytes
  transferred) treats each event as an increment attached to the period it
  happened in. If that period has no subscription, one increment is lost. The
  loss is bounded, it is one event's worth of money, and attaching it to the
  current period would be billing this month for last month's work.
- A metric that **measures a level held over time** (seats occupied, storage
  provisioned, licences active) treats each event as a *state transition* — it
  says the level is now N, and the level persists until something says otherwise.
  Dropping such an event does not lose one unit. It leaves the level wrong from
  that moment forward, across every subsequent period, and the error compounds
  quietly in the customer's favour or yours depending on the direction of the
  transition.

So the rule: **for a level metric, an event that matches no subscription window
attaches to the subject's currently active subscription** rather than being
refused, because the state it describes has outlived the boundary it fell
through. For an occurrence metric it does not. Two further obligations keep this
from becoming a laundering point: the fallback attachment is **recorded as a
fallback** on the event, so that no downstream reader can mistake a guess for a
match — otherwise the resolution is
[unknown rendered as a definite value](../../../_laws.md#unknown-is-not-a-value) —
and the resolution itself is **written onto the event at admission** rather than
recomputed at invoice time, so that a later edit to a subscription window cannot
silently move an already-invoiced event onto a different bill. Overlapping
windows, the fallback rule, and re-resolution as an explicit auditable operation
are the
[late-event-subscription-resolution](./techniques/late-event-subscription-resolution.md)
technique.

## When the door exists twice, the contract is the thing that must be single

Metered systems grow a second ingest lane. The first is the general path that
also serves reads, corrections and the rest of the product; the second is a
narrow high-throughput lane, usually on a different runtime, fed by a durable
log, writing into a store built for scanning rather than for transactions. The
second lane exists for a good reason and is usually well built.

What is almost never well built is the relationship between them. Both lanes
implement the same admission contract — the same dedupe rule, the same
resolution rule, the same refusal set — over the same customer configuration, and
they implement it **twice, in two languages, maintained by people who read
different code**. The contract is now a vocabulary with two authoritative
definitions, which is
[the failure that law forbids](../../../_laws.md#one-authority-per-vocabulary),
and its drift has an unusually cruel signature: it appears only for customers
routed to the newer lane, only for inputs neither team thought to test, and it is
reported by an invoice.

Three commitments, none optional once the second lane merges. **One lane is
named authoritative** — the one the invoice is computed from — and the other is a
variant that must be shown equivalent, not a peer with its own opinion.
**Equivalence is proven differentially, not by unit tests**: each lane's own tests
encode that lane's understanding of the contract, so two self-consistent and
mutually contradictory implementations both pass. Only feeding one input to both
and diffing the outcomes observes the thing in question, which is what
[a gate seeing its target](../../../_laws.md#gate-sees-target) requires. And **the
routing switch is itself a billing-critical surface**: moving a customer between
lanes mid-period means one invoice was admitted under two contracts, so the flip
is a period boundary event or it is preceded by a differential run over that
customer's actual configuration. Building and reading that harness is the
[ingestion-contract-parity](./techniques/ingestion-contract-parity.md) technique.

## What this subject refuses

- **Arrival time used as occurrence time.** They are different facts and they
  belong to different periods.
- **A synchronous verdict on a question whose answer changes retroactively.** If
  editing a metric tomorrow would change today's verdict, the verdict is not the
  door's to give.
- **Deferred validation whose findings go only to a log.** An invisible defect is
  a revenue leak wearing a validation badge.
- **De-duplication by content hash.** It cannot distinguish two identical facts
  from one fact sent twice, and only the emitter can.
- **A duplicate answered with a retriable error.** That is a design for an
  infinite loop in someone else's production service.
- **A freed key on delete.** The emitter never learns the key is free, and its
  next retry re-bills silently.
- **A refused backdated level event.** The level it reports outlives the window
  it missed; refusing it corrupts every period after.
- **A fallback attachment that looks like a match.** If a reader cannot tell
  which resolution path produced the link, the guess has been laundered into a
  fact.
- **Anything at the door that calls another service.** Ingest availability must
  not be a function of anything but the door and its store.
- **A second lane trusted because it passes its own tests.** Two implementations
  of one contract are equivalent when something has run both, or not at all.

## The techniques

- [thin-ingest-deferred-validation](./techniques/thin-ingest-deferred-validation.md)
  — the two-stage admission split: what the door must refuse, what the later
  pass owes, and why the door's cost must not scale with the customer's
  configuration.
- [dedupe-key-survives-soft-delete](./techniques/dedupe-key-survives-soft-delete.md)
  — the emitter-chosen key, store-enforced uniqueness, terminal duplicate
  responses, and why deletion does not release the key.
- [late-event-subscription-resolution](./techniques/late-event-subscription-resolution.md)
  — resolving a subject to a subscription, the occurrence-versus-level rule for
  window misses, and resolution as recorded state rather than a recomputation.
- [ingestion-contract-parity](./techniques/ingestion-contract-parity.md) — what a
  team owes when one admission contract has two implementations on two runtimes:
  a named authority, a fixture corpus, and a differential harness.
