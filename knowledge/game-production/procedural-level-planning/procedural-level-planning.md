---
layer: golden-path
type: golden-path
subject: procedural-level-planning
status: forged
use_when: [turning a designer's world description into a generated placement plan, offering one parameter surface over several generation algorithms, promising reproducibility from a seed, checking a generated room graph before anyone builds it]
techniques:
  - algorithm-parameter-support-matrix
  - declare-what-each-engine-ignores
  - seed-determinism-contract
  - pacing-linter-rules
  - safe-room-and-boss-placement
  - zone-progression-linting
---

# Procedural level planning

A designer types a paragraph — *a flooded temple, three combat rooms before the first
shrine, a boss at the far end* — and a generator returns a world. The plan sitting
between those two things is this subject: a room graph with connections, sizes,
difficulty values and landmark roles, produced under stated parameters, reproducible
from a stated seed, and linted before anything is built from it.

The most dangerous failure here is not a bad layout. A bad layout is obvious and gets
re-rolled. The dangerous failure is a **confident layout that silently ignored half of
what the designer asked for**. The generator accepted a corridor-width setting, a
symmetry preference and a room-count target, honoured one of them, discarded two, and
returned a result with no visible difference between the parts it computed and the
parts it ignored. The designer now cannot iterate — they can only re-roll, because they
have no idea which of their inputs is the lever. Every discipline below exists to make
the generator's actual contract visible.

## One control surface, several backends, one honest matrix

Generative level tools converge on the same shape: a single parameter panel in front of
several algorithms — a cave-carving cellular automaton, a coherent-noise heightfield, a
recursive space partition, a constraint-solving tile collapser. The panel is the right
product decision and the wrong engineering default, because the algorithms do not share
a parameter space. Room count is a first-class input to a partitioner and a *post-hoc
observation* about a cellular automaton. Symmetry is native to a partition tree and
meaningless to a noise field.

The rule is binary and it does not admit a middle: **a parameter either affects every
algorithm it is shown for, or it is disabled with the reason visible on screen**. A
control that renders live and does nothing is a lie the interface tells continuously,
and it is worse than a missing control, because a missing control sends the designer to
look for another lever while a dead control sends them to re-roll. The reason string is
not a tooltip nicety; it is payload — it is the only part of the system that teaches the
designer the shape of the tool (algorithm-parameter-support-matrix).

The same honesty runs one layer deeper, on the output side. A shared plan type is not a
shared layout. Two generators can both emit "a room graph" and disagree completely about
which fields of the request they consulted. The set of inputs a generator **discarded**
must be machine-readable data attached to the result, not a line in a design document
that drifts within a month (declare-what-each-engine-ignores). Once the discarded set is
data, three things become possible that are otherwise impossible: the interface can grey
the dead controls automatically, a check can fail a build when a generator quietly starts
ignoring a field it used to honour, and a designer comparing two backends can see the
trade in one view instead of inferring it from ten re-rolls.

## A seed is a contract, and contracts state their limits

"Seeded" is the word teams use when they mean "we passed a number in somewhere". A seed
is worth having only as a stated contract, and the contract has four terms, all of which
must hold: **the same seed, the same algorithm, the same generator version, and the same
parameter set produce the same plan**. Drop any one and the guarantee is void.

Two disciplines make it real. First, every draw comes from the seeded stream and nothing
touches an ambient global generator — one unseeded call anywhere in the pipeline, even
in a decorative pass, makes the whole run irreproducible, and the bug is invisible
because most runs still look plausible. Second, the seed and the version travel *with*
the plan, so a plan found six months later can be regenerated or honestly marked as
unreproducible (seed-determinism-contract).

The limit is the part teams refuse to write down. A seed that survives a generator
upgrade is a promise nobody can keep: change the tie-break in a corridor router, add a
draw for a new decoration pass, and the same seed produces a different world by design.
So state what happens at a version bump — old plans keep their stored output as the
authority, new generations get the new version, and the version field is what tells the
two apart. A team that instead promises stability across versions ships a silent
regression the first time it optimises the algorithm.

## The plan is a graph, and a graph can be linted

Once a generated level is a typed room graph rather than a picture, it stops being a
matter of taste and becomes checkable. This is the cheapest quality gate in level
production: it runs in milliseconds, before any geometry exists, and it catches the
failures that a human only notices after an hour of walking the space.

The rules worth encoding are about **pacing**, not aesthetics, and each one is a
signature plus a designer consequence: consecutive combat with no relief; a difficulty
step so large it reads as a spike rather than a challenge; a ramp so monotonic it reads
as a treadmill; a boss with nowhere to prepare; a room the player can never reach
(pacing-linter-rules). The last of those is a correctness bug wearing a pacing costume,
and it should fail rather than warn.

The idea underneath the pacing rules is one this subject shares with encounter-scale
pacing craft, which is a separate concern owned elsewhere: **rest is a designed beat,
not leftover space**. A quiet room is doing work — it resets tension, it is where the
player consolidates, it is what makes the next fight legible as a fight. A generator
optimising for interest per square metre will produce a level with no quiet rooms and no
peaks either, because a peak needs a floor to stand on. Encode the floor.

Linting is also where the honesty discipline pays off a second time. A linter that
reports "no findings" for a graph whose difficulty values were never populated is
reporting a blind pass, not a clean one. Unpopulated inputs render as *not measured*, and
a rule that cannot evaluate says so.

## Landmarks are placed by rule, not by chance

A level has structural positions that carry meaning: where the player starts, where they
can breathe, where the reward is, where the fight that ends the zone happens. Leaving
these to uniform random placement is the most common way a technically valid generated
level is unplayable — the boss two rooms from the entrance, the reward behind the boss,
no safe room in the second half.

The placement rules are simple, stable across genres, and worth stating as rules because
they are exactly what a generator drops first: the ending fight goes in the largest room
farthest from the start along the traversal graph; a safe or rest room sits at the start
and again near the midpoint of progression; the ending fight has an adjacent safe room so
preparation has somewhere to happen; the principal reward sits late in progression but
before the ending fight, so it can be used in it (safe-room-and-boss-placement). Each of
these has a reason a designer can argue with, which is the point — a rule with a stated
reason can be overridden deliberately, while a random placement can only be re-rolled.

## Progression is a property of the zone, not of the room

Above the single level sits the zone graph: regions with level bands, connections between
them, and an intended order. The same class of failure recurs one scale up and costs far
more to fix, because zone boundaries are where content, art and narrative have already
been committed.

Three checks carry most of the value. **Reachability** — every zone is entered from
somewhere the player can already be; an orphaned zone is content nobody will ever see and
is a hard failure, not a warning. **Ordering** — the band a zone is tuned for is
consistent with the bands of the zones that lead to it; a jump of three levels between
adjacent zones reads to a player as a wall rather than as a step, which is the same
signature the room-scale difficulty-cliff rule catches, at a different scale.
**Single-sourcing** — the zone's partitioning and its band tables come from the one place
that already owns them, so the map, the spawn tables and the authoring tool cannot
disagree (zone-progression-linting). Where a new region is authored by a generative
process, it reuses those tables rather than inventing parallel ones; the contradiction
between two sources is a defect in its own right, and it surfaces months later as a
tuning bug nobody can locate.

## What this subject is not

It does not own encounter pacing inside a single fight — the dramatic arc of one
engagement, its beats and its recovery windows, is adjacent craft with its own rules;
this subject only guarantees that a fight has room to happen and a quiet space next to
it. It does not own whether the numbers on an encounter are fair; that is a simulation
question answered by a different instrument, and a plan that passes every pacing rule can
still contain an unwinnable fight. It does not own the general architecture of the prompt
that drives the generator, which is a production-wide concern. And it stops at the room
graph: deriving an audio scene, a lighting plan or a streaming layout from those same
rooms is downstream work that *consumes* this output, and the quality of that downstream
work is bounded by whether the graph honestly reported what it is.

## The failure modes of the naive reading

**"The parameters are shared, so the algorithms are interchangeable."** They are not. The
shared type is a convenience for the interface, and treating it as a semantic guarantee
is how dead controls get shipped.

**"It looked right, so the generator honoured the brief."** A plausible layout is the
default output of every algorithm here; plausibility is evidence of nothing. The only
proof that an input mattered is that changing it changes the result, and the matrix is
what saves the designer from having to discover that by experiment.

**"We have a seed, so it is reproducible."** Not without the version and the parameter
set. A seed alone reproduces a run only until the day someone improves the generator.

**"The linter passed."** Ask what it evaluated. Rules that could not run because their
inputs were absent must not be counted as passes, and a graph with no difficulty data has
no pacing verdict at all.

**"A designer can just re-roll."** Re-rolling is what iteration degrades into when the
levers are invisible. The measure of this subject's success is that a designer changes one
number, sees a directed change, and stops re-rolling.
