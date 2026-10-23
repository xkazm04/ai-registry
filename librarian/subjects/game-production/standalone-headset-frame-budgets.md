---
domain: game-production
subject: standalone-headset-frame-budgets
last_touched: 2026-10-22
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

### 2026-10-22 - apply: overdraw-and-transparency-ceiling (run intake-apply-overdraw-1022)

First application, on mage-arena-vr at `c1b94cc`, mode `experiment`, verdict `better`.
Application: `cpp--overdraw-and-transparency-ceiling.md`.

**The seam was chosen to falsify.** The project's D-G4 budget judges particles by count, and
its plan already asks for small screen coverage in words. If count tracked fill on content
authored small, the ceiling would be redundant here. It did not.
- The two palm-height rows are 12% of the count and 89% of the fill.
- Moving two rows at a fixed count doubles the mean fill.
- The closed comfort vignette is three times the whole particle proxy, and the budget files
  it inside a particle row.

**Decision rule added to the technique.** A comfort overlay counts in the ceiling at its own
coverage.

**Still owed:** a device capture. The figures are geometry, and the burst spread that sets
the gaze-region peak is not readable from source. Return at the V1 device sprint.

Still not applied: `per-content-class-frame-budget`, `stereo-draw-call-budget`,
`thermal-headroom-reserve`.

### 2026-10-22 - apply: per-content-class-frame-budget (run apply-pccfb-1022)

First application, on mage-arena-vr at `4e95212`, mode `experiment`, verdict `better`.
Application: `cpp--per-content-class-frame-budget.md`. Project commit `aea4226` on origin master.

**The seam was chosen to falsify.** The project's budget table already looks like a partial
class split: the particle row belongs to effects, and the triangle row names its classes. The
test asked whether the table named a payer in the three D-G4 budget events. It named none:
- The draw row's fail was settled by file ownership.
- Turning occlusion off was paid from triangle headroom, taking the row from 84% to 92% with
  no counterparty.
- Six particle systems passed their own row and added 11 draws to a failing one.

A class split names a payer in all three. The per-part ranking also shows the draw overrun
was projectiles first and interface second. It read as a character cost only because one
presentation file draws all three classes.

**The falsifier fired on the device clause.** The two declared headsets share chip, RAM and
the default eye buffer, so they tie on fill. "The larger display binds fill" is corrected to
"the larger eye buffer binds fill", in the technique, the golden path and the overdraw
technique. **Two decision rules added:** a class with its own count row still owes a share on
every shared row, and a fix paid from another row's headroom is a written trade.

**Structural fact.** The table grows a share only where one module owns a number: the game
thread split by system, and particles. It has none for quantities every class loads.

**Still owed:** every share's size, a thermal reserve, and a GPU and render-thread capture
with one class hidden per run. Return at the V1 device sprint.

## 2026-10-22 - thermal-headroom-reserve (apply, mage-arena-vr)

Mode `experiment`, `structural-only`, verdict `unmeasurable`. The seam was chosen to falsify "the verdict is the late windows, not the mean": it would have fired if the capture path already kept time-ordered windows. It does not: the proxy samples 60 s after a 10 s warm-up against a 7-10 minute session, the frame ceiling is the whole 72 Hz interval (reserve 0%), and 0 of 17 committed summaries hold a frame series (the per-frame file sits in an ignored directory). The technique held and is unamended. The request-level clause had nothing to lower: no performance level is set, so the plugin default (sustained levels) applies.

**Still owed:** the first device capture split into early and late windows, with levels and temperature per window, and the reserve row written with its measured gap.

Every technique in this subject now has an application row.

### 2026-10-22 - `/intake apply stereo-draw-call-budget` (run `ia-stereo-dcb`)

**Tree.** `mage-arena-vr` `origin/master` at `be9a81b`, read in a short-path worktree; the
primary checkout is 120 commits behind. Project commit `3ee293a` (`.ai/applied.jsonl` only).

**Mode.** `experiment`, a static audit of every place the draw-call cap is stated. Verdict
`unmeasurable`. The seam was chosen to falsify "a cap with no path, side and unit is
incomplete": it would have fired if the research's per-frame reading had reached the cap rows.
It did not reach them: 12 statements, 0 carry all three terms, and the capture gate prints no
path. The technique held and is unamended.

**Structural fact.** The project derived the right reading in a research file and nothing that
decides a verdict inherited it. No document asks a device to report that multiview ran.

**Still owed:** a V1 checklist row logging the active stereo path, and the audit re-run once
the cap text carries its terms.

Still not applied: `thermal-headroom-reserve`.
