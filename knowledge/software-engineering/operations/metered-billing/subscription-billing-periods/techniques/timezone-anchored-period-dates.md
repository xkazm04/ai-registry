---
layer: technique
type: technique
subject: subscription-billing-periods
technique: timezone-anchored-period-dates
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [defining what a subscription's period start and end mean, choosing what to persist for a billing boundary, a customer disputes the window an invoice covered]
stage: team
---

# Timezone-anchored period dates

A billing boundary is stored and reasoned about as a **date** — a year, a month,
a day — together with a rule for whose midnight turns that date into an instant.
The two halves stay separate through every computation and are combined exactly
once, at the edge where the storage layer needs a comparable value to select
events. The instant produced there is a *derived, disposable* value. It is never
the boundary's identity.

## Why the date is the primitive

An instant answers "when" without answering "for whom". Two subscribers whose
periods both end "on the 1st" end them more than a day apart if one is at the
eastern extreme of inhabited offsets and the other at the western, and both are
correct. A system that stores only the instant has thrown away the half of the
boundary that a human — a customer reading an invoice, a support agent
reconciling a dispute — actually means.

It has also thrown away recomputability. An instant carries no record of the
zone it was resolved through, so once the subscriber's zone changes there is no
way to ask "what would this boundary have been under the old frame" or "what is
it under the new one". Both questions have to be answerable, because the answer
to the first is what the previous invoice claimed and the answer to the second
is what the next one will.

## The resolution chain

Whose midnight is not a field on the subscription. It is an **ordered, total
chain**, evaluated in one resolver:

1. The subscriber's own declared zone, if set.
2. The zone of the business entity that owns the commercial relationship — the
   selling organization, the region, the billing account above the subscriber.
3. A declared universal default.

Three properties make the chain safe, and all three are commonly missing:

- **It is total.** The last rung is a constant, not a lookup, so the chain
  cannot return nothing. An empty result at any rung falls through to the next;
  it does not become the caller's problem.
- **It never reads an ambient zone.** Not the process's local zone, not the
  storage session's zone, not a request header. Those are properties of *where
  the code ran*, so a deployment move, a worker on a differently configured
  host, or a background job outside a request context each silently redraws
  boundaries. An unset zone is unknown, and rendering unknown as the host's
  local setting is
  [precisely the laundering this corpus forbids](../../../../_laws.md#unknown-is-not-a-value)
  — the boundary comes out as a definite instant with no indication that
  nobody chose it.
- **It has one implementation.** Every operation that touches a boundary —
  opening a period, closing one, selecting events, labelling an invoice,
  answering an entitlement reset — calls the same resolver. Two resolvers is
  [two authorities for one vocabulary](../../../../_laws.md#one-authority-per-vocabulary),
  and the drift between them is a per-customer offset that no test with one
  fixture will show.

## Procedure

1. **Persist the boundary as a date**, plus the anchor it was derived from, plus
   the zone that was resolved when it was materialized. Three small columns beat
   one instant, because together they can answer every question the instant
   cannot.
2. **Keep the date in date arithmetic.** Advancing, clamping, comparing "is this
   boundary in the past" against the subscriber's today — all of it happens in
   the date domain, where a month is a month and a day is a day.
3. **Convert at the last moment, in the query.** The selection of events for a
   window is the only place the boundary needs to be an instant. Build it there:
   take the date, take the resolved zone, produce the instant, hand it to the
   store. Nothing upstream of that call holds an instant.
4. **Persist the resolved zone on the record, and echo it with every window
   that travels.** A period passed to an aggregation, cached, exported, or
   rendered carries the zone it was resolved under. Two windows computed under
   different zones are otherwise indistinguishable and will be compared or
   merged. The stronger reason is detection: a frame change can only be noticed
   by comparing the zone a past record *was computed under* against the zone
   that resolves now, and if the record does not carry its zone that comparison
   is impossible. Everything the next technique does about mutable frames
   depends on this one column existing.
5. **Label from the boundary, never beside it.** The customer-visible "period:
   1–31 March" is interpolated from the same dates the meter used. A label typed
   next to the arithmetic is a second statement of the period, and when they
   disagree the human-written one is the one that is wrong.
6. **Test the offset hour.** Place an event just after local midnight for a
   subscriber at a large positive offset and just before it for one at a large
   negative offset, and assert each lands in exactly one period. A test whose
   fixtures are all in one zone validates nothing this technique is for.

## Decision rules

- **When a boundary must be stored as an instant for indexing, store it beside
  the date, never instead of it.** An index is a performance artifact; the
  identity stays the date, and the instant is rebuilt whenever the zone changes.
- **When the zone chain returns a rung other than the first, that is worth
  recording on the period**, not just resolving silently. "This subscriber has
  no zone, so we used the selling entity's" is a fact a support agent will need
  the day the subscriber sets one.
- **When a zone identifier is invalid or has been retired**, refuse rather than
  substitute. A retired zone identifier that silently resolves to a successor
  with a different historical offset changes past boundaries, and past
  boundaries have already been invoiced.
- **When the product genuinely bills everyone in one zone, declare it and make
  the field immutable.** The defect is not choosing a single zone; it is having
  a mutable per-subscriber zone field that the biller reads and nobody expected
  to change.
- **When a period is displayed to a human, display it closed** — "1–31 March",
  not an exclusive end. The internal materialization is a separate decision from
  the label, and the label is derived either way.

## When not to use it

- **Sub-day cadences.** A window measured in hours or minutes has no local
  midnight to anchor to; it is duration arithmetic and should stay that way.
- **Technical horizons.** Retention, staleness cutoffs, retry budgets and
  session expiry are durations against now. They gain nothing from the date
  domain and pay a real complexity cost for it.
- **Internal reporting.** A dashboard read by one team wants one fixed zone so
  that everyone reading it together means the same day. That is a different
  problem with a different right answer, and the two must not share a resolver.

## Smells

- A subscription table whose only temporal columns are instants.
- A boundary computation that reads the runtime's local zone, directly or by
  calling a "start of day" helper that takes no zone argument.
- A zone field that is nullable and whose null branch is a bare fallback
  literal written inline at three call sites.
- Two functions that both convert a period date to an instant.
- An invoice period string assembled from anything other than the boundary
  dates the meter was given.
- A fixture set in which every subscriber is in the same zone.
