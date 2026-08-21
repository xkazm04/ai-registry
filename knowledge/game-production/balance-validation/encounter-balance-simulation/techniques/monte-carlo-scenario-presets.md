---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: monte-carlo-scenario-presets
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [standing up a balance harness, comparing a result against one taken months ago, deciding how many iterations a question needs]
---

# Monte Carlo scenario presets

A balance harness is only useful if its answers are comparable. Two runs a month apart,
by two people, must differ because the *game* changed — not because one of them typed a
different enemy count into the form. The technique is a small, checked-in, versioned
**cast** of combatants and scenarios that every balance question is asked against, with
the iteration count stated as part of the preset rather than chosen at the keyboard.

## The cast

Four to six combatants, deliberately spanning the axes that make combat maths behave
differently, is enough. A working set:

- **A reference player** at a mid-campaign level with a stated build — health, resource
  pool, primary attributes, mitigation, attack power, crit chance and multiplier, base
  hit, attack rate. The comment next to each derived stat states the formula it came
  from, so a reader can tell an authored number from a computed one.
- **A weak trash enemy** — low health, low output, high count. Exercises the fast-fight
  path and overkill.
- **A heavily mitigated target** — high health, very high armour, slow. Exercises the
  soft-cap region of the defence curve, which is where linear intuitions break.
- **A glass caster** — low health, high burst, high crit multiplier. Exercises the
  spike path and one-shot risk.
- **A boss** — deep health pool, moderate mitigation, slow heavy hits. Exercises the
  long-fight path, resource attrition and the tail of the duration distribution.

Scenarios compose them: a trash pack of several identical weak enemies, a mixed pack, a
solo boss. Three scenarios covering short/mixed/long is a better default than a dozen,
because a cast nobody remembers is a cast nobody compares against.

## The rules that make it work

- **Every stat block is single-sourced.** The cast lives in one place and every surface
  — the interactive tool, the batch sweep, the tests, the documentation example — reads
  it from there. A stat block copied into a second file will diverge, and the divergence
  will be discovered as two teams disagreeing about a result they both computed
  correctly.
- **The iteration count belongs to the preset.** It is a property of the *question*, not
  of the session. Store it beside the scenario so the number is reproduced along with
  everything else.
- **Changing the cast is a versioned event.** Bump the cast's version and treat every
  stored result taken against the old version as historical. A preset edit that silently
  reinterprets an archive of results is worse than no archive.
- **The cast is a comparability device, not a population model.** It does not claim
  players build this way. Anyone tempted to add combatants until the cast "represents
  the playerbase" has confused this technique with playtest sampling and will end up
  with a cast too large to hold in mind and still unrepresentative.

## Choosing the iteration count honestly

A rate estimated from N independent fights has a standard error of about
`sqrt(p(1-p)/N)`. Concretely, for a win rate near a half:

| Iterations | ~1σ on a 50% rate | Smallest difference worth reporting |
| --- | --- | --- |
| 300 | ±2.9 pp | ~8 pp |
| 2,000 | ±1.1 pp | ~3 pp |
| 10,000 | ±0.5 pp | ~1.4 pp |

Two thousand iterations per scenario is a good default for an interactive tool: it runs
in well under a second on a laptop and resolves differences of a few percentage points,
which is the granularity at which a designer actually acts. A broad grid sweep will
often drop to a few hundred iterations per cell to keep the grid interactive — that is a
legitimate trade, and it is only legitimate if the coarser resolution is **reported**.
A heat map computed at three hundred iterations per cell must not render single-point
differences as colour steps a reader will interpret as signal.

State the count next to every rate the harness emits. A rate without its sample size is
a number without its basis.

## Decision rules

- If a question will be asked more than twice, it gets a preset. Ad-hoc parameters are
  for exploration only, and exploratory results are never archived as evidence.
- If two scenarios differ only in one number, make it one scenario with a lever and use
  a sweep, not two presets. Presets multiply badly.
- If a result must be quoted in a review, quote the preset id, the cast version and the
  iteration count with it. Those three plus the code revision reconstruct the run.
- If the harness offers a "quick" mode with a reduced count, it labels its output as
  reduced-resolution rather than emitting the same shape of number as a full run.

## When not to use it

- **When the question is about a specific authored encounter**, not about the systems.
  Then simulate the real placement, with the real combatants, and let the presets be the
  sanity baseline you compare it against.
- **When the outcome is deterministic.** If nothing in the resolution is stochastic, a
  single evaluation is the answer and running it two thousand times is theatre that
  makes a reader believe an uncertainty estimate exists.
- **When the question is perceptual.** Whether a fight *feels* good — its rhythm, its
  readability, its arc — is not a rate and does not become one at any iteration count.
  That belongs to the pacing craft next door, and a harness that answers it with a
  survival percentage is answering a question nobody asked.
