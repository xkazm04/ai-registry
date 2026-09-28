---
layer: technique
type: technique
subject: page-load-pipeline
technique: layout-stability-by-reservation
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [content jumps while the page loads, a lazily loaded section or embed arrives into a placeholder, adding media, a banner or late-arriving content to a page]
---

# Layout stability by reservation

Every resource that arrives after the first render has to land somewhere. If the
space it will occupy was not claimed before it arrived, the layout grows around
it, and everything after it in the flow moves. The reader who was about to tap a
link taps the advertisement that pushed it down; the reader who was reading a
paragraph loses it. The layout shift metric sums these unexpected movements of
visible content, and it counts them regardless of whether anyone was harmed.

The only rule that holds is **reservation**: the space a late arrival will
occupy is claimed in the first render, at the size it will have, so the arrival
replaces a reservation instead of inserting into the flow. Repairs after the
fact — scrolling the reader back, animating the growth — hide the symptom and
keep the cost.

## What must be reserved

- **Media.** Every image, video and embed carries its intrinsic dimensions or an
  aspect ratio in the markup, so the browser sizes the box before the file
  arrives. A responsive image with a known ratio needs only the ratio.
- **Late content slots.** An advertisement, a consent banner, an embed, a
  recommendation strip: its slot is sized in the first render to the size it
  will usually have. If the size varies, reserve the most common size and let
  the rare larger one scroll inside the slot or grow below the reader.
- **Deferred sections and client-only components.** A section loaded later
  arrives into a placeholder, and the placeholder is a reservation. Its height
  must match the loaded section's, including chrome that is easy to forget — a
  legend row, a caption, a control strip under a player. A placeholder that is
  approximately right shifts by the difference.
- **Font swaps.** A late font with different metrics reflows every line set in
  it; the reservation is a metric-matched fallback, owned by
  [font-loading-discipline](./font-loading-discipline.md).

## One placeholder per slot

A deferred component often passes through more than one "not yet" state: the
code has not arrived, then the code has arrived but the component is waiting to
animate in, or waiting for its data. When each state draws its own placeholder,
the slot jumps between them even though no content has arrived. The fix is one
placeholder, defined once and rendered by every not-yet state
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
The same rule applies to a reservation whose size is derived from a constant — a
media aspect ratio, a canvas's composition size: derive the placeholder from the
same constant rather than restating the ratio, or the two will disagree on the
day one of them changes.

## Never insert above the reader

Content inserted above what the reader is looking at moves it, however well the
inserted content was sized. Notices and banners go in reserved slots or overlay
without displacing flow; late-arriving content that belongs above the fold is
reserved in the first render or appears only on a user action. Movement shortly
after a discrete user input — expanding a panel the reader clicked — is expected
and is not what the metric counts. Movement nobody asked for is.

A long page that defers its sections has a harder case: a reader who arrived at
a deep link sits below sections that have not mounted, and as those sections
grow above them the page slides away. Reserving approximate heights and
re-asserting the landing after content arrives is the addressability subject's
protocol, in
[lazy-section-addressability](../../../ui-surfaces/published-surfaces/lazy-section-addressability/lazy-section-addressability.md);
the reservation half of it is this technique.

## Animation is not a loophole

Animating a layout property — height, margin, top — moves every box after the
animated one on every frame, and each frame counts as a shift. Transform and
opacity move nothing in the flow. The discipline is the motion system's
[performance-discipline](../../../ui-surfaces/feedback-and-style/motion/techniques/performance-discipline.md);
it is cited here because an entrance animation on a late-loading section is the
commonest way a well-reserved slot still shifts.

## Decision rules

- When content can arrive after the first render, claim its space in the first
  render at the size it will have.
- Give every media element intrinsic dimensions or an aspect ratio in markup.
- Render one shared placeholder for every not-yet state of a slot, and derive its
  size from the same source as the loaded content.
- Never insert unrequested content above the reader; use a reserved slot or an
  overlay.
- Animate late arrivals with transform and opacity only.

## When not to use this

- **Content the reader asked for.** An accordion that expands on click moves
  content by design; reservation would leave empty space nobody wants.
- **Truly unbounded content** — a user-generated block of unknown length — cannot
  be reserved exactly; place it below the reader, or reserve a bounded height and
  scroll inside it.

## How to test for the property

- Load each key route cold with throttled network and script, and record layout
  shift until quiet; any shift above zero is traced to its element.
- For each deferred section, assert the placeholder's rendered height equals the
  loaded section's at the common viewport widths.
- Enter a long page at its last address on a cold load and assert the landing
  element's position is unchanged after every section above it has mounted.
