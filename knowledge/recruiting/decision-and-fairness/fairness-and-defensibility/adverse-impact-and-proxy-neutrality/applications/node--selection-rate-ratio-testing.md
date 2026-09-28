---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: selection-rate-ratio-testing
stack: node
status: forged
verified_on: 2026-09-26
verified_against: node@24
applied: code
ab_verdict: better
---

# The four-fifths primitive in a demographic-blind hiring platform (TypeScript)

`app/_lib/adverse-impact.ts` is a pure, stateless module with no imports and no
store access. It computes the selection-rate ratio for a set of groups the
recruiter supplies. Its header (`:1-16`) is the clearest statement of the
standard's central claim anywhere in the repo, and it is written as a warning
rather than a feature note:

> This is a READY PRIMITIVE, not an automatic monitor. … THIS PLATFORM COLLECTS
> NO DEMOGRAPHIC DATA, so it cannot and does not run this on stored candidates.

The same paragraph closes the door on the substitution the subject exists to
prevent: the app's automated-rejection fairness gate "is a separate thing: an
ARCHETYPE shield (early-career / unknown), NOT a protected-class test".

## The constants, and why the floor is the interesting one

`FOUR_FIFTHS = 0.8` (`:19`) is the threshold. `ADVERSE_IMPACT_MIN_COHORT = 30`
(`:39`) is the floor, and its doc comment does what the standard asks of a
number: it shows its reasoning rather than asserting a magic value. It notes
that the guidelines themselves caution that a four-fifths difference "based on
small numbers" and "not statistically significant" does not establish adverse
impact, that no single floor is codified, and that 30 is therefore adopted as
the rule-of-thumb minimum for a stable proportion estimate. It states the
two-group requirement: "a full analysis needs ≥2 such groups (one reference +
one comparison) before any ratio is asserted". It also cross-references the
sibling min-cohort gates in the same codebase (`calibration.ts`
`MIN_CALIBRATION_OUTCOMES = 20`, `db/salary-benchmark.ts`
`SALARY_BENCHMARK_MIN_COHORT = 3`), so the floors read as one policy rather than
three opinions.

The floor is on *considered* candidates only. There is no floor on observed
selections, which is the technique's corrected rule: a zero-selection group
facing a 50% reference is assessed and flagged, never suppressed as too small.
Since 2026-09-26 a test pins that case.

## Reference selection defended at both ends

`computeAdverseImpact` (`:211`) picks the reference as the highest selection
rate **among groups that clear the floor**, and states the reason inline: a
sub-floor group "e.g. n=1 at 100%" can no longer anchor the verdict. Ties
resolve to the first such group in input order.

The reference is tracked **by index, not by name** (`:225`). Two pasted rows can
carry the same group name, and matching the reference back by name marked both
of them as the reference, which exempts a row from ever being flagged. The
comment records the incident: "A duplicate 'Women' row at a 0.25 ratio rendered
as 'reference' under a green verdict."

Three input guards protect that data-chosen reference. All three are the
standard's "input hygiene is fairness logic" rule realized:

- `clampCounts` (`:188`) floors counts at zero and caps `selected` at `total`,
  "rather than producing a >100% selection rate that would corrupt the
  reference".
- `parseGroupCounts` (`:104`) records the 1-based line number of every non-blank
  row that failed to parse (`:123`) instead of dropping it, because the
  reference is "highest selection rate among whatever parsed". An empty numeric
  field is treated as a typo, not as a real zero.
- A row must have **exactly three fields** (`:122`). A spreadsheet paste with
  thousands separators ("Women, 1,200, 5,000") used to keep the first three
  fields and parse as 1/200, silently. A genuine 0.50 ratio then rendered green.

## The significance companion and the shortfall (applied 2026-09-26)

Until 2026-09-26 the primitive computed the ratio and stopped, which was this
application's recorded shortfall against the standard. Kp commit 3aae8e801
added the two numbers the technique requires:

- `midPExactTwoSided` (`:59`) is a two-sided Lancaster mid-P exact test for
  each group against the reference. Its comment says why it was chosen over the
  conditional exact test: that test is conservative at these cohort sizes. The
  mid-P test is exact at every size and converges on the Z-test at large N.
  `SIGNIFICANCE_ALPHA = 0.05` (`:48`) is the line.
- `shortfall` (`:246`) is reference rate × total − selected. Its type comment
  states the scale-bound reading: "40 short is noise across 100,000 applicants
  and decisive across 100". The view shows it with its share of the group
  (`DecisionsComplianceImpactCheck.tsx:110`).
- The result gains `anySignificantAdverse` (`:267`) and
  `anySignificantGapAboveThreshold`. The view's verdict (`:36`) has the
  technique's four readings: a significant flag, a flag that is "below 80%, not
  significant", a significant gap above 80% that is not a pass, and the clean
  result.

Five cases were measured against the prior module:

| Case | Before | After |
| --- | --- | --- |
| 15/30 vs 11/30 (ratio 0.73) | adverse impact | below 80%, not significant (p 0.31, 4 short, 13%) |
| 0/100 vs 50/100 | adverse impact | adverse impact, significant (p 2e-19, 50 short) |
| 4,600 vs 5,000 of 10,000 (ratio 0.92) | clean | significant gap (p 1.5e-8, 400 short, 4%) |
| 49,960 vs 50,000 of 100,000 | clean | clean (40 short, 0.04%, p 0.86) |
| two assessed clean, two sub-floor | clean | clean, plus "2 groups … were not assessed" |

Before the change, the first two cases rendered identically, and the third
rendered green.

## Three states, enforced in the type and again in the view

`AdverseImpactResult.reliable` is true only when at least two groups clear the
floor. When it is false, `anyAdverseImpact` is **forced** false (`:266`) and
the view shows a neutral steel verdict, not the green one. Per group,
`impactRatio` is `null` whenever the group or the reference cannot support a
ratio, so an unreliable rate is never promoted into an authoritative ratio. The
same is true of `pValue` and `shortfall`, which are also null on the reference
row.

Two defects in the view's wording were fixed in the same commit:

- The insufficient-sample line said "no group reaches 30 applicants" when
  exactly one group did.
- A clean headline over a mixed report never mentioned the groups it had not
  assessed. `unassessedGroups` (`:270`) now drives a line under the headline
  (`:152`), which is the technique's "mixed reports state the mix" rule.

## The jurisdiction field that is mostly null

`app/_lib/compliance-regimes.ts:29-33` types `adverseImpactStandard` as
`string | null`. It populates the field with the four-fifths rule for exactly
one of seven regimes (`:59`); every other jurisdiction is `null` (`:45`, `:52`,
`:66`, `:73`, `:80`, `:87`). The renderer honours that:
`DecisionsComplianceSection.tsx:96` falls back to an explicit "none" string
rather than to 0.8. The module header (`:11`) adds the framing the standard
requires of such a catalog: these are "FRAMING references, not legal advice
and not a claim of certified conformance".

## Where it falls short of the standard

The analysis is still single-gate by construction: nothing walks the funnel
stage by stage. Results are not stamped with a gate, a window or a scoring
version either. The module is ad hoc by design, which leaves stamping as the
caller's unowned problem. The significance line is a single α with no
correction for comparing many groups at once, and the policy for that is not
recorded anywhere.
