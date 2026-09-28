---
layer: application
type: application
subject: hiring-policy-defaults-and-tiering
technique: per-role-family-threshold-overrides
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Family floors applied from a calibration recommendation

The node application of the baseline technique shows where family floors are stored: an
optional `familyFloors` map inside the screening rule, resolved by `effectiveFloor`. This
one shows how a family floor gets its value. The consumer lets an operator accept a
calibration recommendation per role family with one click. Read at one pinned commit on
2026-09-26.

## The family vocabulary

`app/_lib/role-families.ts` holds sixteen slugs, from `software_engineering` and
`healthcare_clinical` to `skilled_trades`, `frontline_service` and `general_professional`.
The list mirrors a Python taxonomy file, and the header asks that the two be kept "in
lockstep". The apply route answers an unknown family with a 400 (`CALIBRATION_FAMILY_UNKNOWN`),
never with a silent global write. `effectiveFloor` resolves an unmapped family to the
global floor. That matches steps 2 and 6 of the technique: a named taxonomy, and failure
to the baseline.

## The derivation is anchored to an outcome

`recommendScreeningThreshold` (`app/_lib/calibration.ts:255`) does not place the bar at a
percentile of the family's scores. It looks at one band below the floor and one above it,
and asks what happened to the candidates in each:

- if candidates just below the floor advanced past screening at a high rate (at least 60%),
  the floor is too high, so it suggests lowering;
- if candidates just above it advanced at a low rate (at most 40%), the floor is too low,
  so it suggests raising.

That is the corrected step 4 in practice: the anchor is what the score predicted about
advancement, not where the family's scores fall. The outcome is still a proxy. "Advanced
past screening" is a later human judgement, not performance in the job. It is closer to
proficiency than a percentile is, and not the same thing.

**The sample travels with the number.** The function returns nothing below 20 overall
outcomes (`MIN_CALIBRATION_OUTCOMES`) or below 8 in the band (`MIN_CALIBRATION_BAND_OUTCOMES`).
The apply route seals a `screening_threshold_adjusted` record carrying the band, the
advance rate, `n`, the overall `n`, the previous threshold and the named approver.

**The ratchet guard.** Below the floor, the wave itself rejected the candidates, so in the
ordinary data every below-floor outcome is 0 by construction. Measured there, "lower" is
unreachable and "raise" is the only advice the function could ever give. The comment
calls this out, and the fix is structural. The below-floor band is read only from the
calibration holdout (candidates the wave spared). With no holdout there is no
recommendation, "rather than a one-way one". A family floor derived from contaminated data
would be the circular instrument the technique warns about. This consumer refuses to
produce one.

**Direction is named by its effect.** When both bands qualify, the better-supported one
wins, and "a tie goes to the candidate-protective 'lower'". For a reject-below threshold, lowering is protective, and
the code says so in those words. It is the reading the technique's corrected decision
rule now requires.

## Deviations

- **Both directions get the same review.** One click with `pipeline:write` applies a
  "raise" exactly as it applies a "lower". The technique asks for the stronger review on
  the change that enlarges the population exposed to automated rejection. Here that is the
  raise, and the code already knows which one it is: `rec.direction` is in hand and
  written into the seal's rationale.
- **The grouping has no job analysis.** The families are a vocabulary shared with a
  taxonomy file, and each role is mapped to one. Nothing records which work behaviours the
  roles in a family share. So the shared bar cannot be defended as evidence shared across
  similar jobs.
- **"Reversible the same way" is not true after the first apply.** The route's header
  says the change is "trivially reversible the same way" because it writes through "the
  same ... dual-tier store DecisionRulesModal writes through". It writes the team tier.
  The rules screen writes the organisation tier, which the new team row shadows. See the
  react application of the baseline technique.
- **No demographic check on the family's outcome.** The platform collects no demographic
  data, so step 7's protected-characteristic watch has nothing to read. A family bar
  cannot be tuned to a demographic outcome here. It also cannot be shown not to produce
  one.

## Applied

Simulation, 2026-09-26, recorded in `librarian/applied.md`. The review-direction rule was
walked under A and B. A is the rule as first written: "a floor moved down needs the stronger
review; raising is self-limiting". B is the corrected rule: the stronger review goes to the
change that enlarges the exposed population. The cases are the two directions this
function can recommend, plus a manual edit of the global floor on the rules screen.

- A "lower" recommendation: fewer candidates are rejected. A demands the stronger review,
  and B calls it self-limiting.
- A "raise" recommendation: more candidates are rejected without a person reading them. A
  calls it self-limiting, and B demands the stronger review.
- A manual edit from 45 to 30: this is a lower, and it is protective. A and B again
  disagree, and B agrees with the tree's own "candidate-protective" label.

A points the stronger review at the wrong change in every case. **Falsifier:** a governed
value in this tree where a higher number exposes fewer people, such as a confidence floor
that must be met before automation acts. There, A and B agree. None exists in the
screening rule today.
