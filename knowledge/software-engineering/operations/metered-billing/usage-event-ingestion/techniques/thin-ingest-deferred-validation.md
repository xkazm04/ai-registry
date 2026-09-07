---
layer: technique
type: technique
subject: usage-event-ingestion
technique: thin-ingest-deferred-validation
status: forged
laws: [one-validation-door, record-precedes-effect, failure-not-empty-success]
shared_with: []
use_when: [designing the admission endpoint for high-volume usage, deciding which checks block a caller, building the pass that inspects admitted events]
stage: multi-service
---

# Thin ingest, deferred validation

One admission contract, executed in **two stages against one store**: a thin
synchronous stage that refuses only what cannot be stored or routed, and a
deferred stage that re-reads admitted events in bulk against the current
configuration and produces addressable defects. This is not two validation
doors — the writers still pass through exactly one, per
[one validation door per store](../../../../_laws.md#one-validation-door). It is
one door with a stage that runs after the caller has been answered.

## Why the door cannot be thorough

The caller is a customer's production service emitting from a request path.
Three properties of that caller decide the design:

- **Its latency budget is not yours to spend.** An emitter that blocks on you
  degrades its own product; an emitter that does not block buffers in memory and
  loses events when it restarts. Either way your slow response costs somebody
  else money.
- **Its volume is the highest of any path you own.** Ingest receives more
  requests than every other endpoint combined, and its cost per request
  multiplies by a number nobody controls.
- **Thorough validation costs a graph walk.** Resolving a code to a metric,
  checking a property against an aggregation type, and testing filter dimensions
  all read the customer's metric and filter configuration. **The door's latency
  would then be a function of how elaborate the customer's account is** — and
  the account that grows most elaborate is the one paying you most.

There is a correctness argument on top of the cost argument, and it is the one
that settles it. Those checks answer questions whose truth **changes
retroactively**. A metric defined next week gives meaning to a property refused
today; a filter edited next week stops matching events admitted today. A
synchronous verdict on a retroactively mutable question is not conservative, it
is wrong at a rate proportional to how often customers edit their configuration
— and every instance of it is refused revenue.

## What the synchronous stage refuses

Keep the refusal set small, closed, and justified one reason at a time. A check
earns its place at the door only if it satisfies one of two tests.

**Test one — unroutable.** Without this field the event can never be attached to
anything and no later pass can repair it:

- No identifier for the subject the usage belongs to.
- No code naming what kind of usage this is.
- No occurrence timestamp, or one that cannot be parsed into an instant.
- No transmission identifier, so the event cannot be deduplicated and a retry
  would double-bill.
- A subject that has never had a subscription — the emitter is reporting usage
  for something that cannot be billed, which is a bug in their integration and
  they should learn about it on their first test run.

**Test two — would corrupt the machinery.** Admitting this value would make a
later bulk computation fail or produce nonsense for events other than this one:

- A value in a position the aggregation must treat as a number that cannot be
  coerced to one. This one check is worth its cost precisely because its blast
  radius is not local: a single unparseable value inside a set-based summation
  can fail or poison the whole customer's period, not just its own row.

Everything else is admitted. A code with no matching metric, a missing property,
a filter dimension nobody defined — all stored, all examined later. The
justification is uniform: those are facts about the *configuration*, and
configuration is the thing that moves.

## The door records before it acknowledges

The synchronous stage persists the event durably and only then answers the
caller, per
[the record preceding the effect](../../../../_laws.md#record-precedes-effect).
The inversion — acknowledge, then enqueue for a writer — buys a few milliseconds
and creates a window in which the emitter believes the event is safe and nothing
holds it. That window is not theoretical: it opens exactly during the restarts
and deploys that a busy ingest path experiences most.

If throughput forces a durable queue between the door and the store of record,
the queue *is* the record, and the acknowledgement follows the queue's own
durable append rather than the enqueue call returning. The rule is not "write to
the final table synchronously"; it is "do not tell the emitter yes until
something durable has said yes to you."

## What the deferred stage owes

This is the half that gets skipped, and skipping it converts a design into a
leak. The deferred stage has four obligations.

**Run on a fixed cadence, over a bounded and already-closed window.** Sweep
recently admitted events on a schedule — hourly is a defensible default because
it is short against a monthly billing period and long enough that a customer
fixing a configuration mistake within the hour never sees a defect at all. Two
properties of the window matter more than its length. It is **bounded**, so the
pass cannot grow with the corpus. And it is **closed** — the previous whole
interval, not a trailing one ending at the current instant — so the pass is
deterministic, re-runnable after a failure, and cannot half-examine an interval
that is still filling. A schedule that fires a few minutes after the boundary,
reading the interval that just ended, gets both for free.

**Read events in bulk against current configuration, not one at a time.** The
whole reason this stage is cheap is that it inverts the cost the door refused to
pay: instead of one graph walk per event, one set-based pass joins a period's
events against the current metric and filter definitions. A deferred stage
implemented as a per-event loop has paid the door's cost late without gaining
anything.

**Emit a per-event defect record with a reason code — not a log line.** The
output is data, keyed by event, carrying which check failed. It is queryable, it
is countable per customer, and it drives a surface the customer can look at.
Deferred validation whose findings live only in a log stream has replaced a loud
synchronous refusal with a silent one.

**Distinguish "no defects" from "did not run."** A pass that is disabled,
crashed, timed out, or found its window empty must report differently from a
pass that examined a million events and found them all sound, per
[failure spelled differently from empty success](../../../../_laws.md#failure-not-empty-success).
This matters more here than in most places because the healthy state genuinely
is zero findings, so a broken pass and a healthy pass produce the same number.
Publish the count of events *examined* alongside the count of defects; a zero in
the first column is an alert, not a clean bill.

## Decision rules

- **When a check requires reading customer configuration, it is deferred** —
  unless omitting it would corrupt a computation over other customers' or other
  periods' events, in which case it is synchronous and the reason is written next
  to it.
- **When a check requires only the payload itself, it is synchronous** if its
  absence makes the event unroutable, and deferred otherwise.
- **When the deferred stage can be turned off, its off state is loud.** An
  operator disabling it during an incident is legitimate; a fleet that quietly
  converges on disabled because that is the default is a fleet with no validation
  at all.
- **When a defect surface exists, it has an owner and a retention.** Defect
  records that accumulate forever become the customer's second, unloved inbox.

## When not to use this

- **Low-volume ingest with a trusted internal caller.** If usage is posted by
  your own scheduled job at a hundred events an hour, validate thoroughly at the
  door and return a specific error; the split buys nothing and costs a whole
  background stage.
- **Interactive submission by a human.** A person filling a form must be told
  immediately and specifically what is wrong; deferring is hostile.
- **When the deferred stage will not actually be built.** Half of this technique
  is a leak. If the roadmap has room for the thin door but not for the pass and
  the surface it feeds, ship the thorough door and revisit when the volume
  justifies the second half.
