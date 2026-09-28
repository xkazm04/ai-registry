---
layer: technique
type: technique
subject: usage-analytics
technique: batching-and-quota
status: forged
laws: [count-carries-predicate, creation-names-reaper]
shared_with: []
use_when: [choosing whether telemetry ships per click or per session, summaries dying with crashed sessions, pricing a new counter against the daily quota]
---

# Batching and quota

The unit of transmission for usage analytics is the **session summary**: one
record per session, flushed when the session ends, carrying counters
accumulated locally. This is not an optimization of per-event transmission —
it is a different architecture. Of the three arguments for it, privacy alone
suffices; cost and robustness add weight but would not carry it on their own.

## Why per-interaction transmission is wrong

- **Cost.** Against unbatched sends, one request per interaction, the multiple
  is the interaction rate itself: hundreds to thousands of calls per session.
  Mainstream analytics clients already batch, flushing a queue every second or
  every few dozen events, so against them the network saving shrinks to an
  order of magnitude or two. Where a destination bills per event, batching
  saves nothing on the bill, and only a summary does. No general ratio holds,
  so measure yours: events per session times the destination's unit price.
- **Privacy.** Even with immaculate payloads, per-event transmission leaks
  through *timing*: arrival times at the collector reconstruct the user's
  rhythm — when they work, how long they linger, what follows what. A
  summary has one timestamp and no sequence. The aggregation promise of
  [privacy-scrubbing](./privacy-scrubbing.md) is only structural when the
  transport unit is the aggregate.
- **Robustness.** A pipeline touched on every interaction has its failure
  surface in the product's hot path. Accumulating into local counters is
  synchronous, allocation-cheap, and cannot fail visibly; the network is
  touched once, at the edge of the session, where nothing user-facing
  depends on it.

## What the summary gives up

A summary answers exactly the questions whose counters were declared before
the session ran. For that session it answers nothing else, ever, and it keeps
no in-session sequence: which surface came before which is gone. That is the
right trade when the questions are named in advance, and the admission test
of [event-taxonomy](./event-taxonomy.md) demands that they are. It is the
wrong trade for a product still exploring, whose questions are not known yet.
A team that chooses an event stream in that phase is making a deliberate
trade. It still owes the scrubbing and consent discipline in full, and it
should know that its per-event arrival times are the trail this technique
exists to avoid.

Funnels do not need sequence. Their steps are once-per-installation milestones
([activation-and-funnel-honesty](./activation-and-funnel-honesty.md)), each a
latched record of its own that travels beside the summary, not a path
reconstructed from events.

## The accumulator

The in-session state is a set of named counters and gauges, keyed by the
event vocabulary: visit counts per surface, activation counts, duration
accumulators, first-seen flags. Increment is fire-and-forget from the emit
door. Two disciplines keep the accumulator honest:

- **Bounded cardinality by construction.** Keys come from closed
  vocabularies ([event-taxonomy](./event-taxonomy.md)), so the accumulator's
  size is fixed by the registry, not by user behavior. A counter keyed by
  anything unbounded is a slow memory leak and a privacy hole at once.
- **The summary states its window.** A flushed record carries what it
  counted and over what span — session start, end, and the vocabulary
  version in force — so downstream aggregation never merges records whose
  predicates differ
  ([law: a count carries its predicate](../../../../_laws.md#count-carries-predicate)).

## Flush: session end, and the ends nobody plans for

"Session end" is plural in practice, and each shape needs an owner:

- **Orderly shutdown** — the normal flush point, where the runtime has one
  (a desktop or native process does; a browser page does not, below). The summary is finalized,
  handed to the sink, done. Shutdown paths are given a short, bounded window
  to hand off — analytics may never be the reason quitting feels slow, so
  the handoff must be fast and abandonable, not awaited indefinitely.
- **Abrupt death** — crash, kill, power loss. The summary in memory is
  simply gone unless the accumulator checkpoints. The cheap middle ground is
  periodic persistence of the running counters to local storage, with the
  *next* launch flushing any orphaned checkpoint as a "recovered session"
  summary, marked as such.
- **The long-lived session** — a session lasting days defeats "flush at
  end". A maximum accumulation window (flush and reset every N hours of
  activity) bounds both data loss and summary staleness.
- **The browser page, which has no orderly shutdown.** Closing a tab from a
  mobile tab switcher, or the system reclaiming a backgrounded tab, fires no
  unload event at all. The platform's own guidance is that the page becoming
  *hidden* is the last moment its code can count on. Hidden is not the end,
  though: the user comes back, and a page restored from the back-forward cache
  resumes the same session. So on the web the summary is sent
  **cumulatively on every transition to hidden**. Each send carries one
  session id and a sequence number, and the collector keeps the latest per
  session. It travels by a transport that outlives the page (a beacon, or a
  keep-alive request). Both are capped at about 64 KiB in flight, a budget the
  summary's bounded cardinality has to fit. Each resend is one more arrival
  time at the collector. That trail is far coarser than per-event sending, but
  it is not nothing, so resend only when the counters have changed since the
  last send. An unload listener is at most a redundant extra, never the
  mechanism.

Every timer, listener, and checkpoint created for this machinery names its
teardown at creation — flush hooks deregistered, intervals cancelled,
checkpoints deleted after successful flush
([law: creation names its reaper](../../../../_laws.md#creation-names-reaper)); an
analytics layer that leaks its own plumbing is measuring the product it is
degrading.

## Loss tolerance is declared, not discovered

Session-summary batching accepts that some summaries die with their
sessions. This is the correct trade — the data is directional product
signal, not a ledger — but "acceptable loss" is a number, not a shrug:

- **Instrument the loss itself.** Sessions started can be counted cheaply
  and locally (a checkpoint at start); summaries received are known at the
  sink. The gap is the loss rate. A loss rate that moves is a defect
  signal — a new crash, a broken flush path — even when the absolute level
  is fine.
- **Never buy durability with privacy or hot-path cost.** Escalating to
  per-event durable spooling to chase the last few percent of completeness
  reintroduces exactly the trail and the overhead this architecture exists
  to avoid. If a measurement genuinely requires ledger-grade delivery, it is
  not usage analytics and does not belong in this pipeline.

## Quota is a budget with a name

Whatever the destination charges — requests, events, bytes, rows — the
analytics layer owns a stated budget: expected summaries per installation
per day, expected summary size, and the ceiling the product refuses to
cross. New events and new fields are priced against it at design time (one
more counter per session is nearly free; anything per-interaction is not).
The budget check belongs in review of registry changes, because that is
where volume is decided; by the time the bill or the rate-limit arrives,
the decision is months old.
