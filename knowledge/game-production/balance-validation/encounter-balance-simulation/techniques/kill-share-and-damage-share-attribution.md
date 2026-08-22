---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: kill-share-and-damage-share-attribution
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a fight fails its target and nobody knows which knob to turn, deciding what to nerf, reporting a simulation result to a designer]
---

# Kill share and damage share attribution

A survival rate says a fight is too hard. It does not say what to change. Attribution is
the step that converts an aggregate outcome into a named cause: for each source in the
encounter — each combatant, and each ability of each combatant — what fraction of the
outcome it produced. Two fractions carry almost all the useful signal, and they answer
different questions.

## Two shares, two denominators

**Damage share** — of all damage the player absorbed across the run, the fraction that
flowed through this source. Denominator: total damage taken. It measures *pressure*.

**Kill share** — of all deaths across the run, the fraction where this source landed the
killing blow. Denominator: total deaths. It measures *lethality*.

They diverge constantly, and the divergence is the finding:

- **High damage share, low kill share** — a chip source. It wears the player down but
  something else finishes them. Nerfing it makes the fight longer, not safer.
- **Low damage share, high kill share** — a spike. It contributes little on average and
  is what actually ends runs. This is the nerf target, and an average-based report will
  never surface it.
- **High in both** — the fight is about this one thing.

Because the denominators differ, the two are never summed, averaged or blended into a
single "threat" number. A percentage handed to a reader without its denominator is not
information: label every share with what it is a share *of*, in the field name and in
the rendered text.

## Attribute at the right granularity

Attribute to `(source, ability)` pairs, not to sources alone. "The heavy construct is
responsible for 60% of deaths" is one nerf away from ruining the construct; "the heavy
construct's charge is responsible for 60% of deaths" is one number away from fixing the
encounter. Aggregate up to the source for the summary view, but keep the pair as the
stored unit — you cannot decompose an aggregate afterwards.

The instrumentation follows: the fight loop emits a damage event carrying time, source,
target, ability, amount and whether it was a critical hit, and death attribution records
the source and ability of the final event. Deriving shares from the event log rather
than from running counters means a new share metric is a query over data you already
have, not a change to the simulation.

## The dominance rule, and the refusal beside it

A single `(source, ability)` pair holding **at or above roughly three tenths of the
kills** is a dominant killer and is named in the report as the thing to soften. The
threshold exists to make the report actionable at a glance; a tenth of a point either
way does not matter, and it should be one named constant rather than a literal repeated
across surfaces.

The far more important half of the rule is what happens **below** the threshold. When no
pair clears it, the report must say *no single attack dominates your deaths — the danger
is spread across several sources*, optionally naming the leader as context. It must not
present the argmax as a culprit. A source holding twelve percent of kills is the leader
of a flat distribution; naming it sends a designer to nerf a thing that is not the
problem, and when the nerf does not help, it costs the tool its credibility.

Three states, three different outputs:

| State | Report |
| --- | --- |
| No deaths in the run | No culprit — the fight is not killing anyone |
| Deaths, leader below the dominance threshold | Danger is diffuse; leader named as context only |
| Deaths, leader at or above the threshold | Named dominant killer with a concrete instruction |

An absent attribution — a run where the events were not captured — is `not measured`,
which is a fourth state and must never render as the first.

## Make the plain-language form the primary one

Attribution output is read by people who do not use the tool daily. Percentages of a
thing they must first identify are slow; counts out of ten are instant. "It landed the
killing blow in four of every ten deaths — soften it to make the fight fairer" is the
same number as a 0.40 kill share and travels far better into a design discussion. Keep
the precise value available for the people who want it, but the sentence is the product.

Whatever the phrasing, the sentence carries a verb. A report that ends at diagnosis
makes the reader do the last inference; a report that says *soften this* has closed the
loop.

## Decision rules

- If the fight fails a target, read kill share first, damage share second. Lethality
  before pressure.
- If damage share and kill share disagree by a wide margin for a source, that gap is the
  headline, not either number alone.
- If an ability's usage frequency is near zero across a run — used a tenth of a time per
  fight or less — its shares are not meaningful and the ability itself is the finding:
  buff it so it participates, or cut it.
- If attribution is shown alongside a difficulty band, keep them visually separate. The
  band is a judgment about the fight; the shares are measurements about its parts.

## When not to use it

- **When there is one source.** Shares of one are always a whole and communicate nothing
  beyond what the outcome already said.
- **When the deaths are too few to divide.** A handful of deaths across a run gives
  shares with enormous error; below a stated minimum death count, report the count and
  withhold the shares rather than dividing by a number that small.
- **As a substitute for a floor check.** A spike that one-shots the player is a floor
  violation whether or not it holds a large kill share, because a rare catastrophic
  outcome can be both intolerable and statistically minor.
