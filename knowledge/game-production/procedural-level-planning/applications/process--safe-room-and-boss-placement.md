---
layer: application
type: application
subject: procedural-level-planning
technique: safe-room-and-boss-placement
stack: process
status: forged
---

# Placement rules carried by a generation prompt

`buildProceduralLevelPrompt()` in `src/lib/prompts/level-design.ts:361-474` (Path of Fire
tooling repo, `C:\Users\kazda\kiro\pof`) is the prompt-pipeline realization: the designer's
wizard selections become a structured brief that a code-generating CLI turns into a level
generator. The placement rules live in that brief as **declared constraints with reasons**,
not as prose the model is left to infer.

## Constraints render as rules, not as adjectives

`config.constraints` is five booleans (`spawnPoints`, `lootPlacement`, `bossRoom`,
`secretRooms`, `safeZones` — typed in `src/lib/level-design/procgen-spec.ts:33-39` as
*"Gameplay toggles as DECLARED inputs — not prose assembled into a prompt"*). Each enabled
toggle renders one line at `:376-390`, and each line carries its placement rule:

- **Loot placement** — *"Treasure chests in dead-ends, item drops scaled by room difficulty,
  loot room at 60-70% progression."*
- **Boss room** — *"Largest room, placed farthest from start, single entry corridor,
  arena-sized with cover."*
- **Safe zones** — *"Rest areas near start and at ~50% progression, no enemy spawns,
  shop/save functionality."*
- **Secret rooms** — *"1-2 hidden rooms with destructible walls or hidden switches, bonus
  loot inside."*
- **Spawn points** — player start in the start room, enemy spawns distributed by room
  difficulty, a minimum distance between spawn points, a dedicated boss spawn.

Those four bracketed numbers — 60–70% of progression for the principal reward, ~50% for the
mid-level rest beat, one entry corridor for the arena, 1–2 secrets — are the placement
contract this subject teaches, stated where the generator will actually read them.

## The two definitions that are easy to lose

The prompt's safe-zone line defines the role by what it **forbids** (no enemy spawns) and
what it **offers** (shop/save), not by a label. The boss-room line does the same for the
arena: largest and farthest are necessary but not sufficient; a single entry corridor and
cover are what make the space play as a climax rather than as a big room. Both were upward
lessons over an expert draft that had stated only size and distance.

The generated room struct at `:437-439` carries the roles as **data** — `RoomType (enum:
Normal, Start, Boss, Treasure, Secret, Safe)` and `Difficulty (float 0-1)` per room, plus a
`Connections` array — which is what lets the downstream pacing linter and any consumer of the
room graph read the roles instead of parsing names.

## Determinism travels in the same brief

The prompt's standing rules (`:369-373`) include *"The system must be deterministic with a
seed parameter"*, and the best-practices block at `:466` is explicit about the mechanism:
*"Use FRandomStream with seed for all random operations (not FMath::Rand)"* — the seeded
stream rather than the ambient global, exactly the discipline
`seed-determinism-contract` requires, enforced at authoring time rather than caught in
review. `src/lib/level-design/frandom-stream.ts:1-20` ports that same generator into the
tooling so a seed means one thing on both sides, while its own header carefully denies the
larger claim: running the same RNG *"does NOT mean the preview shows the level UE will
bake."*

## Where it falls short

The seed line at `:429` degrades to *"Seed: **Random** (generate via FMath::Rand())"* when
the designer leaves the field blank — the one place the brief instructs the unseeded global
it elsewhere forbids, producing a generator that cannot reproduce its own first run. The
tooling side already solved this: `hashSeed()` in `frandom-stream.ts:68` falls back to
`DEFAULT_PREVIEW_SEED = 1337` precisely so the preview stays deterministic and "never
wall-clock random". The standard is unchanged — an absent seed is resolved to a shown
constant, never to an unseeded draw.

The prompt also states determinism as "same seed + params = same output" (`:441`) with no
generator version in the equation, and its example algorithm parameters (`:327-345`:
cellular birth 5 / survival 4 over 4–6 iterations, noise octaves 4–6 with persistence 0.5
and lacunarity 2.0) are transplanted into the generated code where a later tuning pass
would silently break every stored seed. The version term belongs in the contract.
