---
layer: application
type: application
subject: small-sample-honesty-in-hiring-analytics
technique: insufficient-sample-is-not-a-pass
stack: node
status: forged
---

# "Too small to assess" as a distinct verdict — the fairness and validity gates

Three modules in kp implement the refusal-is-not-a-pass rule, on the three
surfaces where getting it wrong costs the most: a protected-class fairness test,
a score-validity verdict, and a comparative evaluation that gets cryptographically
sealed into a decision record.

## The four-fifths analysis: `reliable` is a third outcome, not a modifier

`app/_lib/adverse-impact.ts` computes the EEOC four-fifths selection-rate ratio
and carries the refusal in two places at two granularities:

- **Per group** (`:107-109`): `reliable` is true only when that group's own
  `total` meets `ADVERSE_IMPACT_MIN_COHORT` (30, `:39`), and the comment is
  explicit that *"when false the UI must render an 'insufficient sample' state —
  NOT a verdict."*
- **Per analysis** (`:118-122`): `reliable` is true only when **at least two**
  groups meet the floor — one to anchor the reference, one to measure against it
  — and *"when false the sample is too small to assess and the UI MUST show
  'insufficient sample' instead of an adverse / no-adverse verdict."*

The load-bearing detail is what happens to the summary bit in that case:
`anyAdverseImpact` is **forced false** while `reliable` is false
(`:120-122`, `:143-145`). A consumer reading `anyAdverseImpact` alone therefore
gets a value that is safe against the "skipped counted as clean" failure only
because it is paired with `reliable` — the two fields together are the typed
verdict this technique demands, and neither is meaningful alone. The doc comment
states the rule in the technique's own words: *"the sample is too small to
assess, which is a DISTINCT state from 'no adverse impact'."*

The thin-cell-as-reference trap is closed at the same site (`:139-142`): groups
below the floor *"carry a null ratio and are never flagged or used as the
reference — a single-applicant '100%' group can no longer become the reference
and flip the whole verdict."* That is the exclusion from a *baseline role*, which
is a stronger requirement than exclusion from display.

The module also declares its own honest ceiling at `:7-16`: the platform collects
no demographic data, so the primitive is offered as a pure function a workspace
can call with its own aggregate counts, and is explicitly not run as an automatic
monitor. Declaring the boundary of what the instrument can assess is the same
discipline one level up.

## The validity verdict: "cannot tell you" is `unknown`, not `weak`

`app/features/insights/analytics/calibrationVerdict.ts:71-81` orders its decision
table so that refusals win before quality grading:

```
if (!p.calibrated || p.brier == null) return "unknown";
const { skill } = calibrationSkill(p);
// A degenerate cohort (every outcome the same way) has nothing to discriminate,
// so no skill exists to report — that is "cannot tell you", not "weak".
if (skill == null) return "unknown";
if (p.leakage?.level === "high") return "circular";
```

Two refusals and a disqualification all sit above the skill ladder. `unknown`
covers both the under-floor case (below `MIN_CALIBRATION_OUTCOMES = 20`,
`app/_lib/calibration.ts:15`) and the **degenerate-cohort** case, where the sample
is large enough but every candidate resolved the same way, so `baseBrier` is zero
and no measure of discrimination can exist (`:30-36`, `:48`). Both would grade as
"weak" under a naive ladder — a bad score rather than an absent one.

The header comment at `:62-70` records why the ordering is structural: *"copy
regresses and a decision table does not"*, with a test that fails if the
`circular` branch is moved below the ladder. The refusal ordering is enforced by
the type and the test, not by whoever writes the string.

The yardstick lesson lives at `:39-42`: the base rate for comparison is the
cohort's own advance rate, not a fixed even-odds constant, because *"0.25 is the
Brier of a 50/50 coin flip, and a cohort that advances 86% of the time is nothing
like a coin"* — measured against the wrong baseline, an arm scoring −0.332
(worse than a constant guess) rendered under a headline claiming a comfortable
margin.

## The comparative evaluation: an incident that produced the floor

`app/_lib/group-eval-cohort.ts:3-8` records the incident verbatim, and it is the
single best illustration of the failure this technique prevents. A
single-candidate group *"crowned a 'recommended lead over the field', reported
EVERY skill as a 'unique strength' (there are no rivals to be unique against), and
trivially 'passed' the weighting-robustness check (a length-1 order cannot
reorder) — then auto-sealed all of that into the decision record."*

Every part of that is the collapse of refusal into pass. A robustness check that
cannot fail on n=1 reported a pass; a uniqueness test with no comparison set
reported universal uniqueness; and the sealed decision record made all of it
durable. The fix (`:34-41`, `hasComparableCohort`) is that *"below the floor
there is no field to compare, so no lead is crowned/sealed and robustness is
reported as 'insufficient sample', not a pass"* — and the lone candidate is still
shown, which is the thin-state substitution rather than a suppression.

## The composed rule at the pack level

`app/_lib/metric-pack.ts:243` computes `certifiable` as
`metrics.every((m) => m.status === "measured")`, and `caveats` carries the
human-readable list of why not (`:61`, `:117-118`). A pack containing a
`not_measurable` metric can never be certifiable, so no aggregation path exists
by which a refusal is summed into a clean result — the aggregator constraint this
technique requires, implemented as an `every` rather than a count.

## Deviations

The fairness primitive is not wired to a stored candidate population at all, so
the "chronically too small to assess" backlog the technique calls for — the list
of questions the organization cannot currently answer about itself — does not
exist here. The standard stands; the repo has the verdict type and not yet the
surface that accumulates it.
