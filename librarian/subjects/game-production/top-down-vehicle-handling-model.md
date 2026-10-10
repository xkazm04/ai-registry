---
subject: top-down-vehicle-handling-model
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# top-down-vehicle-handling-model

A racing-vehicles subject forged on 2026-10-01 from Death Ride, with six techniques and two
`process` applications. The subject had no subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-tdv-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real, and the subject had been overtaken on the day it was forged. The bundle landed
at 12:17 on 2026-10-01. Later that day Death Ride moved every roster car to a two-axle solver
(D2 at `c1923384`, D3 at `85d93766`). Its design note says it read this subject first. So the
process applications described a path that no shipped car takes. Their anchors had drifted: 10
of 27 failed on one and 9 of 25 on the other.

Three lanes ran:
- **Field lane** on firetv `deathride/main` at `d9990777`. It read `Drift.kt`, the routing in
  `World.kt`, the D1, D2, D3 and V1 notes, and the tests. It ran two experiments with four
  ablation switches in a detached scratch worktree. Nothing was committed to the game.
- **Counter-evidence web lane.** Sources were fetched as text and grepped. Two quotes were
  re-fetched by this run: Monster's tutorial, and arXiv 2306.04117.
- **Training-data-only blind lane.**

**Convergence across all three lanes:**
- A two-axle model is the arcade baseline when which-end-lets-go behaviour is wanted.
- Steady body slip on two axles is not zero.

**The golden path was conditioned, not reversed.** "Nothing needs an axle" holds for grip
driving. "Realism creep" now starts after two axles, not at them. A new failure mode was added,
the silent model swap. A second one-authority incident is recorded: surface loss applied twice
on the axle model broke ice recovery.

**Widened with two kotlin applications** (kotlin@2.0.21, 44 anchors held):
- **`kotlin--slip-restoring-yaw-stability`** (experiment, better).
  - Arms: raw restoring to zero, 26.3% mean off the point model (up to 48.8% Balanced, 60.7%
    Stable); shipped, 13.6%, closer in 36 of 50 pairs.
  - The neutral target alone is the smaller part: closer in 29 of 50, 14.8% against 13.6%.
  - Deviations: the counter-steer witness builds a bare spec; the grip comparison CSV now
    carries the human gain in only one arm; a human branch sits in a force law, against the
    project's own brief.
- **`kotlin--bounded-load-transfer-grip`** (experiment, not-better).
  - Under braking, transfer adds under a degree to a ten-degree slip rise (9 of 10 classes).
  - No arm produces power-oversteer.
  - Removing the friction circle gives the same small effect.
  - Deviations: legacy table rows feed only the default spec; the braking witness runs on the
    dead path.

**Techniques gained conditions.** `slip-restoring-yaw-stability` has a two-axle section with
the measured split between its two parts and a fade before the spin. Its "remove one" absolute
was refuted by the blended servo. `bounded-load-transfer-grip` gained the axle form: a clamped,
derived target, and an ablation obligation. Its low-pass is now labelled a design choice no
canonical tutorial makes. `kerb-verge-inside-hard-wall` now prefers edge sampling while the
roster's widths still change.

**Re-anchored.** Both process applications are at `d9990777`, 29 and 29 held, and
`verified_on` moved. Both of their recorded deviations had been **adopted by the project**:
- the hysteresis band witness (D1 cites the registry);
- the reachable verge (V1 "Reproduce the forge finding"; `VergeTest` covers every class on both
  walls).

The kerb-verge application's headline flipped from unreachable to reachable and tested.

**Verified and left untouched:**
- drift-state-hysteresis: the flag selects no physics; the band test exists; the one web source
  agrees.
- The cliff failure mode: the web lane refuted "falloff is required" but not the cliff.
- surface-grip-drag-ladder.

**Declined:** the friction circle as a technique. It converged on mechanism in the training lane
and the field, but the ablation gave +0.7 deg. Its demonstrated role is a correctness bound
(D2's ice AI asked for full brake and full cornering), and the canonical tutorial omits it by
design.

**Impact: 0 contexts.** The map dry-run joins this subject nowhere. firetv sits in a sibling's
uncommitted `projects.json` entry, and its manifest declares software-engineering, localization
and llm-observability only. Return condition: firetv declares game-production, or Death Ride
gets its own manifest.

**Banked leads:**
- speed-attenuated-steering-authority: the axle solver added a reference-wheelbase steering
  ratio (D3 step 1) so long cars turn wider. Return: a second roster with mixed wheelbases.
- Re-run the W3 surface finish-time table on the axle roster. Its numbers predate D2. Return:
  owner re-bands, or a surface table change.
- Low-speed guard: arcade slip models jitter around a stop (web lane). Death Ride regularises
  below 3 m/s and caps the per-tick lateral impulse. Return: a project without a guard.

Clocks: the derived per-stack window; no `refresh_by` set.
