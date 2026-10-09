---
subject: mass-based-arcade-collision
domain: game-production
last_touched: 2026-10-09
touched_by: deepen
dry_streak: 0
---

# mass-based-arcade-collision

Forged 2026-10-01 in the racing-vehicles category from the Death Ride project. It had six
techniques and two applications filed under `process`, both of which read a pure-Kotlin
contact solver.

## Touch log

### 2026-10-09 - `/deepen`, single subject (run dp-mbac-1009)

Dispatched by Curator's projection of the attention scan on **single stack (process)**. The
finding was a mislabel: both applications cite Kotlin code and sat under `process` because
the bundle had no Kotlin stack when they were forged. The run used these lanes:
- a field lane on firetv `deathride/main` at `d9990777`;
- a fleet seam search with per-project `git grep` (Death Ride as the known positive). No
  other registered project has a contact solver; pof's hits are prompt text about an
  engine's physical materials;
- a simulation lane: a 1D port of the tree's `collide` and `contain`, plus roster
  arithmetic over the real shapes, masses and inertia;
- a counter-evidence web lane, which read engine sources raw and the perception
  literature through the Europe PMC full text;
- a training-data-only blind lane.

**Refiled and widened.**
- The two applications now sit under `kotlin` (verified_against kotlin@2.0.21) and were
  re-resolved at `d9990777`. Every World.kt line the forge cited had moved.
- Four new kotlin applications cover the remaining techniques: spin, the circle chain,
  the wall and the pairing.
- Anchor census, by `check-anchors`: 17, 14, 7, 6, 6 and 5 anchors, all held. Quotes were
  written without inner double quotes.

**Conditions, each reached by two lanes:**
- **Restitution pairing is a design choice, not physics.** Of eight engines checked
  (five read at source, three from their documentation), none defaults to the minimum.
  Box2D v2.4 and v3 and Matter.js use the maximum, Godot a clamped sum, Bullet and
  Chipmunk the product, and PhysX, Unity and Unreal the average. Vehicle-collision analysis computes the pair coefficient from both cars
  (arXiv physics/0601168). The blind lane reached the same defaults. The field adds that
  every Death Ride class shares 0.24, so the rule is inert there, and the design note
  promises per-car values that the code never sets.
- **Choose the circle count from the waist depth.** This is arithmetic over the real
  roster plus the field decision. The old "gap admits an opponent" test passes Kestrel with
  two circles, whose flank then gives away 60% of its width; the project had already shipped
  three. A true capsule has no waist: the web lane found it as a standard primitive
  (closest points of two segments) and the blind lane named it the sweet spot.
- **Long spins come from missing yaw damping, not from inertia.** The web lane found a
  full-inertia top-down car tutorial that kills angular velocity, and the blind lane said
  the same. The field adds that Death Ride's handling already carries a yaw inertia while
  the contact kick scales by mass, which ranks the long classes differently.
- **Mass spread depends on how the cars meet.** Todd and Warren's 1.5 ratio reads 95% in
  a symmetric approach and 23% when a mover strikes a stationary body. That figure comes
  from Todd and Norman, J Vis 2026, doi:10.1167/jov.26.2.1, quotes checked against the
  full-text XML. The blind lane put 1.5 as "marginal" and 2 as reliable in clean views.
  "Well above two or nobody can tell" was wrong as an absolute.
- **The closing test, not the maximum, stops the isolated double count.** The simulation
  showed sum and maximum give the same figure at 1-8 passes for an isolated pair. The
  maximum matters in a chain, where the sum gave 23.2 against 20.0. The web lane found
  that the reference engine's hit event reports pre-solve approach speed once per contact
  per step, which converges.
- **"Keep one reader" was too strong.** The field shows two raw readers added within two
  days, each with a gate reason. The web lane shows engines publish one per-step hit
  record for any consumer. The bound kept is one writer, with readers after the last pass
  that carry the slot's basis.
- **The wall's "more than twice" ordering needs restitution below about 0.45.** Reached by
  the blind lane's algebra (retention above twice restitution) and the simulation table.

**Simulated and left untouched:** full separation in the inverse-mass split. The blind
lane and Catto's slides both argued for percentage-and-slop in stacks. The 1D simulation
settled a pinned pair and a three-car wall pile at three passes with no jitter, and slop
left more overlap. The technique keeps its rule and gains the persistence condition (slop
keeps a resting contact alive, which an event model or a warm start needs).

**Verified and left untouched:**
- the inverse-mass arithmetic and the 3:1 acceptance test;
- the unordered pair index and the per-step clear;
- the mass-split damage;
- the wall's per-second budget rule. Death Ride states no per-second figure; it would be
  8.6% retained per second if the car touched on every step.

**Declined (one lane only):**
- **Do not mass-weight damage twice when the damage base is the impulse.** The blind lane
  only. The technique bases damage on closing speed, so it does not apply. Banked.
- **Coulomb wall friction instead of a fixed fraction.** The blind lane only. The technique
  already lists it as a when-not.

## Impact

The subject joins **0 contexts** across the mapped projects. This was checked with a map
dry-run (`--dry-run --json`) in a clean worktree of `93de9a43`, then a per-project
`git grep -c` of each committed `.ai/registry-map.json`. The positive control was pof
joining game-economy-tuning 21 times. No verdict went stale and no `/conform --stale` queue
exists. firetv's domains do not include game-production, so the map cannot join it.

## Applied

- **multi-circle-capsule-contact (waist depth)** - firetv - simulation - better.
- **bounded-collision-spin (divide by the handling inertia)** - firetv - simulation -
  unmeasurable.
- **ram-energy-accumulate-once-per-step (readers carry the basis)** - firetv - simulation -
  unmeasurable. The audio gain mixes bases.
- **wall-tangent-retention-versus-head-on-loss (restitution bound)** - firetv -
  simulation - unmeasurable. The old and new rules agree at 0.24.
- **inverse-mass-impulse-split (proposed slop)** - firetv - simulation - not-better.
- **min-restitution-pairing** - unapplied, inert.
- **golden path mass spread** - unapplied. The contact event carries no mass term.

No project commit was made. Every new condition either agrees with the tree or is a feel
question no instrument here can answer.

## Open leads (banked, convergence rule applies)

- **Damage based on impulse must not be split by mass again.** Blind lane only. Return: a
  project whose damage reads the impulse.
- **Middle-circle wall contact on the inside of a bend.** Death Ride's wall test uses only
  the end circles (World.kt:515), and a convex inner boundary can meet the middle first.
  Field reading only, unmeasured. Return: a track with a tight inner wall, or a report of a
  car clipping one.
- **A per-reader basis on presentation events.** Return: the audio review in the applied
  row.
- **Project leads in firetv, not registry content:**
  - the W3 note promises per-car restitution and the code shares one value;
  - CAR_CONTACT and WALL_CONTACT strengths sit on different bases under one gain formula;
  - the `.002` positional margin is a literal outside the movement table;
  - no pass-count test exists for the ram slot.

## Saturation

Depth rung L2 to L3. This pass read primary engine source, a 2026 reanalysis of the
perception data, and the tree, and it simulated the tree's own arithmetic. Nobody has
driven the game.

Last-pass yield:
- 4 new applications;
- 2 refiled and re-resolved applications;
- 7 two-lane conditions or corrections;
- 0 techniques;
- 0 project commits.

Dry streak 0. Clocks: the applications derive their window from the stack, with no
override. The engine-default census in min-restitution-pairing is the first claim to
re-check, by 2027-04, since engines change defaults across major versions.
