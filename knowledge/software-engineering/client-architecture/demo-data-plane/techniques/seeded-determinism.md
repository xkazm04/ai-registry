---
layer: technique
type: technique
subject: demo-data-plane
technique: seeded-determinism
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [demo numbers differ between two tabs, a documentation screenshot no longer matches the live page, generating volume for a demo collection]
---

# Seeded determinism

All variation in the demo world comes from a **seeded generator**: a
deterministic stream with a checked-in seed, producing the same world on every
render, in every tab, on every machine, on every reload.

The rule sounds like engineering tidiness and is not. It is a viewer-facing
property, and the reason is that **viewers compare**.

## What the viewer actually does

- Opens the demo in two tabs to put two screens side by side. Different numbers
  in each is not read as "the fixtures are random"; it is read as the product
  being unable to agree with itself.
- Screenshots a screen for a document, a deck, or a support reply — and the
  screenshot is then permanently next to a live page that no longer matches it.
- Walks the same tour twice in one meeting, and is asked about the number that
  changed.
- Sends a colleague a link and describes what to look at. The colleague sees
  something else.

Each of those is a comparison, and non-deterministic fixtures fail all four. The
cost is not proportional to how wrong the numbers are; a plausible number that
differs from the last plausible number is the whole defect.

## The mechanics

**A small explicit generator, not the platform's global one.** The generator is
a few lines — a counter-based hash, a linear congruential step, any
well-behaved sequence — held by the fixture module and advanced explicitly.
Reaching for the ambient random source is what produces the problem, and it
produces it invisibly, because a single unseeded call anywhere in the projection
chain de-determinises everything downstream of it.

**One seed per world, checked in, and derived from a stable key where variation
is needed.** If a projection needs each entity to have different-looking
activity, derive that entity's sub-seed from its identifier — not from its index
or its position, so that reordering the roster does not reshuffle the world
([_laws: identity-survives-reuse_](../../../_laws.md#identity-survives-reuse)).

**The seed and generator are named as the recomputation.** The fixture set is a
stored derivation; the module states what regenerates it and how, because a
fixture set nobody knows how to reproduce is one nobody dares to change, and it
freezes at whatever shape it had when its author left
([_laws: derivation-names-recomputation_](../../../_laws.md#derivation-names-recomputation)).

**Nothing from the environment enters the stream.** The three that get in by
accident:

- **The current time.** Any time-dependent value — a series that ends "now", a
  relative age, a countdown — recomputes on every read and drifts across
  renders. The resolution is a **single reference instant, captured once when
  the world is instantiated**, with every timestamp in the world derived from
  it as an offset. That keeps the demo's ages relative — "finished twenty
  minutes ago" stays twenty minutes ago however long the fixture set has been
  checked in, which a hard-coded absolute instant would not — while making the
  whole world agree within a session, which is what the viewer can actually
  check. The residual cost is honest and worth knowing: absolute instants still
  differ between two loads, so a value that must match a screenshot forever
  cannot be time-derived at all. The demo is a photograph taken at entry, not a
  clock that keeps running.
- **Anything about the machine.** Viewport, locale-dependent formatting applied
  before the value is stored, feature detection. Format at the edge; store the
  value.
- **Anything about the request.** A per-load identifier, a session key, a
  navigation counter. Each of these is a hidden clock.

## Deterministic is not static

The distinction that gets lost: the requirement is that the *same inputs produce
the same output*, not that the demo never moves.

A demo may animate. A series may extend as the viewer watches. A live-looking
counter may tick. All of that is legitimate and often necessary — a monitoring
product whose demo is frozen is demonstrating a screenshot. The requirement is
that the sequence is **scripted and replayable**: derived from the seed and from
elapsed time since entry, so that two viewers who enter at different moments see
the same sequence from its beginning, and a viewer who reloads restarts the same
script rather than sampling a different world.

The test that separates the two: reload the page and compare against a
screenshot taken from the same point in the sequence. Deterministic-and-moving
matches; random-and-moving does not.

## Where the seed lives, and what it must not be

The seed is a checked-in constant. It is not configuration, not an environment
value, and not something a viewer can set — a viewer-settable seed makes every
support conversation start with "which world are you looking at."

Changing the seed changes the whole demo world, which is exactly why it should
be changed deliberately and rarely: existing screenshots, existing documentation
and existing recorded walkthroughs are all invalidated at once. Treat a seed
change like a copy change to the marketing site, not like a refactor.

## Verifying it

Two cheap assertions catch every regression in this technique:

- **Generate the world twice in one process and compare.** A single unseeded
  call anywhere in the chain fails this immediately.
- **Generate it in two processes and compare.** This additionally catches
  anything that depends on the process, the clock, or iteration order over an
  unordered collection — the last of which is the subtle one, since a map's
  iteration order can be stable within a process and differ across builds.

Both run in milliseconds and both belong in the suite that runs on every change,
because the way this property breaks is a one-line convenience added by someone
who did not know the rule existed.

## When not to use it

If the fixture set has no variation at all — a dozen hand-written rows, no
generated volume, no series — there is no stream to seed and the technique is
moot. Introduce it when the first generated value appears, and treat that moment
as the point where the world acquires a seed, rather than adding a generator now
and a seed later.
