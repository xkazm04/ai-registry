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

## Architecture review - 2026-10-31

First review, against `2a7424170`. Every document was read, and the arithmetic in each
technique and application was recomputed from its cited values; all of it holds. The
perception figures, the Box2D v3 restitution default and the vehicle-restitution paper were
re-read at source. The golden path credits the per-pair maximum alone with stopping repeat
charges, which its own ram technique corrects (the closing test does that for an isolated
pair), and it states the wall asymmetry without the restitution bound its wall technique
carries. The private tree behind the applications was not re-opened, so no verification
date moved.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/mass-based-arcade-collision",
  "date": "2026-10-31",
  "baseline": "2a7424170",
  "digest": "sha256-b2:288cadaa1b332819",
  "disposition": "clarify",
  "trigger": "pending: no architecture-review record existed after the 2026-10-09 deepen pass.",
  "intended_benefit": "A designer can point at the term responsible when a car contact feels wrong: exact mass split, authored and bounded spin, restitution and wall loss, and one damage figure per meeting.",
  "failure_if_ignored": "Weight classes vanish in contact, damage depends on solver pass count, long cars accept opponents into their flanks, and a raised restitution silently breaks the wall ordering.",
  "boundary": "Contact resolution only; handling owns post-contact yaw and velocity, archetype balance owns the numbers, combat hit dedup owns weapon volumes, partitioning owns broadphase thresholds.",
  "coverage": "All 13 documents read in full; arithmetic in every technique and application recomputed from cited values; primary sources opened for the perception figures, the Box2D v3 default and the vehicle-restitution paper. Private tree anchors and the other seven engine defaults were not re-opened.",
  "counterexamples": [
    "With a closing test on every pass, an isolated pair gives the same ram figure under a sum or a maximum; only a chain separates them.",
    "At e = 0.24 a 60-degree glance keeps only 2.2 times the head-on speed, and above about e = 0.27 it drops under two, so 'a glance keeps its speed' is angle- and restitution-dependent.",
    "When every class shares one restitution, minimum, mean and maximum pairing are indistinguishable; only the product differs.",
    "A handling model that already damps yaw can take a full rotational contact; the bounded kick is a choice, not a necessity."
  ],
  "sources": [
    {
      "url": "https://europepmc.org/article/PMC/PMC12875344",
      "result": "Todd and Norman 2026, J Vis, full-text XML: 'When the objects approached each other with the same speed (left), the observers were 95% accurate. However, when a moving object collided with a stationary one (right), the observers were only 23% accurate.' Caption: 'the blue object is 50% heavier than the red object and e = 0.5.' Mitko and Fischer PSE 'spanned a range of mass ratios from 0.4 to 1.5'. Supports the golden path; adds the e = 0.5 condition."
    },
    {
      "url": "https://github.com/erincatto/box2d/blob/main/src/contact.c",
      "result": "Box2D v3 main: 'static inline float b2MixRestitution(...) { return b2MaxFloat( restitutionA, restitutionB ); }' used when no restitution callback is set. Supports the census entry for v3."
    },
    {
      "url": "https://arxiv.org/abs/physics/0601168",
      "result": "Batista, 'On the Mutual Coefficient of Restitution in Two Car Collinear Collisions': 'Two ways of calculating the mutual restitution coefficient are given: one based on car masses and one based on car stiffness.' Supports 'design choice, not physics'."
    },
    {
      "source": "Existing kotlin applications",
      "result": "Dated 2026-10-09 reports against a private tree; anchors not re-opened, verified_on unchanged. Arithmetic recomputed and holds."
    }
  ],
  "documents": {
    "mass-based-arcade-collision.md": {
      "disposition": "clarify",
      "reason": "Three edits owed. (1) 'One meeting, one number' and the 'damage summed' failure mode credit the per-pair maximum alone with stopping repeat charges, while the owned ram technique (and its simulation) says the closing test stops the isolated double count and the maximum matters in a chain; state both guards. (2) 'Walls are not cars' states the glance-versus-head-on asymmetry unconditionally; the wall technique bounds it to low restitution. (3) The Todd and Warren stimulus figures (95% / 23% at a 1.5 ratio) were for e = 0.5 (Todd and Norman 2026 figure caption, opened this run); name it. Boundary and dependency rule otherwise sound."
    },
    "techniques/bounded-collision-spin.md": {
      "disposition": "keep",
      "reason": "Inertia-versus-damping framing, clamp-after-add and divide-by-handling-inertia rule are consistent with the application's recomputed roster table (arm/m and arm/I ratios reproduce to two places with I = m(L^2+W^2)/12)."
    },
    "techniques/inverse-mass-impulse-split.md": {
      "disposition": "keep",
      "reason": "Impulse arithmetic and 3:1 acceptance test are exact; the slop condition is scoped to persistence-dependent event models and warm starts, matching the 1D simulation recorded in the application."
    },
    "techniques/min-restitution-pairing.md": {
      "disposition": "keep",
      "reason": "Labelled a design choice. Box2D v3 default re-read at source this run (b2MixRestitution returns b2MaxFloat); arXiv physics/0601168 abstract confirms a mutual coefficient computed from masses or stiffness. Remaining engine defaults not re-opened; census re-check stays due by 2027-04."
    },
    "techniques/multi-circle-capsule-contact.md": {
      "disposition": "keep",
      "reason": "Waist-depth formula re-derived (penetration past flank = R - sqrt(R^2-(s/2)^2)); the 2.8:1 car's 60% / 11% figures and the gap-narrower-than-opponent claim reproduce from the cited shapes."
    },
    "techniques/ram-energy-accumulate-once-per-step.md": {
      "disposition": "keep",
      "reason": "Two-guard split (closing test for an isolated pair, maximum for chains) is internally consistent; the 16% chain figure matches 23.2 / 20.0."
    },
    "techniques/wall-tangent-retention-versus-head-on-loss.md": {
      "disposition": "keep",
      "reason": "Ratio table recomputed with a 0.04 tangent loss: 3.9 / 2.2 at e = 0.24, 2.3 / 1.5 at 0.4, failure at 0.5 all reproduce; step 7's shallow-angle contract breaks near e = 0.47, consistent with 'toward one half'."
    },
    "applications/kotlin--bounded-collision-spin.md": {
      "disposition": "keep",
      "reason": "Roster table and the 6,240 N s / 6.1 rad/s / ~5 m/s ceiling arithmetic recomputed from the cited masses, shapes and table values. Tree anchors not re-opened (private checkout); verified_on unchanged."
    },
    "applications/kotlin--inverse-mass-impulse-split.md": {
      "disposition": "keep",
      "reason": "640-2,350 kg span (450 + 190 x stat) and the ~3.7 ratio recomputed; simulation table is a dated report. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--min-restitution-pairing.md": {
      "disposition": "keep",
      "reason": "Inert-rule finding and product figure (0.24^2 = 0.058) check; no verdict is correct. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--multi-circle-capsule-contact.md": {
      "disposition": "keep",
      "reason": "All eight depth figures (Kestrel, Comet, Bastion, Flint at two and three circles) and the 2.55 m gap reproduce from car-shapes values. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--ram-energy-accumulate-once-per-step.md": {
      "disposition": "keep",
      "reason": "Gain table (slot/12 with a 0.25 floor), the 60% car-versus-wall figure and the 10 m/s cue cut reproduce. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--wall-tangent-retention-versus-head-on-loss.md": {
      "disposition": "clarify",
      "reason": "Table and 0.96^60 = 8.6% reproduce. Internal inconsistency: the body says the 15-degree contract fails at about 0.47 (recomputed: 0.468), the verdict says 'below about 0.45'; align the verdict with the body's own figure."
    }
  }
}
```

Applied the same day: the golden path now names the closing test beside the maximum, bounds
the wall asymmetry to low restitution and states the e = 0.5 stimulus condition; the wall
application's verdict now uses its own 0.47 figure. Second record, against the new digest:

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/mass-based-arcade-collision",
  "date": "2026-10-31",
  "baseline": "2a7424170",
  "digest": "sha256-b2:07ef81f3414b201e",
  "disposition": "keep",
  "trigger": "pending: no architecture-review record existed after the 2026-10-09 deepen pass.",
  "intended_benefit": "A designer can point at the term responsible when a car contact feels wrong: exact mass split, authored and bounded spin, restitution and wall loss, and one damage figure per meeting.",
  "failure_if_ignored": "Weight classes vanish in contact, damage depends on solver pass count, long cars accept opponents into their flanks, and a raised restitution silently breaks the wall ordering.",
  "boundary": "Contact resolution only; handling owns post-contact yaw and velocity, archetype balance owns the numbers, combat hit dedup owns weapon volumes, partitioning owns broadphase thresholds.",
  "coverage": "All 13 documents read in full; arithmetic in every technique and application recomputed from cited values; primary sources opened for the perception figures, the Box2D v3 default and the vehicle-restitution paper. Private tree anchors and the other seven engine defaults were not re-opened.",
  "counterexamples": [
    "With a closing test on every pass, an isolated pair gives the same ram figure under a sum or a maximum; only a chain separates them.",
    "At e = 0.24 a 60-degree glance keeps only 2.2 times the head-on speed, and above about e = 0.27 it drops under two, so 'a glance keeps its speed' is angle- and restitution-dependent.",
    "When every class shares one restitution, minimum, mean and maximum pairing are indistinguishable; only the product differs.",
    "A handling model that already damps yaw can take a full rotational contact; the bounded kick is a choice, not a necessity."
  ],
  "sources": [
    {
      "url": "https://europepmc.org/article/PMC/PMC12875344",
      "result": "Todd and Norman 2026, J Vis, full-text XML: 'When the objects approached each other with the same speed (left), the observers were 95% accurate. However, when a moving object collided with a stationary one (right), the observers were only 23% accurate.' Caption: 'the blue object is 50% heavier than the red object and e = 0.5.' Mitko and Fischer PSE 'spanned a range of mass ratios from 0.4 to 1.5'. Supports the golden path; adds the e = 0.5 condition."
    },
    {
      "url": "https://github.com/erincatto/box2d/blob/main/src/contact.c",
      "result": "Box2D v3 main: 'static inline float b2MixRestitution(...) { return b2MaxFloat( restitutionA, restitutionB ); }' used when no restitution callback is set. Supports the census entry for v3."
    },
    {
      "url": "https://arxiv.org/abs/physics/0601168",
      "result": "Batista, 'On the Mutual Coefficient of Restitution in Two Car Collinear Collisions': 'Two ways of calculating the mutual restitution coefficient are given: one based on car masses and one based on car stiffness.' Supports 'design choice, not physics'."
    },
    {
      "source": "Existing kotlin applications",
      "result": "Dated 2026-10-09 reports against a private tree; anchors not re-opened, verified_on unchanged. Arithmetic recomputed and holds."
    }
  ],
  "documents": {
    "mass-based-arcade-collision.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: named the closing test beside the maximum in 'One meeting, one number' and the summed-damage failure mode; bounded the wall asymmetry to low restitution; named the e = 0.5 stimulus condition."
    },
    "techniques/bounded-collision-spin.md": {
      "disposition": "keep",
      "reason": "Inertia-versus-damping framing, clamp-after-add and divide-by-handling-inertia rule are consistent with the application's recomputed roster table (arm/m and arm/I ratios reproduce to two places with I = m(L^2+W^2)/12)."
    },
    "techniques/inverse-mass-impulse-split.md": {
      "disposition": "keep",
      "reason": "Impulse arithmetic and 3:1 acceptance test are exact; the slop condition is scoped to persistence-dependent event models and warm starts, matching the 1D simulation recorded in the application."
    },
    "techniques/min-restitution-pairing.md": {
      "disposition": "keep",
      "reason": "Labelled a design choice. Box2D v3 default re-read at source this run (b2MixRestitution returns b2MaxFloat); arXiv physics/0601168 abstract confirms a mutual coefficient computed from masses or stiffness. Remaining engine defaults not re-opened; census re-check stays due by 2027-04."
    },
    "techniques/multi-circle-capsule-contact.md": {
      "disposition": "keep",
      "reason": "Waist-depth formula re-derived (penetration past flank = R - sqrt(R^2-(s/2)^2)); the 2.8:1 car's 60% / 11% figures and the gap-narrower-than-opponent claim reproduce from the cited shapes."
    },
    "techniques/ram-energy-accumulate-once-per-step.md": {
      "disposition": "keep",
      "reason": "Two-guard split (closing test for an isolated pair, maximum for chains) is internally consistent; the 16% chain figure matches 23.2 / 20.0."
    },
    "techniques/wall-tangent-retention-versus-head-on-loss.md": {
      "disposition": "keep",
      "reason": "Ratio table recomputed with a 0.04 tangent loss: 3.9 / 2.2 at e = 0.24, 2.3 / 1.5 at 0.4, failure at 0.5 all reproduce; step 7's shallow-angle contract breaks near e = 0.47, consistent with 'toward one half'."
    },
    "applications/kotlin--bounded-collision-spin.md": {
      "disposition": "keep",
      "reason": "Roster table and the 6,240 N s / 6.1 rad/s / ~5 m/s ceiling arithmetic recomputed from the cited masses, shapes and table values. Tree anchors not re-opened (private checkout); verified_on unchanged."
    },
    "applications/kotlin--inverse-mass-impulse-split.md": {
      "disposition": "keep",
      "reason": "640-2,350 kg span (450 + 190 x stat) and the ~3.7 ratio recomputed; simulation table is a dated report. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--min-restitution-pairing.md": {
      "disposition": "keep",
      "reason": "Inert-rule finding and product figure (0.24^2 = 0.058) check; no verdict is correct. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--multi-circle-capsule-contact.md": {
      "disposition": "keep",
      "reason": "All eight depth figures (Kestrel, Comet, Bastion, Flint at two and three circles) and the 2.55 m gap reproduce from car-shapes values. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--ram-energy-accumulate-once-per-step.md": {
      "disposition": "keep",
      "reason": "Gain table (slot/12 with a 0.25 floor), the 60% car-versus-wall figure and the 10 m/s cue cut reproduce. Tree anchors not re-opened; verified_on unchanged."
    },
    "applications/kotlin--wall-tangent-retention-versus-head-on-loss.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: verdict's restitution bound aligned to the body's 0.47 at a 15-degree glance."
    }
  }
}
```
