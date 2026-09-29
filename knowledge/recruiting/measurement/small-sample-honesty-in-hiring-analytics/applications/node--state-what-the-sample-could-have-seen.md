---
layer: application
type: application
subject: small-sample-honesty-in-hiring-analytics
technique: state-what-the-sample-could-have-seen
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# What a thirty-per-group clean line could have seen — kp's four-fifths check, measured against ground truth

The technique was earned on 2026-09-29 by simulating a hiring-sized cohort with a
known answer, then run against kp's real function to see whether the deployed
verdict already said what its sample could have seen. It had said most of it and
not the part that matters. Citations resolve against the kp tree at `775c5d02e`;
the measured function is the blob at its parent, `f0395dbec`.

## What was already there

`computeAdverseImpact` (`app/_lib/adverse-impact.ts:265`) had gained, three days
earlier, the significance companion the technique's first half asks for: a
mid-P exact test per group (`midPExactTwoSided`, `:59`), a scale-bound shortfall,
`unassessedGroups`, and a five-state verdict in the component
(`DecisionsComplianceImpactCheck.tsx:36`): insufficient, adverse, *below 80% but not
significant*, significant gap above 80%, clean. Its comment on the floor is honest
about where 30 comes from: *"There is no single codified floor, so we adopt the
standard rule-of-thumb minimum"* (`adverse-impact.ts:31-38`). And its test
`zero selected is the most severe case, never suppressed by a numerator floor`
(`adverse-impact.test.ts:300`) is the asymmetry the technique states: no floor on
selections.

## The experiment

Two groups, `n` applicants each, the reference at a stated selection rate and the
second group's true rate at a stated fraction of it, 4,000 seeded draws per row,
the component's own verdict ladder applied to the real function's output.
"Ratio only" is the behaviour before the significance companion.

| Reference rate | True ratio | n per group | Finding | Watch | Clean | Ratio only flags |
| --- | --- | --- | --- | --- | --- | --- |
| 0.10 | 1.0 | 30 | 3% | 77% | 20% | 80% |
| 0.10 | 0.5 | 30 | 5% | 78% | 17% | 83% |
| 0.10 | 0.5 | 100 | 24% | 63% | 13% | 87% |
| 0.10 | 0.5 | 300 | 65% | 31% | 5% | 95% |
| 0.30 | 1.0 | 30 | 3% | 52% | 45% | 55% |
| 0.30 | 0.5 | 30 | 28% | 56% | 16% | 84% |
| 0.30 | 0.5 | 100 | 72% | 24% | 4% | 96% |
| 0.50 | 1.0 | 30 | 5% | 32% | 63% | 37% |
| 0.50 | 0.5 | 30 | 50% | 41% | 8% | 92% |
| 0.50 | 0.5 | 100 | 96% | 3% | 1% | 99% |

Three readings, each with its n:

1. **The significance companion did its first job.** On equal groups the false
   *finding* rate is 3-6% across every cell, against 37-80% for the ratio alone at
   thirty per group. (Simulated separately with Fisher's exact test the ratio alone
   fires on 78% of equal pairs at a 10% base rate and thirty each.)
2. **At a 10% base rate and thirty per group the verdict carries no information.**
   The mix for equal groups (3 / 77 / 20) and for one group at half the rate
   (5 / 78 / 17) is the same to within noise. A clean line there, with a green
   check, is a computation that fired, not a group that was cleared.
3. **Power is low well past the floor.** A group at half the reference rate is
   shown as a finding 28% of the time at 30% and thirty each, 72% at a hundred each.
   Only around three hundred per group at a 30% base rate is a halving certain
   (100%).

## What landed

`775c5d02e` adds `detectableRatio(referenceRate, referenceTotal, groupTotal)`
(`adverse-impact.ts:115`): the largest ratio at which a group would still be shown
as a significant gap 80% of the time (`DETECTABLE_POWER`, `:79`), from the normal
approximation to the two-sided 5% test (`comparisonPower`, `:93`), with 0 meaning it
could not reliably show even a group that was never selected and `null` with no
reference rate. `AdverseImpactResult.detectableRatio` carries the least sensitive
comparison (`:324`, `:334`), null unless a verdict exists. The component prints it
under the not-significant and clean lines only (`DecisionsComplianceImpactCheck.tsx:
154-158`): *"a group would have to be selected at 33% of the reference rate or less
before this check would reliably show a gap. A result that is not significant does
not show the rates are equal."* A significant verdict states nothing extra. Strings
in en, cs, de and fr; `npm run i18n:check` in parity.

**A/B on the change, by the same ground truth.** The stated ratio is only honest if
a group truly at it is shown about as often as the stated power. Measured on the
real function, 4,000 draws per cell, counting a significant adverse finding or a
significant gap above 80%: 79-83% detection in every cell of rates 0.1 / 0.3 / 0.5
by 30-1,000 per group where a ratio is stated (for example rate 0.3, 100 per group:
stated 0.46, shown 80%; rate 0.5, 300 per group: stated 0.77, shown 80%). The first
version of that check counted only findings below 80% and read 40% at rate 0.3 with
a thousand per group, which is how the ratio-versus-gap distinction surfaced; the
committed test (`adverse-impact.test.ts:377`, seeded, three cells, 600 draws each)
pins the band 70-90%. Before the change, the clean and not-significant lines
stated nothing about sensitivity in any cell.

## Deviations

- **The floor is still on group size.** `reliable` is `total >= 30`
  (`adverse-impact.ts:270`), not on power. At a 10% base rate, thirty applicants is
  three selections; the group clears the floor and the verdict is noise. The
  detectable-gap line now says so at the point of use, but the check still runs.
  That is deliberate: the alternative floor on selections would suppress the
  zero-selected case, which kp has a test to protect.
- **The approximation uses the reference's observed rate as if it were true.** With
  three selections in the reference that rate is itself unstable, so the stated
  ratio is a guide at the low end, not a guarantee. The calibration band above holds
  where the reference rate is at least 0.1 and the groups are 30 or more.
- **A pooled reading is still the operator's job.** The four-fifths guideline lets
  numbers too small to be reliable be judged over a longer period; the tool takes
  whatever aggregate is pasted and does not ask for a longer window.
