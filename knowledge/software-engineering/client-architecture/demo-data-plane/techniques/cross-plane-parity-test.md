---
layer: technique
type: technique
subject: demo-data-plane
technique: cross-plane-parity-test
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [proving the live path would show what the demo shows, the demo and live screens have quietly diverged, deciding where to record the places the two planes may differ]
---

# Cross-plane parity test

A demo plane makes an implicit promise: *this is what the product would show you
on your own data*. [one-interface-many-planes](./one-interface-many-planes.md)
makes the planes satisfy one interface, and its conformance suite checks that
each implementation behaves — absence resolves to absence, a rejected write
rejects. Neither checks the promise. Two planes can satisfy the same types and
the same behavioural suite and still hand a screen different worlds, because
the screens do not consume the interface directly; they consume **loaders** that
compose several calls, derive counts and ages, and shape a screen's props. The
divergence lives there, and it is invisible until somebody compares the demo
with the first real tenant.

The parity test makes the promise checkable: **every screen loader returns the
same props from the live plane as from the demo plane**, when the live plane is
fed an upstream that holds the demo's world — and every place they may differ is
listed in one block, on purpose, with its reason.

## Build the upstream from the demo world

The test needs the live plane's real code — its ingestion, its storage, its
loaders — running against something that holds the same facts the demo plane
serves. Build a fake **upstream** (the external system the live plane polls)
from the demo's root declaration: its entities, its events, its documents,
expressed in the upstream's own formats. Seed the live store with only what the
upstream genuinely cannot express, then run the real ingestion over the fake
upstream so its rows overwrite the seed wherever ingestion derives the same
values. Pin the clock to the demo's moment
([replay-clock-pinning](./replay-clock-pinning.md)) so ages and countdowns can
match at all.

Then assert the rows really came from ingestion: one test that reads a value the
seed did not hold and the upstream did. Without it, a parity test passes
trivially on a live store that is nothing but the seed — the gate observing a
proxy for the thing it gates
([_laws: gate-sees-target_](../../../_laws.md#gate-sees-target)).

## Compare props, as the page would send them

Call each loader twice, once with each plane selected, and compare the results
**as the page would serialise them** — after the same encoding the props cross on
their way to the screen, so "undefined" and a missing key are one fact, as they
are to the client. Compare structurally, the whole value, not a handful of
fields: the point is that a field added to one plane's output and not the other's
fails here.

Where the planes spell an identical meaning differently (one says "no last
event" with an explicit null, the other omits the key), normalise that spelling
in a small named helper with a comment saying both draw nothing. A normaliser
that strips anything else is a hidden difference and belongs in the list below.

## Differences are listed in one place, on purpose

Some differences are the point: live counts only the tenant's own items where the
demo counts its seeded ones; live plays its own history where the demo plays an
illustrative slice; a field exists only in the live plane because only a real
source can supply it. Each is written **once**, in a final group of tests named
for exactly that — *where live differs from demo, on purpose* — asserting the
difference itself (live reads zero here, demo reads five), with a sentence of
reason. The per-loader comparisons null out only the fields that group names.

That single list is the plane boundary's authority
([_laws: one-authority-per-vocabulary_](../../../_laws.md#one-authority-per-vocabulary)):
the documentation can cite it, a reviewer can read it in one screen, and a
difference not in it is a defect by definition. Scattering exceptions across the
per-loader tests — a field skipped here, a filter there — makes the boundary
unreadable and lets a real regression hide as one more skip.

## What this technique refuses

- Parity checked at the interface's types alone, when screens read loaders.
- A live plane under test that never ran its ingestion over the fake upstream.
- Comparing hand-picked fields instead of the whole serialised props.
- A normaliser that hides a semantic difference.
- Allowed differences scattered through the comparisons instead of listed once,
  asserted, and explained.

## When not to use it

When the demo plane is not a claim about the live product — a sandbox with its own
rules, a marketing surface with invented features — there is no promise to test.
And when the live plane has no ingestion to exercise (it reads the same store the
demo seeds), the conformance suite already covers it; the parity test earns its
cost where real derivation code sits between the upstream and the screen.
