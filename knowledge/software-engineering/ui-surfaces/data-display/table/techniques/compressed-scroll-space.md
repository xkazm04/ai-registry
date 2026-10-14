---
layer: technique
type: technique
subject: table
technique: compressed-scroll-space
status: forged
laws: [limits-are-derived]
shared_with: []
use_when: [a windowed table holds hundreds of thousands of rows and the scrollbar stops tracking the rows, the last rows of a very long table cannot be reached, deciding whether a long table should be windowed on the client or paged on the server, mapping wheel and thumb input onto a scroll range the browser will not grant, a click on a deep-scrolled row lands on a neighbouring row]
---

# Compressed scroll space

[Windowed rendering](./performance.md) keeps the DOM small by mounting only the
rows in view and giving the scroll container a spacer as tall as the whole
dataset would be. That spacer has a ceiling. Browsers cap the size of a
scrollable box, at a value in the tens of millions of pixels that differs by
engine and by version. Past it the spacer stops growing: the scrollbar stops
representing the data, the last rows sit beyond the end of the scroll range, and
a position computed as `scrollTop / rowHeight` names the wrong row. At a
46-pixel row the ceiling is reached somewhere between a few hundred thousand and
a million rows, so this is a failure of tables that were ordinary a year earlier
and simply grew.

## Decide first whether the client should hold the rows at all

The ceiling is also a signal. A table that needs a million rows scrollable
client-side is a table whose users sort, filter and select across all of them
locally. If the job is browsing, the [client-server split](./client-server-split.md)
and [pagination](./pagination.md) answer it without any of the machinery below.
Compress scroll space when the full set must stay on the client (an analysis
surface over a loaded dataset, a local-first tool, an export preview) and the
count has outgrown one spacer.

## The mechanism

Keep two coordinates and never mix them. The **logical** coordinate is the
position in the real content (`rows x height`). The **physical** coordinate is the
position the browser reports for the scroll box. Everything the table reasons
about, which row is first, which row a pointer is over, where a scroll-to-row
ends, is logical. Only the scroll box itself is physical.

1. **Probe the ceiling at runtime, once, and subtract a guard.** Build an
   off-screen scroller with an oversized child, read back how tall the engine let
   it become, and keep that minus a margin. A literal in the source is right for
   one engine in one year. Record the probe's result and the fallback used when
   the probe cannot run (no document, a headless renderer).
2. **Cap the physical extent.** `physical = min(logical, ceiling - clientSize)`.
   When logical fits, the two coordinates are equal and nothing below runs. The
   table is compressed only when `logical > physical`, and the flag is derived,
   not configured.
3. **Map linearly between them.** Thumb position times `logical / physical` is the
   logical position, clamped to the logical range. The inverse converts a
   programmatic scroll-to-row back into a thumb position.
4. **Offset the rendered window.** The mounted rows are positioned at their
   logical place by translating the window by `logical - physical`, so a row's
   on-screen position is right even though the scroller thinks it is somewhere
   else. The offset is computed from the same clamped logical coordinate the row
   range is.
5. **Give wheel and keyboard input a logical delta.** A wheel notch is a distance
   the user means in content terms. Multiplying it by the compression ratio turns
   one notch into a leap of dozens of rows. Advance from the previous logical
   position by the delta itself, convert to physical, and let the thumb move
   less. Thumb drags stay proportional; wheel and keys stay absolute. Two input
   classes, two mappings, one stored logical position.
6. **Hit-test in logical coordinates.** Pointer-to-cell, drag selection, and
   auto-scroll while dragging read the logical position, never the raw
   `scrollTop`. This is the step that gets skipped, because the table looks right
   at rest.

## What compression cannot do, derived

One thumb pixel moves the logical position by the ratio `R = logical / physical`.
The thumb can address every row only while `R` is at most one row height. Since
`R = (rows x height) / ceiling`, that condition reduces to **rows at most the
ceiling in pixels**, independent of row height: with a ceiling in the low tens of
millions, a few tens of millions of rows is the thumb's honest upper bound. Past
it, some rows are reachable only by keyboard, search or jump-to. State the bound
beside the ceiling constant, because a limit chosen by feel is raised by feel.

## Verify at the ends, not in the middle

Mid-range scrolling looks correct under a wrong mapping. The checks that fail are
at the edges and under interaction:

- scroll to the very end and assert the last row's bottom edge is inside the
  viewport, vertically and horizontally;
- scroll to several deep positions, click a cell, and assert the clicked row's
  identity equals the row the logical position says is there;
- deep-scroll with a pinned region present and assert the pinned and the body
  regions still agree on which row is which.

## Anti-patterns

- A hard-coded ceiling copied from one browser.
- Reading `scrollTop` as a row position anywhere outside the mapping.
- Compressing a table that should have been paged.
- Applying the ratio to wheel input.
- Testing only the first screenful and the middle.
