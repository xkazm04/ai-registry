---
layer: technique
type: technique
subject: lazy-section-addressability
technique: anchor-coverage-guard
status: forged
laws: [gate-sees-target, deletion-is-not-repair]
shared_with: []
use_when: [a section is renamed and an in-page navigation entry goes dead, adding a location to the declared vocabulary, a navigation dot highlights nothing and nobody knows since when]
---

# Anchor coverage guard

The declared address space says which locations this page offers. The page
says which locations it actually hosts. Nothing keeps those two in agreement
except the memory of whoever last edited both, and a mismatch produces no
error — a navigation entry that resolves to nothing simply does nothing.

The guard is the cheapest possible fix: after first paint, in development and
in tests, walk the declared vocabulary and assert that every entry has a host
in the page, then walk the hosts and report the ones nobody declared.

## Why the wrappers are what make it possible

A coverage check on a page of lazily-mounted sections would normally be
hopeless — at any given instant most sections are legitimately absent, so
"absent" carries no information and the check is pure flake. Always-present
wrappers remove that problem completely. The wrappers are all in the document
at first paint, unconditionally, so the guard runs at a deterministic moment
and its answer does not depend on scroll position, network speed, or how long
it waited.

That is the dependency worth stating: this guard is affordable *because* the
address space was separated from the content. On a page that puts identifiers
on the lazy sections themselves, the same check has to sample over time, and a
check that samples over time is a check that gets muted.

## What it reads

The guard reads the **live page**, not a list of what the page is believed to
render ([law: a gate must see its target](../../../../_laws.md#gate-sees-target)).
A guard that compares the navigation's list against the coaching script's list
compares two declarations to each other and passes while both have drifted
from the markup — which is the exact state it existed to catch. The
authoritative side of the comparison is always the rendered document.

The check runs in both directions, and the second direction is the one people
skip:

- **Declared without a host** — a navigation entry, a call to action, or a
  coaching step naming a location the page does not have. Almost always a
  rename that updated the markup and not the vocabulary. This is the dead dot.
- **Hosted without a declaration** — a wrapper nobody addresses. Either dead
  markup to remove, or a section somebody added without adding it to the
  navigation, which is the more interesting case: a location readers cannot
  reach by name.

## How it reports

**It warns; it never throws.** A broken navigation entry is a defect in the
page's map, not in the page, and taking the page down over it converts a
cosmetic bug into an outage. The guard reports through the development
console and fails a test, and does nothing at all in production — a coverage
warning shown to readers is noise they cannot act on.

The message names the address, the consumer that declared it, and the page,
because the person who sees it is usually not the person who caused it. "Two
anchors missing" sends someone hunting; "the navigation declares *pricing*,
which no wrapper on this page hosts" is a fix.

## Where it runs, and why more than one place

- **In development, on every load of the page.** Zero-cost, immediate, and it
  catches the rename in the same session that made it. This is the highest-value
  placement by a wide margin.
- **In the test suite, per page that declares addresses.** Development-only
  checks are seen only by developers who happen to open that page; a test is
  seen by everyone, including the contributor who changed a shared component
  and has no reason to visit the page it broke.
- **At build time, where the tree allows it.** A static cross-check between
  the declared vocabulary and the page's source is stronger still, because it
  needs no runtime. It is also more fragile to write, so it is an addition to
  the runtime guard and never a replacement for it — the runtime guard sees
  what actually rendered, which is the target.
- **In the tracker's give-up path.** Wherever something already waits for
  locations to arrive — the scroll tracker registering hosts as their content
  mounts — the moment it stops waiting is a free second guard, and a sharper
  one. The first-paint guard answers "is there a host for this address"; the
  give-up path answers "did the content behind this address ever arrive in a
  whole session", which catches the section whose unit fails to load, the
  section gated behind a condition nobody remembered, and the address whose
  content moved to another page. Name the unresolved entries; do it in
  development only, for the same reason as the rest.

## Muting is the failure mode

A guard that is noisy gets silenced, and silencing it is not a fix
([law: deletion is not repair](../../../../_laws.md#deletion-is-not-repair)).
Two specific pressures produce muting, and both are prevented at design time
rather than resisted by discipline:

- **Flake.** A guard that races the page's own rendering will fire falsely,
  and one false positive buys a permanent mute. It must run at a moment when
  the wrappers are definitionally present and never depend on lazy content.
- **Known-broken backlog.** A guard switched on over a page with eleven
  pre-existing violations produces a wall of warnings nobody reads. Fix the
  existing set in the change that adds the guard, or the guard arrives already
  ignored.

And the counterpart discipline: when the guard fires, the repair is the
anchor, never the declaration. Deleting the navigation entry that pointed at
the renamed section makes the warning go away and makes the location
unreachable, which is the defect the guard was reporting, now invisible.

## When not to use this

- **A page with one location.** There is no vocabulary to keep in agreement.
- **Vocabularies generated from the page itself** — a navigation built by
  walking the rendered headings cannot disagree with the page, and a guard
  over it is a tautology. The guard exists for hand-declared vocabularies,
  which is most of them.
- **As a substitute for the coaching layer's own contract check.** A coaching
  script that references anchors across many pages needs its own inventory
  and its own gate; this guard sees one page at a time and will report a
  perfectly healthy cross-page reference as missing if run in the wrong place.

## What this technique refuses

- Comparing two declarations to each other instead of to the page.
- A guard that throws, or that runs for readers.
- A one-directional check that never reports unaddressed hosts.
- A warning that names a count instead of an address.
- Repairing a coverage failure by deleting the declaration.
