---
layer: technique
type: technique
subject: narrative-scroll-surface
technique: sequence-as-spine
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [an explanatory page reads as a stack of unrelated bands, deciding whether a set of sections is really a sequence, numbering the steps of a walkthrough, choosing what holds a long explanatory page together]
---

# Sequence as spine

When an explanatory page's content is a sequence, the page renders that
sequence as **one continuous visual object** — a drawn line, a numbered
ladder, a rail — and hangs the stations off it. The spine is not ornament. It
is the thing the reader follows so that they never have to decide how to read
the page.

## First, decide whether there is a sequence at all

The technique is wrong more often than it is missing, because a spine is
attractive and can be drawn onto anything. Apply the test before drawing:

**A sequence exists when reordering two elements changes the meaning.** Steps
of a process, stages of a lifecycle, the chapters of a story, before/during/
after — swap two and the content becomes false. That is a sequence and it
earns a spine.

**A set exists when reordering changes nothing but emphasis.** Parallel
features, unranked benefits, three audiences, a comparison of options — these
have no true order, and a spine invents one. The reader will read the invented
order as meaning, conclude that the first item is the most important or the
earliest, and be wrong. Give a set a grid, not a spine; a grid says "these are
peers" as clearly as a spine says "these follow".

**A hybrid is the common real case**, and it is resolved by nesting, not by
compromise: the page's top level is the sequence, and a station may internally
hold a set. A spine that runs through both levels is a spine that has stopped
meaning anything.

## The station triad

Each station on the spine carries exactly three things, in this order, and the
discipline is that none of them may absorb another's job:

- **An eyebrow** — two or three words naming the stage. Its job is orientation
  at a glance for a reader who is scrolling, not reading. It is a label, not a
  sentence, and it never carries the claim.
- **A claim** — one sentence, in display type, that a reader could quote back.
  This is what the station asserts. If a station has two claims it is two
  stations, and the second one is being smuggled through at half volume.
- **Evidence** — the illustration, the artifact, the concrete thing that makes
  the claim credible. What qualifies is
  [illustration-carries-the-claim](./illustration-carries-the-claim.md)'s
  question; that a station *has* one is this technique's.

A station missing its evidence is a heading with a paragraph under it, which
is a band. A station missing its claim is decoration with a caption. The triad
is the smallest unit that reads as a step rather than a strip.

Body copy is optional and expensive. A station whose claim needs three
supporting paragraphs is a station whose claim is not a claim; the paragraphs
belong on a document surface the station routes to.

## Alternation is rhythm, not variety

Stations alternate sides of the spine — evidence left and claim right, then
the reverse. Two reasons, and the weaker one is the one usually given:

The weak reason is visual interest. The strong reason is that alternation
makes the spine *visible as a continuous thing*. When every station sits on
the same side, the spine is a margin rule and the eye stops tracking it; when
stations alternate, the reader's eye crosses the spine at every station and
the line is re-established as the page's structure each time. The alternation
is what converts a decorative line into a followed path.

Two constraints on it. **The alternation is derived from the station's
position, not authored per station** — an author toggling a side flag will
eventually produce two stations on the same side and a page that looks broken
for a reason nobody can find. And **alternation collapses on a narrow
viewport**: at one column there are no sides, the spine moves to one edge or
disappears, and every station reads in the same order. A page that keeps
alternating at phone width produces a reading order that zigzags between
columns, which is exactly the orientation tax the surface exists to avoid.

## Numbering is derived from page order — never parsed back out of copy

Stations are numbered, and this is the single most-broken rule in the
technique.

The number is a *derived property of the station's position in the page's
composition*. It is computed once, where the ordered list of stations is
declared, and handed to everything that needs it: the station's own marker,
the index entry, an "of N" readout, a deep link's label
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

What happens instead, reliably, is that the number gets written into the
authored copy — "1. Describe the role" as an eyebrow, a title beginning with
"Step 2" — and then some consumer needs the number as a number and extracts it
back out with a pattern match. That inversion has three failure modes and all
three are quiet:

- **Insertion.** A new station goes in third; every subsequent authored number
  is now wrong, in copy, in four locales, with no gate that can see it.
- **Extraction ambiguity.** The pattern that pulls a leading numeral out of a
  title also fires on a title that legitimately begins with a year, a version,
  or a quantity. The station is numbered 2026.
- **Translation.** A localized title does not carry the numeral in the same
  position, or at all, and the extractor returns nothing for every language
  but the source one. The page silently loses its numbering everywhere except
  where the author looked.

The rule: **copy never contains the number, and nothing ever reads a number
out of copy.** If the design wants "Step 2" visible, the composition supplies
the numeral and the copy supplies only the words.

There is one survivable exception and it is worth stating because editorial
teams ask for it: an eyebrow that reads naturally in every language sometimes
has to carry its own numeral. That is admissible only under two conditions
together. **Nothing reads it back out** — every consumer still takes the
number from page order, so a mistyped numeral is a cosmetic defect in one
place rather than a wrong address everywhere. And **a check asserts the
authored numeral equals the derived position, in every language**, which
converts a class of silent drift into a failing build. Without both, the
exception is just the failure with a justification attached.

The same discipline covers any label *derived* from authored copy — a short
index label cut out of a longer heading, say. Deriving it beats maintaining a
second set of strings, because a navigation entry and the heading it points at
must not be able to disagree. But the derivation depends on the copy's
*shape*, and shape is the first thing a translation loses: a separator
dropped in one language, a heading rewritten without the part being cut. So a
derivation over authored text states its fallback — the whole string rather
than an empty one — and, where it matters, a check pins the shape the
derivation needs.

The number is what the reader sees. It is not the station's **identity**. A
station's identity — the handle a deep link uses, the key an index entry
carries, the address a spotlight points at — is minted once and stays with the
station when a new one is inserted above it
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
page that identifies its stations by their displayed number has published a
set of addresses that all shift by one the next time the story gains a
chapter.

## The spine is drawn once, at page scale

The spine is a property of the page, not a decoration each station brings with
it. Rendered per station — a little connector above and below each one — it
acquires a seam at every join, and the seams are visible precisely when the
stations have unequal heights, which they always do.

Drawn at page scale, it also becomes the natural carrier of *progress*: the
portion of the spine above the reading position can be painted differently
from the portion below, which gives the reader a distance readout that costs
no space and that they never have to interpret. That readout is scroll-bound
and belongs to [scroll-bound-progression](./scroll-bound-progression.md); what
this technique contributes is that there is one line for it to run along.

The spine's geometry is expensive to make responsive and cheap to get wrong.
Two rules keep it manageable: its horizontal position is one number the
stations also reference, so nothing hand-aligns to it; and it is allowed to
disappear entirely below a stated width rather than being squeezed, because a
spine with no room to have sides is a vertical line doing nothing.

**The spine's path is computed from the station list, never hand-plotted.**
This is the rule that a hand-drawn spine breaks the first time the sequence
changes length, and it breaks it invisibly: a path authored as a fixed set of
segments to match seven stations still renders perfectly when an eighth
station is added, with the eighth station hanging off the end of a
seven-station line. Nothing in the change that added the station touched the
path, so nothing in the review could see it; the defect exists only on the
rendered page. Derive each station's position on the spine from its index and
the station count, and the geometry cannot fall out of step with the content.

The same reasoning governs every other per-station structural attribute — a
colour, an accent, a side. Hold them in a **total map keyed by the station
vocabulary**, not in a parallel list, so that adding a station to the sequence
is a hard failure at the place the attribute is missing rather than a silent
truncation at whichever list ran out first.

## When not to use this

- **Content that is a set**, as above. The commonest misapplication.
- **Sequences of more than roughly eight stations.** A spine is a promise that
  the reader can reach the end; past a certain length the promise reads as a
  threat, and the page needs either fewer stations or a different structure
  entirely. If the sequence genuinely has twenty steps, the page is a document
  and belongs on a reading surface with a contents panel.
- **Two stations.** A spine between two things is a line, and the reader
  reads the two things as a comparison whatever the line does.
- **Pages whose reader arrived with a task.** The spine's whole value is that
  it removes a decision from a reader who did not want to make one. A reader
  who came to accomplish something wants the decision back.

## What this technique refuses

- A spine over content whose order is not real.
- A station side chosen by hand rather than derived from position.
- Any code that reads a station's number back out of authored copy.
- A station address derived from the station's displayed number or list index.
- A spine assembled from per-station connectors.
- A spine path plotted by hand against a station count.
- Per-station attributes held in a list parallel to the station list.
- Two claims in one station.
