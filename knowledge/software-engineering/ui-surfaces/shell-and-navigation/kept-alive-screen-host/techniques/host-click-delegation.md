---
layer: technique
type: technique
subject: kept-alive-screen-host
technique: host-click-delegation
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [some links route through the host and others do not, back stops going back after redirects or restores, a hard load wipes the query a bookmark carried]
---

# Host click delegation

The host hears every in-app link click in one place. It does not ask every
link to route through it. One listener on the window in the capture phase
sees the click before the framework's link component and before any handler
in the screen. If the click is one the host takes, it prevents the default,
and a well-behaved link component skips a prevented click. A plain anchor to
an in-app screen then needs nothing special, and a link someone adds next year
is a host navigation without anyone remembering to make it one. The route
table is the one authority on which addresses the host draws, so the
listener, programmatic navigation and back/forward all consult the same table
([law: one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).

## Which clicks the host takes

Write the decision as a pure function over the event and the anchor, and test
it. The host takes a click only when all of these hold:

- it is a plain primary click: button zero, no modifier key, and not already
  prevented by someone earlier;
- the anchor has an href that resolves to the same origin;
- its target is empty or the same tab, and it is not a download;
- neither the anchor nor an ancestor carries an explicit opt-out marker (for a
  link whose own handler does something else);
- it is not a jump within the page (same path and query, with a fragment);
- the route table claims the address, and the screen is switched on.

Everything else stays the browser's: new tabs, downloads, external links. Or
it stays the router's: addresses the host does not claim yet, which makes the
migration incremental, one screen at a time.

## History is shared, so keep the framework's state intact

The host writes history entries itself, and the framework's router is still
listening and keeps private state in each entry. Three rules prevent the two
from corrupting each other:

- **Never write a null state.** Replacing the entry's state with nothing wipes
  the framework's keys, and with them the host's own mark. Pass the current
  state through, or go through the host's own replace.
- **Know what each write tells the framework.** A write the framework
  recognises as its own updates its idea of the current address. A write that
  merely copies its private keys can leave its canonical address behind, so
  the next framework history write restores the old address. Find out which is
  which and expose one quiet replace door for screens that keep their state in
  the query.
- **Do one read per history step.** When the framework renders the popped
  address in the same tick and the host follows it, the host's own pop handler
  must not start a second read of the same address. Skip a read of the address
  already showing with a read in flight.

## Only a person's change writes the URL

The address records where the person went and what they chose. It does not
record what the code computed. Push an entry for a person's click. Replace,
and do not push, for a redirect the server answered, and only while that
screen is showing. Never write the address from initial state. A hard load
hydrates with each screen's default state before the screen has read its
query, and a screen that mirrors its state into the address on mount
overwrites the bookmarked view with the default. The write path belongs to the
person's input handler, and the read path to the arrival.

Query rules around kept screens need stating, because they are where the
surprises live. A link with no query of its own returns to the query the
screen was left with. A bare link to the screen already showing goes to its
bare form, which is how the person clears it. A screen that redirected forgets
its kept query, so a plain link does not land on the redirect's source again.
When the framework renders an address the host has not seen (a hard load, or
back across a router navigation), take the address bar's query and never an
empty one while the bar has one.

## Chrome reads the host's location, not the router's

The framework's path hook trails a host navigation by a frame, because it
updates in a transition after the host's history write. Chrome that names the
current screen (the nav's current mark, a title band, a debug panel) reads the
host's own current-path hook, which changes in the click's own frame.
Otherwise there is a frame in which the new screen is visible and the nav
still marks the old one as current. The document title follows the same rule:
the host derives it from the active screen and sets it in the same commit.

## When not to use it

Delegation is for a client host that owns many screens. A product of a few
documents with real per-page server rendering is better served by the
platform's own navigation and its back-forward cache. A capture-phase
listener that takes clicks is invisible magic to a new contributor, so
document the opt-out marker beside the link component.
