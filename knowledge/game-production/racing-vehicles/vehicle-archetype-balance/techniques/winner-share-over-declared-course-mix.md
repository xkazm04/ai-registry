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

## When not to use it

Combat classes: shares over a movement-only course mix say nothing about fights. A roster
where winning is not the objective (survival, time trial) needs the analogous outcome measure.
And with too few races the shares are noise; state the count and the interval, or the
percentage's third decimal is decoration.
