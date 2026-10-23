---
layer: application
type: application
subject: ad-concept-development
technique: creativity-template-mechanisms
stack: next
status: forged
applied: experiment
ab_verdict: better
verified_on: 2026-10-21
verified_against: next@16.3.3
proof: ab-paired
---

# The angle decides the spread, the seed decides the content

*Verified against the Gravitone studio tree at commit `ae5d62f` (the experiment landed as
`f09e9d3` and `9c3cdac`), 2026-10-21. The version is witnessed by the tree's own
`package.json` pin.*

The technique says surprise has a small number of mechanisms, and a generator should be
given one per premise rather than told to be original. The studio's ad idea round already
does this. Its prompt assembler (`lib/ads/concepts.ts`, `ideasPrompt`) gives each of six
slots a different angle before generation: analogy, twist, exaggeration, demo, emotional,
absurd, with problem-solution in reserve. That set maps onto the 1999 templates closely.
The project's own open-questions file named the gap in its own words: "Does angle seeding
actually widen a model's idea set?" Nobody had measured it, and the first application of
this technique was `unmeasurable` for the same reason: every arm was mechanism-forced, so
there was no control.

## The seam, chosen to falsify

The angle is not the only thing that widens the studio's set. The same assembler gives
every slot an ordinary person's point of view as a seed, and every other slot a forced
connection ("the idea runs through a queue"). The prompt then asks for a long list,
pushed apart and deduplicated by mechanism. With that much divergence procedure already
in place, the angle could plausibly add nothing. If it added nothing, the technique would
need a boundary: mechanisms matter only when nothing else seeds the slots. That is the
outcome this seam could return.

## The A/B

One brief (the studio's seeded rain-jacket project, 15-second vertical, deadpan), the
shipped prompt file, and two seeds.

- **B**: the prompt exactly as the assembler compiles it.
- **A**: the same text with one variable removed, the per-slot angle and the angle
  definitions. The personas, forced connections, long-list stages, gates and schema are
  unchanged. A still classifies each idea after the fact, so it sees the label words,
  but nothing assigns them.

There was one fresh model call per arm and seed. The four sets were condensed to title,
leap and long list, shuffled, and stripped of labels. A separate blind call then
clustered them. The target was distinct leaps (one point made through one kind of device
counts once). The floor was the number of ideas the judge called a category default.

| | B, forced | A, unforced |
|---|---|---|
| distinct leaps per set | 6, 6 | 4, 6 |
| distinct leaps over the arm's 12 ideas | 12 | 9 |
| distinct mechanisms per set | 6, 6 | 3, 4 |
| plain demonstrations, no device | 1 | 2 |
| floor: category default | 2 | 2 |

**Verdict: better, and thin.** Every count moved toward B, and the floor held. With one
unforced seed, two pairs of slots collapsed onto one leap each: an unused towel stack and
a full drying rack, and two different queues of people sheltering from rain. That set
also used three mechanisms in six ideas. The other unforced seed kept six leaps but drifted
twice to plain demonstration, which is the drift the technique's procedure step 3 predicts.
The per-set leap gap comes from that single seed, so the leap count alone does not separate
the arms at n=2. The mechanism spread does.

## What the tree showed that the technique did not say

- **The seed carries the content and the mechanism carries the spread.** Three of the six
  leap clusters that crossed sets were the same seed in both arms. Given a wedding
  caterer, both arms reached for a silver cloche. A persona seed decides what an idea is
  about whether or not a mechanism is assigned. What the mechanism prevents is two slots
  landing on one leap. So the two are complements, not substitutes. A team that already
  seeds with personas still gets spread from assigning mechanisms.
- **A self-graded gate is not a screen.** Every idea in all four sets carried the
  generator's own "yes" on the swap test (would a rival's jacket break the idea). The
  blind judge passed one of twenty-four. The studio's validator checks that the gate has
  the right form, not that it is true. This is the project's separate-judge question,
  measured from the other side, and it is recorded there as a return condition, not here
  as a finding.

## What this realization cannot do

The judge is a model, and model rankings of creative ideas sit near chance against expert
humans. That is why the counts here are clusters, not quality scores. Nothing here says
the forced ideas are *better ads*, only that they are more different from each other. Two
seeds per arm and one judge put this at the floor of what an experiment can be.

The return condition is the project's open question run at five or more seeds per arm,
or a separate judge pass in the round that re-grades the swap test.
