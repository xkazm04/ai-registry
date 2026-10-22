---
layer: application
type: application
subject: standalone-headset-frame-budgets
technique: per-content-class-frame-budget
stack: cpp
status: draft
verified_on: 2026-10-22
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: structural-only
---

# Reading a Quest budget table by content class, and the headset pair that ties on fill

Source tree: `mage-arena-vr` on `master` at `4e95212`, the root of every path below. The
stack is C++ in an Unreal Engine 5.8 project, witnessed by `"EngineAssociation": "5.8"` in
`apps/vr/Game/MageArenaVR.uproject`. There is no `CppStandard` override, so the language level
is the engine default, C++20.

**This is a desk-phase tree.** No build has run on a headset, so no share below has a size.
The project now carries `docs/research/CLASS-SPLIT-2026-10.md` (commit `aea4226`).

## The seam, chosen to falsify

The plan's budget table (`docs/PROJECT-PLAN.md`, section 7) states one frame time, "13.9 ms;
p95 ≤13.9 ms", for everything. One stage is split off: the game thread, at 6 ms, holds the
kernel and the recognizer as system shares. The count rows are shared, with two exceptions
that already look like a class split. The particle row belongs to effects. The triangle row
names its classes: "hands + arena + 20 actors". If those rows did a split's job, the technique
would be redundant here. The test was the three times a row came under pressure in the
project's desktop budget record. Did the table say which class had to cut?

- **Target:** the events the budget can attribute to a class share, and the quantities whose
  binding headset is named with a reason.
- **Floor:** every recorded verdict and figure stays as it is. No config, code or plan row
  changes.

## Arm A: the table as written

| Event | What the table said | What happened |
|---|---|---|
| Draw calls measured at median 310 against ≤150 | one shared row; fail | Settled by a decision record. The material fix went to the lane that owns the presentation file, by file ownership. |
| Occlusion queries turned off for every platform, to cut 155 query draws | nothing; the triangle row passed before and after | The all-pass triangle maximum rose from 293,696 to 321,536, from 84% to 92% of the row. That headroom belonged to three classes, and none of them was asked. |
| Six particle systems added | effects passed their own row, 1,468 of 2,000 | They added 11 draws at the median to a draw row that was already failing. The verdict stayed fail, unchanged from before they were added. |

**0 of 3 events attributable to a class.** Each was settled sensibly, by judgment against a
file map. The table itself named no one.

## Arm B: a share per class

Six classes come out of the stress scene: environment, characters, projectiles (a class this
game adds), interface, hands and effects. Before the material fix, every part was its own
material instance, and those parts drove the draw count. Of 160 such parts, projectiles were
62.5%, the 40 health-bar parts 25% and enemy bodies 12.5%. So the class behind most of the
draw overrun was projectiles, and the second was **interface**. The overrun read as a
character cost only because the characters' presentation code draws all three. The triangle
row's class list leaves out the two largest part counts in the scene.

With desk counts used to rank and every device share left empty until the first device
reading, which is what the technique requires, all three events have a class that pays:
- Projectiles and interface own the draw overrun.
- The culling change becomes a written trade against the classes that held the triangle
  headroom.
- Effects owe their 11 draws from a share on the draw row, whatever their own particle row says.

**3 of 3.** The project doc also records three absences: no thermal reserve ("recorded in
every capture" is a measurement, not a reserve), no GPU row, and no render-thread row. The
render-thread row is missing even though the capture already reads `RenderThreadTime`.

## The falsifier fired on the device clause

The table binds everything to Quest 3. The technique, as written, said fill binds on the
device with the larger per-eye display, which would also be Quest 3 (2064x2208 against
1832x1920). The project's feasibility research, `docs/research/FEASIBILITY-2026-10.md` Q3,
holds the better rule, marked Confirmed. Both headsets share one chip and 8 GB, and both
render the same default eye buffer, 1680x1760. It adds: "A higher pixel density set per
device would break that". So the two headsets **tie** on fill, submission and memory, and
Quest 3 binds only because nothing differs. The technique, the golden path and the overdraw
technique now say the eye buffer binds fill, not the panel. A tie is written down with the
setting that would break it.

## The structural fact

The one stage the table does split, the game thread, is split by **system**: the kernel step
and the recognizer. Class appears nowhere in the time rows. The only class share in the table
is the particle row, the one quantity a single subsystem emits. A table grows a share
wherever one module can own a number. It does not grow one for quantities that every class
loads: draws, triangles, fill and GPU time. Those are the rows where all three events
happened.

## What this cannot show

- **No share has a size.** The desk capture adds 280 draws and 73k triangles over the empty
  arena, and does not split them by class. The ranking above counts components, not measured
  draws. Splitting by class needs the stress driver to spawn one class at a time.
- **Thermal and the smaller headset's per-app memory ceiling** are read nowhere in the tree.
- **The verdict is about what the budget can attribute, not about speed.** `better` means the
  split names a payer for every recorded event. It moved no frame time.
