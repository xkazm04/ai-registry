---
layer: technique
type: technique
subject: lazy-section-addressability
technique: always-present-anchor-wrappers
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [adding a code-split or viewport-mounted section to a long page, a deep link lands at the top instead of at its section, unmounted sections collapse the page into one screen]
---

# Always-present anchor wrappers

Every addressable location on a lazily-assembled page gets a wrapper that
renders unconditionally, from the first paint, forever — and the wrapper, not
the section, carries the address. The section mounts inside it whenever it
gets around to it.

The shape is small. What it buys is that the page's address space stops being
a function of what has loaded.

## What the wrapper is

A wrapper is four things and nothing else:

- **The address.** The identifier an outside link resolves against, in the
  form the platform's own navigation understands, plus whatever machine-facing
  attribute the page's internal consumers scan for.
- **Reserved geometry.** A minimum extent approximating what the section will
  occupy, so the page's scroll length is roughly right before anything mounts.
- **A focus target.** Programmatically focusable, so a jump can move focus and
  not merely scroll.
- **The lazy child.** The section itself, mounted on whatever schedule it
  likes.

It is not a styling element. It carries no spacing, no background, no
alignment the design depends on — because the moment it does, it is part of
the layout, and the next person restructuring the layout will feel entitled to
remove it. A wrapper that looks purely structural survives refactors; a
wrapper that is quietly holding the section's top margin does not.

## The rules that make it work

**The page renders the wrapper; the section does not.** This is the rule
everything else rests on and the one most often inverted. If the section
declares its own wrapper, the wrapper arrives with the section — which is to
say, it arrives late, exactly when it was needed early. Ownership sits with
the page-level composition that knows the full ordered list of locations,
because that is the only place with the knowledge to render all of them
before any of them has loaded.

**Unconditional means unconditional.** Not behind a loaded flag, not behind a
data-present check, not behind a viewport predicate, not behind an
entitlement. A section with nothing to show still has an address; a reader who
follows a link to it should land at a section that says it is empty, not
somewhere else on the page with no explanation. If a location genuinely
ceases to exist for a class of reader, that is a declared removal from the
address space with a stated destination for its old links — not a wrapper
that silently fails to render.

**The identity is minted once, at the page level, and carried.** Sections
mount, unmount, and re-mount as the reader scrolls; a scroll tracker or a
coaching overlay may re-resolve the same address several times in one
session against several different element instances
([law: identity survives reuse](../../../../_laws.md#identity-survives-reuse)).
The wrapper is the stable end of that relationship. Nothing may derive the
address from the section's position in a list, from a render counter, or from
anything else that changes when a section is inserted above it.

**The section's own identifier still exists, and is a different thing.** The
inner identifier names a finer target — a heading, a control, the element a
coaching step points at — and it is legitimately absent until the section
mounts. Consumers treat it as the *refinement*, resolved after the wrapper
has been reached and the mount has happened. Deleting it in the enthusiasm of
adopting wrappers loses the precision that made the finer target worth
pointing at.

The two handles are not interchangeable, and the asymmetry is worth stating
because it looks like an inconsistency until you see it: **travelling
resolves the wrapper first, tracking resolves the inner element only.** A
jump wants whichever handle exists, and the wrapper always does. A tracker
asking "which location is the reader in" wants the section's true geometry,
and a wrapper holding reserved space is not that — a location whose content
has never mounted is legitimately never the current one. Same address space,
two resolution orders, each correct for its direction.

**Every addressed location gets a wrapper, regardless of how it currently
renders.** The temptation is to skip the wrapper for sections that are
server-rendered today, since their own identifier is in the document from the
first byte and works fine. It works fine until someone changes that section's
render mode for an unrelated reason — a new dependency, a build-time
failure — and discovers months later that a render-mode setting was quietly
load-bearing for every external link into that section. Uniformity here is
not tidiness; it is what decouples the address space from the rendering
decision.

**Reserved height is an estimate with a correction.** The estimate never
matches; the discipline is that it is close enough to keep the scroll bar
honest and that every consumer re-asserts its position once the real content
lands. A wrapper with no reserved extent produces the collapsed-page failure —
all locations near the top, several sections mounting simultaneously because
all of them are suddenly near the viewport, and the reading position shoved
downward as each one inflates.

**The landing offset accounts for sticky chrome.** The wrapper declares the
offset its own landing needs rather than leaving each consumer to subtract a
header height it will get wrong differently. One page, one answer for how far
below the top of the viewport a landed section sits — and the offset belongs
on *every* element an address can resolve to, wrapper and inner alike.
Putting it only on the inner section produces the subtle version of this bug:
links that happen to resolve to the wrapper land flush under the header,
links that resolve to the section land correctly, and nobody connects the two
observations.

**The reserved-space stub renders identically before and after the page
becomes interactive.** Where the platform reconciles server output against the
first client render, a stub differing between the two produces a mismatch, and
recovery from a mismatch can discard and re-create the very subtree the
address depends on. So the stub is computed from nothing
environment-specific — no viewport measurement, no stored preference, no
clock — and the decision to reveal the real content is made strictly after
that first render.

**Mounting is monotonic.** Once a section has mounted it stays mounted for the
life of the page, and the approach gate stops watching. The relationship
between an address and its content then only ever improves, so no consumer
needs to handle a target that resolved once and vanished. A gate that unmounts
sections as they leave the viewport saves memory and buys back every race this
subject exists to eliminate.

## Where the wrapper is not enough

The wrapper guarantees the address resolves. It does not guarantee that what
the reader sees after landing is the section — that is the mounting side, and
it belongs to the loading discipline of whatever hosts the page. Concretely:
a wrapper with a reserved extent and no content is a correct address and a
poor arrival. The section still owes the reader a placeholder that looks like
what is coming, and it still owes an honest failure state when its code will
not load.

Two more limits, so the wrapper is not asked to solve them: it cannot make a
name unique — two locations wanting one address is a vocabulary problem,
resolved where the vocabulary is declared — and it cannot decide how long a
consumer waits for the inner target, which is the consumer's protocol.

## When not to use this

- **Pages with no deferred content.** If every section is in the document at
  first paint, the wrapper is one extra element between the address and the
  content, and the section may carry its address directly. Adopt wrappers when
  the page adopts deferral, in the same change — not before, and never after,
  because "after" means shipping the broken interval.
- **Locations that are not addressed.** A page with one address and no
  in-page navigation does not need an address space. Wrapping every block on
  general principle produces a vocabulary nobody maintains, which is worse
  than no vocabulary at all.
- **Content whose position is genuinely dynamic** — a virtualized list, a
  reordering feed. There the address is a data identity resolved by scrolling
  the collection, not a fixed location on the page, and this technique's
  static wrapper is the wrong instrument.

## What this technique refuses

- A wrapper rendered by the lazily-loaded section it wraps.
- Any condition, anywhere, on whether the wrapper renders.
- An address derived from list position, render order, or anything else that
  changes when a neighbour is inserted.
- A zero-extent wrapper on a page whose sections mount on approach.
- A wrapper that has acquired styling responsibilities and can therefore be
  argued away in a layout review.
