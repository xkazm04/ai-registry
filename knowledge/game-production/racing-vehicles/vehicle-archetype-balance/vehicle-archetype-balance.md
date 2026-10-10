---
layer: golden-path
type: golden-path
subject: vehicle-archetype-balance
status: forged
use_when: [authoring a roster of racing vehicles that must be different and fair, a vehicle class keeps winning or never wins, deciding what a rating number is allowed to mean, adding a new vehicle to an existing tier]
techniques:
  - linear-stat-to-physics-mapping
  - power-rating-single-function
  - identity-pair-via-authored-band
  - weights-fit-to-sim-with-published-residuals
  - winner-share-over-declared-course-mix
  - sidegrade-two-per-tier
---

# Vehicle archetype balance

A racing roster has to satisfy two demands that pull against each other. The vehicles must
be *different* — a player who picks one should feel a different game from a player who
picks another — and they must be *fair*, in the sense that no pick is the answer. The
naive resolution is to make them different by tuning each one's numbers and fair by making
the numbers add up. That resolution produces rosters that are numerically uniform and
mechanically dull, or numerically honest and secretly dominated, depending on which half
the author trusted. The craft of this subject is keeping the two halves in separate
instruments: a rating that says what a vehicle *costs*, a pair that says what it *is*, and a
race result that says whether it *wins*.

Everything below is stated for a top-down arcade racer where a handful of vehicle classes
share a track set, a tier ladder and a shop. The principles transplant to any roster of
asymmetric contenders on a shared course set. The honesty rule of the subject is that almost
every claim about whether a roster is balanced is a claim about a *simulation*, and a
simulation is not a player. Where this subject says a roster was accepted, it means a seeded
harness over the shipping rules passed a declared gate; it does not mean anyone has felt it.

## A stat is an authoring handle, and physics is derived from it

Authors do not set metres per second. They set a small number of unitless ratings — speed,
acceleration, grip, armour, mass, handling, braking, slots — on one fixed scale, and a
single table maps each rating **linearly** onto the physical quantity the movement step
consumes: a base value and a per-point increment, nothing else
(linear-stat-to-physics-mapping). The linearity is not a physical claim. It is a promise to
the author that one more point means the same increment everywhere on the scale, so a
designer can predict what a change does and a reviewer can read a roster as a table.
Handling in particular is two separable physical things — how much steering lock the
vehicle has at speed, and how quickly yaw follows the input — and one rating may drive
both, which is why the mapping is parameter-to-rating and not rating-to-parameter. Several
parameters can hang from one stat; no parameter hangs from two. Two conditions apply. Linearity
is a choice: a shipped kart racer uses one lookup curve per stat to make stacking a stat
yield less near the top. And once the movement step models geometry, a stat's value can be
multiplied in the step by another stat or by per-vehicle shape data. The rule must then hold
for the *effective* quantity the step integrates, not only for the table.

The failure of the naive reading is a rating that is only a label. A bar on a screen that
nothing consumes is a declared input with no reader
([declaring-an-input-is-not-consuming-it](../../_laws.md#declaring-an-input-is-not-consuming-it)),
and a rating that drifts away from the physics it names makes every other number in this
subject meaningless.

## One function says what a vehicle costs

Equal strength is not the goal; equal *cost* is. Define a **Power Rating** as one function
from a vehicle's derived physical quantities to a number: each quantity normalised against
an origin and a per-point unit, multiplied by a weight, summed
(power-rating-single-function). Every system that needs to know how strong a vehicle is —
the roster check, the shop offer, the pricing of a rival's purchase — calls that function.
None of them re-derives it
([one-authority-per-quantity](../../_laws.md#one-authority-per-quantity)), and the step that
runs the race never calls it at all, because a rating is a design-time summary and not a
runtime rule. Each tier has a budget, and every vehicle in the tier sits within **plus or
minus three percent** of it. The tolerance is narrow on purpose: a wide band lets a
sixth-percent edge hide inside "within budget", and a rating that cannot tell two vehicles
apart has no job.

The rating is a *summary*, and the thing to hold onto is what it summarises. It is a linear
combination of physical quantities whose weights were chosen so that equal rating predicts
roughly equal race outcome. That prediction is approximate. The weights are a fit, the fit
has residuals, and the residuals belong in the published record next to the weights
(weights-fit-to-sim-with-published-residuals). A rating treated as an equivalence is a lie
a player will discover on the first course where the equivalence does not hold.

The fit is also bound to the rules it ran on. Replace the movement step and the weights are
stale even if no vehicle's stats moved. The budget check keeps passing, because it reads the
same stale weights. Only a fresh residual table shows what changed. A stat the simulation
never exercised has a weight the data cannot identify, so it gets no price at all. A small
weight and a large one are equally arbitrary. Field rating systems show the drift at scale:
whole-table recalculations, and exploits through one under-priced part. A project whose
physics outran its fit can honestly downgrade the rating to a planning index, provided the
race-outcome acceptance carries the verdict.

## Equal cost, different shape: the identity pair

If the only rule were "same rating", the cheapest way to satisfy it would be to make every
vehicle average. So the second rule forbids it: every vehicle carries an **identity pair**,
a strength it is paid for and a weakness that pays for it. A vehicle strong somewhere is
strong only by being weak somewhere else, and a vehicle at the budget with no weakness is
an error, not a virtue. The strength and weakness are measured against the tier's reference,
in an **authored band width** — a number in rating points the designer wrote down — and not
in the sample deviation of the tier, because a tier with two vehicles has a sample deviation
that cannot be exceeded by both of them (identity-pair-via-authored-band).

The pair also carries the skill story. A light vehicle that is fast to launch and to turn but
capped on the straight asks the player to find the line; a heavy one that is fast on the
straight but wide in the corner asks the player to choose lanes and use contact. A pair is
what turns a rating budget into a *question put to the driver*, which is why it is a design
rule and not a lint nicety. The pair must also be legible: the weak rating is drawn so that
a player sees what they gave up when they chose.

## Progression is a sidegrade choice

A tier ladder where each tier replaces the last with strictly better numbers is a menu with
one item. Put at least two vehicles in each tier, built from different archetypes, and let
the budget rise by tier while it stays level within one (sidegrade-two-per-tier). A player
moving up chooses *which* trade to carry forward, and a player staying down is not
punished with a worse game, only a smaller budget. The tier budget curve is the economy's
business; the within-tier shape is this subject's.

## Acceptance is who wins, over a mix someone wrote down

A roster passes when no class dominates the *winners*. The instrument is the **share of
races won by each class** over a declared mix of courses, with the mix's weights
written beside the result (winner-share-over-declared-course-mix). Three rules sit inside
that sentence.

First, winners, not entries. An entry-rate threshold is bounded by how often a class is on
the grid: if each class fills a third of the starting positions, a fifty-five percent
entry-rate gate can never fail, so it measures nothing and reads as green. This is a
precise instance of an instrument that proves no input
([an-instrument-proves-it-had-input](../../_laws.md#an-instrument-proves-it-had-input)),
and it was caught and replaced in the source for exactly this reason. Winner share has a
ceiling of one hundred percent and a fair-share floor of one over the number of classes,
so a gate can sit between them and bite.

Second, a declared course mix. A class that wins every long straight and loses every
hairpin has a mean that depends entirely on how many of each the game contains, so the
weights are authored, published and labelled as a content assumption rather than a claim
about what players choose. Per-course results are reported alongside the mixture so the
mixture cannot hide a class that never wins anywhere, and each class must be best on at least
one course type and worst on at least one.

Third, a failed gate is a finding, never a threshold to loosen. When a tier fails, the fix
is a change to a vehicle's authored stats followed by a rerun of the full sweep — and the
rerun is mandatory, because a one-point correction that cures one gate can overshoot into
the opposite failure.

Four conditions bound what a passing share means.
- **A share is not a margin.** With scripted equal drivers, the faster class on a course wins
  nearly every race there. The mixed share then sits near the course weight each class owns,
  and the gate reads only leakage onto the partner's courses. Publish per-course time gaps
  beside it.
- **The course choice.** When a player picks the vehicle with the course in view, the mixture
  no longer describes the decision. Gate per course type too, as motorsport balancing does by
  circuit type, but with a ceiling on the lead, not a parity window, because the roster is
  meant to differ per course.
- **Driver skill.** A share at one driver skill is one bracket's verdict. Run the gate at two
  or more and fail on any.
- **The ruleset.** The verdict belongs to the rules the harness ran. In the source, the same
  tier failed on movement alone and passed with combat on. The acceptance harness must run the
  shipping rules, and a rule change reopens acceptance.

## Four invariants keep skill above power

The rating budget is about *power*. Whether the game rewards driving is a separate question,
and the roster has to hold four invariants over the same harness: no class dominates the
winners; the same light vehicle driven by an expert beats a novice-driven heavy on the
technical course, and the reverse on the straight; the light vehicle's top-speed deficit
shows up as measurable time lost on a long straight and is not bought back by launch alone;
and the heavy vehicle's armour does not make it unkillable, with a declared ceiling on its
time to be destroyed. The first is owned here. The second, third and fourth are checks on
whether the *skill axes* work and are consumed from the difficulty neighbour; they are
listed here because a roster that passes only the first can be a rating-balanced pile of
cars that nobody drives differently.

## What is measured, simulated, authored

Three epistemic states recur and must not be mixed. **Authored**: the stat values, the
mapping, the tier budgets, the band width, the course weights, the thresholds. They are
decisions. **Simulated**: winner shares, per-course times, skill margins, the fit residuals
— a seeded harness running the shipping rules with scripted drivers, at a stated race count.
**Measured on people**: none, in the source of this subject. A roster accepted on simulated
evidence is accepted for the stock movement comparison it ran; it is silent about combat
fairness, about how a class feels under a thumb, about whether the warning colour on a weak
bar reads. Those are rendered *unmeasured*, never *passed*
([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)).

## Boundary against the neighbours

The cost-curve audit in the economy subject prices a roster of objects in one central
resource and treats an off-curve object as the work queue; this subject borrows that stance
for vehicles but owns what that technique does not, which is the *shape* rule (the identity
pair), the *physics mapping* beneath the rating, and the acceptance by race outcome — pick
the economy subject when the question is what something should cost, and this one when the
question is whether equal cost still produces different, fairly winning machines. The
peer-outlier linting in the encounter-simulation subject screens an authored combatant
against its same-tier peers on paper and says nothing when peers are scarce; this subject
leans on that screen and adds the rule that a tier of two peers is below its floor and needs
an authored band instead, and it owns the winner-share check on top of the simulation the
other subject teaches. The difficulty subject owns what makes a game hard and how skill
scaling differs from power scaling; this one consumes that distinction as the skill-versus-
power invariants and does not restate it. When the question is "what is this fight's win
rate", read the encounter subject; when it is "what is this roster's class balance", read
this one.

## Failure modes of the naive reading

A rating that is a pretty number nobody computes twice. A budget enforced only on the
rating, so every vehicle is average. A weakness that is cosmetic: the "weak" stat is one the
course set never punishes. A dominance check whose threshold the grid composition makes
unreachable. A course mix nobody wrote down, so the result changes when a track is added.
A fit weight for a stat the simulation does not exercise, read as a price. Near zero, it lets
one class collect the stat free. Anywhere else, it is a correlation. A rating calibrated on a
movement step the game has since replaced, still passing its budget check. A mixed winner
share near fifty percent read as "close" when every course is a rout. A movement-only harness
still gating a game that now has combat. Each is a defect in the instrument, not in the
roster, and each looks like a pass.
