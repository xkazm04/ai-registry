---
layer: technique
type: technique
subject: page-load-pipeline
technique: render-blocking-budget
status: forged
laws: []
shared_with: []
use_when: [adding a stylesheet, a third-party tag or an inline script to the head of a document, the first render waits on a resource nobody can justify, choosing between deferred, asynchronous and module script loading]
---

# Render-blocking budget

Two kinds of resource hold the first render hostage, and both do it on purpose.
A **stylesheet** blocks rendering, because a page painted before its styles
arrive is an unusable flash of unstyled content that then rearranges itself. A
**classic script without loading attributes** blocks the parser, because it may
write into the document at the point it appears; everything after it waits for
it to download and run. The browser is right to do both. The page is wrong when
it gives either behaviour to a resource that does not need it.

The technique is a ledger: **every resource that blocks the critical path is a
line in a budget with a named reason**, and every resource without a reason is
moved off the path. The ledger is short on a healthy page — the styles for the
first screen, and perhaps a tiny inline script that must run before paint — and
long on a page that grew by accretion.

## Scripts: ordering is the real choice

The loading attributes differ in when a script runs, not only in whether it
blocks:

- **Deferred** — fetched in parallel with parsing, executed after parsing
  finishes, **in document order**. The right default for the page's own
  scripts, because dependencies between them keep working.
- **Asynchronous** — fetched in parallel, executed **as soon as it arrives**,
  possibly before parsing finishes and in no guaranteed order. Right for an
  independent script that nothing depends on and that depends on nothing: an
  analytics beacon, a self-contained widget. Wrong for anything in a chain,
  where it produces a race that passes on a fast connection.
- **Module** — deferred by default, with its whole import graph fetched in
  parallel; the asynchronous attribute makes it run as soon as the graph is
  ready. A deep module graph can itself be a discovery problem, because each
  level is found only when the level above has arrived.
- **Inserted by script** — a script element created at runtime does not block
  the parser and runs as soon as it can, unless explicitly told otherwise. It is
  not blocking, but it is late: see
  [discoverable-critical-resources](./discoverable-critical-resources.md).

A classic blocking script in the head is justified only when it must run before
the first paint and is small: a theme or locale decision that would otherwise
paint the wrong colours and then flip, for example. It must be inline, tiny,
self-contained, and budgeted as such. Anything that can run after paint does.

## Stylesheets: scope, then split

- **Scope by media condition.** A stylesheet whose media condition does not
  match — print, a viewport range the device is not in — is still downloaded,
  at low priority, and does not block rendering. Splitting styles by the
  condition they serve is the cheapest unblocking there is.
- **Critical styles first.** The styles the first screen needs can be delivered
  inline or as a small first stylesheet, with the remainder loaded without
  blocking. The technique pays on large stylesheets and cold visits; it costs
  cacheability and a second maintenance surface, so it is worth measuring
  before adopting rather than adopting by default.
- **A cross-origin stylesheet is a connection plus a request on the critical
  path.** A third-party font or widget stylesheet in the head adds a name
  lookup, a connection and a secure handshake before the page can paint. Serve
  it from the document's origin, or at minimum warm the connection early.
- **Imports inside stylesheets chain.** A stylesheet that imports another
  creates a serial fetch the scanner cannot see; flatten at build time.

## Third-party tags

Third-party tags are where budgets rot, because each arrives with an
installation snippet written for the vendor's convenience and each owner adds
one without seeing the others. The ledger applies to them without exception:
each tag names its owner, its reason to exist on this page, and its loading
mode; none blocks the parser; tags that need consent do not load before it;
and a tag without an owner at review time is removed.

## Decision rules

- When a resource blocks the first render, write down why; if the reason is
  not "the first screen is wrong without it", move it off the critical path.
- Default the page's own scripts to deferred or module; use asynchronous only
  for scripts with no ordering relationship to anything.
- Allow a head-blocking classic script only when it is inline, small, and must
  decide something before paint.
- Split stylesheets by media condition before considering critical-style
  extraction; adopt extraction only when a measurement shows the full
  stylesheet is the delay.
- Serve critical stylesheets from the document's own origin, because every
  foreign origin on the critical path adds a connection before paint.

## When not to use this

- **Pages whose first render is not the product.** An authenticated tool opened
  once a day and kept open pays blocking cost once; its budget belongs to
  script cost and responsiveness.
- **Tiny documents.** A page whose entire stylesheet is a few kilobytes gains
  nothing from critical-style extraction and pays the maintenance anyway.

## How to test for the property

- List the render-blocking resources of each key route from a cold load and
  diff the list against the ledger; any unlisted entry fails.
- Assert that no parser-inserted classic script without loading attributes
  appears in the head except the budgeted inline ones.
- Throttle one third-party origin to time out and assert the first render still
  happens on schedule.
