---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: tier-band-peer-outlier-linting
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a new combatant has just been authored, screening a roster for balance outliers, budgeting an encounter before simulating it]
---

# Tier-band peer outlier linting

Most balance defects enter the game as a combatant authored in isolation and never
compared to anything. Nobody simulates it, because simulating everything is expensive and
nobody knows this one is suspect. The cheap fix is a linter that runs on every authored
combatant and compares it to the peers it will actually be encountered alongside: same
tier, same roster. It costs nothing, runs at authoring time, and catches the numbers that
were typed with a stray zero or copied from a boss.

This is a **screening** instrument. It sits below simulation on the ladder of evidence
and never substitutes for it — a combatant that passes the lint has only been shown to
resemble its peers on paper, which says nothing about how the fight resolves.

## A transparent threat score

Reduce a combatant's stat block to one number with a small keyword-to-weight table:
offence weighted highest, then health, then mitigation, then critical, then speed, with
a small default weight for anything unrecognised. A working set:

| Stat family | Weight |
| --- | --- |
| damage, attack, power | 0.5 |
| health | 0.3 |
| armour, defence, resistance | 0.25 |
| critical | 0.2 |
| speed, agility | 0.15 |
| anything else | 0.1 |

The score is the weighted sum; the per-stat contributions are kept and sorted, so the
tool can show *what* made this combatant score highly, not only that it did.

The design choice is deliberate and is the point of the technique: **legibility over
accuracy.** A fitted model would rank a roster better. A designer cannot predict what
raising a stat by ten does to a fitted model's output, and so cannot use it while
authoring. A visible table of weights means the score behaves the way a designer expects,
and when it surprises them the surprise is a real finding rather than an artefact. The
score's job is to be *predictable*, and its accuracy needs only to be sufficient to sort
a roster.

Alongside the raw score, a **roster percentile** turns it into a sentence a designer can
act on — "this sits above nine tenths of the roster" — because a raw weighted sum has no
scale a human holds in their head.

## The peer band

For each stat family, compare the combatant's value to the mean of its **same-tier
peers, excluding itself**:

- at or above about **2.5×** the peer mean → warn: verify this is intentional,
- at or below about **0.4×** the peer mean → warn: may be under-tuned,
- otherwise → no finding.

Both thresholds are warnings, never errors. An intentional outlier is a legitimate design
act — a named elite is supposed to be above its band — so the linter's voice is "verify",
and a suppression must be possible without editing the linter. The findings that *are*
errors are structural: no abilities at all, no tier assignment, a missing core stat. Those
are absences, not judgments, and absences are not a matter of taste.

## The minimum-population rule

**Below a floor of same-tier peers — two, excluding the subject — the linter says
nothing about bands.** This rule is rarely written down and matters more than the
thresholds do. A mean over one peer is that peer's value; comparing against it produces
findings driven entirely by whichever combatant happened to be authored first, and a
linter that fires on noise is a linter designers learn to close.

The output below the floor is **not enough peers to judge**, which is a distinct value
from "within band". Rendering it as a pass tells a reader the combatant was checked when
it was not — and it is exactly the state a brand-new tier is in, which is when a stray
number is most likely and least likely to be caught.

The same rule governs the percentile. A percentile computed against a roster of one is
not a percentile; returning a maximum score for a lone entry is a fabricated number, and
the honest output is the same *unranked* label. Percentiles need a population as much as
means do.

## Where it runs

At authoring time, in the surface where the combatant is being edited, with findings
visible next to the fields that produced them. A linter that only runs in a batch report
somebody reads on Fridays has lost most of its value: the whole advantage of this check
is that it fires while the author still remembers what they intended.

## Decision rules

- If a combatant trips a band, either simulate it or record why the outlier is intended.
  Dismissing without one of the two is how the defect ships.
- If a whole tier trips consistently against another tier, the tiers are mis-assigned,
  not the combatants. Check the tier boundaries before retuning anything.
- If the threat score and the simulated outcome disagree, the simulation wins and the
  score's weights are the thing to examine — a persistent disagreement means a weight is
  wrong or the roster has a mechanic the weighted sum cannot see.
- If a stat has no keyword match and lands on the default weight, surface that. Silent
  default-weighting of a stat that dominates the game's maths is a slow-burning error.

## When not to use it

- **As a verdict.** The score screens; the simulation measures. Treating a threat score
  as a balance conclusion is the standard misuse and it produces rosters that are
  numerically uniform and mechanically broken.
- **Across tiers.** The band is meaningful only within a tier. A cross-tier comparison
  needs a model of tier progression, which this is not.
- **On a roster too small to have a shape.** Below the population floor the correct
  output is silence with a label, and adding placeholder combatants to reach the floor
  makes the mean a fiction.
- **On stats that are not on a common scale.** A weighted sum over values with different
  units and ranges is only defensible because the comparison is *within* a family against
  a peer mean. Do not extend it to ratios, percentages and durations without normalising.
