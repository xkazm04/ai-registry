---
spec: forge
status: EXECUTED
subject: rigid-body-simulation-stability
bundle: game-production
category: engine-integration
source: https://github.com/NVIDIA-Omniverse/PhysX
source_commit: 6dc53585d7db07346f53d0598a5fd3bfdce47d8d
run_id: px1014
date: 2026-10-14
---

# Forge spec: rigid-body-simulation-stability

**Why this is XL, argued.** Five mechanisms from one tree's operating guides (an
articulation-stability guide, a collision-behaviour guide, a gripper-tuning worked
example, a performance guide and a known-limitations table) share one home the corpus
lacks: how a constraint-based simulation is kept stable while it is tuned. A content
search (not the slug map) over every bundle's documents for spring-damper vocabulary
(natural frequency, damping ratio, critically damped, implicit integration or spring,
spring-damper) returned **zero** documents, and one for solver-iteration, sub-step,
fixed-timestep, depenetration and tunnelling vocabulary returned four incidental ones; the only neighbours are arcade vehicle handling
(`racing-vehicles`), which models a hand-rolled integrator for feel, and
`gameplay-runtime-patterns`, which owns update order, not stiffness. The mechanical
trigger (three design candidates, one home-if-new) fired. A single author's account of
a tree is thin evidence for a subject, so this spec names the primaries that have to
corroborate it, and names the case where the source's own guides contradict each other.

## Placement (verified against the authority, not a count)

`knowledge/game-production/taxonomy.json`: category `engine-integration`, layout
`nested`, holding 9 subjects before this entry and 10 after it. `MAX_CHILD_DIRS` is 10
(`scripts/lib/taxonomy.mjs`), so this is the last slot: **the category is full after
this lands**, and the next engine-integration subject needs a taxonomy decision, not a
folder. The director appends `rigid-body-simulation-stability` to that category's
`subjects` before dispatch.

Subject folder:
`knowledge/game-production/engine-integration/rigid-body-simulation-stability/`.
From the golden path the laws file is `../../_laws.md`; from `techniques/` and
`applications/` it is `../../../_laws.md`. Purity profile is `game`: no engine, DCC or
generative product names, no vendor attribute names, no file formats named after a
product. Say "the solver", "the drive", "the scene's step rate".

## The subject, in one paragraph

A simulated mechanism (a robot arm, a ragdoll, a vehicle chassis, a gripper closing on
an object) goes unstable for one of two reasons that look the same on screen: a
**stiff constraint** is being integrated at a step too coarse for its frequency, or a
**contact** is being resolved with too little room, mass or iteration. The two have
different cheapest fixes, in opposite order, and the source's own guides disagree about
which lever comes first because they are answering different instabilities. The subject
is the triage: name which stiffness is the source, spend the cheap lever for that
source, and derive the numbers from the mechanism instead of tuning by eye.

## Proposed techniques (slugs are final; the decision rule each must carry)

1. `spring-by-frequency-and-damping-ratio` - Author every spring-damper as (natural
   frequency, damping ratio) from the lightest mass or inertia it couples, never as a
   copied stiffness. Derive stiffness from the force you need at the smallest error you
   care about, then read the frequency it implies and compare `step x frequency` to 1.
   Two regimes: with explicit stepping that product is a stability bound; with an
   implicit or exact discretization it is not, but the applied force **saturates** past
   it (raising stiffness further reduces the response, extra damping does almost
   nothing). When the frequency is too high and the physical model justifies it, add
   reflected inertia (rotor inertia x gear ratio squared) instead of lowering the gain.
   Re-derive damping whenever stiffness changes. **Carry the measured case below.**
2. `instability-triage-by-stiffness-source` - The tree's articulation guide says raise
   the step rate first, then cut solver iterations to the lowest count that holds; its
   collision guide says the step rate is the last lever, after contact offset,
   speculative sweeps, mass ratio, depenetration cap, iterations and friction. Both are
   right for their own instability. Discriminator: instability that tracks a **drive,
   a coupled joint or a closed loop** (stiffness-limited) takes the step rate first;
   instability that shows as **penetration, jitter or tunnelling** (contact-limited)
   takes the cheap contact levers first. The exit condition is the cheapest
   configuration that still holds on a **reproducible** scene; an intermittent case
   gives no signal and is not tuned.
3. `bound-actuation-by-the-lightest-coupled-body` - Clamp a drive's force and a joint's
   velocity from the actuator specification, then check the resulting acceleration
   against the lightest body in the coupled pair, including its attached subtree. Rules
   of thumb to test against the primaries: linear accelerations orders of magnitude past
   gravity, and angular steps approaching a full turn, are bugs, not tuning. Large
   mass or inertia ratios across a joint or a contact are a defect in the model to fix
   before any solver setting. **A force that can remove more velocity than exists in one
   step is the same bug in a hand-rolled integrator**: clamp the correction to what one
   step can absorb.
4. `replicated-environments-share-unbounded-geometry` - When one scene is cloned N
   times to train or test in parallel, any unbounded collider (an infinite ground, a
   half-space) duplicated per copy overlaps every other copy, so contact work grows
   with N squared and the profiler blames the solver. Rule: unbounded geometry exists
   once and is shared, or is replaced by a bounded collider positioned per copy;
   verify with a recorded contact dump of two copies, not by inspection. Boundary: this
   is about cloned scenes, not about broad-phase tuning in a single scene.
5. `filter-the-pair-after-proving-the-class` - Unintended self-collision between
   non-adjacent links is a common instability. Diagnose by disabling self-collision
   wholesale **once, to prove the class is the cause**; then restore it and filter only
   the offending pairs. Adjacent links are already excluded by the joint, so filtering
   them is a no-op that hides the real pair. Never ship the global disable when the
   model needs self-collision for its job.

## Measured case to carry (technique 1 and 3): a hand-rolled integrator, five step sizes

A managed project's top-down vehicle model discretizes its first-order lags with the
exact exponential form (`1 - exp(-dt/tau)`) and clamps its lateral correction to the
velocity that exists. Run through the project's own test gate (scratch test, deleted
afterwards), the same steered-cornering input was integrated at 120, 60, 30, 20 and
15 Hz and compared with a 240 Hz reference over a 2 s full-lock corner at 30 m/s
(steer 1.0, throttle 1.0; reference heading -1.969 rad, slip 0.409 rad, speed 25.33 m/s):

| step | heading error (rad) | slip error (rad) | position error (m) |
| --- | --- | --- | --- |
| 120 Hz | -0.0046 | -0.0015 | 0.256 |
| 60 Hz | -0.0137 | -0.0044 | 0.766 |
| 30 Hz | -0.0316 | -0.0105 | 1.768 |
| 20 Hz | -0.0490 | -0.0168 | 2.750 |
| 15 Hz | -0.0659 | -0.0233 | 3.706 |

Every value finite at every step: the exact form removes the stability bound. The
error is **first order in the step** (roughly 3x per 3x), so unconditionally stable is
not step-invariant; a gentler corner (steer 0.4) shows the same slope (0.56 m at 60 Hz).
The decision rule this adds: an exact or implicit discretization buys stability, not
accuracy, so a fixed step is part of the model and a variable step needs a convergence
check, not a stability check. The project's existing step-size test covers
straight-line throttle only (tolerance 0.8 m at half rate) and does not see the yaw
path.

## Boundaries it must NOT absorb

- Update order and read/write copies of state: `gameplay-runtime-patterns`
  (`update-order-and-frame-coherence`). This subject starts after the step order is
  fixed.
- Arcade vehicle feel, drift state machines, steering response curves:
  `racing-vehicles` (`top-down-vehicle-handling-model`, `steering-feel-profile-shaping`).
  Those subjects tune for feel with a model that is not a solver; this one tunes a
  solver. Name the boundary in both golden paths' notes, not by link across bundles.
- Bounded collision spin and ram energy: `mass-based-arcade-collision`.
- Per-frame cost of a hot path: `perf-regression-gating`, `render-submission-economy`.
- Any product's attribute names, schema layers or authoring files. The source's
  attribute vocabulary is the strip test's input: what survives is the mechanism.

## Where the instance lives (read-only tree; commit pinned above)

Clone is at `C:/t/px1014` until this run's Phase 9 (it is deleted by run id; if the
worker finds it gone, re-clone the pinned commit shallow at a short path). Operating
documents, in order of density, under `ovphysx/docs/guides/`: `articulation_stability.md`
(drive stability, acceleration drives, mass ratios, armature, self-collision, solver
order), `gripper_tuning.md` (the worked derivation: max force from load and friction,
stiffness from force at the smallest delta, damping from a ratio, the implicit-spring
caveat, armature as reflected inertia), `collision_tuning.md` (the ordered lever list),
`performance.md` (cloned-environment ground plane), `limitations.md` (fourteen rows,
"none known" means no workaround exists). The managed-project seam is the vehicle
integrator described above; it is **not** published and must not be cited by path.

## Applications (1-3, not per technique)

1. `process--...`: the order of operations for tuning a gripper closing on a load,
   written as a procedure (minimal scene, gravity off then on then lift; derive, then
   verify against the spec's open-to-close time and held load; then fine-tune one
   parameter and re-derive its dependants). Stack `process`.
2. `kotlin--exact-step-bounded-correction`: the measured case above, as an application
   of techniques 1 and 3 to a hand-rolled integrator. First paragraph says the witness
   for the stack version (the project's build file) and that the numbers are from the
   project's own test gate on 2026-10-14. No paths, no project name.
3. Optional: a negative application ("what this realization cannot do"): the exact
   step makes the model stable at any rate and says nothing about whether the result
   is right at that rate.

## Web budget (primaries, ~6 fetches, spend them on the claims most likely wrong)

- A published treatment of soft constraints as a spring-damper with a frequency and a
  damping ratio, including the implicit formulation and why it is stable at large steps
  (the 2011 GDC talk on soft constraints from the Box2D author; its repository hosts
  the PDF).
- A published treatment of sub-stepping against iterating (the same author's solver
  comparison write-up); the claim to test is "a smaller step with fewer iterations
  beats more iterations at a larger step", which is technique 2's first branch.
- One reference on reduced-coordinate articulated-body dynamics for the mass-ratio and
  reflected-inertia claims (Featherstone). Fetch only to confirm armature as reflected
  rotor inertia (`I_m * G^2`).
- Spend the rest on the two claims most likely wrong: the acceleration rules of thumb in
  technique 3 (the source gives them without derivation) and the "~250 is a good SDF
  resolution" style numbers, **which must not land as numbers** (dated, tree-specific).

## Open questions the drafter decides (do not leave them for a later pass)

- Technique 2 states a contradiction between two guides. Decide whether it is a
  technique or a section of the golden path; the director's lean is a technique because
  it carries a discriminator and an exit condition.
- Whether technique 5 is big enough to stand alone or folds into technique 3 as its
  last section. Fold it if it cannot carry its own decision rule beyond "filter the
  pair".
- Which of the law ids in `_laws.md` the techniques may cite. Cite only laws that
  already have anchors; do not invent one. `a-number-carries-its-unit-and-basis` is a
  candidate for technique 1 (radians against degrees was the source's own trap).
- Dated facts (default step rates, iteration counts, buffer sizes) do not land. If a
  number is the only content, it is a lead.

## Worker contract

Read, in order: `docs/forge-brief.md`, `docs/harvest-brief.md`, `docs/rkb-profile.md`,
this spec, then every neighbour named under Boundaries. Draft expert-first, spend the
web budget on the primaries above, reconcile read-only against any tree the bridge
names, run the gate on your own subject, run **no git**. Override this brief wherever
the neighbours' stated scopes or the primaries say it is wrong, and say so with the
argument in your report. Return a report that lists every file written and every
override; the director reviews the diff, not the report.

## Execution record (2026-10-14)

Forged in the intake session by one worker; reviewed by diff (gate green, purity clean
in the golden path and techniques, `use_when` on all five, anchors on the process
application 8 held / 4 unquoted). Overrides, all accepted: (1) application filename is
`kotlin--spring-by-frequency-and-damping-ratio` (stack--technique); (2) no third
application, the "cannot do" content is a section of the kotlin one; (3) the primary
(soft-constraint talk) and the worker's own one-step derivation say the implicit-spring
force rises to a ceiling of mass x error / step^2 rather than falling, so the subject
says "saturates" and the process application records the disagreement with the source
guide; (4) the acceleration rules of thumb were replaced by a derived check against the
thinnest collider and contact margin; (5) the primary's "at least 4 steps per period"
replaced the guide's looser bound. Technique 5 stayed standalone. engine-integration is
now at the 10-subject cap.
