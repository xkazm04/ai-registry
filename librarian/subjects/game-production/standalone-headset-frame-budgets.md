---
domain: game-production
subject: standalone-headset-frame-budgets
last_touched: 2026-10-21
touched_by: intake
dry_streak: 0
depth: L1
---

# standalone-headset-frame-budgets

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-10-21 - `/intake apply forward-path-feature-allowance` (run `apply-fpfa-1021`)

This is the first reconciliation against real code. The subject was founded on 2026-10-17
(`40dc5965`) as a text-only draft.

**Tree.** `mage-arena-vr` `master` at `d25ecc7`, read in a short-path worktree of origin
master. The project commit is `41e7f3f` on origin master (docs and `.ai/` only). The primary
checkout was left untouched: it is 61 commits behind origin and carries owner WIP in
`.gitignore`. For one row, the installed 5.8.3 engine's renderer source was read.

**Mode.** `experiment`, a static audit of ten allowance rows against config, data, code and
the plan. The verdict is `better` on the naming target. Before, 4 of 10 rows had no project
decision; after, 0 of 10. The floor held: six explicit decisions, no config change. The seam
was chosen to falsify "a feature that is not listed will be assumed". It would have fired if
every row were already decided. It did not fire: the decided rows were exactly the ones an
earlier research finding had forced, and every other row sat at the engine default.

**Four unenforced rows.**
- Post chain: `r.MobileHDR` is unset, so it is on by default.
- Lights: the code has two movable lights, and the plan allows one dynamic light.
- Decals: a style study assumes them.
- Foveation: off by default.

**Boundary added to the technique** as a decision rule. A plan-held allowance names the
setting or code line that enforces each row. Until a row has one, the code is the allowance.
In this tree the plan's lighting row lost to the greybox code within the first phase.

**Engine read that narrowed a claim.** On Vulkan, the mobile decal path reads depth through a
subpass fetch even with Mobile HDR off. So a depth-projected decal does not force the frame
off chip there. The technique already confines its warning to decals that read normals, and
that held.

**The evidence gate is still owed.** No row carries a device cost, and no build has run on
the headset. Return at the project's V1 device sprint (from 2026-11-04). Run a GPU capture of
the stress scene with `r.MobileHDR` on and off, and check that the blink's camera fade still
renders with it off.

Not applied this run: `per-content-class-frame-budget`, `overdraw-and-transparency-ceiling`,
`stereo-draw-call-budget`, `thermal-headroom-reserve`. The project's D-G4 budget proxy (draw
calls, particles, triangles) is the nearest seam for the first and third.
