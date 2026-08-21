---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: one-shot-rate-and-ehp-floor-checks
status: forged
laws: [a-number-carries-its-unit-and-basis, law-and-check-share-one-source, unmeasured-is-not-a-pass]
shared_with: []
use_when: [checking a fight is shippable rather than merely balanced, measuring survivability against a stated hit, wiring a canon threshold into a harness]
---

# One-shot rate and effective-health floor checks

Most balance work is about averages. This is not. A floor check asks whether the
encounter can produce an outcome that is unacceptable *at all*, regardless of how good
the average is — a hit that deletes a player from full health before they can react. A
fight can sit perfectly in the middle of its target survival band and still be
unshippable on this axis, which is why floors are computed and reported separately from
bands rather than folded into a single score.

The threshold itself is a systems-canon rule, not this technique's to set: the canon
states the maximum fraction of a capped character's effective health that the largest
non-boss hit at a given area level may deal — around a third is the common statement.
What this technique owns is **how a simulation measures compliance** with that rule and
what it is allowed to conclude.

## Effective health does not exist without a reference hit

The single most common error here is treating effective health as a property of a
character. It is not. Where mitigation is soft-capped against the size of the incoming
hit — the standard shape, where the fraction removed falls as the hit grows — effective
health is a function of two arguments: the defensive stat and **the hit it is being
computed against**. The same armour value can multiply survivability by two against a
small hit and by a fifth of that against a large one.

So the measurement is always a triple, and all three travel together:

- the **reference hit** the figure was computed against, with its damage type,
- the **effective health multiplier** the defence yields against that hit,
- the resulting **effective health** in points.

A harness that emits an effective-health number alone has emitted a number whose meaning
depends on an assumption the reader cannot see. Two teams will read it two ways and both
will be right about different things.

## The check

1. **Determine the reference hit.** Take the largest single hit the encounter can
   produce against the reference character at the relevant level — the maximum over the
   ability set, with critical multipliers applied and every "more" multiplier stacked,
   not the average hit. The worst case is the point of the check.
2. **Compute effective health against that same hit.** Not against an average hit, not
   against a nominal one. Using a different hit for the mitigation calculation than for
   the numerator is the arithmetic version of the same basis error.
3. **Form the ratio** `biggest hit / effective health`.
4. **Compare to the canon fraction** and grade with two severities: at or above the
   fraction is a warning — the hit is large enough to be unreactable in combination with
   another; at or above one it is critical — a literal one-shot from full health.
5. **Report the ratio, both operands and the allowed bound** in the finding, not just a
   pass or fail. A designer needs to know whether they are ten percent over or triple.

Alongside the analytic check, the stochastic harness measures the **one-shot rate**
empirically: the share of deaths in which the player was killed by a single blow from
near-full health. This is the observed counterpart of the analytic bound, and it catches
what the analytic form misses — combinations, overlapping telegraphs, an unlucky
critical on top of a heavy hit. A one-shot rate above roughly five percent reads as
unfair to players regardless of what the analytic bound says: they die before they can
react, and the fight teaches nothing.

Report both. The analytic check says *this is possible*; the empirical rate says *this
is how often it happens*. Neither substitutes for the other.

## The threshold is read, not typed

The number the check compares against is defined once, in the canonical statement of the
rule, and the checker reads it from there. A threshold typed into the harness will drift
from the prose the moment a lead retunes the game, and the drift is undetectable from
either side — the checker keeps passing against a rule nobody holds any more.

Two mechanical corollaries:

- **A parse failure is a loud error.** If the checker cannot find the number in the
  canonical source, it fails; it never falls back to a built-in default, because a silent
  default is precisely how a check outlives its law.
- **The finding names the rule it enforces.** Every violation carries the identifier of
  the canon rule, its human statement, the metric, the actual value and the allowed
  bound. A finding that only says "one-shot risk" cannot be traced back to the authority
  that made it a rule, and an untraceable finding gets argued with instead of fixed.

Extracting the numbers from canon prose is a neighbouring craft; this technique only
requires that the extraction exists and that its failure is noisy.

## Adjacent floors worth measuring in the same pass

Floors travel in families, and the harness that computes one is already holding the data
for the rest. Time-bounded observations that have earned their place: a run where the
player dies inside a few seconds is punishing rather than hard; a fight running past
about three quarters of a minute reads as spongy; a fight over in under three seconds is
trivial. On a bursty axis, bucketing damage into short windows and flagging any window
in which incoming damage exceeds roughly two fifths of the player's maximum health
catches spikes that no per-hit check sees, because the spike is an accumulation across
two seconds rather than one hit.

Each of these is a separate finding with its own severity and its own timestamp into the
fight, so a designer can jump to the moment rather than re-reading the whole run.

## Decision rules

- If effective health is reported anywhere, its reference hit is reported beside it. No
  exceptions, including in tooltips and chart axes.
- If a fight was not simulated, its floor status is `not measured`. It is never `pass`,
  and it is never a neutral middle colour on a dashboard.
- If the ratio is between the warning fraction and one, the fight is shippable only with
  a deliberate, recorded decision. Silence at this severity is how these ship.
- If the empirical one-shot rate and the analytic bound disagree, trust the empirical one
  for *frequency* and the analytic one for *possibility*, and investigate the gap — it
  usually means a stacking path the analytic model does not enumerate.

## When not to use it

- **Against a boss telegraph designed to kill.** A scripted mechanic whose purpose is to
  punish a missed dodge is exempt by design; exempt it explicitly, by naming the ability,
  rather than by raising the global threshold until it passes.
- **As the definition of the law.** The floor belongs to the systems canon. A harness
  that invents its own fraction has created a second authority for a shippability rule,
  and the two will disagree at the worst possible moment.
- **On an under-specified character.** If the reference build's mitigation is not fully
  determined, the check cannot be computed; say so rather than computing it against a
  guess and rendering a confident bar.
