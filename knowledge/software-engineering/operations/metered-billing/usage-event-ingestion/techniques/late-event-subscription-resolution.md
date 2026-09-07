---
layer: technique
type: technique
subject: usage-event-ingestion
technique: late-event-subscription-resolution
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary, derivation-names-recomputation]
shared_with: []
use_when: [attaching a usage event to a subscription, handling backdated or replayed usage, deciding what to do when no subscription window matches]
---

# Resolving a late event to a subscription

Resolution is the door's third question: **which subscription does this event
belong to?** Take the subject identifier the emitter sent, find that subject's
subscriptions, and select the one whose window contains the event's occurrence
timestamp. The happy path is a lookup. The technique is entirely about the two
ways it misses.

## Two misses, two different answers

**No subscription has ever existed for this subject.** The event cannot become
money by any later repair, and the most likely cause is that the emitter is
sending an identifier from the wrong namespace — an internal id, a staging id, a
customer that was never provisioned. Refuse at the door with a specific reason.
This is one of the few configuration-dependent checks worth paying for
synchronously, because the answer is stable (a subject with no subscription today
had none yesterday), the lookup is a single indexed read rather than a graph
walk, and the emitter is far better off learning it during integration than
discovering a month of missing usage.

**Subscriptions exist, but none covers the occurrence timestamp.** This is the
late event: usage that happened during a gap, before the first subscription
started, or after one ended and before the next began — most often because the
emitter buffered during an outage, replayed a backlog, or backfilled a migration.
And here the correct answer **depends on what the metric measures**, which is the
one thing about this problem that is not obvious.

## The occurrence-versus-level rule

- A metric that **counts occurrences** — requests served, messages delivered,
  bytes transferred — treats each event as an *increment* belonging to the period
  it happened in. A window miss costs exactly one increment. Attaching it forward
  to the live subscription would charge this period for last period's work, which
  is a defect a customer can see on an invoice. Refuse it, or park it for review;
  either way the loss is bounded and visible.
- A metric that **measures a level held over time** — seats occupied, storage
  provisioned, licences active, agents connected — treats each event as a *state
  transition*. It does not say "one more unit happened"; it says "the level is now
  N, and it stays N until something says otherwise." Dropping such an event does
  not lose one unit's worth of money. It leaves the level wrong from that instant
  forward, through every subsequent period, until an unrelated event happens to
  correct it. The error compounds, it is silent, and its direction is arbitrary.

So the rule, stated as a rule: **when an event matches no subscription window and
its metric measures a persisting level, attach it to the subject's currently
active subscription; when the metric counts occurrences, do not.** The
justification is that the state a level event describes has genuinely outlived
the boundary the event fell through — the seats really are still held, the
storage really is still provisioned — so carrying it forward is the *accurate*
reading, not a lenient one.

Two corollaries worth writing down:

- If the subject has no currently active subscription either, the fallback has
  nothing to attach to and the level event is refused like any other unroutable
  event. The fallback is "attach forward", not "invent a target."
- The fallback belongs to the **metric's aggregation kind**, which is
  configuration, not to the event. An emitter cannot request it, and a per-event
  flag asking for it is an attack surface on the invoice.

## A fallback attachment must never look like a match

The fallback is a policy decision made in the absence of information, and the
event must carry that fact. Store the **resolution outcome** — matched by window,
attached forward by the level rule, refused — as a typed value on the event
alongside the subscription it points at.

Two laws bite here at once. Without the outcome, a guess is
[unknown rendered as a definite value](../../../../_laws.md#unknown-is-not-a-value):
the event points at a subscription with the same confidence whether the window
matched or nothing did, and no query can separate them. And the outcome must
reach the surfaces that act on it — the aggregation, the invoice explanation, the
support tool — as that typed value rather than as a line in an ingest log, which
is [a verdict surviving its boundary](../../../../_laws.md#verdict-survives-boundary).
The practical test: when a customer asks why a seat charge appears in this month's
invoice for a change they made last month, can anyone answer from the data? If
the answer requires reading ingest logs, the verdict did not survive.

Count fallback attachments per customer and alert on a rise. A healthy
integration produces a trickle; a spike means an emitter's clock is wrong, a
backfill is running, or a subscription was terminated while usage kept flowing —
all things worth knowing before the invoice is cut.

## Resolution is written down, not recomputed

Resolve **at admission** and store the result on the event. The alternative —
resolving lazily at aggregation or invoice time — is appealing because it is
always "current", and it is wrong for a specific reason: **subscription windows
are editable**. An operator fixing a start date, a support agent backdating a
cancellation, a plan change applied retroactively — each of these silently moves
already-invoiced events onto different bills, and the second invoice does not
match the first with no change to any event.

Storing the resolution makes it a derived value, which brings its own obligation:
[a stored derived value names how it is recomputed](../../../../_laws.md#derivation-names-recomputation).
So the technique requires an explicit **re-resolution operation**: invokable,
scoped to a subject and a time range, audited, and reporting how many events
moved and between which subscriptions. It runs when a subscription window is
genuinely corrected. It never runs implicitly as a side effect of reading, and it
never runs over a period that has already been invoiced without a human deciding
that a credit or a re-issue is intended.

## Every entity is resolved as of the occurrence time, not as of now

The window predicate is the visible half of a rule that applies to **every**
entity the event touches. The customer that owns the subject, the plan the
subscription carried, the metric the code names — each is looked up *as it was
when the usage happened*, not as it is now.

The case that proves it is deletion. A customer churns; a week later their
emitter's backlog drains and posts usage from before the churn. If the lookup
filters deleted customers unconditionally, that usage is unroutable and is lost
— for a customer who genuinely incurred it and genuinely owes for it, in the
final period, which is the period most likely to be disputed. The correct
predicate is *not deleted, or deleted after the event's occurrence timestamp*.
Same shape as the subscription window, same reason.

The rule generalizes: **any filter on an entity's lifecycle that ingest applies
is applied against the event's clock, not the wall clock.** A filter written
against `now` is a bug that only fires for late events, which is to say only for
events nobody is watching.

## The resolution cache must outlive the late-event window

A lane that resolves from an in-memory or shared cache rather than from the
store of record needs a retention horizon, and that horizon is
**derived from how late an event may arrive**, not from how much memory is
convenient. A cache that holds only currently-live subscriptions cannot resolve
a backfill from last month; it will report "no subscription" for events the
authoritative store would have matched, and it will do so silently because
"no subscription" is a normal outcome.

Derive the horizon from the same measurement that bounds the de-duplication
window — the longest realistic emitter replay — and state it beside the cache
definition. When two lanes hold different horizons, they resolve the same event
differently, which is a divergence in the admission contract and not a caching
detail.

## Overlaps and ties

Real subjects have overlapping subscriptions: an upgrade that starts before the
old plan's window closes, a duplicate subscription created during a failed
migration, two products billed separately under one subject. Resolution must be
**deterministic and written down**, not left to whatever ordering the store
happens to return.

- Prefer the subscription whose window contains the occurrence timestamp; among
  several, prefer the one still open over one already closed, then the most
  recently started. Ties broken by a stable identifier, never by insertion order.
- **Refusing to choose is not a tie-break.** Raising an error when more than one
  candidate is active turns a data condition the product allows into an ingest
  outage for that subject, and it fires on exactly the upgrade and migration
  paths that produce overlaps. If two active subscriptions are genuinely
  invalid, refuse them where they are *created*; at ingest, pick by the written
  rule and record which one.
- If the metric's code is scoped to a plan or a product, filter by that first —
  it usually resolves the overlap without a tie-break at all.
- Record which rule fired, for the same reason the fallback is recorded: an
  invoice dispute over an overlap is unanswerable without it.

## Decision rules

- **When the subject has no subscription at all, refuse synchronously.** The
  emitter has a bug and cheap early failure is a gift.
- **When no window matches and the metric measures a level, attach to the active
  subscription and mark the outcome.**
- **When no window matches and the metric counts occurrences, refuse or park;
  never attach forward.**
- **When a subscription window changes, re-resolve explicitly and report the
  movement.** Never let a read path re-derive it.
- **When the fallback rate rises, treat it as an integration alarm**, not as
  normal traffic.

## When not to use this

- **Single-subscription subjects with no history** — a product where a customer
  has exactly one subscription for life — has no window to miss, and the
  resolution collapses to a foreign key.
- **Prepaid or credit-drawdown models** where usage debits a balance rather than
  a period do not have this problem in the same shape; there is no window, only
  a balance, and a late event debits the same balance whenever it arrives.
- **Where every metric counts occurrences**, the level branch is dead code and
  writing it is speculative. Add it with the first level metric, not before.
