---
layer: golden-path
type: golden-path
subject: lazy-section-addressability
status: forged
use_when: [a long page adopts code-split or viewport-mounted sections, a deep link into a section lands at the top of the page, in-page navigation highlights nothing on a cold load, a consumer needs to point at a section that has not mounted yet]
techniques:
  - always-present-anchor-wrappers
  - external-anchor-vs-internal-id
  - scroll-to-hydrate-then-retry
  - anchor-coverage-guard
  - ssr-gating-decision-tree
---

# Lazy section addressability

A long page is a place with named locations in it. People link to those
locations from other pages, from release notes, from support replies, from
search results; the page's own navigation points at them; its calls to action
jump between them; a coaching overlay spotlights them. Every one of those is
the same operation — *resolve a name to a position on this page* — resting on
an assumption nobody writes down: that the thing named is present when the
name is used.

The moment the page becomes economical about what it renders — sections
code-split, sections mounted only when they approach the viewport, sections
that never render on the server at all — that assumption stops holding, and it
stops holding *asymmetrically*. The name is used at the earliest possible
moment, on the first paint, before a byte of the section's code has arrived;
the thing named appears at the latest possible moment, after scroll, after
fetch, after mount. The naive page puts the name on the thing. On a warm cache
with everything already in the document the naive page works perfectly, which
is why this defect ships.

This subject owns the **address space** of such a page: the guarantee that
every declared location resolves from the first paint onward, whatever the
content behind it is doing, and the protocol every consumer uses to travel
there.

## An address is a promise; content is a resource

The load-bearing distinction is that an address and the content at that
address have opposite obligations, and a page that stores them in one place
gets the weaker of the two.

An **address** must be *total and eternal*. Total: every name the product has
published for this page resolves, at all times, from the first byte,
regardless of entitlement, data, viewport, or network. Eternal: a name that
has escaped into a bookmark, an email, an external site is a contract the page
cannot unilaterally revoke. **Content** is *partial and late* by design — that
is the entire point of loading it lazily — and it may never arrive at all: a
failed unit, a disabled flag, an empty result.

Bind the address to the content and the address inherits content's properties,
which are exactly the properties an address may not have. So the standard
separates them physically: an always-present wrapper, rendered
unconditionally and rendered by the page rather than by the section, carries
the address; the lazy content mounts inside it. The section's own identifier
still exists and is still useful, but as a *second, later-arriving handle*,
not as the address. That split is
[always-present-anchor-wrappers](./techniques/always-present-anchor-wrappers.md),
and everything else here is a consequence of it.

## The address space is declared, not discovered

The addresses of a page are a closed vocabulary with one authoritative
definition — a list, in one place, of every location this page offers by name.
The navigation reads that list, the scroll tracker reads that list, the
coaching script and the calls to action reference entries in it, and the page
proves it hosts every entry.

The alternative is what pages accumulate by default: each consumer carrying
its own string, discovered by reading the markup once at authoring time. Those
copies drift on precisely the edit that matters — the one where a section is
renamed, split, or moved — and nothing fails at that moment. The link still
navigates, to nowhere; the tracker still runs, highlighting nothing; the
overlay still opens, pointing at the void. The absence of a crash is what
makes this the slowest-noticed class of defect on a marketing or
documentation page, where the people who own the content are not the people
who read the console.

## Two namespaces, because they answer to different owners

Within the address space there are two kinds of identifier and they must not
be the same string. The **external address** is what the outside world holds —
URLs, links from other products, indexed results. Its owner is history: it may
not change because a designer restructured the section, and when it must
change, the old name survives as an alias rather than evaporating. The
**internal handle** is what the page's own machinery tracks — which entry the
scroll tracker considers current, which element a coaching step spotlights.
Its owner is the current design; it changes as often as the design does, and
nothing outside the page ever learns it.

Fusing them makes each hostage to the other's release cadence: a refactor
becomes a broken two-year-old link, and a frozen external contract becomes a
frozen internal structure. The two-namespace rule and the alias discipline are
[external-anchor-vs-internal-id](./techniques/external-anchor-vs-internal-id.md).

## Navigation is a protocol, not a call

On a page of this shape, "go to that section" is not one operation. It is a
sequence with a specific and slightly surprising middle step: **the scroll is
what causes the content to exist.** Mounting is gated on approach; approaching
is the trigger. A consumer resolves the address against the wrapper — which
always resolves — scrolls it into view, and only then begins looking for the
finer target it actually wanted, on a bounded retry, with a declared behavior
for exhaustion.

Two naive readings fail here, differently. The first resolves the finer target
immediately, finds nothing, and gives up: the deep link lands at the top of
the page and the reader never learns there was a section. The second inserts a
fixed delay before resolving — the fix that works on the author's machine, on
a warm cache, on a fast connection, and becomes a coin flip everywhere else. A
fixed delay is not a wait; it is a bet about somebody else's network. The
protocol, its retry budget, its cancellation rules, and its post-mount
re-assertion of position are
[scroll-to-hydrate-then-retry](./techniques/scroll-to-hydrate-then-retry.md).

## Geometry is part of the address

An address that resolves to a zero-height stub is only half an address. When
every unmounted section collapses to nothing, the whole page stacks into the
first screen: scrolling to the seventh location and to the third land within a
few pixels of each other, several sections mount at once because all of them
are suddenly near the viewport, and as they inflate they shove the reading
position around. The reader experiences a page that will not hold still.

So the wrapper reserves an approximation of the height its content will take,
which makes the scroll geometry roughly correct before anything has mounted —
and because the approximation is wrong, the consumer re-asserts its landing
after the content arrives. Reserve *and* re-assert; either alone is a bug with
a different shape.

## Four consumers, one address space

This is a subject rather than a fix because the address space has several
independent consumers, and a repair applied to one of them looks complete
while the others stay broken:

- **Deep links from outside.** The hardest case: the name is used at the
  earliest moment the page exists and nothing has warmed.
- **In-page navigation and scroll tracking.** Needs the space in both
  directions, and the two directions resolve differently — a jump takes
  whichever handle exists and the wrapper always does, while tracking wants
  the section's real geometry and so resolves the inner element only. A
  tracker has its own cold-start defect: it sweeps the page once when it
  starts, finds only what has mounted, and never lights up the rest, so it
  must register hosts as they arrive rather than assume they were there.
- **Calls to action inside the page itself.** The button halfway down that
  sends the reader further down, to a section a cold entry has not mounted
  either.
- **Guided coaching and resumed sessions.** Both point at a place recorded in
  a session that is not this one.

Enumerating them is not decoration. Each new consumer is a new opportunity to
resolve an identifier its own way, and one page with four resolution
strategies has four cold-load behaviors that will never be diagnosed together.

## The defect is invisible in development

Every failure here shares one property: it does not reproduce under the
conditions its author works in. A development session has a warm module cache,
a fast local connection, and a page that has usually been scrolled through
already. The defect needs a cold first paint, a direct entry at the address,
and a connection slow enough for mounting to outlast the consumer's patience.
So this subject's testing posture is not optional and not the same as the rest
of the page's: enter **at the address**, by hard load, never by navigating
there from the top; enter with caches cold and the connection throttled,
because the fast case has no bug in it; test the *last* address on the page,
since the failure scales with distance from the initial viewport. And keep a
cheap always-on guard for the case testing will not catch — the renamed
section — which is
[anchor-coverage-guard](./techniques/anchor-coverage-guard.md).

## What may be client-only is a written rule

Behind all of this sits a decision usually made per section, in a hurry, and
never revisited: whether a section renders on the server at all. The decision
is legitimate — some subtrees genuinely cannot be rendered ahead of time, and
some are large enough that rendering them twice buys nothing — but as an
unwritten decision it decays in one direction only. Client-only always works
on the author's machine, so absent a rule the share of the page that exists
before script runs falls quietly toward zero, and one day the page's meaning
is invisible to anything that does not execute it.

The standard is a written tree with an answer per class of subtree and the
reason attached, applied per section and audited: browser-only capabilities,
heavy motion subtrees and below-fold decoration may be client-only; anything
above the fold, anything carrying the page's meaning to a crawler or an
unfurled link, and anything a reader must still see when script fails, may
not. The wrapper is exempt from the question entirely — it is always rendered
ahead of time, because it is the address. See
[ssr-gating-decision-tree](./techniques/ssr-gating-decision-tree.md).

## Where this subject stops

Three neighbours border this one closely enough that the seam is worth stating
outright. [app-shell](../../shell-and-navigation/app-shell/app-shell.md) owns
[lazy-section-loading](../../shell-and-navigation/app-shell/techniques/lazy-section-loading.md)
— how a section's code is split, what occupies the viewport while it is in
flight, what warms it early, what happens when it will not load at all. That
subject answers *when does the content arrive and what does the reader see
meanwhile*; this one answers *what does a name resolve to while the content
has not arrived*. If the question is about a placeholder, a prefetch, or a
failed unit, it is next door; if it is about a link that landed nowhere, it is
here. [guided-tours](../../shell-and-navigation/guided-tours/guided-tours.md)
owns
[anchor-contracts](../../shell-and-navigation/guided-tours/techniques/anchor-contracts.md)
and
[missing-anchor-degradation](../../shell-and-navigation/guided-tours/techniques/missing-anchor-degradation.md)
— the identifier contract between coaching content and product code, and the
declared policy for a step whose target is legitimately not on screen. That
policy is for genuine absence: a control this reader is not entitled to, a
panel an empty account does not show. A section that merely has not mounted
yet is not absent, and it must never reach a degradation path; making sure it
never does is this subject's job, and coaching is only one of the four
consumers it serves.
[session-resume](../../shell-and-navigation/session-resume/session-resume.md)
owns
[last-seen-anchors](../../shell-and-navigation/session-resume/techniques/last-seen-anchors.md),
and the shared word invites a real confusion: an anchor there is a *watermark
in time*, a durable scalar recording when a scope was last seen, while an
anchor here is an *address in space*. Recording where the reader was is that
subject; making the recorded place resolvable when they come back is this one.
The rule for picking, in one line: ask whether the thing you are reasoning
about is the content, the timestamp, or the name — content is the shell's,
timestamps are resume's, names are here.

## Accessibility posture

Addressability is an accessibility feature before it is a convenience one,
because the readers most dependent on landing precisely are the readers least
able to recover from landing wrongly:

- **A jump moves focus, not only scroll.** Scrolling a location into view
  leaves keyboard and screen-reader users where they were; the wrapper takes
  programmatic focus so the next interaction continues from the landing point.
  Another reason the wrapper must exist at first paint: focus cannot be given
  to something that is not there.
- **Reserved space is not content.** A stub holding height for an unmounted
  section announces nothing; it is empty space, not a labeled region with no
  contents.
- **The landing is not under the header.** Sticky chrome is accounted for in
  the scroll offset, or every deep link lands with its heading hidden behind
  the bar — visually a near-miss, and on a magnified viewport a complete one.
- **Current location is stated**, semantically, not only as a highlighted dot.
- **Skip affordances address the same space.** A skip-to-section control is
  one more consumer of the declared vocabulary, never a second private list.

## The techniques

- [always-present-anchor-wrappers](./techniques/always-present-anchor-wrappers.md)
  — the unconditional wrapper that carries the address and reserves the
  geometry, with the lazy section as its child and the section's own
  identifier as a later handle.
- [external-anchor-vs-internal-id](./techniques/external-anchor-vs-internal-id.md)
  — two namespaces with two owners: the published address history owns and the
  internal handle the current design owns; renames, aliases, reuse.
- [scroll-to-hydrate-then-retry](./techniques/scroll-to-hydrate-then-retry.md)
  — the navigation protocol: resolve the wrapper, scroll to cause mounting,
  bounded retry for the real target, cancellation, and re-assertion of
  position after layout grows.
- [anchor-coverage-guard](./techniques/anchor-coverage-guard.md) — the
  development-time assertion that every declared entry has a host and every
  host has a declaration, read from the live page rather than from a list.
- [ssr-gating-decision-tree](./techniques/ssr-gating-decision-tree.md) — the
  written rule for which subtrees may skip server rendering, the reasons that
  qualify, and the audit that stops the exception from becoming the default.
