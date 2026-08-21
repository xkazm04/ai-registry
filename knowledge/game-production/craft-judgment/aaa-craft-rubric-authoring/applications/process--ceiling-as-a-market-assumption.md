---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: ceiling-as-a-market-assumption
stack: process
status: forged
verified_on: 2026-08-20
---

# A per-class ceiling file with a written market assumption

`src/lib/craft/craft-ceilings.json:1` in the `pof` ARPG production tool is the
technique implemented almost exactly as described: one record per deliverable class,
each holding a `ceiling` level on the A1–A4 craft axis, a `class` of `permanent |
arguable | uncapped`, and a `reason` written as prose.

The file's own header comment states the contract, including the rendering rule:

> `permanent` = assumed never to move (generative 3D/animation will not reach top
> tier); `arguable` = revisit as the model market moves; `uncapped` = the long-term
> chase (LLMs are expected to reach AAA parity here). A step AT its ceiling renders as
> achievement, never amber shame. Changing a ceiling is a product decision — record why
> in the reason.

## The eight records, and what each classification is doing

- **`text-config`, `graph-data`, `ue-runtime`, `audio`, `vfx-particles` — A4, uncapped.**
  Design docs, systems specs, quest graphs, state machines, runtime code, generated audio
  and effect graphs. The reasons name the bet directly: "AAA-grade code generation is the
  core market bet". `vfx-particles` adds the compositional note that any capped mesh
  inputs are covered by the mesh class's ceiling rather than re-capped here — a ceiling
  is not inherited twice.
- **`2d-art` — A3, arguable.** "Image models arguably reach AA today; AAA key-art parity
  is unproven. Revisit as image models move." This is the exemplary arguable entry: it
  names the missing quality, names the tooling generation it is a claim about, and states
  the trigger for revisiting.
- **`3d-mesh` — A2, permanent** and **`animation` — A2, permanent.** Both reasons end with
  the same sentence pattern: "Reaching A2 here IS the roof."

The lens documents restate the same assumption in prose. `src/lib/craft/lenses/3d-art.md:133`
names the human-craft differentiators the ceiling rests on — sculpt-driven topology,
authored bakes, art-directed material storytelling — and says explicitly that "an asset
set that holds A2 across the board is this lens's definition of success".
`src/lib/craft/lenses/animation.md:112` does the same for motion and adds the rule about
unreachable anchors: "the A3/A4 anchors exist only to calibrate what is deliberately not
being attempted." `src/lib/craft/lenses/2d-art.md:121` closes with "A4 is described above
only to orient scoring; it is not awardable under this lens version" — the ceiling scoped
to the version, which is exactly the coupling the versioning technique wants.

## The rendering rule, implemented

`src/lib/status/craft.ts` carries the achievement rule into the projection. `CraftState`
is `'gauged' | 'at-ceiling' | 'stale'`; `distanceToRoof` clamps at zero so a level above a
later-lowered ceiling never goes negative; the badge suffix for `at-ceiling` is `^`, so a
mesh at its roof reads `A2^` with the spoken form "A3 AA · at ceiling — at the recorded
maximum for this medium".

The precedence comment at `src/lib/status/craft.ts:105` is the part worth transplanting:
`ungauged (no/outdated verdict) → stale → at-ceiling → gauged`, with the note that
"stale beats at-ceiling deliberately: a stale `A2^` on a 3D step would read as 'roof
reached' when it is actually unverified." An invalidation state outranks an achievement
state, always.

## Deviations

- **The ceiling has two homes.** Each lens's frontmatter carries a `ceiling` field
  (`src/lib/craft/lenses/game-systems-code.md:4`) and `craft-ceilings.json` carries one
  per deliverable class. They are keyed differently — lens versus class — so they are not
  strict duplicates, but the values overlap and nothing in the repo pins them together the
  way `lens-versions.ts` is pinned to lens frontmatter by test. One quantity, two writable
  owners.
- **No dates on the arguable entries.** The `2d-art` reason says "revisit as image models
  move" without recording when the assumption was made, so nothing can flag it as expired.
  The standard in the technique keeps the date requirement.
