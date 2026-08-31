---
layer: application
type: application
subject: versioning-snapshots
technique: retention-and-pruning
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.85
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Rust — a reaper that already gates on readers, and the two readers it cannot see

How a Rust service's revision janitor stands against
[retention-and-pruning](../techniques/retention-and-pruning.md), and against the
amendment that a pruning query's guards cover only references that exist as rows.

## The seam

A retention janitor on a six-hour interval, deleting revisions older than a
cutoff while keeping a floor of the newest per key. Against it: a streaming
export advertised as constant-memory with no row cap, and two cursor feeds that
page across separate requests.

## What the tree had already reached, and why it counts

The project independently built the amendment's first repair, and wrote down the
incident that forced it: both janitors used to fire on a bare sleep, so over
enough sessions one was guaranteed to land mid-scrape holding the writer lock,
and the stall was charged to whatever the operator was doing. Its own comment
states the conclusion — *the fix is not a better interval, it is to stop
scheduling and start measuring*. The result is an in-flight counter fed at the
request door, with the janitor deferring the whole pass while it reads non-zero
and recording a deferral outcome so a janitor that never runs cannot become
folklore.

That is independent corroboration of the amendment, reached without it. It is
also a **third mechanism** the amendment's own enumeration did not contain — an
activity gate that tracks *whether anyone is reading* rather than *which version
each reader holds* — and it is available exactly where the technique had
declared the time bound unavailable, because it never asks a long reader to be
short. The technique now carries it.

## The arms

- **A** — the technique before today: pruning is a query with guards, every
  guard a durable row. No reader appears in the guard list.
- **B** — the amendment: a live-reader mechanism, or a bound on reader lifetime.

Both arms were evaluated by classifying every reader over the pruned tables
against the registry the tree already has.

## What the arms said

| reader | lifetime bound | visible to the gate |
| --- | --- | --- |
| streaming export | none (documented "no row cap") | **no** |
| changes cursor feed | none | between requests, **no** |
| history cursor feed | none | between requests, **no** |
| export-before-delete | none | yes |
| pinned-reference scan | none | yes |
| replayable revisions | caller's limit | yes |

**Zero of six readers carry a lifetime bound**, and there is no request-timeout
layer anywhere in the server — the only deadline in the process is the shutdown
grace period. Fleet-wide the count is one bounded reader in roughly fifteen.

And the gate has a blind spot its own module documents: the guard drops when the
handler produces its response, not when the body finishes streaming. The export
is the exact inverse of the case that comment anticipated — it returns the
response head immediately and then hits the store on every poll, so the gauge
reads zero while a long read is in progress against the table the janitor is
about to delete from.

**Verdict: better.** The tree reached the mechanism and the amendment locates
two reader classes the mechanism misses by construction.

## Why the collision is latent rather than live, with the crossing point

Retention is currently disabled by default and the corpus is seven days old, so
nothing collides yet. The store holds 10,782 revisions over 8,546 keys, peaking
at 5,843 revisions in one day, with 193 keys already past the retention floor —
machine-rate version creation, which is the condition the amendment names as
when the gap opens.

The trigger is a walk outrunning the janitor interval. At the observed peak
rate, a year of history is about 2.1 million rows, or roughly 2,100 pages at the
configured clamp, so a full walk exceeds the six-hour interval once mean page
latency passes **~10 seconds**. That number is what would falsify the
prediction.

## The two clauses this seam added to the technique

- **A live-reader mechanism owes a harm bound and a deferral count.** This
  janitor's own comment says it carries no harm bound, so under permanent load
  it defers indefinitely — and other passes in the same module escalate past the
  gate on exactly such a bound. The amendment's first repair has the identical
  failure: a reader that never ends pins the low-water mark forever. Without the
  bound, the repair converts a data-loss bug into a silent no-maintenance bug.
- **Register at the store touch, not at the response.** The response boundary is
  the natural place and it is blind to a streaming body and to a cursor walk
  spanning requests. The discriminator is whether the reader holds a connection
  while it reads, and neither of those does.

## Return condition

Latent with a stated trigger: live when retention is enabled and the corpus ages
past the window, or when any single walk exceeds the janitor interval. The
instrument that would settle it already exists and needs one change — hold the
activity guard across the stream's lifetime rather than to the response head,
and the deferral counter that already reports gate pressure will show whether
exports are colliding with the reaper.

## What this realization cannot do

The classification is static: it shows that six readers have no lifetime bound
and that two are invisible to the gate, and it cannot show that a collision has
occurred, because nothing in this store records a read that failed to find a
version. Detecting the live case needs the reaper to log what it deleted against
what was being read, which no instrument here does.
