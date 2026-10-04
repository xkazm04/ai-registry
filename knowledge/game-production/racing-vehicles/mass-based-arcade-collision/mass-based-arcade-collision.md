---
layer: golden-path
type: golden-path
subject: mass-based-arcade-collision
status: forged
use_when: [resolving car-to-car contact in a top-down arcade racer or combat racer, deciding how much rigid-body physics a vehicle game needs, a heavy car must feel heavy and a light car must feel quick, collision damage must be fair and countable]
techniques:
  - inverse-mass-impulse-split
  - min-restitution-pairing
  - multi-circle-capsule-contact
  - bounded-collision-spin
  - wall-tangent-retention-versus-head-on-loss
  - ram-energy-accumulate-once-per-step
---

# Mass-based arcade collision

A car is a long, heavy, rotating thing, and a rigid-body engine will happily treat it as
one. An arcade vehicle game almost never wants that. It wants four smaller promises: the
heavy car wins a shoving match and the light car is visibly thrown; a glancing wall touch
costs a little speed and a head-on one costs a lot; two cars that touch never pass
through one another, including along their flanks; and the number that later becomes
damage is one number per meeting, not a figure that depends on how many solver passes
happened to run. This subject is the smallest contact model that keeps those four promises
and refuses everything else.

The naive reading is "use a physics engine, tune the masses". A full solver brings
inertia tensors, friction cones, sleeping, stacking stability and a contact manifold, and
each of those is a source of motion the designer did not author: cars that climb each
other, spin for a second after a tap, or lock together and vibrate. The opposite naive
reading is "push the cars apart and zero the closing speed", which is stable and feels
like cardboard. The craft is in the middle: a few lines of impulse arithmetic whose every
term is a design decision, so that when a collision feels wrong a person can point at the
term responsible.

## Mass is the only thing that has to be physically honest

Everything in the model descends from one conservation law and one authored ratio. Linear
momentum is conserved across a contact, so the velocity change each car receives is
inversely proportional to its mass; two cars whose masses differ by three to one exchange
velocity change in the same ratio. That is the entire "weight" of a heavy car, and it is
worth keeping exact, because it is the one part of the contact that a player reads without
instruction: the big car barely notices the small one. Nothing else in the model is
physically honest, and that is deliberate. Spin is a bounded approximation. Restitution is
a single authored number per car. Wall friction is a fixed fraction. Each is declared
approximate where it is authored, so that nobody later mistakes a tuning knob for a
measurement.

The masses themselves have to be spread widely enough to be felt. A roster whose heaviest
car is only a fifth heavier than its lightest produces a velocity ratio that nobody can
perceive; the ratio between extremes needs to be well above two before a player can tell
the classes apart by contact alone, and that spread is a roster-balance property, not a
solver property. The balance subject next door owns choosing the numbers; this subject owns
what a number does once it is chosen.

## Position and velocity are separate repairs

A contact has two defects that must be fixed independently. The cars overlap, which is a
position error; and they are approaching, which is a velocity error. The positional split
moves each car away along the contact normal in proportion to its inverse mass, so the
light car is displaced further and the pair separates by exactly the overlap. The velocity
impulse changes each car's speed along the same normal, again by inverse mass, and only if
the cars are still closing. Doing only the first makes cars slide through each other's
momentum; doing only the second lets overlap accumulate until a car is inside another.
Both are sized by the same inverse-mass sum, which is why they live together in one
technique.

## A car is a chain of circles

Circle-to-circle contact is the cheapest contact there is, has no degenerate case beyond
coincident centres, and gives a smooth, round response. A car is longer than it is wide, so
one circle is wrong and a rectangle test is expensive and full of corner cases. The answer
is a capsule built from circles along the car's axis: a pair at the ends, and a middle one
as soon as the car is long enough that a small object could fit between the end circles. The
circles are derived from the drawn silhouette, so that what the player sees touching is
what the model treats as touching. A contact test is then the product of the two cars'
circle counts, which is small enough to ignore at racing populations and large enough to
matter if the field ever grows into the hundreds.

The same circles are what give a hit its lever arm. A nose-to-nose contact on the axis
produces no rotation; a contact at a front corner produces a turn, because the contact point
sits off the centre of mass. Spin falls out of the geometry for free, which is why it is
the part most in need of a bound.

## Walls are not cars

A wall has infinite mass and no velocity, so the impulse model degenerates into a mirror:
the car's normal velocity is reversed and scaled by restitution, and the car is pushed back
inside the boundary. What makes it feel like a wall instead of a mirror is the tangential
component. A glancing touch keeps almost all of its along-wall speed and loses only a small
fixed fraction, while a head-on hit has nearly all of its speed in the normal direction and
loses it at once. The asymmetry is the whole feel: scraping a barrier is a cost, hitting it
square is a penalty, and the player learns the difference without being told.

## One meeting, one number

A contact solver that runs several passes, over several circle pairs, can see the same
meeting of two cars many times in one step. Whatever is derived from the contact for use
elsewhere, above all collision damage, must therefore be recorded as a per-pair maximum
over the step and consumed once after the solver finishes, never added up as the solver
goes. A threshold on closing speed keeps ordinary bumping free, and the damage that results
is divided between the cars by mass so the heavy car pays less. The identity of the thing
being counted is the pair of cars and the step, which is the same idea that gives a sweeping
weapon one hit per swing, applied to a body instead of a blade.

## What this is measured against

Every claim in this subject's techniques is one of three kinds, and a reader should know
which. Some are arithmetic that a unit test can prove, such as momentum conservation, the
mass-ratio split and the absence of a hole between circles. Some are behaviours observed in
simulation, such as how a glancing and a head-on wall hit compare, or how a contact chain
settles over several passes. And some are authored feel: the spin scale, the yaw ceiling,
the wall loss fraction and the ram threshold are numbers chosen to look right on paper and
in replays. None of them has been validated by a person driving the game with their hands.
The honest label for the whole model is therefore *simulated and authored*, and a
consumer who needs it felt must schedule that test; nothing here substitutes for it.

## Failure modes of the naive reading

- **Equal masses by default.** The impulse is symmetric, every collision looks identical,
  and the roster's weight classes mean nothing in contact.
- **Averaged restitution.** A bouncy car meeting a dead one rebounds as if both were
  lively. The pairing technique states why the minimum is the honest choice.
- **Spin from a full inertia model.** Cars spin for seconds after a tap and are unplayable;
  or the spin is applied uncapped across several contact circles and a light car is thrown
  into a rotation it cannot steer out of.
- **Damage summed over solver passes.** The same meeting is paid for two, three or nine
  times, and the figure depends on the iteration count and on which circles touched.
- **Wall friction as a flat speed multiplier.** Glancing and head-on hits cost the same, and
  racing along a barrier becomes as expensive as hitting it.
- **A hole in a long car.** Two circles at the ends leave a gap a small car can drift into,
  so one car sits inside another's drawn body with no contact registered.

## Where this subject ends

Hit deduplication in real-time combat gives a sweeping volume an identity so a target is hit
once per activation; this subject borrows that principle for the single place it recurs here,
the per-pair, per-step ram figure, and owns nothing else of it. When the question is how a
weapon volume is counted, read the combat subject; when the question is how two bodies that
have already touched exchange momentum and how that exchange becomes a number, read this one.
The spatial-partitioning threshold in the gameplay runtime patterns subject decides when an
acceleration structure is worth building; this subject only states that a racing field is
far below that threshold and that the circle-pair product is the cost to watch if the field
grows. How a car accelerates, turns and slides is the handling model's concern: this subject
writes a yaw rate and a velocity into the car at contact and the handling model owns what
happens to them afterwards. Which numbers a car's class is given, including its mass and
restitution, belongs to the archetype balance subject. A reader picks between them by asking
what is being decided: how a contact resolves belongs here, how the car drives either side of
it does not.
