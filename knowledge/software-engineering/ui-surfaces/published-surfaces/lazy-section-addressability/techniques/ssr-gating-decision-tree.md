---
layer: technique
type: technique
subject: lazy-section-addressability
technique: ssr-gating-decision-tree
status: forged
laws: [gate-sees-target]
shared_with: []
use_when: [a subtree breaks server rendering and someone proposes making it client-only, deciding whether a section may skip pre-rendering, auditing how much of a page exists before script runs]
---

# The server-rendering gating decision tree

Somewhere in every long page there is a subtree that will not render ahead of
time. It reads a measurement that only exists in a browser, or it drives an
animation engine that assumes a live document, or it is simply enormous and
rendering it twice buys nothing. Making it client-only is the correct fix, it
takes one line, and it works immediately.

That is the whole problem. The escape hatch is cheap, effective, and
invisible on the machine of the person using it, so absent a written rule the
share of the page that exists before script runs falls in one direction only.
Two years on, the page's meaning is a script tag, and nobody made that
decision — a hundred people each made a defensible small one.

The remedy is a tree with the answer written down, applied per section, and
audited against what the page actually emits.

## The default

**Server-rendered.** The burden of proof is on the exception, and the
exception names its reason at the section, in a comment or an argument a
reviewer can read. A section marked client-only with no stated reason is
reverted to the default in review, not because the choice is necessarily
wrong but because an unstated choice cannot be re-evaluated when the section
changes.

## The subtrees that may be client-only

- **Genuine browser-only dependence.** The subtree touches capabilities with
  no server-side counterpart — live measurement of element geometry, device
  or storage access, media capture — at a point in its lifecycle that runs
  during rendering rather than after it. Note the qualifier: needing such a
  capability *after* mount is not a reason, because that code never runs
  ahead of time anyway.
- **Heavy motion or visualization subtrees below the fold.** Their
  pre-rendered output is discarded and replaced within a frame of arriving,
  so producing it costs time on both sides and buys nothing. The saving is
  real only when the subtree is genuinely heavy; "it has a transition on it"
  is not this case.
- **Decoration the reader can lose.** A subtree carrying no information — an
  ambient background, a parallax layer, a decorative flourish — whose absence
  in a non-executing reader is not a loss.
- **Third-party embeds that refuse to render ahead of time.** Not a choice so
  much as a constraint; record it as such so it is revisited when the embed
  is replaced.

## The subtrees that may not

- **Anything above the fold.** Its absence before script runs is a visible
  blank on first paint and usually the page's largest paint element; making
  it client-only trades a rendering cost for a perceived-speed cost several
  times larger.
- **Anything carrying the page's meaning to a non-executing reader.** Search
  crawlers, link unfurls, reader modes, text extractors, and archival
  captures all see the pre-script document. A page whose value proposition,
  pricing, or documentation is client-only is a page that says nothing to any
  of them.
- **Anything a reader must still see when script fails.** Scripts fail — a
  blocked domain, an aborted download, a corporate proxy. Legal notices,
  contact routes, and the page's core claim survive that; ornament does not
  have to.
- **The address wrappers, always.** They are the addresses, and an address
  that only exists after script runs is not an address. This is the one entry
  in the tree with no exceptions: whatever the section does, its wrapper is
  rendered ahead of time.

## Changing a section's mode is an address-space change

The entry in this tree that surprises people: flipping a section from
server-rendered to client-only silently removes every identifier inside it
from the pre-script document. If any of those identifiers was ever published —
and on a long page some of them always were — the flip breaks external links
in a way that produces no error, no failed build, and no visible difference to
anyone testing on a warm machine. Nothing in the change resembles a link
edit, so nothing in the review will resemble a link review.

This is precisely why every addressed location carries a wrapper whether or
not it currently needs one. With the wrapper in place, render mode becomes a
pure performance decision and can be revisited freely; without it, the mode
setting is quietly part of the page's public contract, and the person who
changes it will not know that.

## The decision is recorded, not remembered

Each section's mode lives with the section, in one consistent form, with the
reason attached — not scattered across the composition, and not implied by
which import style someone happened to use. Two properties follow:

- **A reviewer can see the whole page's posture in one place**, which is the
  only way anyone ever notices that eleven of fourteen sections are
  client-only.
- **The reason is re-readable when the section changes.** "Client-only
  because it measures its container" stops being true when the measurement
  moves into an effect, and only a written reason gives a future contributor
  a reason to look.

## Audit against what is emitted, not against the configuration

The mode declared next to a section is a claim about the output. The output
is the thing that matters, and it can diverge — a section declared
server-rendered whose entire body is behind a client-only check renders an
empty shell ahead of time and satisfies every configuration reading of the
rule ([law: a gate must see its target](../../../../_laws.md#gate-sees-target)).

So the audit reads the pre-script document itself: fetch the page as a
non-executing reader would, and check that the content the tree says must be
there is there. Do it on a schedule the page's change rate justifies, and
always after a change to how the page is composed. The cheap version of the
same check, worth doing by hand at least once per significant change, is to
load the page with scripting disabled and read what is left — the result is
usually a surprise the first time.

## Reserved geometry is part of the bargain

A client-only section that occupies zero space before it mounts pays for its
rendering saving with layout instability: content below it sits too high on
first paint and is shoved down when it arrives. Every client-only subtree
declares an approximate extent, for the same reason every address wrapper
does. A page that is fast to first paint and jumps twice while settling is
not a fast page; it is a page that has moved its cost somewhere the metrics
were not looking.

The reserved space may also carry a *name* — a short label, in the
pre-script markup, saying which section is coming. It costs nothing, it gives
a non-executing reader a table of contents instead of a column of blank
rectangles, and it makes the page's structure legible in a raw fetch. Keep it
to a label. A reserved region stuffed with a plausible-looking copy of the
content is a different thing entirely: it is a claim to readers and machines
that the content is present, and it will be wrong the moment the real section
changes.

## When not to use this

- **Applications behind a login with no crawler, no unfurl, and no
  non-executing reader.** There the tree's second half largely evaporates and
  the honest rule may be "client-only by default" — which is still a written
  rule, still applied per section, and still exempts the address wrappers.
- **A page composed entirely at build time from static content.** The
  question does not arise; the whole page is pre-rendered by construction.

## What this technique refuses

- A client-only section with no recorded reason.
- Any address wrapper that exists only after script runs.
- An above-the-fold subtree excused because it renders quickly on the
  author's machine.
- An audit that reads the configuration instead of the emitted document.
- A client-only subtree that reserves no space.
