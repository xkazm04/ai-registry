---
layer: application
type: application
subject: admission-queue
technique: self-paced-intake
stack: rust
status: forged
verified_on: 2026-08-31
verified_against: rust@1.96
applied: simulation
ab_verdict: better
proof: structural-only
---

# Rust — a change-data drain that steps per row

A desktop application streams SQLite changes to its own front end: a
synchronous `update_hook` pushes one record per changed row into a bounded
channel, a reader thread forwards those into an unbounded async channel, and a
drain task consumes them one at a time and emits each to the WebView. The
consumer is the default shape — block on the channel, take one item, handle
it — and everything this application reports follows from that.

## What one step costs

Per received record the drain performs, in order: a hook call marking cloud
state dirty; on insert, a wake signal to a downstream subscription loop; a
`SELECT` fetching the full row by rowid; and a cross-process `emit` into the
WebView bridge. Three of those four are fixed costs that do not grow with
batch size — a query round-trip, an IPC round-trip, a signal — which is
exactly the tell the technique names. A transaction writing N event rows
therefore costs N queries and N IPC emits, executed serially, and the drain's
rate is the writer's rate by construction.

## The structural fact: the tree already decided this four times, three ways

Nobody set out to prove anything about pacing, and the codebase proves it
anyway. Its long-lived consumers were written independently and settled into
three different policies with no rule distinguishing them:

| consumer | policy | shape |
| --- | --- | --- |
| change-data drain | per arrival | `while let Some(e) = rx.recv().await` |
| quality-gate fix loop | per arrival | same shape, one full execution per request |
| journal writer | self-paced | batches captures before writing |
| jobs worker | self-paced | `loop { tick(); sleep(5s) }` |

Two of four already self-pace, and their comments give the reason in local
terms ("batches captures", a fixed tick) without naming a general rule. The
split does not track the three exemptions the technique states — the fix loop
runs a whole persona execution per arrival, which is neither latency-critical
nor rare — so the policy was inherited from whichever shape the first author
reached for. That is the finding a tree cannot be built to produce: the
decision was made four times and never once written down, which is what an
unstated default looks like from the outside.

## The downstream consumers are already self-paced

Both destinations of the per-arrival work run on their own clocks. The
subscription loop this drain wakes declares a 2s active and 10s idle interval
and keeps the poll "as the heartbeat"; the cloud sync loop debounces and
no-ops when disabled, which the drain's own comment cites as the reason the
per-event call is cheap. So per-arrival signalling is being converted back
into self-paced ticks one hop downstream, and the intermediate signals are
work spent to trigger something that was going to run regardless. The
technique's "a wake is not work" corollary is visible here as an already-paid
cost rather than a hypothetical.

## A/B by simulation, over three cases from this tree's own history

No code was changed. Each case is a real repair recorded in the source or in
the project's bughunt notes, walked under policy A (per arrival, as built) and
policy B (drain on an interval with a per-drain cap, coalescing on rowid).
The reasoning below is the author's, labelled as such.

**Case 1 — the boot-burst overflow.** The drain formerly slept six seconds
before spawning its reader thread; the bounded channel filled with nobody
consuming, records were dropped, and the front end never saw them. The repair
added three things: spawn the reader first, an *unbounded* async channel to
absorb the burst, and a pre-wait rowid watermark with a replay-from-database
path afterwards. Under B the readiness gate is a drain interval rather than a
channel: the reader still buffers into one bounded queue, and the first drain
after readiness takes up to the cap and emits once. The second, unbounded
buffer has no job, and the replay path is needed only when the bounded
buffer's shed policy actually fired — which the existing drop counter already
reports, instead of being inferred. **B is better**, and the win is one
unbounded buffer and one recovery path deleted, not throughput.

**Case 2 — the update freeze.** Only inserts fetched the full row; an update
fell through to a lightweight payload the live-stream view rejects for having
no event type, so a row froze at its first-seen status. The repair made
updates re-fetch and re-emit under the same name, which the view replaces in
place. Correct — and it multiplied the per-row cost by the transition count:
an event moving queued to running to completed now pays three fetches and
three emits for one row. Under B the drain coalesces on rowid, keeps the last
action seen, fetches the now-current row once and emits once. The intermediate
states are precisely the ones the view was already discarding by replacement,
so coalescing them loses nothing this consumer reads. **B is better, and this
is the strongest of the three:** it recovers the cost the freeze repair
introduced without reintroducing the freeze.

**Case 3 — the redundant wake.** Every insert signals the subscription loop.
Because that signal is a `notify_one` against a loop with its own interval, N
signals in a burst already collapse to one useful tick, so N−1 are redundant
rather than expensive. Under B the wake fires once per non-empty drain and
dispatch latency becomes bounded by the drain interval instead of by delivery
time. **B is better but marginal**, and saying otherwise would overstate it —
this case is a tidiness win, not a cost win.

## What would falsify this

One measurement decides it, and this tree cannot currently produce it: **the
drain-size distribution.** If arrivals are overwhelmingly isolated — a
histogram dominated by batches of one — then B coalesces nothing, case 2's
win evaporates, and every record pays up to one interval of added latency for
no return. The technique's first exemption would then apply and the current
design would be correct as written.

The tree instruments the adjacent quantity and not this one: a counter of
records dropped when the bounded channel was full, described in its own
comment as meaning "the drain task fell behind the write rate." That counter
proves the coupling exists under load; it does not report how arrivals
cluster. **Return condition: emit the per-drain batch size and read its
distribution.** Until then the verdict rests on the structural argument and on
three historical repairs, which is why the proof status here is
`structural-only` rather than `ab-paired`.

## What this realization cannot do

The simulation compares policies, not implementations. It cannot price the
IPC emit or the rowid fetch on real hardware, so it says which direction the
cost moves and not by how much. A reader deciding whether to copy this should
treat the direction as argued and the magnitude as unmeasured.
