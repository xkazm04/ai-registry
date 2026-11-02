---
layer: technique
type: technique
subject: on-stream-overlay-delivery
technique: clear-on-disconnect
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [writing the reconnect logic of an overlay page, an overlay that froze on stream, deciding what an overlay shows while its tool is restarting]
---

# Clear on disconnect

When an overlay page loses its data feed, it clears every data-bearing layer to
transparent and reconnects on a capped backoff. It never holds the last frame. The first
full snapshot after reconnecting repaints the page from nothing.

## Why freezing is the worst option

The broadcasting software composites whatever the page last painted. A page that loses
its feed and does nothing keeps showing its last state, and that state is almost always
mid-action: a vote bar part-way through a count, a countdown at a few seconds, a draw
plate saying "drawing". To every viewer the frozen layer is a live claim — the vote is
at 61 percent, the draw is still running — made on behalf of the tool that has in fact
stopped. Nobody watching can reload it, and the streamer, looking at their own controls
rather than their output, often does not notice for minutes.

The alternatives are not symmetric. A cleared overlay is a visible absence: the streamer's
preview shows the gap, the audience sees an uncluttered stream, and no false number goes
out. A frozen one is a confident falsehood with the tool's styling on it. Showing a
"reconnecting" banner on stream is a middle path that usually loses: it advertises a fault
to the whole audience and covers the stream for as long as the fault lasts. Put the
connection state on the streamer's own surface, not on the broadcast.

## Procedure

1. **Detect the break both ways.** Treat a stream error or close as a break, and also
   treat silence longer than the server's heartbeat interval as a break, since a half-open
   connection delivers nothing and raises no error.
2. **Clear first, then reconnect.** On a break, the page removes every layer whose
   content came from the feed — including the provenance marker, any bound animation
   state and any diagnostic it was showing — before scheduling any retry. Static
   decoration that carries no data may stay. After a clear, the next accepted snapshot
   rebuilds the scene from nothing even if it is identical to the one that was cleared;
   a page that skips "unchanged" state after a clear stays blank.
3. **Back off with a cap.** Retry after a short delay that doubles to a ceiling of tens of
   seconds, and stays at the ceiling. A streamer's tool can be down for a whole stream; the
   page must keep trying without hammering, and must come back on its own when the tool
   returns, because no one will reload the source mid-broadcast.
4. **Reset the backoff on a real snapshot**, not on the socket opening. A connection that
   opens and fails before sending data is still a failure, and resetting on open lets a
   server that accepts and immediately drops connections pin the page at the shortest
   delay.
5. **Distinguish a transient drop from a refusal.** A stream library's own reconnect
   covers a dropped connection; an explicit refusal from the server (not found,
   unavailable) closes the stream for good in most clients, and only the page's own timer
   brings it back. A page that relies on the native retry alone stays dark after the
   first refusal.
6. **Reload, do not reconnect, when the page ran package script.** Script that already
   executed keeps its state; a fresh document is the only way to know the page is clean.
   A scripted overlay that loses its feed schedules a page reload on the same capped
   backoff, and remembers its attempt count across reloads so a crash loop still backs off.
7. **Repaint from the first snapshot.** Nothing from before the break is reused, which is
   only safe because every message is a full snapshot.

## Decision rules

- **When a timer was running at the break**, it is not continued locally. A countdown that
  keeps ticking without its server is a fabricated number; clear it and let the next
  snapshot restate the deadline.
- **When a decorative asset fails to load**, hide it and leave transparent space. A
  broken-image glyph on stream is a visible fault the audience reads as the tool failing.
- **When the page reports its own health**, it reports counts and states (snapshots
  rejected, reconnect attempts) in a place the streamer's tooling can read, never the
  rejected payload text, which may carry exactly what the payload rules kept off air.
- **When the tool shuts down cleanly**, it sends an explicit empty snapshot first, so the
  overlay clears immediately rather than after the heartbeat timeout.
- **When the schema version does not match** after a reconnect (the tool was upgraded,
  the page is cached), clear and stay clear; log the mismatch for the streamer, not the
  audience.
- **When measuring the behaviour**, measure time from break to cleared layer inside the
  real embedded browser as well as in a headless browser. A headless figure does not
  vouch for the embedded one, and an unmeasured live timing stays reported as unmeasured.

## When not to use it

A layer that carries no tool data — a static frame, a logo, a decorative border — has
nothing to go stale and need not clear. And an overlay that intentionally shows a final,
settled result (a draw that has been sealed and announced) may hold it, but only because
the result is final, and the snapshot that made it final said so: "final" is a state the
server asserts, never one the page infers from silence.
