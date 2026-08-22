---
layer: technique
type: technique
subject: long-form-reading-surface
technique: scroll-spy-reading-band
status: forged
laws: [count-carries-predicate, failure-not-empty-success]
shared_with: []
use_when: [the current-section highlight flickers between two entries, the highlight jumps a section early, choosing what counts as the reader's position, a progress bar fills before the article ends]
---

# The reading band

"Which section is the reader in" has no measured answer. A tall viewport shows
the tail of one section, all of a short one, and the opening of a third; a short
viewport may show no heading at all. Every naive definition fails visibly:
nearest heading to the top edge flickers whenever the reader nudges the wheel
near a boundary; first heading intersecting the viewport jumps a section ahead
the moment the next title peeks over the fold; last heading scrolled past ignores
that the reader is looking at the *next* section's opening paragraph.

The technique is to stop measuring and **declare**: carve a horizontal band out
of the viewport, call it the reading position, and define the current section as
the topmost heading intersecting it. Everything else follows from where the band
edges sit.

## Sizing the band

The band is expressed as insets from the viewport's top and bottom edges, and
each edge answers a different question.

- **The top inset clears the fixed chrome**, and then some. A heading behind the
  header is not where the reader is; a heading level with the header's lower
  edge is not either, because the reader's eye is below it. Take the chrome
  height from the offset budget and add a small comfort margin — this is one of
  the derived offsets that module owns, not a number invented here.
- **The bottom inset is large — most of the viewport.** This is the edge people
  get wrong. If the band extends to the fold, a heading entering at the bottom
  of a tall screen becomes "current" while the reader is still several
  paragraphs above it, and the panel highlights a section they have not reached.
  Cutting off around the upper third of the viewport means a heading becomes
  current roughly when it reaches the reader's actual gaze position. The band is
  a strip near the top, not the whole screen.

Both insets scale with the viewport rather than being absolute pixels wherever
the platform allows it, because a band tuned on a desk monitor is the entire
screen on a phone.

## Topmost wins, and nothing means "unchanged"

Two headings can intersect the band at once — a short section fully inside it.
The rule is **topmost intersecting wins**: the reader has entered the second
section's territory only when the first has left the band. This is what makes
the highlight advance monotonically as the reader scrolls down and, crucially,
what makes it stable: a boundary crossing changes the answer once, not on every
frame near the boundary.

When *no* heading intersects the band — a long section whose heading has
scrolled past — the previous answer stands. This is not an optimization; it is
the correctness rule, and it is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) in
miniature. "No heading in the band right now" and "the reader is above the first
heading" produce the same empty observation and must produce different states:
the first keeps the current section, the second has no current section at all.
Collapsing them gives the classic defect where the highlight blinks off in the
middle of every long section, which reads as the panel being broken.

Two more states are worth spelling separately:

- **Not yet computed.** Before the first observation, the surface has no answer
  — distinct from "no section is current". A panel that highlights its first
  entry by default is asserting a position it has not observed, and will be
  wrong for any reader who arrived at a deep link.
- **Arrived by anchor.** A heading the reader jumped to must become current, or
  the panel disagrees with the destination the reader just chose. The cheap fix
  is to set it on activation; the durable one is geometric — give the anchored
  heading a scroll clearance equal to the band's top inset, and the jump lands
  the heading inside the band, where the ordinary rule makes it current with no
  special case at all. Both numbers come from the offset budget, which is what
  makes their equality a property of the system rather than a coincidence
  between two literals that will drift.

## The observation is passive and the answer is one value

Position tracking runs on every scroll of a long document, so its cost is real
and its structure matters:

- **Observe intersections; do not poll geometry.** A handler that measures
  every heading's position on every scroll event does layout work proportional
  to headings times scroll events, on the main thread, during the one
  interaction the reader most notices jank in. Platform intersection primitives
  do this work off the critical path and report only changes.
- **One tracker per document, one current value.** Every consumer — the panel
  highlight, a breadcrumb, a shared-link updater — derives from that value. Two
  trackers with slightly different bands is the same divergence disease this
  subject fights everywhere else, in its least obvious location.
- **The heading set handed to the tracker must be a stable value.** The tracker
  rebuilds its observation whenever that input changes, so a list derived fresh
  on every render — a filter applied inline, say — tears down and re-registers
  every observation on every render, and the first paint after each rebuild has
  no answer at all. Derive the filtered list once and hold it.
- **Re-establish the observation when the heading set changes.** The tracker
  observes elements; when the article's content swaps, the old elements are
  gone. An observer left watching detached elements never fires again and the
  highlight freezes on the previous document's section — silently, because a
  frozen highlight looks exactly like a reader who has stopped scrolling.

## Reading progress carries its predicate

A progress indicator is a number that travels, and it is wrong far more often
than it looks, because the obvious implementation answers a different question
than the reader is asking
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
Progress through the *document* counts the footer, the related-articles block,
the comments — so the bar reads full while the reader is mid-argument, or never
reaches full because the last screen of the page is chrome. The predicate that
matches the reader's question is **progress through the article body**: measured
from the body's top to its bottom, reaching one hundred percent exactly when the
last line of prose is visible, whatever sits below.

The same honesty applies to a reading-time estimate: it is a stated
approximation over the body's words at a stated rate, and it belongs next to the
article's other metadata, not presented as a measurement of the individual
reader. Round it coarsely — a minute-level estimate claiming precision it does
not have invites exactly the scrutiny it cannot survive.

Neither indicator is announced. A progress value that updates in a live region
turns every scroll into speech; it is decoration for a visual reader and noise
for everyone else.

## When not to reach for this

An article short enough to fit in two screens does not need position tracking —
the reader can see where they are. A surface whose contents panel has three
entries does not either; the highlight adds motion and answers a question nobody
asked. The band earns its complexity at the length where a reader genuinely
loses their place, which in practice is a document with more than a handful of
sections and more than a few screens of prose.
