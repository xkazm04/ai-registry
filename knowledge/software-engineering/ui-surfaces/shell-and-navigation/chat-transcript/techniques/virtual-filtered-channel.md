---
layer: technique
type: technique
subject: chat-transcript
technique: virtual-filtered-channel
status: forged
laws:
  - count-carries-predicate
  - identity-survives-reuse
shared_with: []
use_when: [the same channel is open in two panes with different filters, adding a filter means touching the scroll or selection code, a search or user popup needs a subset of one transcript, filtered rows must outlive their source's retention window, merging several channels into one pane]
---

# Virtual filtered channel

A transcript surface is asked, sooner or later, to show *some* of a stream
rather than all of it: one pane filtered to moderators, another to mentions,
a popup showing one user's messages, a merged view over three rooms. The
naive design threads the predicate through the view - every place that
counts rows, positions the scrollbar, walks a selection or answers a search
learns to skip the rows the filter hides - and the filter becomes a second
axis through every line of the render path. The standard removes the axis:
**a filtered or merged view is itself a channel.** It subscribes to its
sources, applies its predicate once per arriving message, keeps its own
bounded buffer of what passed, and is handed to the transcript surface
exactly as an unfiltered channel would be. The view never learns that
filters exist.

This technique owns the derived-channel object and its subscription. What
the transcript does with any channel - keys, scroll, selection, layout - is
the rest of this subject, unchanged; what a predicate language looks like
and how it is validated belongs to the search and filtering subjects, not
here.

## Three channels, one of them unknown to any registry

A view renders exactly one channel and that channel is **virtual**: an
ordinary channel object with the same type and name as its source, created
by the view when it attaches, registered nowhere. The source - the channel
the transport feeds, the one a registry hands out by name - is held beside
it as the *underlying* channel, and is what the view consults for anything
that is a fact about the room rather than about the rows: live state, room
identity, the user list. A third slot, the *origin*, is set only when the
underlying channel is itself derived (a popup over a popup) and points at
the real room so that actions launched from the nested view land in the
right place.

Keeping the three distinct is what makes nesting and merging free: a merged
pane is a virtual channel over several sources, a user card is one whose
predicate is an author match, and neither adds a branch to the render path.

## The predicate runs at ingest, once, on every door

The virtual channel subscribes to every event its source emits and
re-evaluates the predicate for each message that arrives through any of
them: appended live, prepended from history, filled into a reconnect gap,
substituted for an earlier message, cleared. A message that passes is added
to the virtual channel's own buffer through the same door an original
message would use, so downstream it is indistinguishable from one; a
message that fails is never seen by the view at all. A *replacement* is
re-evaluated on the replacement value - a message edited into or out of the
predicate changes the derived channel exactly as an insert or delete would.

Two consequences are the point. **The predicate's cost is bounded by
arrival rate, not paint rate** - an expensive filter runs once per message
per view, never once per frame. And **the predicate cannot fail on the
render path**: a malformed rule or a missing field is handled at ingest,
where it can be logged and the message admitted or refused as policy says.

When the filter set changes, the virtual channel is **rebuilt from the
source's current snapshot**, not patched: detach, create a fresh derived
channel, replay the snapshot through the predicate, reattach. Patching a
live buffer for a predicate change is a diff between two filtered
sequences, and getting it wrong shows as rows that should have vanished
lingering until the next scroll.

## The derived buffer has its own horizon

The virtual channel holds a bounded buffer sized like any channel's. That
buffer is not a window onto the source's buffer; it is a separate retention
with a separate horizon, and the difference is deliberate. A rare row - one
moderator message an hour in a room doing fifty messages a second - is
evicted from the source's buffer within seconds, but the filtered channel
that admitted it holds it for as long as its own buffer allows. **Rows that
survive the predicate survive the source's retention.** Without this, a
filter over a busy room shows an almost-empty pane whose few entries blink
out as the source rolls over.

The same fact governs what the view may count. A "new since you scrolled
away" badge, a scrollbar's highlight marks, a row total - each is computed
over the virtual channel and carries that predicate, per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate): the
number is "rows matching this pane's filter", never "rows in the room", and
two panes over the same room with different filters legitimately disagree.

Identity passes through unchanged: a row in the virtual channel is the same
value, with the same key, as the row in the source (per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)), so a
replacement by that key lands on the same derived row, and the frozen model
of [immutable-model-cached-layout](./immutable-model-cached-layout.md) is
shared by reference across source and derivation without a copy.

## The decision rule

**When any view may show a subset or a union of what a channel carries,
build the subset as a channel that subscribes to its sources and filters at
ingest into its own bounded buffer; hand the surface only channels. Thread a
predicate through the render path only when there is exactly one view, it
is never nested, and the predicate is cheap enough to run per frame** - and
expect to regret that the first time someone asks for a second pane.

## Boundaries

- **It is not a query engine.** A predicate that must scan history the
  buffer no longer holds is a search concern; the virtual channel serves the
  live and recent window only.
- **It is not a place to transform rows.** The derivation admits or refuses;
  it does not rewrite. A different rendering of the same message uses the
  layout's element-visibility mask, not a modified copy.
- **It inverts when the source is not a stream.** A static list filtered
  once for display is a filtered list; the object costs more than the
  predicate it wraps.
- **The virtual channel is never registered.** The moment a registry can
  hand it out by name, the derived buffer becomes a source with a retention
  nobody planned.

The shape - a derived stream that is itself a first-class stream, filtered at
the subscription rather than at the consumer - is the standard composition in
reactive stream libraries; reaching it without a chat client in front of you
is expected.

## How to test for it

- Open one room in two panes with different filters, then add a third pane
  with no filter. The render, scroll and selection code paths are identical
  across all three; only the channel object differs.
- Feed a burst that overflows the source's buffer while one filtered pane
  admits one row in a thousand. The filtered pane keeps its rows after the
  source has rolled past them.
- Change a pane's filter set. Rows appear and vanish in one rebuild, with
  no intermediate frame showing a stale row.
- Replace a message so that it newly fails the predicate. The derived pane
  drops it; the unfiltered pane shows the replacement.
