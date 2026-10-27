---
layer: technique
type: technique
subject: demo-data-plane
technique: replay-clock-pinning
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [the demo is a recorded moment replayed through the live pipeline, ages and countdowns in a replay drift from the recorded figures, a fake upstream is polled by the real ingestion code]
---

# Replay clock pinning

[seeded-determinism](./seeded-determinism.md) keeps a generated world stable by
deriving every timestamp from one reference instant captured when the world is
instantiated, so the demo is a photograph taken at entry. That works when the
fixtures are *generated*. It does not work when the demonstration is a
**recorded moment** — a dataset whose events carry absolute instants, whose
figures were written to read "feed twelve seconds old", "due in nineteen hours",
and which is replayed through the product's real ingestion code against a fake
upstream. There, entry-relative time is wrong in both directions: offsets from
the viewer's now turn every recorded instant into a different age, and the
real poller computes its own ages from the wall clock, so the replay disagrees
with the very figures it was recorded to show.

The resolution is to treat **the clock as an input of the plane**, and pin it.

## Two clocks, both injected

Any code path that turns instants into ages reads time from an injected clock,
never from the ambient one, and the clock has two faces because the pipeline
uses time at two moments:

- **poll** — when the ingestion step runs. Ages stored at ingestion (how long
  since the last event, how stale a feed is) are measured against it.
- **read** — the instant a screen reads the result at. Ages and countdowns
  rendered on screen (time until a deadline, time since an item opened) are
  measured against it.

For the real plane both faces are now. For the replay, both are **pinned to the
recorded moment**, with the poll a fixed interval before the read so the
recorded "feed twelve seconds old" falls out of the arithmetic rather than being
typed in. Every screen then shows exactly the recorded figures, on every load,
in every tab, and the figures say plainly what they are: the time on screen is
the recording's, not today's.

The pin is a derivation and names what it is derived from
([_laws: derivation-names-recomputation_](../../../_laws.md#derivation-names-recomputation)):
the recorded moment is one constant exported by the dataset, and both faces are
computed from it. Two hand-typed instants — one in the poller setup, one in the
renderer — drift the first time the dataset is re-recorded.

## The read instant crosses the render seam

When a screen is rendered once on a server and again in the browser, the read
instant is captured once, where the data is read, and passed down with the
data, so the two renders compute the same ages. This is the same rule
[timestamp-display](../../../ui-surfaces/feedback-and-style/status-vocabulary/techniques/timestamp-display.md)
states for the real plane, and the pinned clock makes it non-optional: a replay
whose browser render re-reads the wall clock shows a recorded deadline counting
down from today.

## Choosing pinned or entry-relative

The two strategies are not rivals; they answer different kinds of fake plane,
and one product may need both:

- **Generated fixtures, consumed directly by screens** — entry-relative, from
  [seeded-determinism](./seeded-determinism.md). Ages stay fresh ("twenty
  minutes ago") however long the fixtures have been checked in.
- **A recorded moment, replayed through the live pipeline** — pinned. The
  figures must match the recording, and the pipeline's own arithmetic must
  produce them.

The tell is who computes the ages. If the fixture module does, it can offset
from entry. If the product's real ingestion or loaders do, they need a clock
they can be handed, and the replay hands them the recorded one.

## What this technique refuses

- Any age, staleness or countdown computed from the ambient clock in a path the
  replay exercises.
- One clock face for a pipeline that measures time at ingestion and at read.
- The recorded moment typed in more than one place.
- A browser render that re-reads the wall clock after a server render read the
  pinned one.

## When not to use it

A demonstration that never runs through the real ingestion path — fixtures
handed straight to the screens — has no pipeline to hand a clock to;
entry-relative seeding is simpler and keeps ages fresh. And a pinned replay is
visibly a moment in the past: where a viewer must see "today", pinning is the
wrong tool, and the plane should be generated instead.
