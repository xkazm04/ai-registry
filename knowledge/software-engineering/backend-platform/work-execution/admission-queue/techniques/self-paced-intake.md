---
layer: technique
type: technique
subject: admission-queue
technique: self-paced-intake
status: forged
laws: [count-carries-predicate, absent-guard-is-loud]
shared_with: []
use_when: [deciding whether an arrival should trigger a step at all, one write producing N downstream round-trips, a consumer whose cost scales with its producer's burst shape]
---

# Self-paced intake

Everything else in this subject decides what to do with an arrival: admit it,
queue it, refuse it, order it, bound the depth it may reach. All of it
presumes the arrival is what moves the system — that the request showing up is
the event the machinery reacts to. That presumption is a design decision, and
it is usually made by default, in the shape of the first consumer somebody
wrote: a loop that blocks on the channel, takes one item, and handles it.

Such a loop has given its work rate to its callers. Its step count equals
their arrival count, its burst shape is their burst shape, and its cost per
unit time is a fact about their behaviour rather than a property anyone chose.
Every control this subject offers is then a defence built downstream of that
decision — and defending a rate you could have set instead is more machinery
for a worse result.

**The prior question is whether an arrival causes a step at all.** A
self-paced consumer wakes on its own clock, drains whatever accumulated since
the last wake, and does one unit of work for the batch rather than one per
arrival. Arrivals still land in a bounded buffer; what changes is that the
buffer's *depth* absorbs the burst instead of the *consumer's step rate*
tracking it.

## What decoupling buys, beyond cost

The economics are the obvious half and the least interesting. Three
properties follow from the same separation:

- **Work per unit time becomes expressible.** A per-arrival loop has no rate
  to state — its rate is whatever arrived. A self-paced loop's rate is a
  number someone chose, which is the precondition for every bound in this
  subject: you cannot budget, admit against, or alarm on a quantity that is
  defined as "however much showed up."
- **Control flow stays local.** A loop that steps per external event
  interleaves its own state transitions with the environment's schedule. The
  self-paced loop decides when it is between steps, which is when its
  invariants hold and where anything expensive belongs.
- **Batching is free rather than engineered.** Amortising a fixed cost across
  many items requires a batch to exist, and a batch exists only when the
  consumer declines to act on the first item. Per-arrival consumers reach for
  debouncing and coalescing later, as repairs, and those are self-pacing
  reintroduced under a worse name and without a stated rate.

## The tell: fixed cost multiplied by arrival count

The seam is worth finding when a single step carries a **fixed cost that does
not grow with batch size** — a round-trip, a transaction, a cross-process
message, a re-render, a lock acquisition, a flush. Per arrival, that cost is
paid N times for N arrivals; per drain, once for N. The multiplier is the
producer's burst shape, which the consumer does not control and generally does
not know.

The diagnostic is one question asked of the loop body: *does this step's cost
fall if two arrivals are handled together?* If yes, the loop is paying a tax
proportional to somebody else's write pattern.

Two corollaries, both cheap:

- **Coalesce before working, not after.** Draining a batch and then discovering
  that eight of its ten entries name the same target is the common case for
  change notifications, cache invalidations and dirty-marking. Deduplicate the
  drained batch on its natural key, then do the work once per distinct key.
- **A wake is not work.** Where the step's only job is to nudge a downstream
  consumer that is *itself* self-paced, per-arrival waking buys nothing and
  costs a signal per event: the downstream loop was going to run on its own
  clock regardless. Wake at most once per drain, and only when the drain found
  something.

## The rate must be stated, not implied

A self-paced loop replaces an unstated rate with a stated one, and the
statement is the deliverable — per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate), "it
batches" converts to nothing, while "drains at most every 50ms, at most 500
entries per drain" converts to a worst-case added latency and a worst-case
step cost. Both numbers belong where operators read them, because together
they are the loop's contract: **added latency is bounded by the interval, and
work per interval is bounded by the drain cap.**

That second bound is the one people forget, and without it self-pacing has
only moved the problem: a loop that wakes on a timer and then drains an
unbounded backlog has a bounded *step rate* and an unbounded *step cost*,
which is the same outage arriving on a schedule. The drain cap is what makes
the interval meaningful, and leftover entries simply wait for the next wake.

## When per-arrival is right

Self-pacing is not free, and three conditions make the per-arrival loop the
correct design:

- **Latency is the product.** Work whose value decays inside the pacing
  interval — a response a human is waiting on, an interactive keystroke path —
  must not be delayed to be batched. This is the same split
  [engagement-paced-cadence](../../../../llm-agent/evaluation-and-cost/cost-metering/techniques/engagement-paced-cadence.md)
  draws between reactivity and spontaneity, and the two techniques answer
  neighbouring questions: that one paces a loop that has *no* external work
  and must not bill for idling, this one paces a loop that *does* and must not
  let arrivals set its rate. A loop can need both.
- **Arrivals are rare and expensive.** Where each event is individually
  significant and inter-arrival time reliably exceeds any sensible interval,
  batching yields an empty batch on most wakes and adds latency to the rest.
- **Ordering or transactionality is per-item.** If handling two arrivals
  together changes the outcome — each needs its own transaction, its own
  isolation, its own failure boundary — the batch is not a batch, it is a
  loop with extra steps.

Outside those three, per-arrival is a default nobody chose, and it is worth
naming as such: a consumer whose rate was never decided has made its most
important capacity decision silently
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) in its
capacity form — the unstated rate is the missing guard).

## Migrating an existing per-arrival consumer

The change is small and its risks are known:

1. Replace the single-receive with a bounded multi-receive: block for the
   first item, then take up to the cap without blocking.
2. Coalesce the batch on its natural key.
3. Do the fixed-cost work once per batch, or once per distinct key.
4. State the interval and the cap where operators can read them, and emit the
   drain size so the batch distribution is observable rather than assumed.
5. Keep the buffer bounded and keep its shed policy
   ([depth-bounds-and-shed](./depth-bounds-and-shed.md)) — self-pacing changes
   who absorbs the burst, not whether the burst is bounded.

Step 5 is the one that gets dropped, and dropping it converts a per-arrival
loop with a drop policy into a self-paced loop with unbounded memory, which
is a worse failure that takes longer to find.

## Decision rules

- Decide the step trigger before designing admission: own clock, or arrival.
  A per-arrival loop is a choice, and it is only correct against one of the
  three conditions above.
- Ask of every loop body whether two arrivals handled together cost less than
  two handled apart. If yes, the loop is taxed by its producer's burst shape.
- Self-pace with **both** bounds — an interval and a per-drain cap. An
  interval alone bounds the rate and not the cost.
- Coalesce the drained batch on its natural key before doing work, not after.
- Never wake a self-paced downstream consumer per arrival; wake at most once
  per non-empty drain.
- Keep the arrival buffer bounded and its shed policy explicit after the
  change, not only before it.
- State the interval, the cap and the observed drain-size distribution;
  "it batches" is not a rate.
