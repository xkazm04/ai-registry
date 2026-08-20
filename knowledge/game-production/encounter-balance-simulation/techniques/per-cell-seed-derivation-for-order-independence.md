---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: per-cell-seed-derivation-for-order-independence
status: forged
laws: [a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [building a parameter sweep or heat map, a cell's numbers change when the sweep order changes, making a stochastic result quotable]
---

# Per-cell seed derivation for order independence

A parameter sweep evaluates a grid: player level against enemy archetype, one attribute
against another, a lever against a step. Each cell is a stochastic simulation. The
question this technique settles is where each cell's randomness comes from — and the
answer that seems obvious is wrong in a way that is very hard to see.

## The defect

The natural implementation creates one seeded generator for the sweep and threads it
through every cell. Every cell is seeded, the whole run is reproducible end to end, the
tests pass. But each cell consumes an **order-dependent slice** of one advancing stream,
so a cell's result is a function of how many draws were taken before it. Change the
iteration order, add a row, filter the grid, resume after a crash, parallelise — and the
numbers in an untouched cell move. Designers notice this as "the tool is flaky"; they do
not report it as a bug, they report it as distrust, and they start re-running until the
answer looks reasonable.

Resetting the generator to a constant at the top of each cell fixes order dependence and
introduces a worse defect: every cell then draws the identical sequence, so systematic
correlations run across the whole grid and neighbouring cells are no longer independent
samples of anything.

## The rule

**Derive each cell's seed from the cell's own identity, never from a shared advancing
generator.**

The identity is the tuple that defines the cell — every parameter that distinguishes it
from its neighbours, and nothing that does not. Compose it into a stable key string, hash
the key into a seed with a cheap avalanche hash, and construct a fresh generator per
cell from that seed:

1. Build a key from the cell coordinates, joined with a separator that cannot occur
   inside any component: `cell|<archetype>|<player-level>`, `sens|<attribute>|<step>`.
   Use the *semantic* identity, not the array index — indices renumber when the grid is
   filtered, and a renumbered index silently re-rolls the cell.
2. Fold the key into a 32-bit value with a fast non-cryptographic hash. A multiply-xor
   loop over the character codes is sufficient; the requirement is avalanche, not
   security, and a hash whose output for adjacent keys is adjacent will correlate
   adjacent cells.
3. Mix in a **run-level base seed** so the entire grid can be re-rolled as a unit to
   check that a conclusion is not an artefact of one seed. Keep the base constant by
   default; make re-rolling an explicit action with the seed recorded in the output.
4. Guard the degenerate output: a hash that lands on zero must be nudged, because a
   zero state is a fixed point for several common cheap generators and produces a
   constant stream.

The property this buys is stated as a test: evaluating the grid forwards, backwards,
shuffled, in parallel, or one cell in isolation yields byte-identical results.

## Consequences worth having

- **A single cell is re-runnable.** A designer asking "why is this cell red?" can rerun
  exactly that cell, at higher iteration counts or with a trace, and get the same fight.
  With a shared stream that is impossible without replaying the whole sweep.
- **Parallelism is free.** Cells are pure functions of their coordinates, so they may be
  distributed across workers with no coordination and no ordering guarantees.
- **Caching is sound.** A cached cell result is valid as long as its coordinates and the
  code are unchanged; the cache key is the same key the seed came from.
- **Resumption is exact.** A crashed sweep resumes by evaluating the missing cells only.

## Lazy draws inside the kernel

Order independence at the grid level is undone by fragility at the kernel level. Inside
a single fight resolution, only consume a draw when the outcome actually depends on it —
no avoidance roll for a combatant with zero avoidance chance, no crit roll for a zero
crit chance. A draw taken and discarded costs nothing in the result and shifts every
later draw, which means adding an unused defensive layer to a combatant changes the
outcome of every subsequent event in the fight.

The rule is that the draw sequence is a function of the events that *could* have gone
either way. That is what lets a second caller — a replay tool, an adapter carrying a
simpler model into the kernel, a trace recorder — reuse the kernel and preserve its own
existing draw order.

## Decision rules

- If a result is a cell in a grid, seed it from the coordinates. If it is a single
  scenario run, seed it from the scenario id plus the iteration index — the same rule
  one dimension down.
- If a parameter is not part of the cell's identity, keep it out of the key. Including
  a display setting or a timestamp in the key re-rolls the cell whenever anything cosmetic
  changes.
- If two cells must be *correlated* on purpose — comparing configurations under identical
  conditions, common random numbers — share the key deliberately across the pair and say
  so. That is the one legitimate reason two cells draw the same stream.
- If a conclusion survives at only one base seed, it is a seed artefact. Re-roll the base
  before quoting it.

## When not to use it

- **When the evaluation is deterministic.** No draws, no seeds, nothing to derive.
- **When the sweep is genuinely sequential** — a simulation where cell N+1 begins from
  cell N's end state, such as a progression over time. There the ordering is the model,
  not an accident; seed the *chain*, and note that the grid is a trajectory rather than
  a set of independent samples, because a reader will otherwise read it as one.
