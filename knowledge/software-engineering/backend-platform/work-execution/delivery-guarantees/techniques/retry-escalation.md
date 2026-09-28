---
layer: technique
type: technique
subject: delivery-guarantees
technique: retry-escalation
status: forged
laws:
  - count-carries-predicate
  - deletion-is-not-repair
  - unknown-is-not-a-value
shared_with: []
use_when: [deciding what happens after the final retry, events crash forever while their counter reads zero, a counter that resets itself on deploy or restart, a retry list capped at N entries with the oldest dropped, a permanently failing item retried on every run]
applied: experiment
ab_verdict: better
---

# Retry escalation

An attempt failed. The [retry-backoff](../../../resilience/retry-backoff/retry-backoff.md)
subject owns what happens next in *time* — whether this failure class retries
at all, and how long the wait is (jittered, laddered:
[backoff-design](../../../resilience/retry-backoff/techniques/backoff-design.md)). This
technique owns what happens next in *count*: the persisted attempt counter,
the threshold that bounds it, and the state transition that fires when the
bound is crossed. The two compose into one sentence: **backoff decides when
the next attempt happens; escalation decides that there is a last one.**

## The counter is persisted, incremented on every attempt, by every path

The attempt count lives on the event row — not in a worker's memory (dies
with the worker, which is precisely when it mattered), not derived from log
archaeology. And *every* consumption of an attempt increments it:

- handler returned failure — the obvious increment;
- worker crashed mid-processing and the reaper requeued — the forgotten one.
  A reaper that requeues without incrementing creates events that crash
  forever while their counter reads zero (see stuck-reaping);
- attempt aborted by shutdown, cancelled by timeout — still attempts; the
  event consumed a slot of the system's willingness.

The counter also carries its predicate (law: count-carries-predicate):
*attempts of what?* Redelivery from upstream, after deduplication, must not
re-increment a counter that means "our processing attempts" — otherwise a
chatty sender exhausts an event's budget without a single handler failure.
Conversely, if the pipeline distinguishes crash-reaps from clean failures
(worth doing — they triage differently), either count separately or record
the kind alongside; a single number summing unlike things supports no later
claim about what went wrong.

## The threshold is a transition, not a comparison

The bound exists as a state change: when attempts reach the limit, the event
*moves* — out of the retry cycle, into the dead-letter lane, with the final
failure attached (see dead-letter-design). The defining anti-pattern of this
technique deserves its full statement:

> **A retry counter that increments forever is a dead letter without the
> letter.** The failure is just as permanent — the event will never succeed —
> but nothing marks it, nothing surfaces it, and the system spends real
> resources on attempt 40,000 while the operator believes the pipeline is
> healthy. Unbounded retrying is not persistence; it is a slow leak of
> compute wrapped around a silent loss of the event.

Three refinements on the threshold:

- **Permanent failures escalate immediately.** When failure classification
  (owned by
  [error-classification-for-retry](../../../resilience/retry-backoff/techniques/error-classification-for-retry.md))
  says the failure cannot heal — malformed payload, rejected authorization,
  a target that no longer exists — the remaining budget is worthless.
  Escalate at attempt one; spending the full ladder on a permanent failure
  delays the human who could actually fix it.
- **The budget is per event class.** A cheap idempotent recomputation can
  afford ten attempts; an amplifying handler whose retries have side costs
  wants two or three. One global constant is either waste or recklessness,
  class by class.
- **An elapsed-time bound backs the count.** Attempts × maximum backoff can
  stretch a small count across days; for events whose value expires, a
  deadline ("no attempts after T") escalates staleness on its own, whatever
  the counter says. Escalation by staleness records a different reason token
  than escalation by exhaustion — the triage differs (see
  non-delivery-ledgers).

## A capped list of recent failures is not a budget

The cheapest retry memory a pipeline grows is a list of the keys that failed,
capped at a small number, newest kept, re-offered at the start of each run. It
reads as a bound and it is not one: nothing in it counts *this* item's
attempts, so an entry leaves only when enough *other* entries fail after it.
The same structure then fails in two opposite directions:

- **It forgets fastest when failures are correlated.** An outage fails
  everything a run touches, the list turns over at the outage's arrival rate,
  and entries fall off before the dependency is back. The evicted key does not
  become a dead letter; it becomes *untried*, because the only fact separating
  "failed four times" from "never attempted" lived in the entry that was
  dropped ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
  Whether it ever runs again then depends on the main scan's ordering: behind
  a backlog that arrives faster than it drains, it does not.
- **It never forgets when failures are rare.** On a quiet pipeline nothing
  displaces a permanently failing key, so it is retried on every run
  indefinitely, and if the main scan also still sees it as unprocessed it
  holds one of that scan's slots too.

Lifting the cap cures the first and leaves the second untouched. The repair is
the counter this technique already requires, kept where the list was: an
attempt count per key, persisted with the key; exit by success or by that
key's own budget, into a terminal record the main scan also respects (a key
that exhausted its budget is a verdict, not untried work). Keep a cap on the
*work* re-queued per run, never on the *memory* of what failed; that memory is
then bounded by the set of things that can fail, the same bound the success
side's memory already has. And **a run in which every attempt failed charges
no item's budget**: that is the shared dependency being down, not N items
failing, and charging it lets one outage longer than the budget retire every
item that happened to be in flight - the per-item form of the rule in
[circuit-breakers](../../../resilience/retry-backoff/techniques/circuit-breakers.md):
decide whether an outage consumes budget, or it exhausts all of them.

Measured on a replay of one such pipeline's own ingest loop (an eight-entry
list, five new items admitted per run, forty runs, an outage of up to four
runs, two permanently failing items): with arrivals faster than admission, 12
of 20 outage failures ended un-ingested and recorded nowhere; the permanent
failures were retried on all 80 opportunities and, where admission order was
stable, held two of five admission slots throughout, cutting throughput by up
to 40%. Uncapping the list removed the silent loss and changed nothing else.
Per-key budgets removed both, but a budget charged during the outage retired
the outage's first items and lost up to five ingests against the as-is loop;
not charging all-fail runs removed that loss, with throughput at or above the
as-is loop in all 36 conditions and identical state on a failure-free trace.

## Escalation preserves; it never destroys

The transition to dead-letter carries the event's full context forward:
payload, identity, attempt history, the final error verbatim. Escalation that
truncates — keeping a count but dropping the payload, keeping an error string
but losing which attempt produced it — converts a triageable record into a
tombstone (law: deletion-is-not-repair; discarding the evidence of a failure
is not handling the failure). The rule of thumb: the dead-letter record must
contain everything a human needs to decide *retry or discard* without
consulting a second system, because the second system's retention will have
expired by the time anyone looks.

## Decision rules

- **Escalation is the pipeline's decision, not the operator's default.** The
  threshold fires automatically; the operator's role begins at the triage
  surface. A design where humans must notice a high counter and manually
  move the event has a dead-letter lane staffed by hope.
- **Reset the counter only across an operator retry.** When a human
  re-queues a dead-lettered event after fixing the cause, that is a new
  campaign and the count restarts — but the record keeps its lineage (this
  is redrive attempt two of an event dead-lettered once before; a repeat
  offender is a signal). Automatic resets — on deploy, on restart, on
  partial success of a batch — quietly convert the bound back into infinity.
- **Watch the aggregate, not just the individual.** One event at the
  threshold is routine; a cohort marching toward it together is an outage in
  progress. Escalation *rate* is the pipeline's leading health indicator,
  and it belongs on the same surface as the reaper's counts.
