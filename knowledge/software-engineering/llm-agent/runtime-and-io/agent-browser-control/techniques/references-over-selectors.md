---
layer: technique
type: technique
subject: agent-browser-control
technique: references-over-selectors
status: forged
laws: [failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [an agent writes a selector and clicks the wrong element, an action waits its full timeout on an element that is gone, a page rewrites itself without navigating and the agent's references are stale, custom components are clickable but absent from the accessibility tree]
---

# References over selectors

The agent must name an element to act on it, and the naming is done by the
runtime, not the agent. A snapshot walks the page's accessibility tree,
assigns each node a short sequential reference, and stores a locator for
each reference in the daemon's memory. The agent reads the annotated tree —
one line per node, reference, role, accessible name — and issues actions
against references. It never composes a selector, because an agent composing
a selector from a text dump of markup is guessing, and the confident wrong
guess clicks the wrong element.

## The locator lives outside the page

The reference table is a map from reference to a locator built from what the
accessibility tree said: the role, the accessible name, and an index for
disambiguation when several nodes share both. The locator is **lazy** — it
describes how to find the element and is resolved against the live page at
action time, not a handle captured at snapshot time. That is what lets a
reference survive a re-render that replaces the element's node with an
equivalent one, and what makes staleness a *detectable* condition rather than
a dangling pointer.

The rejected alternative is to write the references into the page as
attributes. It is the first thing everyone builds, and it fails on three
fronts that the agent cannot see: a content security policy on a production
site blocks the injection; a framework's reconciliation strips the attribute on
its next render; and a shadow root is unreachable from outside. Each failure is
silent from the agent's side — the attribute is simply not there — and the
agent has no way to know whether the element vanished or the marker did. A
locator held outside the document touches none of that.

The tree the snapshot walks is the browser's own accessibility model, and the
accessible name is computed by a public specification: an explicit labelling
reference first, then an explicit label attribute, then the host language's
native label, then name-from-content for the roles that permit it, then the
tooltip attribute as a last resort — and a hidden node contributes nothing
unless explicitly referenced. Two consequences for the reference design
follow. A node whose role prohibits name-from-content will often be unnamed,
so the locator for it degrades to role-only and the disambiguating index does
the work. And the index must be counted against **the same population the
locator will match**: if the snapshot filters to interactive roles before
counting, but the locator matches every node of that role in the document, the
index is wrong and the reference resolves to a sibling. Count on the
unfiltered walk, then filter what is shown.

Disambiguation by role, name and index is identity minted once per snapshot
and carried into every action until the next snapshot
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); the
index is never recomputed at action time from a different traversal.

## References are cleared on navigation

After a navigation every locator in the table describes the previous page. A
reference used across that boundary must **fail loudly**. The dangerous
alternative is to let it resolve: the new page has a button with the same role
at the same index, the locator finds it, and the agent has clicked something
it never saw. So the table is cleared on main-frame navigation, and the same
clearing happens when a frame the references were scoped to detaches. A
cleared reference resolves to "not found — snapshot again", not to the nearest
match, and not to nothing
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Presence is checked before every use

Modern applications rewrite themselves without navigating — route transitions,
tab switches, modals — and none of those clear the table. A reference to a
node that has since been removed is stale while the table still holds it. The
driver's action on a missing element waits its full timeout, tens of seconds,
before failing with a message about the action rather than the element.

So **every resolution counts the locator's matches first**. Zero matches is a
millisecond failure whose message says what the reference *was* — its role and
accessible name — and what to run next. This is the single largest latency
win in the loop: a thirty-second wait becomes an immediate, self-explaining
failure. The presence check rides ahead of the driver's own actionability
checks (visible, stable across consecutive frames, enabled, receiving events)
and does not replace them; those still gate the action once the element is
known to exist.

More than one match is also a condition, not a success. When an unnamed node's
locator degrades to role-only and the document holds more nodes of that role
than the snapshot showed, the locator is ambiguous. For an action the driver's
strict mode refuses, and the message says so and points at a fresh snapshot;
for a read-only overlay the runtime may fall back to the first match, but
**every fallback is counted and reported**, never silent — a first-match
annotation that hides its ambiguity teaches the agent that a wrong box is the
right one.

## The second namespace

The accessibility tree is a model of semantics, and a great deal of the
modern web is interactive without being semantic: a division styled with a
pointer cursor, an element with a click handler, a custom tab index on a
container that a framework renders as a button. These are invisible in the
tree and therefore un-referenceable by the primary walk, which is exactly the
gap an agent falls into on a custom design system.

A second scan finds them by their interaction signals — cursor styling, an
attached handler, an explicit tab index — and assigns them references in a
**separate namespace** with its own prefix, listed under their own heading in
the snapshot output. The separation is deliberate: the agent must know that
these were found by heuristics, that their "name" is visible text rather than
a computed accessible name, and that the driver's semantic checks may not
apply to them. Merging the two namespaces would let a heuristic hit wear the
authority of a semantic one.

## Decision rules

- The runtime names elements; the agent acts on references and never composes
  a selector. Where a selector is accepted at all, the error path steers the
  agent back to references.
- Store locators outside the page; never inject markers into the document.
- Locator is role plus accessible name plus an index counted on the unfiltered
  walk; a name-less node is a role-only locator with an index.
- Clear the table on main-frame navigation and on scoped-frame detach; a
  cleared reference fails with "snapshot again", never resolves to a
  neighbour.
- Count matches before every use; zero is an immediate failure naming the
  element's former role and name; more than one refuses the action, and any
  read-side first-match fallback is counted and reported.
- Heuristically found interactive elements get a separate namespace and a
  separate heading.

## The boundary

[agent-addressable-ui](../../agent-addressable-ui/agent-addressable-ui.md)
stamps *source locations* into an interface the team builds, so a person can
hand an agent a file and line. This technique names *live elements* in a page
nobody on the team built, so the agent can act on them. The two meet at the
accessibility tree and part immediately: that subject discards it as "a role
and a name, which is not a location"; this one uses exactly a role and a name
because a location is not what an action needs.

## When not to use this

A page the team controls end to end, tested by a suite that already owns its
test identifiers, does not need runtime references — the identifiers are
stable by construction and cheaper than a snapshot per step. The technique
pays when the page is arbitrary, the reader is an agent, and the cost of a
wrong click is higher than the cost of a snapshot.
