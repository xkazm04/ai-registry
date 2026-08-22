---
layer: technique
type: technique
subject: lazy-section-addressability
technique: external-anchor-vs-internal-id
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [naming a new addressable section, renaming or restructuring a section that outside links point at, deciding whether the scroll tracker and the deep link may share one identifier]
---

# External anchor versus internal id

A page of named locations has two populations of consumers, and they want
opposite things from a name. The world outside wants a name that never
changes. The design inside wants a name it can change whenever the design
does. One string cannot serve both, and the failure of trying is silent in
both directions.

So the standard keeps two namespaces, with two owners and two change rules.

## The external address: owned by history

The external address is the name that has escaped. It is in URLs, in links
from other pages of the same product, in support replies, in release notes,
in third-party write-ups, in indexes built by machines the product does not
control. Its properties follow from that:

- **Stable past the lifetime of the design.** The section it names may be
  rewritten, re-laid-out, merged with a neighbour, or moved up the page; none
  of that is a reason to rename the address. The address names *the subject
  matter of the location*, not its construction.
- **Human-legible and hand-typable.** A short lowercase phrase a person can
  read in a URL and guess the meaning of. Never a generated hash, never a
  build-derived identifier, never anything containing a version — each of
  those changes on a rebuild, which is the one thing an address may not do.
- **Minted once and never reused for a different location.** A recycled
  address is worse than a dead one: a dead address lands the reader at the
  top of the page, where they can look around; a recycled address lands them
  confidently in the wrong place, and they have no signal that anything went
  wrong.
- **Retired with an alias, not deleted.** When an address genuinely must
  change, the old name keeps resolving — mapped to the new location at the
  page's single resolution point. The alias costs one line and it is the
  entire difference between "we restructured the page" and "we broke every
  link anyone ever shared."

## The internal handle: owned by the current design

The internal handle is what the page's own machinery holds: the key a scroll
tracker uses to say which location is current, the target a coaching step
spotlights, the node a measurement reads. It never leaves the page. It may
change in the same commit as the markup it names, and nothing outside notices
because nothing outside ever saw it.

Because it is private, it may also be *finer* than the address. An external
address names a section; an internal handle may name the specific control
inside that section that a step needs to point at. That asymmetry is the
reason the two namespaces are not merely a stability precaution — they
describe different granularities of the same page.

## One declaration, many consumers

Both namespaces live in one declared list — the page's addressable
locations, each with its external address, its internal handle, and its
human label — and every consumer reads from that list
([law: one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
The in-page navigation renders from it. The scroll tracker's map is built
from it. Coaching steps and calls to action reference entries in it by key.

The alternative is what pages accumulate by default: the navigation holds one
hand-written list of strings, the tracker holds another, the coaching script
holds a third, and the markup holds the fourth. Four copies of one vocabulary,
each correct on the day it was written. They do not drift gradually — they
drift all at once, on the edit where somebody renames a section and updates
the two lists they happened to know about.

## The decision rules

- **When a name will appear in a URL, it is an external address.** Treat it
  as published from that moment, even before anyone has shared it.
- **When a name exists only so the page can find its own element, it is an
  internal handle.** Never publish it; never let a link resolve against it,
  because the first link that does converts it into an external address
  without anyone deciding to.
- **When the design changes and the subject matter does not, only the handle
  changes.** When the subject matter changes, the address changes and the old
  address becomes an alias.
- **When two locations want the same address, neither gets it.** Resolve the
  collision in the declaration, where it is one edit, not in the markup, where
  the resolution order decides the winner arbitrarily.
- **When an address is retired, its alias outlives the release that retired
  it.** State the window if the product needs one; the default is forever,
  because the cost of keeping an alias does not grow.

## The failure this prevents, stated plainly

A section is restructured. Its identifier was serving both duties, so it
changes. Nothing fails at build time — an identifier is just a string, and
the page renders fine. The in-page navigation, updated in the same commit,
also works. What breaks is every link created before that commit: they still
navigate to the page, land at the top, and look to the reader like the
content was removed. The people who notice are outside the team, months
later, and the report they file is "your documentation link is broken," which
nobody can trace back to a layout refactor.

## When not to use this

- **A page nobody links into.** If no address has ever appeared in a URL,
  there is one namespace and this technique is ceremony. Adopt it the moment
  the first address is published — including internally, because internal
  links outlive the teams that made them.
- **Generated content whose addresses are derived from the content itself** —
  headings in a rendered document, for instance. There the address is a
  function of the text, the stability contract belongs to the text, and the
  right move is to make that derivation deterministic and documented rather
  than to layer a second namespace over it.

## What this technique refuses

- One identifier serving both an external link and an internal tracker.
- An external address containing a hash, a version, or anything a rebuild can
  change.
- Reusing a retired address for a different location.
- A rename that ships without an alias.
- A second hand-written list of location names anywhere on the page.
