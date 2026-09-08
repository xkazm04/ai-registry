---
layer: technique
type: technique
subject: narrative-scroll-surface
technique: reveal-without-loss
status: forged
laws: [gate-sees-target, deletion-is-not-repair, failure-not-empty-success]
shared_with: []
use_when: [sections of a page appear as the reader scrolls to them, a whole-page capture of an animated page comes out empty, an accessibility sweep of a scroll-driven page finds nothing to report, deciding whether a reveal may mount its content]
---

# Reveal without loss

Content that appears as the reader scrolls must **exist for every reader who
never scrolls**. The reveal is a change of appearance over content that is
already present and already laid out — never a decision about whether to put
the content there at all.

The rule is one sentence and the reason it needs a technique is that the
convenient implementation violates it, looks identical in a browser, and takes
the page's own argument out of the served document without anything failing.

## The readers who never scroll

Five of them, each losing something different:

- **Crawlers and link previews.** They take the served document, or a rendered
  frame of its first screen. Content that mounts on approach is content that
  is not in either. The page's argument — the thing it exists to make — is
  absent from every summary of it that anyone else generates.
- **Print and export.** A reader printing the page, or saving it to a portable
  document, gets a static composition of the whole thing at once. Anything
  waiting to be scrolled to is blank space with a heading over it.
- **Screenshot and capture.** Someone putting the page into a deck, a report,
  or a review takes one frame. See below: this one has consequences beyond the
  reader.
- **A reduced-motion reader.** They have asked the page not to move. If the
  reveal is the only route to the content, they have asked the page not to
  show them anything.
- **A reader whose script did not run.** A failed bundle, a blocked request,
  an old device. Whatever the served markup contains is the whole page for
  them, permanently.

The obligations are not five different fixes. One discipline satisfies all of
them.

## The discipline: appearance, not presence

- **The content is in the served document.** Every station's text, every
  heading, every alternative description is present at the first byte, in
  reading order, whether or not the reader ever reaches it.
- **The content is laid out.** Not merely present but occupying its real
  space, so the page's height is honest before anything reveals and the scroll
  bar does not lie about how long the page is.
- **The reveal moves opacity and position only**, over that laid-out content.
  These are the properties a compositor can change without the page
  recomputing anything, and — the point here — without the content ever having
  been absent.
- **The resting state is the resolved state.** The content's default, with no
  script, no observer and no scroll, is *fully visible*. Script's job is to
  take a visible thing and make it arrive; not to take an invisible thing and
  make it appear. Inverted — content that starts at zero opacity and is
  revealed by script — every reader whose script did not run gets a page of
  headings over blank rectangles, and the page reports no error, because
  nothing went wrong.

That last rule is the one with teeth, and it is worth stating as its own test:
**disable script and look at the page.** If any content is missing, the reveal
is mounting or hiding rather than animating.

It has a consequence that scroll-bound motion makes easy to miss. A gesture
whose curve *starts* dim renders its starting value into the served document,
because that is the value the composition holds before any position is known.
Text is still present — crawlers and previews get the page's argument, which
is the first obligation and it is met — but the static frame is the entry
state rather than the resolved one, so the printed, exported and unscripted
renderings are a page of ghosts. The fix is not to abandon the envelope: it is
that the *served* value is the resolved one and the entry state is applied
only once the page can see where the reader is.

**Nothing branches the served markup on a fact only the reader's device
knows** — the motion preference, the viewport, the scroll position. The server
cannot know them, so a first client render that consults them produces a
document that disagrees with the one that was served, and the recovery from
that disagreement can be discarding and re-rendering the whole page. That is
the maximum amount of work, spent on precisely the readers whose preference
triggered it. Read those facts as live external state, render the same thing
the server did on the first pass, and correct on the next.

## Never conditional mounting

The tempting implementation is to hold the station's content back until the
station approaches the viewport, because it is easier to not render something
than to render it and style it, and because it appears to save work.

It saves very little — the content is text and an image the page was going to
need anyway — and it converts an appearance problem into a presence problem,
which is a different subject with a much larger surface: addresses that
resolve to nothing, a page that collapses into one screen because unmounted
stations have no height, a deep link that lands nowhere. If a station's
content is genuinely heavy enough to defer — a large embedded artifact, a
media player — then it is deferred deliberately, with the address discipline
that deferral requires, and the *rest* of the station still ships in the
document.

Hiding is the same defect wearing a different coat. Content removed from the
accessibility tree until a scroll position is reached is content a non-visual
reader cannot reach at all, since they are not producing scroll positions in
the way the observer expects. Reveal changes how content looks. It never
changes whether it is there
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

## The instrument problem: a review taken at the top is a review of a different page

This is the part that costs teams real money, because it makes their checks
confidently wrong rather than absent.

**A whole-page capture of a scroll-driven page renders empty.** The capture
tool loads the page, waits for it to settle, and photographs the full height —
at scroll position zero, where every station below the first screen is at the
start of its envelope: reduced scale, low or zero opacity, offset. The image
that comes back is the first screen followed by several pages of empty colour
blocks. Nothing errors. The capture *succeeded*, and it produced a picture of
a page that does not exist
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
An automated visual review built on it — a design pass, a regression
comparison, a reviewer glancing at an attached image — is now silently
reviewing blankness, and will keep passing while the page rots.

**An accessibility sweep at the top of the page never sees most of the page's
chrome.** The index that only appears once the reader has left the hero, the
station markers that materialize with their stations, a progress readout that
is inert until there is progress — none of them exist at scroll zero, so an
audit run there reports on a document missing exactly the elements whose
semantics are most in doubt. A clean result is not evidence; it is the
instrument looking at the wrong thing
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

### Latching reveals and scroll-bound ones need different remedies

This is where the repair usually goes wrong, and it goes wrong quietly because
the two mechanisms look identical while you scroll.

A **latching** reveal fires once when its content first approaches and then
stays resolved. Walking the page from top to bottom leaves every station
revealed, so a harness can walk the page, return to the top, and then capture
or audit a fully-resolved document in one frame. This works and it is the
right fix for that mechanism.

A **scroll-bound** gesture has no latch. Its state is a live function of the
current position, so returning to the top returns every distant station to its
entry state, and the walk bought nothing. The same remedy, applied to the same
page, is now a no-op with a comment explaining why it works.

Most real pages have both. So the rule is per mechanism, not per page: for a
latching reveal, walk and return; for a scroll-bound one, observe at the
positions where the stations peak, or observe the page's own reduced-motion
rendering, in which nothing depends on position at all. A harness that applies
one remedy to a page containing both has an instrument whose stated
justification does not cover half its target.

The rules that follow:

- **A capture scrolls first, and the way it scrolls matches the mechanism.**
  Drive the page through its full scroll range for latching reveals; capture
  per station at each station's peak for scroll-bound ones. A single
  top-of-page shot is not a capture of this surface.
- **An audit is run at stated scroll positions**, one of which is a position
  where the scroll-dependent chrome exists. Where the harness cannot scroll,
  the reduced-motion rendering — in which everything is at its resolved state
  simultaneously — is the honest static substitute, and using it deliberately
  is different from getting it by accident.
- **The check names which page state it observed.** A review artifact that
  does not say where the page was scrolled to cannot be interpreted later, and
  the next person to see an empty image will assume the page is broken rather
  than the instrument.

## Reduced motion is the page's own static rendering

The reduced-motion path is not a degraded mode to be tested last. It is the
page rendered as a static composition — every station at its peak, nothing
depending on position — and that is precisely what print, export, capture and
the no-script reader all need. Building it well means four of the five
never-scrolling readers are served by one code path that a reader can actually
switch on and look at.

Which is also the cheapest way to keep it honest: a path only machines
exercise decays. A path a human can enable with one preference and see with
their own eyes does not.

## When not to use this

Nothing here is optional on a published explanatory page. The scope limit is
elsewhere: a surface **behind authentication**, whose content no crawler will
index, no link preview will summarize and no anonymous reader will encounter,
loses the first obligation and keeps every other one. Print, capture, reduced
motion and script failure are not properties of being public.

## What this technique refuses

- Station content mounted on scroll approach.
- Content removed from the accessibility tree until a scroll position.
- A resting state that is invisible without script.
- A served frame that is the gesture's entry state rather than its resolved
  one.
- Markup branched on the motion preference, the viewport or the scroll
  position.
- A page whose served document does not contain its own argument.
- A whole-page capture taken at scroll zero and treated as a picture of the
  page.
- An accessibility result reported without the scroll position it was taken
  at.
