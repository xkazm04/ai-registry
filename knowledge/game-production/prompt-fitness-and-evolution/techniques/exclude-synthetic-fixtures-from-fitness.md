---
layer: technique
type: technique
subject: prompt-fitness-and-evolution
technique: exclude-synthetic-fixtures-from-fitness
status: forged
laws: [a-number-carries-its-unit-and-basis, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [defining the population for a fitness figure, auditing why two arms scored differently, computing quality statistics over an artifact store]
---

# Exclude synthetic fixtures from fitness

## The concern

A fitness figure is a statistic over a population, and the artifact store is not the
population. It also holds test fixtures, seeded demo content, tutorial samples, retry
duplicates, abandoned drafts and human-rewritten artifacts. Every one of those is a real row
that a naive query counts. A figure computed over a population that is nearly half fixtures
is not measuring the prompt at all — and this is not hypothetical: one measured comparison
arm was 43.8% synthetic fixtures.

That number is the argument. It is not a rounding error to be waved at; it is large enough
to invert a conclusion, and it was invisible until someone counted.

The contamination is also **asymmetric by construction**, which is worse than being large.
Smoke and integration harnesses exercise whichever path is wired into them — in the same
measurement, the contaminated arm carried 342 fixtures out of 780 artifacts while the other
arm carried 0 out of 7. Fixture volume tracks how a harness is wired, never how good a
prompt is, so it lands entirely on one side of a comparison and reads as productivity.

## What is out, and why

| Excluded | Reason |
| --- | --- |
| Test fixtures and seeded content | Authored by a seeder, not the prompt; often deliberately minimal |
| Tutorial / onboarding samples | Hand-written to be exemplary or deliberately poor |
| Retry duplicates | Same input, counted twice — over-weights inputs that failed once |
| Abandoned drafts | Never intended to be shipped; grading them grades an interrupted process |
| Human-edited artifacts | The quality is the human's; crediting the prompt is theft |
| Artifacts with `unknown` provenance | Cannot be attributed to a version at all |
| Artifacts from a different rubric era | Different basis; not the same unit |

The organising rule is the one that governs all craft grading: **grade against what ships**.
If the artifact would never be handed to a player, it is not evidence about whether the
prompt produces shippable work.

## Procedure

1. **Mark at creation, not at analysis.** Fixtures declare themselves when they are written —
   a provenance origin field with a closed set of values (`generated`, `seeded`, `fixture`,
   `imported`, `human-authored`). Classification after the fact, by name pattern or heuristic,
   is guesswork that gets worse as the store grows.
2. **Define the population once**, as a named filter with an owner, and have every fitness
   consumer use it. Two filters will diverge, and the divergence shows up as two dashboards
   quietly disagreeing.
3. **Apply it before any aggregate is computed**, not as a caveat afterwards.
4. **Report the exclusion count and breakdown next to the figure**, always. An exclusion you
   cannot see is indistinguishable from a bug in the filter.
5. **Alarm on the ratio.** When excluded share of a candidate population crosses a stated
   fraction — a quarter is a defensible line — treat the figure as unusable and investigate
   the store rather than publishing a corrected mean. A store that is half fixtures has a
   problem the filter is hiding.

## Decision rules

- **When exclusion shares differ materially between two arms, the comparison is void until
  explained.** Unequal contamination is a confound: you are comparing populations, not
  prompts.
- **When a fixture is indistinguishable from real output, treat that as a defect in
  provenance**, not as a reason to include it. The fix is upstream marking.
- **When a human edited a generated artifact, the artifact leaves fitness and the edit is
  recorded.** It is still valuable evidence — about which criteria humans keep having to fix
  — but as a separate signal, never inside the prompt's score.
- **When retries are collapsed, keep the last successful attempt and record the attempt
  count.** Attempt count is itself a fitness signal; two attempts to reach the same score is
  worse than one.

## When NOT to use it

- **Do not exclude an artifact merely because it scored badly.** The exclusion set is defined
  by origin and lifecycle, never by outcome. A filter that anyone can extend after seeing the
  scores is not a filter.
- **Do not exclude the difficult classes.** Dropping the artifact classes a prompt handles
  badly produces a flattering number that predicts nothing about the batch that ships.
- **In a coverage report — how much of the project has been generated at all — fixtures may
  legitimately count**, because that question is about the store. Fitness and coverage are
  different questions with different populations; keep both filters, and label which is in
  use.
