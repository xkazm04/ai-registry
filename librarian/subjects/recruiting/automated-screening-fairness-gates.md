---
domain: recruiting
subject: automated-screening-fairness-gates
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# automated-screening-fairness-gates

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-asfg-0926)

Dispatched by the Curator lane on "never swept by the librarian". The subject had two
stacks (node, process), so it carried no single-stack debt, and no application was
expired or at risk. Four lanes: a re-read of every citation in the one joined tree (kp)
at its HEAD, a survey of kp's seams for the three techniques with no application, web
counter-evidence (six claims), and a blind training-data lane.

**Counter-evidence: two rules flipped, four claims conditioned, one held.**
- The shield's membership rule. "Shield on career shape, which the candidate's own
  evidence states" is refuted as written. US age regulation lists "college student"
  and "recent college graduate" among the terms that signal age (29 CFR 1625.4, read
  verbatim). The ADEA protects older applicants against younger ones and not the
  reverse (29 CFR 1625.2; *Cline*, 2004). Suits have run on campus-only hiring (settled)
  and on AI screening (*Mobley v. Workday*: the tool's recommendations are exposed
  "regardless of the degree to which particular employers place weight on" them). The
  blind lane reached the same place on its own: career shape is an age proxy, and an
  accuracy shield must fire both ways. Landed: members are named by the instrument's
  failure at any age, and the shield's effect is measured by age band in aggregate. The
  prompt instruction for shielded candidates gains its cost: only reviewers of
  unshielded candidates see reject recommendations.
- Showing the recommendation. Reviewers followed a screening tool's picks up to 90% of
  the time even when they rated it poor (AIES 2025). In a non-hiring study, explanations
  did not reduce over-reliance, and deciding first did (CSCW 2021). The blind lane
  reached blind-first review independently. Landed: the recommendation stays in the
  record and is revealed after the reviewer's own reading.
- "Regulators and courts in more than one jurisdiction have said plainly..." holds, and
  now names its basis: WP251 (read verbatim), the Amsterdam appellate Uber ruling of
  2023 (read verbatim), the UK's 2025 Art 22A (read verbatim). SCHUFA (2023) moves the
  decision upstream to the score and says nothing about a human confirming.
  Dun & Bradstreet is about explanation, and is not cited.
- "A growing body of employment-AI regulation" is overstated for the US. The EU (GDPR
  now; AI Act for recruitment from 2027-12-02 after the omnibus), Colorado and California
  (2027, after the fact, on request) point one way; the UK narrowed Article 22 in 2025,
  and US federal policy retreated from disparate impact (an executive order of 2025-04).
  Landed with dates, both directions.
- "Several years of retention in at least one major jurisdiction" holds (California,
  four years including ADS data). It now names California and adds the EU six-month log
  floor against GDPR storage limitation (web and blind converged). The blocked-refusal
  technique's "keep them anyway" is conditioned on the jurisdiction.
- Self-reported confidence as a gate. Holds as "evidence about the model". Conditioned:
  verbalized confidence is overconfident (ICLR 2024; a five-model study, 20-60%) and
  calibration can differ by gender (2026). A counter-study found stated confidence
  better calibrated than token probabilities, on question answering with known answers.
- One single-lane clarification landed. The blind lane flagged that logging only
  refusals makes adverse-impact analysis impossible, so the technique now says the refusal
  stream is not the denominator store.

**Tree lane.** All three applications re-read at kp `5e1582a03` (no cited file moved
by `0faded607`). Most lines had moved. Wrong from the start:
- "exactly one field is machine-actionable": the screening auto gate acted on the
  recommendation (the finding below);
- "no serializer consults SCREEN_ROUTES at runtime": TypeScript's `coerceScreenRoute`
  does, and the closed type is lost one hop later;
- "no mechanism for adding a cohort": a `fairnessProtected` flag exists, and Python
  ignores it;
- "all automated hiring judgment lives in automation.py": the TypeScript screening
  wave has its own auto-reject path.

Changed since 2026-08-20: the shield reads a live registry, POLICY has eleven keys,
the deterministic builder's bottom branch is three-way, and a cleared reject the
recruiter leaves unticked is held back. The TypeScript unscored check fails open on
`undefined`, `NaN` and `0.5`, where Python holds all three.

**Landed** (60b1b9c0): the two flipped rules, the relaxed-gate rule, the four
conditions, a node application of fail-closed-on-an-unclassifiable-candidate (from the
real tree), all three applications re-verified to 2026-09-26.

**Applied** (4 rows in [[applied]]): code better (kp `0faded607`, the screening auto
gate re-derives the shield: 4 of 4 shielded or unknown cases advanced unattended
before, 0 after); simulation better (shield membership, 2 of 3 kp fixture cases move);
two unmeasurable (reveal-after-read needs a pre-reveal record; retention and subgroup
calibration need a setting and labelled outcomes kp does not have).

## Impact

Map regenerated for kp at registry 60b1b9c0 (kp `62d6cc3c6`). kp: 8 contexts join this
subject (`autonomy-control-room`, `candidate-apply-flow`, `group-eval-comparison`,
`hiring-decisions-api`, `jobs-candidates-compare`, `pipeline-api`, `screening-fairness`,
`tests-scoring-fairness`), all `unknown`, **0 stale verdicts**. No other project joins it.

## Owed to projects

kp, each read in the code, none fixed in this pass (one project per finding, and the
auto gate was the one):
- Python's policy pass relabels a null or unregistered archetype as `bau`
  (`automation.py:968`), a pinned caveat. The fix is small and its A/B test is specified
  (not run): `evaluate_entry` at score 20 should return reject for `None`, `""`,
  `"unknown"` and an unregistered id before, and hold after. The TypeScript backstop refuses these today, so
  the refusal count reads as routine instead of "an upstream regression".
- The detector's no-signal default is `bau` at 0.4 (`archetypes.json`). A product
  decision: `unknown` would shield it and breaks two registry tests on purpose.
- Python keys the shield on the scoring model only; the TypeScript `fairnessProtected`
  flag is ignored by `automation.py`.
- The TypeScript unscored check: `typeof score !== "number" || !Number.isFinite(score) ||
  score < 1`.
- The refusal event names no proposer (null actor) and no refusing rule (four rules
  share one kind and prose), and it is not in the sealed decision-record chain.
- A fairness-refused reject sets no approval, so it never reaches the Decisions queue
  its own comment names.
- Screening holds carry no structured reason, so confidence, shield, volume and parse
  holds look the same.
- `coerce_recommendation` accepts an unchecked default and absorbs unrecognized verdicts
  silently.

## Open leads

- **Hold expiry in adverse-impact counts.** The blind lane says a hold closed by a filled
  requisition should count as a rejection in selection-rate statistics. That is single
  lane, and it belongs to the adverse-impact subject's denominators. Return: when that
  subject is next deepened.
- **Silent model fallback as an unaudited selection procedure.** The blind lane says a
  degraded run that falls back to a heuristic or an older model is using a procedure
  nobody audited. The golden path already sends that verdict to hold. Single lane.
  Return: a source on fallback scoring in employment selection.
- **Colorado SB 26-189 text and the California §11013 rule text.** Both were read only
  through secondary sources (the legislature site refused, and the rule is a scanned PDF).
  Return: when a regulation-owning recruiting subject is next deepened.

## Declines

- Emotion recognition is prohibited in the workplace under the AI Act (blind lane). It
  is true, and it is outside this subject: no gate here reads affect.
- A three-layer enforcement including a database constraint that refuses a reject
  without a reviewer id (blind lane). The defence-in-depth technique already asks for
  the narrowest boundary. A database constraint is one realization of that, not a new
  rule.
- NYC LL144 audit and notice duties (both lanes). They are real, and they are not
  oversight or retention rules. They belong to the measurement and candidate
  communication neighbours.
