---
subject: scoring-rubrics
domain: software-engineering
last_touched: 2026-09-20
dry_streak: 0
---

# scoring-rubrics

First touch: 2026-09-20, from `/intake` on a sponsored AI-video demo
(`youtube:QW2nS4DO-s8`). The subject has nothing to do with the source; it was
reached by the seam hunt, which opened a fleet project's frame-composition
context to look for somewhere to apply the source's camera-language claims and
found the project's own context-map join misbehaving instead.

## State

7 techniques, unchanged in count. One amendment landed inside
`normalization`.

Landed:

- `normalization` gains **"Many cohorts, one decision: anchor the cutoff on the
  population"** — the boundary the technique's cohort-relative section did not
  reach. Its stated costs are all *within* one cohort (yesterday's score is not
  comparable, one entity's gain lowers everyone's number, an outlier compresses
  the scale). The unlisted cost appears when the same rule runs **per group**
  and the result feeds a decision made **across groups**: each group's frame is
  set by its own leader, so admission rides on how dominant that leader happens
  to be, and the failure is an **inversion** rather than a compressed scale —
  the strongest group rejects a candidate a weaker group admits comfortably.
  The section carries the one-query diagnosis (per group, the weakest candidate
  it admitted; then ask whether any group rejected a stronger one) and the fix:
  `bar = min(group best, population centre) x the kept fraction`, so the
  leader may lower the bar and never raise it.

## Why an amendment and not a technique

The file's own rule survives the finding — cohort-relative framing is still the
right instrument for ranking within a group, and the amendment says so. What it
did not reach is the many-cohort case; and its stated corrective there
(percentile anchors over the raw min and max) does not help, because the
incomparability is *between* frames rather than within one. That is a boundary
case of a mechanism the subject already models, which is the shape an amendment
is for.

## Evidence

Measured on one project's generated context map, then fleet-wide across 13
checkouts and 997 contexts:

- the motivating case: a context whose leader scored 1675.4 rejected its own
  **#2 at 732.3** (`use_when`-grounded) against a bar of 921.5, while **25 of
  26 sibling contexts admitted a pair weaker than that** — down to 298.1, a
  2.46x inversion. The project's median leader is 666.7, so the rejected pair
  would lead half the repo's contexts.
- applied to the instrument: **4208 → 4689 pairs (+481, +11.4%)**, 461 of them
  `use_when`-grounded, **0 lost**, contexts with no map unchanged at 6, and the
  corpus-wide lexical-only share improved 6.18% → 5.99%.

The instrument already computed the population statistic the fix needs — it
uses it twenty lines later to flag weak governance and to qualify confidence,
and never reached for it at admission. That asymmetry is how the finding was
located and it is the generalisable half.

## Leads

- The `TOP` cap and the retained-verdict merge interact: 35 contexts already
  exceeded the nominal cap before this change and 41 do after, in both arms.
  Pre-existing and out of scope here. Return condition: when someone asks why a
  context carries nine pairs against a cap of five.

## Architecture review - 2026-10-31

First architecture review, against `5a08b4610`. All twelve documents were read in
full. Two primary sources were opened: the OECD/JRC composite-indicator handbook
and the abstract of Paruolo, Saisana and Saltelli (2013). Both dispute the
subject's framing of a linear weight as a statement of importance: in an additive
composite a weight is a substitution rate, and its effective influence also
depends on the normalized spread and correlation of the data. A second issue is
internal: `unmeasured-honesty` rejects mean imputation, yet the renormalization
it prescribes imputes each missing dimension at the entity's own weighted mean of
what was measured. The consumer tree behind the two react applications was
reopened at `a7b34f56`. One cited file in `react--gap-ranking` has been deleted
there, and the leaderboard file in `react--weight-design` has changed shape. The
tree behind the node applications is not on this machine.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/scoring-rubrics",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:476078a37f34137d",
  "disposition": "clarify",
  "coverage": "All 12 documents read in full. Primary sources: the OECD/JRC Handbook on Constructing Composite Indicators (2008), with its weighting, imputation and normalization passages read; the arXiv abstract of Paruolo, Saisana and Saltelli. The consumer tree of both react applications was reopened and every citation checked. The tree of both node applications was not available, so only their internal arithmetic was checked. The normalization amendment's arithmetic was recomputed from the note. Nothing was executed.",
  "counterexamples": [
    "Two dimensions both weighted 0.5, where one normalized dimension spans 0-100 across the cohort and the other spans 48-52, are not equally important: the first decides nearly every ranking. A nominal weight is not an effective influence.",
    "An entity measured on 3 strong dimensions out of 10 gets its renormalized score by imputing those strengths to the 7 missing dimensions. That is mean imputation, at the entity's own mean, so renormalization is not free of the 'absence as the middle' disguise. Only the coverage floor and the disclosure contain it.",
    "With one dimension absent, normalized x declared weight summed over the breakdown does not equal the renormalized composite. The contributions must use renormalized weights, or the parts do not visibly sum.",
    "The per-group cutoff fix assumes candidate scores are on one scale across groups. If they are not, the population centre is itself a frame mix."
  ],
  "sources": [
    {
      "url": "https://knowledge-for-policy.ec.europa.eu/sites/default/files/jrc47008_handbook_final.pdf",
      "result": "OECD/JRC Handbook (2008). Supports a correction: 'With both linear and geometric aggregations weights are trade-offs and not \"importance\" coefficients', and 'weights in additive aggregations necessarily take the meaning of substitution rates (trade-offs) and do not indicate the importance of the associated indicator'. It names 'an inconsistency between how weights are conceived (usually measuring the importance of the associated variable) and the actual meaning'. It supports the normalization section's outlier warning, saying min-max is open to 'extreme values/or outliers'. Its imputation section lists mean substitution as single imputation and notes that case deletion is unbiased only under MCAR."
    },
    {
      "url": "https://arxiv.org/abs/1104.3009",
      "result": "Paruolo, Saisana and Saltelli, 'Ratings and rankings: Voodoo or Science?'. The abstract supports separating nominal weight from effect: 'the declared importance of single indicators and their main effect are very different', because correlated, heteroskedastic data keep nominal weights from matching main effects."
    },
    {
      "source": "Consumer tree of the react applications, at a7b34f56",
      "result": "improvePlan.ts lines 75, 83 and 95 match the quote. goldenStandard.ts and goldenStandard.test.ts match. compositeHealthScore.ts still has the dev-only sum assertion. The twin's readinessGaps.ts no longer exists: the consumer's own copy of this application records it as retired 2026-09-16, with setupContract.ts SETUP_FOCUS_ORDER as an unranked replacement. leaderboardScoring.ts now has a null absence policy, renormalization and COVERAGE_FLOOR = 0.5. The quoted '// 0-1 (sums to 1)' type comment is gone, and there is still no sum assertion and still no rubric version."
    },
    {
      "source": "Internal arithmetic",
      "result": "Lens sums are org = team = solo = 1.00; D3 is 0.14 against 0.07, which is 2x; D4 is 0.12 against 0.07. Leaderboard weights sum to 1.00. In the note: 4689 - 4208 = 481 (+11.4%); 732.3 / 298.1 = 2.46; 921.5 / 1675.4 = 0.55."
    }
  ],
  "documents": {
    "scoring-rubrics.md": {
      "disposition": "clarify",
      "reason": "Decision 3 says each weight 'is a claim that dimension A matters twice what dimension B does'. Per the OECD/JRC handbook, a linear weight is a trade-off rate, and its effective influence also depends on normalized spread. Restate it as a trade-off and point to weight-design's sensitivity check."
    },
    "techniques/weight-design.md": {
      "disposition": "clarify",
      "reason": "The opening frames a weight as 'matters twice as much'. Add that in an additive composite the weight is a substitution rate in normalized units. The sensitivity section should also say that nominal weight is not effective influence: spread and correlation can override the declared vector (Paruolo et al.)."
    },
    "techniques/normalization.md": {
      "disposition": "keep",
      "reason": "Frame declaration, the baseline floor for progress, polarity, clamps, monotonicity and the many-cohort amendment are sound. The outlier warning matches the handbook. The amendment's assumption of a common score scale is recorded as a counterexample, not a defect."
    },
    "techniques/unmeasured-honesty.md": {
      "disposition": "clarify",
      "reason": "It says renormalization rejects all three disguises. Arithmetically, it imputes each missing dimension at the entity's own weighted mean of the measured ones. State that, and say that the coverage floor and the disclosure are what make it acceptable."
    },
    "techniques/weight-lenses.md": {
      "disposition": "keep",
      "reason": "The lens invariant, the missing-versus-zero fault, validating the vectors actually used, and the boundaries are sound and internally consistent."
    },
    "techniques/gap-ranking.md": {
      "disposition": "keep",
      "reason": "Impact in rubric space, impact per effort with declared overrides, a total comparator ending in stable identity, and hysteresis are all sound."
    },
    "techniques/rubric-stability.md": {
      "disposition": "keep",
      "reason": "Golden fixtures on the full explanation object, parity of twins and of inputs, the score-moving list, the pin's blind spots, and the rule that a bump asserts non-comparability are all sound."
    },
    "techniques/score-explanation.md": {
      "disposition": "clarify",
      "reason": "It says contribution (normalized x weight) is 'the only column whose sum is the composite'. Under partial coverage that holds only with renormalized weights. Say so, so the rule agrees with unmeasured-honesty."
    },
    "applications/node--rubric-stability.md": {
      "disposition": "reverify",
      "reason": "The citations to the gate and governance files could not be reopened, because that tree is not available here. The text is internally consistent."
    },
    "applications/node--weight-lenses.md": {
      "disposition": "reverify",
      "reason": "The arithmetic checks: all three lenses sum to 1.00 and the 2x CI ratio holds. The model.ts line anchors and quoted comments could not be reopened."
    },
    "applications/react--gap-ranking.md": {
      "disposition": "clarify",
      "reason": "readinessGaps.ts was deleted from the consumer tree (retired 2026-09-16). Mark that section as quoted from history and name the unranked replacement. The improvePlan half re-checks clean."
    },
    "applications/react--weight-design.md": {
      "disposition": "clarify",
      "reason": "The leaderboard section quotes a '(sums to 1)' type comment that is gone. The file now nulls absent dimensions, renormalizes and applies a 0.5 coverage floor, but still asserts no sum. Update the section. The other two citations and the no-rubric-version gap re-check clean."
    }
  }
}
```


## Architecture review - 2026-10-31 (clarify applied)

Applied the six clarify items the earlier 2026-10-31 record named, against
`5a08b4610`. The four technique and golden-path edits rest on the OECD/JRC
handbook, the Paruolo et al. abstract, and arithmetic. The two react
application edits rest on the consumer tree reopened this run. The node
applications keep `reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/scoring-rubrics",
  "date": "2026-10-31",
  "baseline": "5a08b4610",
  "digest": "sha256-b2:60a8d51619b8012d",
  "disposition": "reverify",
  "coverage": "All 12 documents decided. The six clarify items from the first 2026-10-31 record were applied and the edited sections re-read. Every applied change rests on a source opened this run (the OECD/JRC handbook and the Paruolo et al. abstract), on arithmetic verified this run, or on the consumer tree reopened at a7b34f56. The verified_on dates of the two react applications moved to 2026-10-31 because every citation in them was re-checked. The two node applications were not touched and stay reverify, which is now the overall disposition.",
  "counterexamples": [
    "Two dimensions both weighted 0.5, where one normalized dimension spans 0-100 across the cohort and the other spans 48-52, are not equally important: the first decides nearly every ranking. A nominal weight is not an effective influence.",
    "An entity measured on 3 strong dimensions out of 10 gets its renormalized score by imputing those strengths to the 7 missing dimensions. That is mean imputation, at the entity's own mean, so renormalization is not free of the 'absence as the middle' disguise. Only the coverage floor and the disclosure contain it.",
    "With one dimension absent, normalized x declared weight summed over the breakdown does not equal the renormalized composite. The contributions must use renormalized weights, or the parts do not visibly sum.",
    "The per-group cutoff fix assumes candidate scores are on one scale across groups. If they are not, the population centre is itself a frame mix."
  ],
  "sources": [
    {
      "url": "https://knowledge-for-policy.ec.europa.eu/sites/default/files/jrc47008_handbook_final.pdf",
      "result": "OECD/JRC Handbook (2008). Supports a correction: 'With both linear and geometric aggregations weights are trade-offs and not \"importance\" coefficients', and 'weights in additive aggregations necessarily take the meaning of substitution rates (trade-offs) and do not indicate the importance of the associated indicator'. It names 'an inconsistency between how weights are conceived (usually measuring the importance of the associated variable) and the actual meaning'. It supports the normalization section's outlier warning, saying min-max is open to 'extreme values/or outliers'. Its imputation section lists mean substitution as single imputation and notes that case deletion is unbiased only under MCAR."
    },
    {
      "url": "https://arxiv.org/abs/1104.3009",
      "result": "Paruolo, Saisana and Saltelli, 'Ratings and rankings: Voodoo or Science?'. The abstract supports separating nominal weight from effect: 'the declared importance of single indicators and their main effect are very different', because correlated, heteroskedastic data keep nominal weights from matching main effects."
    },
    {
      "source": "Consumer tree of the react applications, at a7b34f56",
      "result": "improvePlan.ts lines 75, 83 and 95 match the quote. goldenStandard.ts and goldenStandard.test.ts match. compositeHealthScore.ts still has the dev-only sum assertion. The twin's readinessGaps.ts no longer exists: the consumer's own copy of this application records it as retired 2026-09-16, with setupContract.ts SETUP_FOCUS_ORDER as an unranked replacement. leaderboardScoring.ts now has a null absence policy, renormalization and COVERAGE_FLOOR = 0.5. The quoted '// 0-1 (sums to 1)' type comment is gone, and there is still no sum assertion and still no rubric version."
    },
    {
      "source": "Internal arithmetic",
      "result": "Lens sums are org = team = solo = 1.00; D3 is 0.14 against 0.07, which is 2x; D4 is 0.12 against 0.07. Leaderboard weights sum to 1.00. In the note: 4689 - 4208 = 481 (+11.4%); 732.3 / 298.1 = 2.46; 921.5 / 1675.4 = 0.55."
    }
  ],
  "documents": {
    "scoring-rubrics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: decision 3 now calls a weight a trade-off rate whose real influence also depends on normalized spread, 'a claim to check, not a fact', in place of 'A matters twice what B does'."
    },
    "techniques/weight-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the opening states that a weight is a trade-off rate between normalized units, not an importance coefficient. The sensitivity section gains a paragraph separating declared weight from effective influence (spread and correlation) and asks for each dimension's effect to be measured."
    },
    "techniques/normalization.md": {
      "disposition": "keep",
      "reason": "Frame declaration, the baseline floor for progress, polarity, clamps, monotonicity and the many-cohort amendment are sound. The outlier warning matches the handbook. The amendment's assumption of a common score scale is recorded as a counterexample, not a defect."
    },
    "techniques/unmeasured-honesty.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the renormalization section now says it equals imputing each missing dimension at the entity's own weighted mean, a milder cousin of the third disguise, made safe only by the disclosure and the coverage floor."
    },
    "techniques/weight-lenses.md": {
      "disposition": "keep",
      "reason": "The lens invariant, the missing-versus-zero fault, validating the vectors actually used, and the boundaries are sound and internally consistent."
    },
    "techniques/gap-ranking.md": {
      "disposition": "keep",
      "reason": "Impact in rubric space, impact per effort with declared overrides, a total comparator ending in stable identity, and hysteresis are all sound."
    },
    "techniques/rubric-stability.md": {
      "disposition": "keep",
      "reason": "Golden fixtures on the full explanation object, parity of twins and of inputs, the score-moving list, the pin's blind spots, and the rule that a bump asserts non-comparability are all sound."
    },
    "techniques/score-explanation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the contribution column now uses the weight renormalized over the measured dimensions under partial coverage, so the parts still sum."
    },
    "applications/node--rubric-stability.md": {
      "disposition": "reverify",
      "reason": "The citations to the gate and governance files could not be reopened, because that tree is not available here. The text is internally consistent."
    },
    "applications/node--weight-lenses.md": {
      "disposition": "reverify",
      "reason": "The arithmetic checks: all three lenses sum to 1.00 and the 2x CI ratio holds. The model.ts line anchors and quoted comments could not be reopened."
    },
    "applications/react--gap-ranking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the readinessGaps section is marked retired 2026-09-16 and quoted from history, and names the unranked SETUP_FOCUS_ORDER replacement. 'has' became 'had' in the summary. verified_on moved to 2026-10-31 after every citation was re-checked."
    },
    "applications/react--weight-design.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the leaderboard section drops the vanished type-comment quote and records the new null absence policy, renormalization and 0.5 coverage floor, noting the sum assertion is still missing. verified_on moved to 2026-10-31 after every citation was re-checked."
    }
  }
}
```
