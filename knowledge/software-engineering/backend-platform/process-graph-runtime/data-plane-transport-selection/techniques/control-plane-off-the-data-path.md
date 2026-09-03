---
layer: technique
type: technique
subject: data-plane-transport-selection
technique: control-plane-off-the-data-path
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a supervisor's event loop is on the message hot path, a control loop deadlocked awaiting a guaranteed send, deciding what a supervisor is allowed to hold, metrics collection stalls the scheduler]
---

# Control plane off the data path

The bypass has a mirror obligation. If payloads no longer pass through the
supervisor, the supervisor must stop being *positioned* to touch them — and
that is a stronger statement than "it happens not to". A supervisor that keeps
one hand on the data, or that can block on something the data plane does, is
still on the hot path, which was the thing the bypass was bought to remove.

The rule has two halves. **The supervisor sees lifecycle notifications, never
payload copies.** And **its event loop never awaits anything whose completion
depends on the rest of the system.**

## The first half: notifications, not payloads

What the supervisor legitimately holds is small and enumerable: which peers
exist and their state, which edges are declared, which route each edge
settled on and why, health and readiness, and the counters an operator reads.
None of that scales with message volume, which is the property that makes the
control plane's cost independent of the data plane's throughput.

What it must not hold is any per-message payload, in any disguise. The
disguises are worth naming because each arrives with a good reason attached:
a debug tap that copies "just the first N bytes" of every message; a metrics
path that hashes payloads to detect duplicates; a recording feature
implemented as a supervisor subscription. Each begins as a bounded diagnostic
and each puts payload volume back into the process whose latency budget the
whole design protects. Where such a feature is genuinely needed, it belongs in
a separate subscriber process that competes for delivery bandwidth like any
other consumer — visibly, and outside the loop.

## The second half: the loop never blocks

A single-threaded event loop that owns the routing tables is an excellent
design — topology changes need no locking, because one owner mutates them —
and it has exactly one catastrophic failure mode: something the loop awaits
requires the loop to make progress.

**Never await a delivery-guaranteed network publish on the loop.** This is the
concrete deadlock and it does not look like one in review. The loop awaits an
acknowledged send to a peer. The peer's acceptance requires an event that only
the loop can process. The loop is inside the await. Two parties, one of them
the loop itself, and neither can move; the symptom is a control plane that
stops responding while data continues to flow, which is a state nobody's
mental model of the system contains.

The fix is structural. Publishing is **offloaded to a bounded drain channel**
serviced by a separate task, and the loop's contribution is a non-blocking
enqueue that cannot fail slowly. Three properties make the offload safe:

- **The channel is bounded** — a few hundred entries is the right order.
  Unbounded is not a fix, it is the same deadlock rewritten as a memory leak.
- **A full channel drops with a warning**, and the warning names what was
  dropped. Dropping is the price of the bound, and a bound that blocks instead
  of dropping has reintroduced the deadlock at one remove. A dropped
  notification that is silently discarded is a control plane that reports
  healthy while it has stopped telling anyone anything
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **The drain task names its reaper** — it is created with the loop and shut
  down with it, and its shutdown drains or explicitly abandons what is queued
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). A drain
  task that outlives the loop it serves publishes stale lifecycle events into a
  graph that has moved on.

## Not everything may be dropped, and the invariant is still "never block"

The rule that survives is *never await on the loop*. "Always drop when full"
is the ordinary consequence of it, not a second rule, and treating the two as
the same thing produces the opposite failure: a lifecycle notification whose
loss strands a peer forever, discarded because a channel was briefly full.
Some events are like that — a notification that a peer restarted, which is the
only thing that will ever release a client waiting on a correlation that died
with it. Dropping one is not a lost metric, it is a permanent hang somewhere
else.

So classify, and give the two classes different machinery:

- **Droppable notifications** — status, metrics, routine state syncs — go on
  the bounded channel and are dropped loudly when it fills.
- **Critical lifecycle events** are delivered with backpressure, and the
  backpressure is awaited **on a detached task holding cloned handles**, never
  on the loop. The loop's attempt is still non-blocking; when it fails, the
  loop hands the work off and returns to draining, and the guarantee is kept by
  something that is allowed to wait.

Reserve headroom for the second class in the receiver's own channel as well —
a small number of slots that ordinary traffic may not consume — so the common
case never reaches the offload at all.

**Never collect metrics inline on the loop.** A diagnostic that stalls the
control plane makes the system worse precisely when it is being examined, and
the stall is attributed to whatever was happening at the time rather than to
the measurement. Metrics are pulled by a separate task from state the loop
already maintains, or pushed onto the same kind of bounded channel.

## Instrument the loop against the next one

The deadlock above is one instance of a class, and the class is "something on
the loop took longer than it should have". The cheap general instrument is a
**handler-duration ceiling**: time every handler, log any that occupies the
loop longer than a low ceiling — a hundred milliseconds is a good default —
with the handler's identity in the record.

This is not a fix, it is a smoke detector, and its value is that it finds the
*next* offending await while it is still a latency complaint rather than a
hang. It is also the instrument that survives contributor turnover: the person
who adds a blocking call in two years will not have read this document, and
the log line will tell them what they did.

## What the operator sees

The control plane's own health is reported separately from the data plane's,
because the bypass has made them genuinely independent and collapsing them
hides the exact failure this technique prevents — a stalled loop while
throughput looks perfect. Three signals suffice: the drain channel's high-water
mark and drop count, the handler-duration outliers, and the loop's own liveness
as a heartbeat that is not derived from message traffic.

## When not to use it

- **When the supervisor is on the data path by design.** A system whose
  mediator must see every message — because it filters, transforms, or
  authorizes — has a different architecture, and pretending otherwise produces
  a control plane that is on the hot path and untuned for it. Decide which
  system you are building.
- **When the loop is not the only owner.** The single-threaded ownership is
  what makes lock-free routing-table mutation correct. A design that shares the
  tables across threads needs synchronization on its own terms, and importing
  the never-block rule without the ownership rule gets neither benefit.
- **For the never-block rule, never.** It has no exception; the classification
  above exists precisely so that "this event matters too much to drop" is
  answered by an offload rather than by an await. A channel that has instead
  been quietly widened until it stopped dropping has replaced a visible bound
  with an invisible one, and a loop that awaits "just this one important send"
  is the deadlock rewritten with a good reason attached.
