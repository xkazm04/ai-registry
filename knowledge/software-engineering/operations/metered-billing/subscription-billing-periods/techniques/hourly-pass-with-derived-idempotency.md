---
layer: technique
type: technique
subject: subscription-billing-periods
technique: hourly-pass-with-derived-idempotency
status: forged
laws: [identity-survives-reuse, verdict-survives-boundary]
shared_with: []
use_when: [designing the recurring pass that advances billing periods, duplicate invoices appeared for one period, the biller must survive an outage and catch up]
stage: team
---

# Recurring pass with derived idempotency

When boundaries land at every hour of the day across the subscriber base, the
pass that advances them runs at boundary granularity — hourly, not nightly — and
every pass must be independently safe. The key that makes it safe cannot be
handed to it, because the thing that woke it is a clock with no memory. It must
be **re-derived** from domain state that any pass would compute identically.

## Why the pass is a state query, not a timer

The tempting phrasing is "find everything whose boundary fell since I last ran".
That phrasing has a cursor in it, and the cursor is the defect: it must be
persisted, it must be advanced exactly once, and if the pass dies between doing
the work and advancing it — or advances it and then dies — the window is either
replayed or lost. A lost window in this domain is unbilled revenue that nobody
will ever notice, because the missing invoice does not exist to be looked at.

The correct phrasing is a question about *current state*:

> Which subscriptions have a boundary that is now in the past, and no period
> record opened for it?

A pass phrased that way has no memory to keep and no memory to lose. It is
correct when it runs twice in the same minute, when it runs an hour late, and
when it runs for the first time after a day of downtime — in the last case it
simply finds more rows and catches up, which is the behaviour you want and the
behaviour a cursor cannot give you without special-casing.

It also removes an entire class of clock-alignment bugs. The pass does not need
to fire *at* any boundary. It needs only to fire *more often than the shortest
gap you are willing to be late by*. Civil offsets are not all whole hours — some
are offset by a fraction — so an hourly pass will sometimes open a period up to
an hour after the boundary. That is a latency property, not a correctness one:
the boundary is still the boundary, the window still tiles, and the invoice
still covers the right range. A design that tried to fire exactly on each
boundary would need a per-subscriber timer set and reset on every zone edit, and
would be wrong the moment one was missed.

## The key must be derived, because nothing minted it

The general idempotency discipline says: mint the key with the intent, upstream,
before the first attempt, and present the same key on every retry. That
instruction presumes an intent. Here there is none. No caller decided to bill
this subscription; a recurring pass observed that a date had passed. There is no
"first attempt" to mint at, and a key generated per pass deduplicates nothing —
two passes generate two keys and produce two invoices.

So the key is a **pure function of domain state**:
`(subscription identity, period boundary)`. Any pass, on any host, at any time,
computes the same key for the same period, because both inputs are facts about
the subscription rather than facts about the pass. This is
[identity derived from what a thing is](../../../../_laws.md#identity-survives-reuse),
applied to a period: the period's name is its subscription and its boundary, not
the moment somebody got round to creating it.

The concrete forms this rules out are worth naming, because each has shipped:

- The tick time as part of the key. Two passes have two tick times.
- A generated identifier per work item. The second pass generates a second one.
- The boundary as an *instant*, when the instant is re-resolved through a zone
  that has since changed. Derive the key from the boundary **date** and the
  subscription, so a frame change cannot rename an existing period.

## Layered guards, and the collision is the real one

Four layers is a reasonable shape, and only the last is authoritative:

1. **The selection predicate.** The query that finds due subscriptions excludes
   those that already have a period record for the boundary. This is the cheap
   filter and it is racy by construction — two passes can select the same row
   microseconds apart.
2. **A re-check inside the unit of work**, after whatever exclusion the runtime
   offers has been acquired. This narrows the race to the width of the write.
3. **A uniqueness boundary in the store** on the derived key. This is the only
   layer that is actually atomic and the only one that can be relied on.
4. **A handler that reads a uniqueness violation on that key as "already
   done".** Without this, layer three converts the race into a crash.

The pre-checks are optimizations. They reduce wasted work and they reduce noise;
they do not make anything safe. A design that has layers one and two but not
three is a design that has never been run under contention.

## Losing the race is a success

This is the part teams get wrong even after building all four layers. When a
pass computes the key, attempts the write, and collides, **the outcome is
correct**: the period exists, exactly once, with the right boundary. Nothing
failed. The only thing that happened is that a different pass got there first.

Spell it that way. The collision is caught, classified as an already-opened
outcome, and returned as such — a
[typed verdict that survives to the caller](../../../../_laws.md#verdict-survives-boundary),
not a generic error re-thrown from the storage layer and not an exception that
reaches an alerting path. Two consequences follow, and both matter:

- **Error budgets and alerts stay meaningful.** A duplicate-invoice alarm that
  fires every hour under normal operation is an alarm the team will mute, and
  the day it means something they will mute it too.
- **The collision rate becomes an observable.** Counted as an outcome rather
  than swallowed as an exception, it is a health signal: a rate that suddenly
  climbs means passes are overlapping more than they should — a slow unit of
  work, a pass interval shorter than the pass duration, or an extra scheduler
  somebody stood up.

The inverse mistake is equally common: swallowing the collision silently, with
no outcome and no counter. Then the operator can see neither that it happened
nor that it stopped happening.

**Scope the success spelling to the callers that have no intent.** This is the
refinement that keeps the rule from becoming a blanket duplicate-suppressor.
The same billing path is entered by more than one kind of caller: the recurring
pass, which has no intent and races itself, and a human or an interface asking
for an invoice now, which does. For the first, a collision is an outcome. For
the second, a collision means the request was wrong — the period already exists
— and swallowing it returns a success for work that was never done. So the
handler branches on **why** the run was invoked, and only the clock-originated
reason collapses the violation into success. A path that collapses it for every
caller has stopped being idempotent and started being silent.

## Procedure

1. **Pick the pass interval from the boundary distribution**, not from
   convention. If boundaries land at any hour, the interval is at most an hour.
   Stagger the start minute against the other recurring passes that share the
   worker pool: several hourly sweeps all firing on the hour turn a cheap
   design into a thundering herd once an hour, and the billing pass is the one
   that must not be starved.
2. **Phrase the selection as a state query** over due-and-unopened, with an index
   that supports it, and no persisted cursor anywhere.
3. **Derive the key** from subscription identity and boundary date, in one
   function that both the selection and the write call.
4. **Put the uniqueness boundary in the store** on exactly that key, and treat it
   as the definition of "a period exists".
5. **Classify the violation as an outcome**, count it, and return it as a typed
   result rather than an error.
6. **Make the pass safe to run at any frequency**, and then prove it: run it
   twice concurrently against the same fixture and assert one period, one
   invoice, and one recorded collision.
7. **Bound the catch-up.** A pass that finds a very large backlog after a long
   outage should process it, but a backlog beyond a stated size is itself a
   signal — surface it rather than quietly billing a year of periods at once.

## Decision rules

- **When a subscription's unit of work fails, it fails alone.** The pass
  processes each subscription independently and never lets one bad row abort the
  sweep; the next pass retries it for free, because the state query will select
  it again.
- **When a period could not be opened for a data reason** (a refused stitch, a
  missing anchor), do not retry it forever in silence. Repeated selection with
  repeated refusal is the correct behaviour only if the refusal is visible.
- **When more than one process may run the pass**, do not add a leader election
  as the primary defence. Election reduces contention; the derived key is what
  makes the outcome correct, and a design that relies on election is one failover
  away from a duplicate.
- **When the pass is idle**, that is a state worth emitting. A biller that
  silently does nothing looks identical whether there is nothing to do or its
  selection predicate has been broken by a schema change.
- **When work is queued for later execution rather than done inline**, the key
  travels with the queued item and is re-checked at execution. The gap between
  selection and execution is exactly where a second pass fits.

## When not to use it

- **A genuinely single-zone product** where every boundary really is the same
  instant may run a nightly pass — but the derived key still applies, because
  restarts and retries do not care how often the pass runs. Drop the hourly
  cadence, never the key.
- **Event-driven billing**, where an external system pushes a "period ended"
  signal, has an upstream intent and can carry a minted key. Use the general
  idempotency discipline there; this technique exists for the case where no such
  intent exists.

## Smells

- A persisted "last run" timestamp anywhere in the biller.
- A key built from the current time, a random identifier, or a job identifier.
- A uniqueness constraint whose violation is caught and logged at error level.
- A duplicate-billing alert with a mute on it.
- A pass that aborts on the first subscription that throws.
- Concurrency safety argued from "only one scheduler runs it".
