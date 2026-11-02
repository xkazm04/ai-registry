---
layer: technique
type: technique
subject: on-stream-overlay-delivery
technique: full-replacement-snapshots
status: forged
laws: [checkability-routes-the-pixel]
shared_with: []
use_when: [choosing between deltas and snapshots for an overlay feed, an overlay that drifted from the tool's state, an overlay that is wrong after a reload or reconnect]
---

# Full-replacement snapshots

Every message an overlay page receives is the whole picture for the layers it governs,
and it replaces the previous picture wholesale. The page keeps no running state of its
own: no counters, no appended lists, no merged patches. Whatever the last message says is
what the page shows.

## Why not deltas

Deltas are the natural choice for a developer, because they are small and they map to
events: "+1 for option A", "entrant joined", "alert queued". On an overlay they fail in
three predictable ways. A page that reloads — and the broadcasting software reloads
browser sources on scene activation, on settings changes and on its own restart — starts
from nothing and draws the wrong state until enough deltas arrive. A page that misses one
message during a reconnect is wrong forever, because nothing in a delta stream ever
re-asserts the total. And a page that applies deltas is a second state machine, so every
rule the tool applies (deduplication, a late ballot refused, a tie-break) must be
re-implemented identically on the page, or the stream disagrees with the tool.

Overlay payloads are small by construction, because they are aggregate. A full snapshot of
a vote bar, a giveaway plate or an intensity meter is a few hundred bytes. The bandwidth
argument for deltas does not exist at this scale; the correctness argument for snapshots
does.

## Procedure

1. **Define the snapshot per overlay.** It contains every field the page draws, including
   the phase (idle, open, closing, result) and anything time-based expressed as an absolute
   deadline from the server, not a local countdown seeded once.
2. **Send on load, on connect and on change.** The page itself can carry its first
   snapshot, rendered into the document by the server (escaped so the data cannot close
   the element that holds it), so the first frame is correct before any stream opens. A
   new subscriber then receives the current snapshot immediately on connecting, before
   any change happens. A page that connects into a quiet period must not wait for the next
   event to learn what to draw.
3. **Coalesce to the latest.** Pending updates for one overlay collapse into a single
   latest-value slot rather than a queue. A slow page or one that reconnects receives the
   newest accepted state, never a backlog it has to replay, and the server's memory per
   client is bounded. Cap the number of simultaneous subscribers too.
4. **Order and stamp.** Each snapshot carries a monotonically increasing sequence (or the
   producing state's revision). The page drops a snapshot older than the one it shows, which
   makes duplicate and out-of-order delivery harmless.
5. **Render idempotently.** Rendering the same snapshot twice produces the same frame.
   Animations interpolate between the shown snapshot and the new one; they never carry
   forward a value that the new snapshot does not state.
6. **Validate, and clear on a rejected snapshot.** The page parses every snapshot against
   the closed schema. One that fails is not drawn, and the layer it governs clears: a newer
   state exists and the page cannot read it, so what it is still showing is known to be
   superseded. Keeping the previous frame on a rejected update is the frozen-overlay
   failure arriving by a different door.
7. **An empty snapshot is a state.** "Nothing to show" is sent explicitly, and the page
   clears. Absence of a message is not "nothing to show"; it is unknown, and is handled by
   the disconnect rule.

## Decision rules

- **When the look or the data changes while the overlay is live**, push a new snapshot
  over the open stream; do not refresh the browser source through the broadcasting
  software. A source refresh is slow, reloads the document and flickers on air, and a
  polling page that reloads itself on a timer misses any sub-second delivery budget for the
  same reason. Refreshing the source belongs to set-up, where a content hash in the address
  busts the cache once.
- **When an event is momentary** (an alert, a confetti burst), carry it in the snapshot as
  a bounded list of recent events with ids and expiry times, so a page that reconnects
  mid-burst either shows the remainder or nothing, and never replays an old one.
- **When the snapshot grows large**, the overlay is receiving something it does not draw;
  apply the aggregate-only rule before reaching for deltas.
- **When a value on screen is checkable** — a share, a count, a time — the page draws the
  number in the snapshot exactly; it never computes, rounds differently or smooths a
  checkable value into a different one.

## When not to use it

A feed of genuinely unbounded, append-only content — a full chat log — does not fit in a
snapshot, and it does not belong on an overlay in that form either. An on-stream chat lane
carries a bounded window of recent approved lines as its snapshot; the log itself stays
in the tool.
