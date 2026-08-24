---
layer: application
type: application
subject: assessment-instrument-validation
technique: minimum-cohort-and-inconclusive-verdicts
stack: spec
status: forged
verified_on: 2026-08-23
source: US-EEOC/29-CFR-1607
---

# The regulator has the state but never the word (29 CFR Part 1607)

**Pin.** Uniform Guidelines on Employee Selection Procedures (1978), 29 CFR Part
1607, US EEOC and the co-signing federal enforcement agencies. Retrieved
2026-08-23 from the eCFR versioner API for Title 29 at its currency date
**2026-08-20** (title last amended 2026-08-04), `sha256 b07f727e…5f5a25` over the
part's XML; at `ecfr.gov/current/title-29/subtitle-B/chapter-XIV/part-1607`. In
force at that date; every citation re-opened after drafting.

## Rule by rule

**Four verdicts.** The regulation never names one: *inconclusive*, *undetermined*
and *not evaluable* appear **zero** times across §§1607.1–1607.18. It names the
*condition* twice — §1607.4(D)'s evidence "based upon numbers which are too small
to be reliable", and §1607.15(A)(2)(c), headed "When data insufficient to
determine impact". The third state exists, unnamed, in the **recordkeeping**
section rather than the verdict section, because the regulation's terminal act is
enforcement discretion, not a returned value. It needs no verdict lattice; a
system that returns a value to a caller does. **Regulation's scope, not a gap.**

**Inconclusive never certifies.** Confirmed, by a mechanism the technique lacks.
Under §1607.15(A)(2)(c), where selections have been too few to determine impact
for a job, the user keeps collecting the *component-level* records — the duty
§1607.15(A)(2)(a) would otherwise switch off — "until the information is
sufficient to determine that the overall selection process does not have an
adverse impact", or the job changes substantially. The only exit is an
affirmative clean determination; insufficiency defaults to the *more* burdensome
branch. §1607.9(A) is the same move on the validity side, ruling out reputation,
promotional literature, usage frequency and other "nonempirical or anecdotal
accounts" in lieu of evidence: an absent study cannot become a validity claim.

**Setting the floor.** §1607.4 states no cohort floor at all — the only cardinals
in paragraphs A–E are the ratio itself ("four-fifths (4/5) (or eighty percent)")
and §4(C)'s list markers. The caveat is qualitative: "small numbers", "too small
to be reliable". §1607.14(B)(1) then delegates the number outright — how many
persons make a criterion-related study meaningful "should be made by the user on
the basis of all relevant information" about the procedure, the potential sample
and the employment situation. That is the technique's own instruction, *set the
floor from what the comparison must survive*, written as a refusal to set it.
Scoped negative: the part's only numeric thresholds are §1607.14(B)(5)'s 0.05
significance level and the 2% / 98% **labor-force share** of §1607.15(A)(1) and
(A)(2)(a) — a market share, not a cohort size.

**Render the count with the verdict.** Confirmed and sharpened. §1607.15(B)(6)
makes a validity study's subgroup composition "essential" and says it "should
include the size of each subgroup"; §1607.15(B)(8) permits the opposite for the
*statistic*, since where groups are "too small to obtain reliable evidence of the
magnitude of the relationship" it "need not be reported separately". The
regulation splits where the technique splits — the count is mandatory, the number
derived from it optional exactly when it cannot be trusted.

**Not evaluable is a route, not a violation.** §1607.14(B)(4) requires study
subjects "insofar as feasible be representative of the candidates normally
available in the relevant labor market", and §1607.16(U) makes "an adequate
sample of persons available for the study" the first condition of technical
feasibility — constructed subjects satisfy neither, which is the golden path's
*necessary and insufficient* as an admissibility condition. Then the technique's
hardest call: the §1607.14 preamble and §1607.6(B) say that where a user cannot
conduct the validation techniques the obligation *changes* — use procedures as
job-related as possible, minimise or eliminate adverse impact, or justify
otherwise under federal law. Infeasibility yields neither a certification nor a
finding; it re-routes the duty, as strict mode routes not-evaluable rather than
counting it a violation.

**Precedence — the divergence.** The technique fixes precedence as *a real signal
always beats the absence of one*, and stops. §1607.4(D) closes the loophole that
leaves: where a user has **not maintained** the required impact data, the
agencies "may draw an inference of adverse impact" from that failure itself,
given underutilisation in the job category. A manufactured absence becomes a
positive finding — so "not evaluable is never a violation" is exploitable by
whoever owns the harness. **Technique gap; a candidate edit.**

**No individual-rendering rule.** Scoped negative: §1607.4 and §1607.15 govern
records at group level, and nothing in Part 1607 says how an unmeasurable
*individual* submission renders back to that person — so "no data must never read
as unfair" has no counterpart here. Regulation's scope.

## The procedure, worked

Source table: **Eightfold AI Inc., "AI Interviewer Bias Audit Results"**, audited
by **BABL AI Inc.** under NYC Local Law 144 of 2021 on 2026-06-29, signed
2026-07-08, at `eightfold.ai/trust/ai-interviewer-bias-audit-results/`, retrieved
2026-08-23 (`sha256 09f4fd3b…`). Rates are published to three decimals; counts
below are the unique integers reproducing them.

Gender (real, self-reported) is a §1607.4(B) category: male 943/1250 = 0.7544 is
the highest rate and so §4(D)'s comparator; female 295/395 = 0.74684 gives ratio
0.74684 / 0.7544 = **0.990**, the published figure — above four-fifths, z = 0.27,
p = 0.79, no finding on either sentence of §4(D). Note the denominator: 1,235
further records were dropped as unknown gender, **42.9%** of the 2,880 arriving.

The audit's smallest cohort is the age table's *above 40* group, n = 121. Age is
outside §1607.4(B)'s categories and the publisher applied the arithmetic
voluntarily, so what is tested here is §4(D)'s procedure, not its jurisdiction.
Above 40: 97/121 = 0.80165; below 40: 1995/2759 = 0.72309. Above-40 holds the
highest rate and is the reference, so **ratio = 0.72309 / 0.80165 = 0.902** — the
published figure, above four-fifths.

Now §4(D)'s small-numbers caveat against that 121-person cohort. It does
**nothing**, cutting one way only: it excuses *greater* differences — a ratio
under four-fifths — resting on small numbers and not statistically significant,
and nothing withdraws a ratio *above* four-fifths on those grounds. Here the thin
cohort sits in the reference position, its noise setting everyone else's
denominator: one person crossing the median inside that 121 shifts the below-40
ratio by 0.009 (96 → 0.911, 97 → 0.902, 98 → 0.893), and 13 more drag it under
0.80. Meanwhile the only route by which an above-0.80 ratio becomes a finding is
§4(D)'s second sentence, needing significance "in both statistical and practical
terms" — which at n = 121 is unreachable: two-proportion z = 1.90, p = 0.058;
Fisher exact p = 0.061, both outside §1607.14(B)(5)'s 0.05 level. The cohort is
at once too small to fail and too small to pass — the technique's *inconclusive*
exactly. The published verdict is **PASS**, undifferentiated.

That audit also states that race/ethnicity and intersectional testing used
**synthetic** data from a language model across 12 personas, demographics carried
by generated names, "because insufficient real-world data was available" — the
precise condition of §1607.15(A)(2)(c), answered by substitution rather than by
continuing to collect, and folded into the same PASS as the real-data rows.
§1607.14(B)(4)'s representativeness clause does not let those rows stand for the
rate at which human candidates are selected.
