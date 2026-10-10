---
layer: golden-path
type: golden-path
subject: top-down-vehicle-handling-model
status: forged
use_when: [authoring or reviewing the per-step dynamics of an arcade car seen from above, a car that feels either glued to rails or uncatchable, adding a surface or a handbrake to a vehicle that already drives, deciding which handling quantities belong in a data table]
techniques:
  - speed-attenuated-steering-authority
  - slip-restoring-yaw-stability
  - bounded-load-transfer-grip
  - drift-state-hysteresis
  - surface-grip-drag-ladder
  - kerb-verge-inside-hard-wall
---

# Top-down vehicle handling model

A top-down arcade car is a point with a heading and a velocity that are not the same
vector. Everything that makes it feel like a car and not like a cursor lives in the gap
between those two vectors: the angle between where the nose points and where the body is
travelling, the rate at which that angle opens, and the force that closes it again. A model
that sets velocity equal to heading times speed has no gap and therefore no handling, only
steering. A model that integrates a full tyre, suspension and drivetrain has a gap it
cannot afford to keep honest on a living-room television at a fixed step, with six cars and
a player who has never heard the word understeer.

The subject is the middle: a handful of small laws, each one a line of arithmetic reading a
named number from a table, that together produce a car which turns in, pushes wide when
asked for too much, snaps loose when provoked, recovers when it is caught, and slows on grass.
Each law is cheap, each is tunable by someone who never opens the code, and — this is the
point of the craft — each one is bounded, so that no combination of inputs and surfaces
produces a state the player cannot read.

## The state is three numbers and an angle

The reduced state of one car is a position, a velocity vector, a heading and a yaw rate.
From those, one derived quantity does almost all of the work: the **slip angle**, the signed
angle from the heading to the velocity direction. Zero slip is a car travelling the way it
points. Small slip is ordinary cornering. Large slip is a slide. For grip driving nothing in
the model needs a wheel, an axle or a contact patch; the slip angle is the whole tyre.

That last sentence has a boundary, and it is the first design decision. One slip angle has one
saturation point, so it cannot say *which end* of the car lets go: understeer against
oversteer, a handbrake that frees only the rear, a long car that turns wider than a short one,
a spin that happens because the rear ran out of grip. When the design wants drift as a feature
rather than as a flavour of cornering, the next model up is two axles: one slip angle and one
lateral force at each end, and a yaw torque from the two forces on their lever arms. That is the
reduction the most widely copied tutorial on game car physics uses, and its stated aim is
understeer, oversteer, skidding and handbrake turns. It is still an arcade model. The laws below
survive the move, but two of them change meaning; the techniques say how.

Each step then does the same four things in the same order. Steering and the stabilising
term set a *desired* yaw rate; the actual yaw rate lags toward it; the velocity is rotated
into the body frame, split into forward and lateral components, and the lateral component is
reduced by a bounded grip force; and the forward component is driven by throttle, brake and
drag. Rotating back into world axes closes the step. The order matters because every law
below is a modification of one of those four moves, and a modification that lands in the
wrong move is the usual cause of a model that is "almost right".

## Six laws, each a single concern

**Steering authority is a function of speed.** The commanded turn rate is not a constant per
unit of stick. At parking speed full lock must not spin the car on the spot; at motorway speed
the same lock must not throw it off the road. The authority curve is a small continuous
function of speed with a stated low end and a stated high end, and it is the first thing a
player feels. `speed-attenuated-steering-authority` carries it.

**Yaw has a restoring term.** The nose is pulled toward the velocity direction in proportion
to slip. Without it the car is a rotating body that never recovers; with too much it is on
rails. This is the single most consequential constant in the model, and it is the one the
rest of the handling is tuned around. The direction it pulls toward is zero slip only for a
point. A two-axle car corners with a steady body slip that is not zero, so there the term
restores toward that neutral angle, or it fights every ordinary turn.
`slip-restoring-yaw-stability` carries it.

**Load moves, but only a little, and never past a bound.** Braking presses weight onto the
front and lightens the rear; throttle does the reverse. A model can track that shift as a
slowly-following scalar fed by a bounded target. It is a small lever, and how small should be
measured, not assumed. On a point mass its effect is a grip interval you can compute from the
table. On a two-axle model it moves capacity between the ends. In one measured case, taking it
out removed under a degree from a ten-degree slip rise when braking in a corner, and full
throttle in the same corner produced no power-oversteer with it or without it. `bounded-load-transfer-grip` carries it.

**Drift is a state with two thresholds.** A car enters a slide at one slip angle and leaves
it at a smaller one. Without the gap, a car sitting at the threshold flickers between modes
every step. `drift-state-hysteresis` carries it, including the question the naive reading
never asks: what, downstream, actually reads the state.

**Surfaces are a ladder with two columns.** Every material the car can be on has a grip
multiplier and a drag rate, and the table is ordered so that leaving the road is always a
loss that the player can predict. `surface-grip-drag-ladder` carries it.

**The road has a margin that is inside the wall.** A kerb and a verge are bands of surface
that sit between the racing line and a hard boundary, so the penalty for running wide can
be felt without the car ever leaving the world. `kerb-verge-inside-hard-wall` carries it,
including the geometric condition under which that band can be reached at all.

## What a principal practitioner holds true

**Every quantity has one authority and one unit.** Grip appears in the lateral force, in the
surface table, in the load-transfer gain, and — if there is an opponent driver — in the speed
the driver chooses for a corner. A model that applies the same loss twice is not twice as
realistic; it is wrong in a way no single line reveals. When a computer-driven opponent
reads the same grip number the physics reads, it must read it once. A rival that was slowed
by a surface at the corner-speed estimate and again by a separate multiplier failed to finish
on the slipperiest surface, and the repair was to delete the duplicate, not to add power.
The same project made the same mistake again when it moved to two axles. Surface grip already
scaled each axle's capacity, and a first draft scaled the yaw reference by it as well. Ice
recovery broke, and the fix was again a deletion. A model change is when this rule is most
likely to be broken, because every law is being re-derived at once.

**Bounded is a property of the target, not of a clamp.** A lagging scalar fed by a value
that cannot leave a range stays in that range without a single `min`. A clamp hides the
fact that the feed was unbounded; a bounded feed makes the limit visible in the table where
a designer can read it.

**Continuous physics, discrete presentation.** The grip, yaw and drag laws are continuous in
slip, speed and load. A drift flag, a tyre-smoke trigger and a camera shake are discrete, and
they hang off the continuous state through thresholds with hysteresis. The two must not be
confused: a discrete flag that does not feed back into the forces is free to flicker-proof
and cheap to retune; one that does feed back is a mode switch, and mode switches are where
handling goes wrong in ways no continuous test shows.

**Tune against a witness, not against a feeling you have not had.** The laws here are
verified by what a deterministic simulation can show: that braking preserves lateral
momentum, that a counter-steer reduces slip, that every surface finishes a seeded race, that
the ordering of surfaces is preserved. None of that is the experience of holding the stick.
A handling model should carry, beside each constant, whether it has been measured in a
simulation, exercised by seeded rivals, or only authored. An authored constant is a
hypothesis about a hand that has not yet been on the controller.

## Failure modes of the naive reading

- **Rails.** Velocity re-aligned to heading every step. Easy to author, impossible to feel,
  and every other law in this subject becomes inert because there is no slip to act on.
- **Ice rink.** Lateral grip too weak or yaw restoration absent, so a small steering input
  accumulates into a spin the player has no inputs to stop. The fix is the restoring term and
  the lateral force cap, never a larger steering rate.
- **The cliff.** Grip that drops from full to nothing at a threshold, with no lag and no
  recovery band. Players experience it as the car suddenly stopping being theirs.
- **Realism creep.** Adding a wheel, then a differential, then a suspension, each justified by
  one anecdote. The arcade model's value is that one person can hold all of it in their head.
  Two axles are not creep when the design asks for which-end-lets-go behaviour; they are the
  floor for it. Creep is what comes after: per-wheel loads, drivetrains, engine torque curves,
  longitudinal slip ratios. Canonical arcade write-ups leave those out on purpose, and some even
  handle longitudinal and lateral tyre forces separately instead of sharing one grip budget.
- **The silent model swap.** A game moves its roster to a richer model and keeps the old
  integrator for a default car. The old laws' tests stay green, because they build the default
  car, and now witness a path no shipped vehicle drives. Build every handling fixture through the
  same factory that builds shipped cars, and assert which path it took.
- **The orphan flag.** A drift state that is computed, tested and stored, and read by nothing
  but a particle effect. That is acceptable when named as such; it is a defect when everyone
  assumes it changes how the car drives.
- **The unreachable margin.** A kerb or verge designed as a gentle penalty and placed where
  the car's sampling point can never arrive. The table is authored, the test for ordering
  passes, and the band does nothing.

## Where this subject ends

The nearest neighbour is the discipline of choosing the runtime shape of gameplay behaviour:
state machine, type object, update order, allocation. That subject decides *how a behaviour
is structured* from a design sentence; this one decides *what the behaviour's arithmetic is*
once a vehicle has been chosen as the thing being modelled. The rule for picking is whether
the question is about shape or about physics: whether the handling table should be a data
row, whether the per-step update has a single writer per quantity, and whether the step
allocates nothing are that subject's questions; whether the yaw lag should be a first-order filter, which
constants the grip force reads and why the load scalar is bounded are this one's. Where this
subject leans on it is the data-driven rule — handling differences between cars are values,
and a car that needs a special case in code has stopped being a row.

A sibling subject, [steering feel profile shaping](../steering-feel-profile-shaping/steering-feel-profile-shaping.md), owns how raw controller input becomes the steering value that enters
these laws: dead zone, response curve, rise and return rates. This subject takes that value
as given and owns what the physics does with it. The rule for picking is where the number
is born: before the model reads it, it is input shaping; after, it is a vehicle law. The
speed-indexed authority multiplier sits exactly on the seam, and this subject owns the
multiplier's meaning in the physics while the sibling owns how a feel profile selects its
endpoints.

Collision response between cars, wall impulses, mass-ratio effects, the design of the track
itself, and the balance of one car archetype against another are all downstream of this
model and are not decided here; this subject supplies them a car whose velocity and slip
they can trust.
