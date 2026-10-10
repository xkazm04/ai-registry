---
layer: technique
type: technique
subject: vehicle-archetype-balance
technique: winner-share-over-declared-course-mix
status: forged
laws: [an-instrument-proves-it-had-input, a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [deciding whether any vehicle class dominates, a dominance threshold never fires, publishing a roster balance report, a tier fails its gate and a fix is proposed]
---

# Winner share over a declared course mix

The concern: how to decide that no class dominates. The technique measures, per class, the
**share of races won**, aggregated over a **declared mix of courses** whose weights are written
down, and gates the maximum share. Entry rate and mean finish are tempting substitutes; they
fail for reasons below.

Status of claims: the shares are **simulated**: seeded races under the shipping rules with
scripted drivers at a stated count. The course weights are **authored** — a content assumption,
not a claim about what players pick. No share here is a human-felt result.

## Why not entry rate

An entry rate counts how often a class is on the grid, or how often it places. If each class
fills a third of the grid, its entry rate is capped at a third, and a threshold of fifty-five
percent cannot be reached by any class under any roster: the check always passes and
distinguishes nothing. In the source this exact instrument ran forty thousand races before the
bound was noticed. The general rule is the instrument rule: before trusting a gate, compute its
maximum attainable value and confirm the threshold sits inside the reachable range
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).
Winner share ranges from zero to one, its fair-share value is one over the class count in a
symmetric field, and a threshold between those bites.

## Why a declared mix

A class that wins every long straight and loses every hairpin has an average that is a
statement about the course set. Report the mix with the number: for example fifty percent long
straight, twenty-five technical, twenty-five loose surface, read from the same data the
harness reads, so the report cannot drift from the run. Label it "content mixture assumption".
Adding a course type later changes the mix, and the old number is a number about the old
content.

Always publish per-course results next to the mixture. A mixture can hide a class that never
wins anywhere (it is simply never first), or a class that is dominant on the course with the
most weight. The roster gate has two companions: each class must be best by mean time on at
least one course type and worst on at least one — otherwise its pair is not real — and the
maximum mixed winner share must stay under the threshold.

## What the share measures when drivers are scripted

With equal scripted drivers in a low-noise simulation, the faster class on a course wins
nearly every race there. In the source's five two-class tiers, 12 of 15 course cells went to
one class in at least 97 percent of 2,000 races, and the lowest cell was about 84. The mixed
share is then close to the total weight of the courses each class owns. On a mix of one quarter,
one half and one quarter it sits near fifty percent by construction. What the gate actually
reads is **leakage**: the races a class wins on its partner's course. The tier that failed
showed this. Its margins were the smallest in the roster, about six seconds on every course,
and its technical-course class won about one race in six on the long straight. That straight
carries half the weight.

So a share is not a margin. Publish each course's time gap beside the share. Read a mixed share
near the owned weight as "the shape is clean", not as "the classes are close". A
fifteen-second gap and a two-second gap give the same share. Motorsport parity systems measure
the margin directly: a lap-time window of a few tenths of a percent, from a car's best laps
and clean top speed. They measure it per circuit or per circuit type, never over a season
blend.

## When the player chooses per course

The mixture describes the roster's fairness only if the vehicle is chosen *before* the course
is known, for example a career car carried through a season. When a player can pick a vehicle
per race with the course in view, the mixture no longer describes the decision. The pick on
each course is the answer, and "no pick is the answer" has to hold per course type. Then gate
per course type, with a ceiling on how far any class leads there. The field's practice matches.
One GT series keeps four balance sets selected by circuit type, and the endurance series gives
its signature race a balance of its own. The design difference stands: an archetype roster is
meant to differ per course, so the per-course gate is a ceiling on the lead, not a parity window.

## Driver skill is a second axis

A share measured at one driver skill is one bracket's verdict. Skill-heavy stats (handling,
launch, line choice) pay more as skill rises, so a roster balanced for scripted drivers can
favour different classes for experts. The published balance framework of a large competitive
game sets win-rate bands per skill audience and calls a contender overpowered if it crosses
the band in *any* audience. Run the gate at two or more driver skills and fail on any. The
skill-versus-power invariants in the golden path probe the same axis on one course at a time.
They do not replace a share per skill. Research on simulation-driven balancing finds agent
balance carries over to perceived balance for most scenarios, not all. Treat equal-skill
scripted acceptance as necessary, not sufficient.

## The verdict belongs to the ruleset the harness ran

The same roster, physics and seed scheme gave two different verdicts depending on which rules
the harness ran. With movement only, the source's first tier failed at 56.2 percent (95 percent
interval 55.3-57.0, 2,000 races per cell). With combat on, the same tier passed at 52.7. A
gate verdict names the ruleset it ran on. The harness that ships the acceptance must run the
rules the game ships. A movement-only harness kept after combat joined the game measures a
different game, and its failure is a finding about the harness first.

## Procedure

1. Declare the course types, each with a weight, in data.
2. For each tier, build the homogeneous field: every class in the tier, equal driver skill,
   starting positions rotated so grid order does not favour a class.
3. Run a stated number of seeded races per scenario; seeds derive from the scenario so a rerun
   gives the same result and a worker pool changes nothing (see the encounter-simulation
   neighbour for the seeding discipline).
4. Per class, per course: winners, mean time. Per class, mixture share: the weighted sum of
   per-course winner shares.
5. Assert every entry resolved (finished or terminated) and report the count of distinct end
   states; an instrument must show what it examined.
6. Gate: maximum mixed share below the threshold; each class best and worst on at least one
   course type.
7. Replay a sample of first seeds on the final code and data and require byte-identical rows. A
   verdict is bound to the content it judged
   ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).

## When a gate fails

A failed gate is a finding. Change one authored stat, rerun *the whole sweep for that tier*,
and read the new maximum. In the source, a failing top tier at about sixty-one percent was first corrected by one stat point that
overshot (its partial sweep exceeded the limit again), and the second correction landed at about fifty-two.
A cure in one direction overshoots into the other when a share sits near a threshold; one run
after one edit is not acceptance. Do not widen the threshold, do not drop the failing course.
Unchanged tiers keep their accepted samples; rerun only what the change could affect, and record
that choice.

## Decision rules

- When two tiers share a data change, rerun both. When a metadata-only change touches no physics,
  reuse the sample and say so.
- When a class wins everything on a course type, check the course first: is the radius or
  length such that a stat is irrelevant there.
- When the per-course results disagree wildly with the mixture, believe the per-course ones.
- When the synthetic course is longer than the playable ceiling, it is a probe of one stat,
  not a pacing claim. Label it so.
- When the field is not symmetric (a mixed-tier grid), the fair share is not one over the count;
  say what it is.
- When a mixed share sits near the weight a class owns, read the per-course margins before
  calling the tier close. When a tier fails, look first for the course where the leakage
  happens and for the smallest margin.
- When the vehicle is picked with the course in view, gate per course type as well as on the
  mixture.
- When the movement or combat rules change, rerun the acceptance on the new rules. An accepted
  sample from the old rules is history, not evidence.

## When not to use it

A roster meant to be equivalent everywhere, such as spec cars balanced against each other:
there the goal is parity per circuit, and a lap-time window is the instrument. Combat classes:
shares over a movement-only course mix say nothing about fights. A roster
where winning is not the objective (survival, time trial) needs the analogous outcome measure.
And with too few races the shares are noise; state the count and the interval, or the
percentage's third decimal is decoration.
