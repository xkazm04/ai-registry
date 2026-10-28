---
layer: technique
type: technique
subject: kept-alive-screen-host
technique: frame-first-no-skeleton
status: forged
laws: [unknown-is-not-a-value]
shared_with: []
use_when: [screens flash a loading silhouette on every switch, layout moves when data lands, a count renders 0 before it is read]
---

# Frame first, no skeleton

The screen's real frame is the placeholder. On the click, the host renders
the screen's heading, toolbar, panes, column headers, section titles and the
fixed rows it always shows, and every value that has not been read is a dash
in the exact box the value will occupy. There is no loading file, no
skeleton component and no fallback silhouette. A skeleton is a second,
approximate drawing of the screen, and the frame is the screen itself.

## Make the screen data-optional

Converting a screen means making every component in it render without its
data. It starts from the frame, reads each slice through a hook that answers
*unread*, *ok* or *error*, and draws a dash where a value is unread. Three
rules decide whether that holds up:

- **A dash, never a zero and never a blank.** An unread count is a dash. A `0`
  claims nothing exists, and a blank collapses the cell and reflows the row
  when the value arrives ([law: unknown is not a value](../../../../_laws.md#unknown-is-not-a-value)).
  An attention colour (an amber count, a red badge) is never drawn for a
  value that has not been read, because it asks the person to act on
  something nobody looked at.
- **Reserve the geometry.** Every region holds its real height and width from
  the first frame: a summary line of dashes in the strip's slot, a table's
  header row with its column widths, a card grid with its known card count.
  Arrival replaces dashes inside the boxes, and nothing moves. Where the count
  of items is itself unread, reserve the region's box and draw one dash. Do not
  invent rows.
- **Unread is not empty.** A region whose slice is unread shows its dash and
  never its empty state. "No projects yet" before the list has been read is
  the empty flash, and it is a false statement.

## The main regression: state seeded once from props

A screen that used to receive its data before it rendered usually has hooks
that seed their state once from it: a reducer initialised from the list, a
selection defaulting to the first row, a filter set built from the available
columns. Made data-optional, these hooks seed from the empty unread state and
never look again, and the screen stays empty after its data arrives. Give each
such hook an arrival path. Start from an empty constant, resync when the
incoming data object changes, merge into the UI state instead of wiping it,
and apply a default pick on first arrival only and never over the person's
own pick. This is the class of defect to search for first when converting a
screen. It is silent in tests that render with data already present, so every
screen also gets a render test that goes from unread to read.

## Settling in without a ghost

Regions may still arrive with designed motion: each region waits for its own
slice and then settles in after a step of its declared order, so a screen
fills in a deliberate sequence and not in network order. The motion is on the
region, the region was painted from the first frame, it plays once per mount,
and a kept screen shown again does not replay it. Under a reduced-motion
preference there is none. How a region settles (the cascade, the stagger, the
identity guards) is the async-states neighbour's craft. This technique only
forbids that any stand-in shape precedes it.

## The gate test

The ban is enforced by a test over the source tree, because a placeholder
style that only review enforces comes back with the next screen someone adds.
The test fails on:

- any route-level loading file;
- any component file or exported component whose name says skeleton or loading;
- any suspense fallback that is not null, or one of a short, named allowlist
  of real still frames (a landing page's static scene, a nav list with nothing
  current).

The test also asserts it is not vacuous, by checking that an allowed fallback
it expects actually appears in the tree. A guard that finds nothing because
its pattern drifted passes forever. When a new still frame is genuinely
needed, it joins the allowlist by name in the same change, so every exception
is reviewed.

The cost of removing route-level loading files is stated and accepted. A
navigation that goes through the router (entering the app from outside the
host) now waits for its static shell instead of drawing a stand-in. Every
in-app click is the host's and never waits.

## When not to use it

The rule assumes the frame is knowable without data. A surface whose very
structure is data (a user-composed dashboard, a document whose sections are
content) has no static frame to paint. Give it a held box of the last known
height, and accept that its first arrival shapes it. Public, indexed pages that
must ship content in the first response need server-rendered data, not dashes.
