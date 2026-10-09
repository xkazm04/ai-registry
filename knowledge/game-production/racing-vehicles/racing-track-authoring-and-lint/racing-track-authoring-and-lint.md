---
layer: golden-path
type: golden-path
subject: racing-track-authoring-and-lint
status: forged
use_when: [authoring a closed racing circuit as data and wanting it rejected when it is unraceable, choosing road width and corner radius for a roster of differently sized cars, deciding how much of a lap should be straight, tying world metres to camera scale and on-screen car size, proving a track linter would actually fire, a circuit with junctions or alternative routes, accepting circuits into a library that passes lint and still reads as ovals]
techniques:
  - width-in-widest-car-widths
  - corner-radius-in-longest-car-lengths
  - straight-fraction-pacing-band
  - oriented-capsule-grid-lint
  - mutate-good-track-to-prove-linter
  - px-per-metre-scale-contract
  - shape-contract-above-the-linter
---

# Racing track authoring and lint

A circuit authored as data is a closed curve in metres with a width at every point, plus a
handful of marked sites along it: gates, a starting grid, pickups, hazards. A designer places
a few dozen control points, a bake turns them into a dense ribbon, and from then on every
system asks the ribbon questions: how far along am I, how far off the centre, what is the
turn rate here, what surface is this. This subject is the discipline of making that data
**checkable before anyone drives it**, so that the failures a human would find on the third
lap are found in milliseconds at load.

The failure that motivates all of it is a track that is a valid curve and an unraceable
place. The control points close, the spline is smooth, the sites are all inside the road, and
the widest car cannot fit through the hairpin, two grid slots overlap on a bend, the ribbon
crosses itself a long way down the lap so the progress tracker teleports a car across the
infield, or the lap is one long straight with no corner to brake for. None of those is a bug
in code. All of them are content, and the only thing standing between them and a player is
whether somebody wrote the rule down as a number and made a check read it.

## Units are relative to the cars, not to the world

The first decision, and the one most easily made wrong, is what the thresholds are measured
in. A width of sixteen metres means nothing until you know the cars; the same road is generous
for a compact buggy and cramped for a long armoured wagon. A track authored against absolute
metres silently goes wrong the day the roster changes: the designer enlarges the cars, every
number in the linter still passes, and every corner is now tighter than anyone intended. So
the rules are stated in **car-relative units** and resolved against the roster's extremes at
check time: road width in widest-car widths (width-in-widest-car-widths), corner radius in
longest-car lengths (corner-radius-in-longest-car-lengths). The two different extremes are
deliberate. Width is a lateral question and the widest body decides it; radius is a turning
question, and the longest **wheelbase** decides it, together with steering lock, because a long
wheelbase sweeps a larger arc and needs more room to rotate. The longest body is a proxy that
holds only where wheelbase is a fixed share of length. In the measured roster it was not: the
longest body and the longest wheelbase belonged to different cars. Using one reference for
both, "the biggest car", over-constrains one axis and under-constrains the other for any roster
whose largest car is not also its longest and widest.

The numbers are **authored**. A minimum of a few car widths and a minimum radius of a couple of
car lengths are defensible defaults that come from reading how published racing-game design
treats lane width and from checking that the authored circuits can be driven by simulated
opponents. They were not tuned on human play, and the honest status of every threshold in this
subject is *authored, simulated, not felt*. A reader transplanting them should treat them as a
starting point for their own playtest, not as a finding.

## A lap needs a rhythm, and the rhythm is a fraction

The room-graph world has pacing rules because a level is a sequence of beats. A lap has the
same need in a different geometry: a circuit that is all corners is exhausting and a circuit
that is all straight has nothing to learn. The cheap, robust expression of lap rhythm is the
**fraction of the lap that is straight**, counted by arc length where the turn rate falls
below a stated threshold, held inside a band (straight-fraction-pacing-band). It is crude on
purpose. It says nothing about where the straights are or how the corners link, and that is
the point of keeping it a gate and not a quality score: it catches the degenerate lap and
leaves the interesting laps to a human. A band has two ends and both are findings; a lap that
fails the low end has no place to go fast, and a lap that fails the high end has nothing to
brake for. Expect it rarely to bind. Across a measured library of 37 installed circuits the
fraction ran from 0.37 to 0.73 inside a band of 0.12 to 0.85. Motorsport regulation caps the
**length** of a straight, not its share, and a longest-straight limit is the cheap companion
check. A geometric fraction is not the flat-out fraction either: a twisty street circuit is run
flat out over more of its distance than its geometry suggests, and only a speed profile under a
simulated driver measures that.

## Sites are checked against the same cars

A starting grid is the one place where several cars must coexist on a bend at standstill, and
it is where careless checks produce both false alarms and misses. Two cars side by side are
not two circles, and a long car is not a point: treating each as a bounding circle rejects a
perfectly good two-wide row, and treating each as a point accepts a row where noses overlap
tails. Each slot is checked as an **oriented capsule** that follows the track heading at that
slot, with a margin, so the check agrees with how the cars will actually be drawn and collide
(oriented-capsule-grid-lint). The same logic is why the other site checks, such as a pickup
being inside the road with the car's half-width to spare, are written against the car and not
against the centreline.

## Global overlap is the one check a local view cannot see

A smooth closed curve can still cross itself, or run so close to a distant part of itself that
the two ribbons overlap. Locally every segment is fine. The consequence is severe: a progress
tracker that projects a car onto the nearest ribbon segment will, at the overlap, project onto
the wrong part of the lap, and gates are skipped or lap counts jump. The check compares ribbon
segments that are far apart **along the arc** and requires their centrelines to be farther
apart than the two half-widths together; segments close along the arc are excluded because
neighbours on a corner are legitimately near. The exclusion distance is itself a decision. State
it in car units, never metres, and make it the larger of several car lengths and several road
widths. An exclusion of two road widths alone was measured firing on a road's own continuation:
once a baked segment is about one road width long, the sample two places along falls outside the
exclusion and inside the clearance. The overlap rule is owned by the mutation discipline
below, because it is the rule whose failure is least visible to a casual look at the track.

## Branches hang off the curve

Arcade circuits grow junctions, shortcuts and alternative routes, and a single closed curve
looks as if it cannot hold them. In the measured case it held them by staying the **progress
authority** and declaring each exception. Practitioners describe the same thing: a track is
normally a single closed list of nodes, and branches add links to it.

- **An at-grade crossing is declared, not tolerated.** The declaration names the two arc
  positions that meet. The global overlap rule is waived within a stated distance of those two
  points and nowhere else. A twin with the declaration removed must report the overlap. An
  elevated crossover is declared the same way, by layer, so that a legal figure of eight is not
  refused.
- **Projection near a crossing is hinted by the last progress.** The search for the nearest
  segment starts from where the car was a moment ago. A global nearest-segment search is what
  the overlap rule protects, and at a declared crossing that search would put the car on the
  wrong passage.
- **An alternative route is a second curve driven over an interval.** Both ends map
  monotonically onto the main lap, so a shortcut cannot award checkpoints the main route did not
  pass. Width, radius and site rules apply to its driven interval in the same car units.
- **Route rules are a rule family of their own.** They need their own mutants. In the measured
  case they were the last rules added and the least proven: one of six junction rules had a
  mutant, and none of nine branch rules did. A game with very heavily branched routes is better
  served by an explicit node graph with links, with these rules applied to each edge.

## Acceptance is a separate instrument

A linter that passes every circuit has said the circuits are raceable. It has not said they are
distinct or that their rhythm is placed. Those are properties of the whole outline and of the
library, and they belong to a second instrument run before a circuit is accepted
(shape-contract-above-the-linter). It reads the linter's thresholds rather than copying them. It
measures the outline against its convex hull, the rhythm as corner families and placed
straight-brake pairs, and race behaviour under seeded simulation. It compares outlines pairwise
across the library. Every one of its gates has a planted witness. In the measured case it
rejected all 29 circuits of a library that the linter passed and a person had already rejected as
ovals. Keep the two apart. A lint failure refuses the circuit at load, and a shape finding refuses
it entry to the library.

## A linter that has never failed is a hypothesis

The structural gate in this subject is cheap, deterministic and exact: it is arithmetic over a
baked polyline, not a simulation. That makes it trustworthy and it also makes it easy to believe
in without ever having seen it fire. A rule can be present, read its threshold from the right
place, run on every shipped track, and still never trigger because a sign is wrong, a unit is
doubled, or the comparison is a no-op for the values in play. The only proof a rule works is a
**mutant**: take a track that passes, change it by one defect the rule is meant to catch, and
assert that exactly that rule fires (mutate-good-track-to-prove-linter). Every rule gets its
mutant. A rule without one is declared unproven, not assumed sound, and the report states how
many of the rules have been seen to reject something.

## Scale is a contract between three things

World metres, camera pixels per metre and a minimum on-screen car size are three numbers that
describe one thing, and treating them as independent is how a game ends up with correct physics
and cars the size of grains. The contract fixes the physical car length in metres, fixes the
camera's scale range in pixels per metre, and states a minimum on-screen length, so that every
car at the lowest allowed zoom is at least that many pixels long (px-per-metre-scale-contract).
The camera is then allowed to move inside its range and **not outside it**, and every
state of the camera, including the ones added later for shared views, has to honour the floor
or declare itself a map. The contract belongs in a track subject and not only a camera subject
because road width in car widths already ties the track to the car; the pixels close the loop to
the screen: a road that is four widest-car widths wide at the floor zoom is a known number of
pixels, and that is what a viewer actually sees.

## What this subject is not

It does not own what the cars are. Their masses, sizes and how they differ from each other are
inputs here, taken as the roster's extremes; whether the classes are balanced against one
another is a different question with its own instrument. It does not own the handling model, so
a minimum radius is a geometric floor and says nothing about whether a given car at a given
speed can hold the line through it. It does not own collision response between cars, though the
capsule used for the grid is the same silhouette collision uses and must stay so.

**Boundary against the room-graph planner.** The planner owns discrete, typed room graphs and the
rhythm of their sequence, with seed reproducibility as a generator contract; this subject owns a
continuous closed curve in metres, measured in vehicle-relative units, authored by hand and
checked as geometry. Pick by the medium of the thing being linted: if the units are rooms and
edges, the planner's pacing rules apply; if they are metres, radii and arc length, this subject's
do. The two share one idea, that rest is a designed beat and the floor that lets a peak exist, and
differ in everything else; in particular nothing here is generated from a seed, so no
reproducibility contract is needed beyond the bake being deterministic. The neighbour for the
roster is the archetype-balance subject: it decides what the extremes are, this one consumes them.

## The failure modes of the naive reading

**"The curve is smooth, so the corner is gentle."** Smoothness is continuity, not radius. A
perfectly smooth hairpin can be tighter than the longest car can turn in, and a spline between
unevenly spaced control points can overshoot into a tight kink the designer never placed. Lint the
baked ribbon, not the control points.

**"The widest car fits, so the road is wide enough."** One car fitting is the existence proof for
a time trial. Racing needs room for cars to run side by side and to pass, which is why the
minimum is a multiple of the widest car and not a margin on it.

**"Every shipped track passes the linter, so the linter works."** A check that has never been
shown to fail is untested. Passing the shipped set proves the set is clean under the rule; only a
mutant proves the rule can see a defect.

**"The camera is clamped, so the car is always readable."** Only on the paths that apply the clamp.
A second camera mode that takes a minimum of its own against a different target can slip below the
floor; the contract has to be asserted on every mode, or the mode must say it is a map. The same
goes for a factor applied after the clamp. In the measured case a felt request to pull the race
camera back was applied as a divisor after the floor, every race camera fell below the contract,
and the contract's data test stayed green. A felt change is legitimate, and it belongs in the
table, where the contract can see it.

**"Every circuit passes the linter, so the library is good."** The linter proves each circuit is
raceable. A library of raceable ovals passes it on every circuit. Distinctness and placed rhythm
are measured by a separate acceptance instrument, or they are not measured.

**"A straight fraction of one half is a good lap."** It is a good lap only in the sense that it is
not degenerate. The band is a floor for rhythm and nothing more, and passing it must never be
reported as the track being good.

**"The numbers came out of the linter, so they were validated."** The thresholds here were
authored and then checked against simulated opponents. Nobody has driven these circuits and
reported that the corners felt fair; a document that lets a simulated finish read as a felt one
has quietly promoted a weaker rung of evidence to a stronger one.
