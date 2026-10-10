---
subject: steering-feel-profile-shaping
domain: game-production
last_touched: 2026-10-10
touched_by: deepen
dry_streak: 0
---

# steering-feel-profile-shaping

A racing-vehicles subject forged on 2026-10-01 with six techniques and two `process`
applications. Both read Death Ride's feel pipeline and its five-row profile table. It had no
subject note.

## Touch log

### 2026-10-10 - `/deepen`, single subject (run dp-sfp-1010)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
rank was real. The code is Kotlin, the bundle declares `kotlin`, and the tree had moved under
the applications. Three lanes ran:
- a field lane on firetv `deathride/main` at `d9990777`. It read `FeelProfile.kt`, the
  handling fork in `World.kt`, the axle model in `Drift.kt`, `Cars.kt`, `feel.csv`,
  `drift.csv`, `FeelTest` and `DriftModelTest`. Three scratch experiments ran in a detached
  worktree with a slew-rule toggle that was never committed. The game's own `FeelTest` ran green
  in the same build.
- a counter-evidence web lane. I re-fetched the two sources that landed in technique text and
  read them verbatim: the XInput "getting started" page and the PhysX 4.1 vehicle guide.
- a training-data-only blind lane.

**Widened: three kotlin applications** (kotlin@2.0.21). All 22 anchors hold under
`check-anchors`.
- **`kotlin--five-profile-trace-bands`** (experiment, better). `FeelTest` builds a bare
  `CarSpec()` with no drift geometry, so its 60 traces run the single-body handling path.
  Every catalogue car has run the axle model since 2026-10-01 (`c1923384`), with a human
  steering gain of 2. The bands were set on 2026-09-30. Through `CarCatalog.apply`, the same
  step fixture puts 60 of 150 traces out of band; 59 fail on yaw, 56 of those above the band.
  `FeelTest` passes 15 of 15. At pinned speed a full-lock step spins the axle model: 70 of 150
  traces exceed 45 degrees of slip, 7 at half lock and 0 at a quarter.
- **`kotlin--asymmetric-steer-slew-rise-return`** (experiment, better). The game still uses
  the exact-zero rule (`World.kt:201`). There were 88 paired runs: 4 profiles x 11 vehicles x
  ease or reversal, at 18 m/s. The magnitude rule cut input lag in all 88, by 17 to 133 ms.
  Yaw settled faster in 43, the same in 37 and slower in 8, all 8 on the livelier profiles.
  Both controls held: release, and the equal-rate baseline, came out identical under both rules.
- **`kotlin--brake-never-reverses`** (unapplied). The axle model clamps a sign crossing, not
  forward speed: "A brake may stop existing reverse travel, never create it." The game already
  tests both halves in `DriftModelTest.kt:87`.

**Re-anchored.** Nine anchors in the two `process` applications had moved (`World.kt`
anchors shifted by 5 to 30 lines, `index.html` by 64). All 39 hold at `d9990777`, and `verified_on` moved
to 2026-10-10. Both applications now note the axle path.

**Conditioned (no new technique).**
- *five-profile-trace-bands*: build the fixture through the shipped factory and assert the
  branch it took (measured; the training lane reached the same fixture-path trap blind). Pin
  speed only below the spin point (measured; the training lane also flagged velocity pinning).
- *asymmetric-steer-slew-rise-return*: the twofold return is an engine-sample default (PhysX
  steer rise 2.5, fall 5.0, read verbatim), not a survey of shipped titles. Some titles expose
  one rate; a simulation's manual advises a slower keyboard return. The magnitude rule wins at
  the input and is a likely, not a free, win at the vehicle (measured).
- *deadzone-exponent-remap*: "published guidance around a tenth" had no source and is gone.
  Platform defaults (19 to 25 per cent) cover stick noise, and tuned racing values are a few
  per cent. The order is confirmed by the XInput page (verbatim). An outer dead zone and the
  single-axis read were added; both lanes agreed on them.
- *throttle-instant-release-progressive-rise*: engines ramp the fall faster than the rise
  (PhysX pad 6 against 10, verbatim), and none found is instant. The cliff is justified by the
  touch and network ambiguity. Lift smoothing belongs on the weight transfer.
- *brake-never-reverses*: the floor keys on the crossing in a model that can spin (field). A
  gated brake-to-reverse is a product decision, not this defect. That point came from the
  training lane only and is phrased as a when-not.
- *golden path*: a new failure mode, "a fixture on a path nobody drives", plus the spin-aware
  brake, the throttle-cliff rationale, and the speed-steer claim hedged to vehicle kits.

**Verified and left untouched.** The dead zone is subtracted, rescaled and then bent, in that
order. The selection rule is return on falling magnitude or a sign change; the training lane
reached it independently and named the same exact-zero defect. Brake beats throttle on the
raw input. Shaping is owned by the core.

**Not found / declined.** Unreal Chaos default input rates sit behind the Epic login and are
unverified, so they are not cited. The game-option names for speed sensitivity and
countersteer assist came from search summaries and forums, so no product is named. The
brake-to-reverse convention has one lane and is not a technique.

**Impact.** 0 contexts. firetv is absent from the committed `projects.json` and has no
manifest or map, so nothing joins this subject. The return condition is firetv declaring
game-production, or Death Ride getting its own manifest.

**Banked leads.**
- An ease and reversal pattern in the game's trace test (return condition: the owner's call on
  the slew rule).
- Re-banding the profiles on the axle model at a sub-saturation step (return condition: owner).
- A worked tool-side sweep for the spin threshold per class (return condition: a second
  project with a slip model).
