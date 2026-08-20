---
layer: technique
type: technique
subject: operator-surfaces-for-llm-spend
technique: single-render-layer-many-consumers
status: forged
laws: [estimation-announces-itself, never-present-absence-as-an-answer]
shared_with: []
use_when:
  - more than one consumer renders the same accounting payload
  - adding a new surface (CLI, agent tool, report export) to a spend store
---

# Single render layer, many consumers

Spend data reaches the operator through several transports — an agent tool
result, a terminal, a comparison report at the end of a batch run, a raw API
response. The technique: **implement the human rendering exactly once, as a
pure library from canonical structured payload to formatted text, and make
every consumer call it.** Consumers differ in transport and pagination; they
never differ in what a number looks like or which caveats accompany it.

## Procedure

1. **Define the canonical payload first.** The API's structured response is
   the contract; the renderer is a pure function over it. The renderer never
   queries the store — it formats what it is handed, which makes it trivially
   unit-testable with literal fixtures.
2. **One module per report shape.** Cost rollup, margin table, limit status,
   leaderboard — each gets a formatting function keyed to its payload, sharing
   low-level helpers (money, rates, percentages, comma grouping, timestamp
   shortening, sparklines, aligned tables) from one utility module so the
   whole product agrees on how a dollar looks.
3. **Ship rendering and payload together.** A tool result carries the
   formatted text *and* the structured object; a terminal consumer prints the
   text on an interactive session and offers a flag to emit the raw payload.
   Machine consumers must never scrape human formatting.
4. **Push the honesty rules into the renderer.** Truncation lines ("showing
   top N of M"), currency caveats, simulation stamps, em-dashes for
   unmeasured values, empty-state sentences — all rendered by the shared
   layer, so no surface can forget them. This is where
   "estimation announces itself" becomes enforceable rather than aspirational:
   the disclosure is part of the one rendering everyone gets.

## Decision rules

- When a new consumer needs a slightly different view, add a parameter to the
  shared renderer or a new report function beside the others — never a fork of
  the table code inside the consumer. The moment two implementations of the
  same table exist, they are already diverging.
- When the renderer receives an empty row set, it renders an explicit
  empty-state sentence scoped to the report ("no revenue or attributed cost in
  this window"), never an empty string and never a bare header — an absent
  section reads as a broken surface, and a silent blank reads as "zero".
- Rounding, sign conventions, and column order are renderer decisions, made
  once. If a consumer wants different rounding, that is a new requirement to
  debate, not a local patch.
- Keep the renderer free of transport concerns: no protocol envelopes, no
  terminal-width probing beyond what a caller passes in. Purity is what lets
  the agent surface, the CLI, and the batch report certify the same code with
  the same tests.

## Why it earns its cost

The render layer is where trust is manufactured. Operators cross-check
surfaces against each other — the number quoted by the agent against the panel
on the wall against the terminal report — and any disagreement, even a
rounding disagreement, is read as "the data is wrong somewhere". One renderer
makes cross-surface agreement structural. It also concentrates review: a
change to how thin margins are flagged or how truncation is disclosed is one
diff in one module, reviewable by someone who owns the reporting contract.

## When not to use it

A dashboarding system that renders from its own queries is a legitimate second
renderer — it draws charts, not text, and lives outside the process. Accept
that boundary but keep it honest: the panel queries read the same store and
the same semantics (nullable costs stay nullable) even though they bypass the
text renderer. Similarly, do not force a one-off internal debug dump through
the product renderer; the technique governs operator-facing reports, not
scaffolding.
