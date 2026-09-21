---
layer: technique
type: technique
subject: narrative-scroll-surface
technique: no-orientation-tax
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [adding a side index to an explanatory page, deciding whether navigation entries may be dots, a deep link into a step lands under the header, an explanatory page offers the reader a choice of entry points]
---

# No orientation tax

The orientation tax is the attention a reader spends working out **how to read
this page** before they have read any of it. A page whose reader arrived
without an intention cannot levy it. Every decision the page delegates is a
decision the reader may answer by leaving, and leaving costs them nothing.

This technique is the set of rules that keep the tax at zero while still
letting the page have an index, deep links and a small-viewport form.

## One reading direction, always available, never chosen

The page has exactly one path through it, and scrolling is how you take it. A
reader who does nothing but scroll receives the whole argument in the right
order. Everything else the page offers is a shortcut for a reader who has
already decided they want one.

What this rules out, all of which are added with good intentions:

- **A choice of entry points.** "Start here if you are an engineer, here if
  you are a buyer" asks a reader to classify themselves before they know what
  the categories buy them, and a reader who cannot classify themselves leaves.
- **Two columns that could be read in either order.** The page has just handed
  the reader a layout puzzle. Side-by-side is for *comparison*, where the
  parallel is the content; it is not for continuation.
- **A "jump to what you care about" control at the top.** The reader does not
  yet know which part they care about. That is what the page is for.
- **Interaction as a precondition.** A station whose meaning is behind a tab,
  a toggle, or a hover has moved its content behind a decision. A reader
  scrolling past sees an empty box and concludes there was nothing there.

## The index is a readout first and a navigation second

If the page has an index — a rail of stations down one edge — its primary job
is to tell the reader **where they are**, and only incidentally to take them
somewhere. That inversion decides every detail below it.

A reader being told where they are is being reassured: the page is finite, it
has this many parts, you are on this one, there are that many left. A reader
being asked where to go is being taxed. The same component does both; which
one it is doing is a matter of how it is designed, not of what it is called.

**The current entry is the readout, and "none yet" is a real state.** Before
the reader reaches the first station — a tall hero, an introduction — no
station is current, and the index must show that rather than pre-highlighting
the first one ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
A rail that lights entry one on arrival is telling the reader they are
somewhere they have not been, and the highlight then does not move when they
genuinely reach it — so the one moment the readout had something to say is the
one moment it says nothing.

## Legible at rest, or it is not navigation

**Every entry in the index is readable without any interaction.** This is the
rule that most often loses to visual taste, and the argument for it is not
aesthetic:

A destination you cannot read is not a destination. A column of bare dots
offers no information about where any dot goes, so a reader cannot choose one;
they can only guess, land somewhere unexpected, and lose their place. What a
dot column actually is, is a *progress indicator* — it says how many parts
there are and which one you are on, which is genuinely useful — dressed as a
navigation. Ship it as what it is, or make the entries readable.

Labels that appear on hover do not satisfy this. Hover is not available to a
touch reader at all, it requires the reader to already be pointing at the
thing they are trying to identify, and it makes the index a place where you
have to hunt. A label revealed on hover is an answer to a question the reader
had to ask by aiming.

**If the index does expand — on hover, on focus, on proximity — it reserves
its expanded width at rest.** The expansion changes only what is painted
inside the reserved band, never the band's own footprint. An index that grows
its width on interaction pushes the page's content sideways under the reader's
eye, and it does so at the exact moment the reader's pointer is near the edge
of the page, which is also the moment they are most likely to be reading. The
reserved width is computed from the widest label the index can ever hold, not
from the widest one it holds today, or the first long station title added
later reintroduces the reflow.

The same rule applied at the smallest scale is what makes the active/inactive
distinction safe: **carry it in colour and opacity only.** A distinction
carried by weight, size or added ornament changes the entry's footprint, so
the index reflows as the reader scrolls past every station — a page that
twitches at the edge of vision for the entire read.

**The reserved band is a claim on the page's horizontal space, and the page's
own content must be laid out against it.** A pinned index sits above the
content rather than beside it, so nothing in the layout knows it is there; a
centred line of text long enough to reach that band runs underneath it, and
the collision appears only past a certain string length. Which means it
appears first in whichever language translates longest, on whichever viewport
is narrowest among those where the index is shown — a combination nobody
browses by accident. The clearance is measured, at the narrowest viewport that
still renders the index, against the longest string the page can hold, and the
measurement is written down beside the constraint it justifies.

## The station list is one vocabulary

The index's entries, the spine's stations, the deep-link addresses, the
you-are-here computation and the small-viewport substitute are all views of
one ordered list of stations, declared once
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

The alternative — an index with its own hand-maintained list of labels and
targets — is a page where adding a station leaves the index one short and
nothing fails. The index still renders, still highlights, still navigates; it
is simply describing a page that no longer exists. Nothing about the surface
makes that visible, and the people who edit the content are not the people who
read the console.

The index's labels are usually *not* the station's claim: a claim is a
sentence and an index needs two or three words. That is a legitimate second
string, and it belongs on the station's own declaration next to the claim, not
in the index's file. One list, several fields.

## Deep links land on a station, under the chrome, with focus

A link into a station is a link somebody else wrote — in a message, in a
support reply, in a search result — and it is used at the least forgiving
moment: cold, on someone else's device.

Three obligations, and the third is the one that is usually missing:

- **It lands on the station**, not near it. The station's identity is its
  address, minted with the station and stable across insertion.
- **The landing accounts for fixed chrome.** A page with a pinned header must
  place the station below it, and the number that expresses that is the same
  offset budget every other pinned element on the page withdraws from. This is
  not this subject's number to invent; it is the reading surface's, and a page
  that computes a second one gets two answers.
- **The landing moves focus.** A reader who activates an index entry and
  receives only a scroll has their focus still in the index. The visual reader
  is at the station; everyone else is reading a list. The station takes
  programmatic focus without becoming a tab stop.

A deep link also arrives at a page whose scroll-bound state is undefined until
the browser has finished placing it. The station must be readable at that
instant — which is the reveal rule's job, and the reason it is not optional
here: a deep link into a station that reveals on scroll lands on nothing.

Two more arrival mechanics, both of which only misbehave for a reader who did
not start at the top:

- **Chrome whose visibility depends on scroll position reads that position on
  its very first render.** An index that appears once the reader is past the
  hero must consult the live scroll position, not a value some later effect
  mirrors into place. A deep link, or a restored scroll position on a reload,
  lands the reader mid-page — and a mirrored value paints the index hidden and
  then pops it in a moment later, an entrance played at a reader who had
  already arrived.
- **A jump replaces the reader's position in history; it does not add to
  it.** The index is a scrubber over one page, not a trail of visited
  destinations. Accumulating an entry per jump means a reader who used the
  index four times needs five back-presses to leave the page and return to
  wherever they came from — so the index has made the page harder to escape,
  which is the orientation tax collected on the way out. Replace the entry so
  the location stays shareable and the back button still means "leave".

## Where the rail cannot fit, the destinations still exist

Below the width at which a side index is viable, it is removed — not
compressed into unreadable stubs, which reintroduces exactly the failure above.

Removal is not deletion of the capability. The same ordered station list is
offered in a form the narrow viewport can hold: a scrollable horizontal strip
of readable labels, a disclosure listing them, or — legitimately, and often
the right answer — nothing at all, on the grounds that a narrow viewport's
reader scrolls anyway and the page is designed to be consumable by scrolling.
What is not acceptable is silently losing the you-are-here readout on the
viewport class where readers are least able to tell how long a page is.

Whichever form is chosen, it is chosen deliberately and stated, because "the
rail disappears below this width" is otherwise discovered by a reader rather
than decided by an author.

## When not to use this

- **Surfaces where the reader has a task.** A tool's user wants control and
  will pay an orientation cost once to get it. Removing their choices is the
  same mistake in the other direction.
- **Documents.** A reader who wants the content should be offered a contents
  panel and the ability to jump. The reading surface owns that case and its
  index is a genuine navigation, not a readout.
- **Pages with two or three stations.** An index over three entries is chrome
  that describes something the reader can already see all of.

## What this technique refuses

- A decision on the first screen.
- Index entries that cannot be read without hovering, focusing or pointing.
- An index that changes the page's layout when it expands.
- A second list of station labels maintained beside the real one.
- An active-state treatment that changes an entry's footprint.
- A pinned index whose reserved band the page's own content was never measured
  against.
- A jump that pushes a history entry.
- A current-station highlight that shows entry one before the reader has
  reached it.
- A deep link that scrolls without moving focus, or that lands under a pinned
  header.
- Content whose only route is an interaction the scrolling reader will not
  perform.
