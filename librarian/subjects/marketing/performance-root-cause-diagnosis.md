---
subject: performance-root-cause-diagnosis
domain: marketing
last_touched: 2026-10-22
touched_by: intake-apply-wsr-1022 (apply)
dry_streak: 0
---

# performance-root-cause-diagnosis

First touch. Forged 2026-09-09 in the founding wave of the `marketing` bundle
(category `measurement-and-economics`), one worker, expert draft first, then reconciled against the
consumer workspace at `2893314` and the SEO prompt pipeline at `a47c1ecd`.

**use_when:** explaining why a paid portfolio, a customer cohort or a lead source misses its target, designing a diagnosis that a model may phrase but not invent, deciding when a diagnosed problem counts as fixed, reviewing whether past recommendations actually worked

**Techniques (6):** advice-ledger-scores-past-advice, cause-ladder-tracking-gap-first, one-lever-from-supplied-entities, outcome-closed-by-own-metric-with-dead-band, thresholds-mirror-the-prompt, wasted-spend-ranking.

**Applications (stacks: node):** node--advice-ledger-scores-past-advice, node--cause-ladder-tracking-gap-first, node--outcome-closed-by-own-metric-with-dead-band.

## Sightings

- Every threshold the subject states is labelled documented / measured / convention in
  the technique that carries it; the worker's report listed the conventions and they
  are in the files, not only in the report.
- Deviations of the reconciled trees are recorded in the applications with the standard
  kept; the source note `librarian/sources/2026-09-09-seo-agent.md` carries the
  deviation backlog by area.

## Owed

- Single-stack debt: born with the stacks above; an external reconcile against a
  second tree is the next pass.
- No `librarian/applied.md` row yet except where the source note says so; the
  unapplied backlog is every technique here without a row.

## 2026-10-22 - apply: thresholds-mirror-the-prompt (run intake-apply-tmtp-1022)

- First application, `code`, `better`, ab-paired on systedo-case. The ads and
  lead-source diagnoses coerced an out-of-set model cause to a fixed catch-all, the
  ladder's last rung. B falls back to the deterministic pick: cause off the pick 27/36
  to 0/36, severity 18/36 to 0/36, in-set causes unchanged.
- Application: `node--thresholds-mirror-the-prompt`. The technique's rule held; no
  amendment.
- Project commits sit on a pushed branch. The master fast-forward waits on the base
  suite's two reds.
- Owed: the cohort diagnosis still states an LTV:CAC target of three as fact and has no
  deterministic check on the cohort the model picks (the technique's benchmark case).

## 2026-10-22 - apply: wasted-spend-ranking (run intake-apply-wsr-1022)

- First application, `code`, `better`, ab-paired on systedo-case. The ads diagnosis
  still matches the technique (it is the tree the technique came from), so the seam was
  the pattern miner's money pit, a second ranking of waste in the same tree. It admitted
  only a positive return, so a zero-conversion spender could never be named. B calls the
  diagnosis's own definition. On the fixture the pit was off the top waster A 1/1, B 0/1.
  On the sample spines it was 0/120 in both arms, because the spine has no
  zero-conversion campaign.
- Application: `node--wasted-spend-ranking`. Two decision rules were added to the
  technique: a surface that cannot say why leaves a value-less converter out as not
  measured, and every ranking of waste in one product calls one definition and one target.
- The project commit sits on a pushed branch. The master fast-forward waits on the base
  suite's two reds.
- Owed: the budget recommender ranks donors against the module's portfolio target, not
  the tenant goal the badges use (a one-target-one-threshold breach on a money path).

## 2026-10-31 - architecture review

All 13 documents read in full. The subject is mostly a design discipline reconciled
against one tree, so few claims depend on the outside world. Two were checked against
primary sources: the LTV:CAC target of three (Skok's own wording calls it a guideline,
which supports the subject's rule that a prompt may not state it as fact), and the
tracking-gap rung (Google Ads' own status vocabulary separates a broken tag from a
quiet week, so a zero count alone cannot tell them apart - the rung's premise).
Three internal defects were found: a wasted-spend decision rule whose examples
contradict its own instruction, a "three refusals" count over a four-item list, and a
cause-ladder application whose first deviation was fixed in a later application with
no pointer between them.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/performance-root-cause-diagnosis",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:a5973514c8c89bfe",
  "disposition": "clarify",
  "coverage": "All 13 documents read in full (golden path, 6 techniques, 6 node applications). Arithmetic in every application's verification and proof tables re-checked. Two primary sources read. Not evaluated: the private consumer tree at any commit, any re-execution of the cited tests, the lead-source and cohort instances' own rungs (owned by neighbouring subjects). No verification date was refreshed.",
  "counterexamples": [
    "A portfolio at or under its cost-share target with one lagging network carrying a quarter of spend classifies as network imbalance, not healthy, because the imbalance rung sits above the healthy rung. That is the intended ordering, but an owner reading 'healthy' as 'on target' will be surprised.",
    "Google Ads reports 'Awaiting conversions' ('No conversions have been recorded in the last 7 days') separately from 'Misconfigured' ('Conversions have stopped recording entirely due to a setup error or a broken tag'). A low-volume account can sit at zero conversions with working measurement; the gap rung's lever (check measurement, touch no spend) is still the cheaper wrong action, but the verdict is not certain.",
    "A cohort with the lowest LTV:CAC ratio can carry a small fraction of acquisition spend; ranking cohorts by the ratio alone repeats the worst-by-ratio failure the golden path forbids for campaigns."
  ],
  "sources": [
    {
      "url": "https://www.forentrepreneurs.com/saas-metrics-2/",
      "result": "Read. 'The best SaaS businesses have a LTV to CAC ratio that is higher than 3, sometimes as high as 7 or 8', and 'I should stress that these are only guidelines, there are always situations where it makes sense to break them.' Supports thresholds-mirror-the-prompt's rule that a prompt stating a ratio of three as the goal carries a convention, not data."
    },
    {
      "url": "https://support.google.com/google-ads/troubleshooter/13455130?hl=en",
      "result": "Read. Lists 'Misconfigured: Conversions have stopped recording entirely due to a setup error or a broken tag' and 'Awaiting conversions: No conversions have been recorded in the last 7 days.' Supports the cause ladder's premise that spend with zero recorded conversions is ambiguous between a measurement gap and real non-conversion, and that the measurement check comes first."
    },
    {
      "source": "Arithmetic across the applications",
      "result": "Consistent: (0.20-0.25)/0.25 = -0.2; 0.25 to 0.24 is -4%, inside a 5% band; 9 fixtures x 3 causes = 27 of 36; 3 of 12 fixtures match the catch-all; the pattern miner's cost x (1 - roas/targetRoas) equals spend - value x target cost share. The advice-ledger application says 'three of the technique's refusals' and lists four."
    }
  ],
  "documents": {
    "performance-root-cause-diagnosis.md": {
      "disposition": "keep",
      "reason": "Ownership seams are stated and match the techniques; every convention is labelled as one; the failure-mode list maps one-to-one onto techniques."
    },
    "techniques/advice-ledger-scores-past-advice.md": {
      "disposition": "keep",
      "reason": "Record, update, refusals and read-back are internally consistent and agree with the outcome technique's band and inversion rule."
    },
    "techniques/cause-ladder-tracking-gap-first.md": {
      "disposition": "keep",
      "reason": "Rung order and its harm-asymmetry argument hold; the Google Ads status vocabulary supports the gap-first premise. Open lead, not a defect: where a platform exposes a conversion-action status, it can disambiguate the gap rung."
    },
    "techniques/one-lever-from-supplied-entities.md": {
      "disposition": "keep",
      "reason": "Drop-not-correct, no backfill after a total drop, and no external benchmarks are consistent with the applications that realise them."
    },
    "techniques/outcome-closed-by-own-metric-with-dead-band.md": {
      "disposition": "keep",
      "reason": "Comparison, dead-band and verdict-not-delta inversion are correct and match the application's verified calls. Tension for the Director, not applied: its cohort key metric is 'the same deterministic worst the fallback picks' (lowest ratio), while wasted-spend-ranking says to rank cohorts by the amount at stake."
    },
    "techniques/thresholds-mirror-the-prompt.md": {
      "disposition": "keep",
      "reason": "The pairing rule and the cohort-benchmark case are sound; Skok's own text calls the ratio of three a guideline, which is what this technique says."
    },
    "techniques/wasted-spend-ranking.md": {
      "disposition": "clarify",
      "reason": "The last decision rule says 'rank by the amount at stake, not by the ratio alone' and then gives two ratios as its quantities (the lowest lifetime-value ratio, the worst cost per qualified lead). Restate the quantities as amounts in the same shape as campaign waste: acquisition spend the cohort's ratio does not justify, and a source's excess cost per qualified lead times its qualified leads."
    },
    "applications/node--advice-ledger-scores-past-advice.md": {
      "disposition": "clarify",
      "reason": "'upsert ... carries three of the technique's refusals' is followed by four bullets; should read four."
    },
    "applications/node--cause-ladder-tracking-gap-first.md": {
      "disposition": "clarify",
      "reason": "True at its pinned commit 2893314, but its first deviation (an unrecognised cause coerced to budget-misallocation) was fixed at 7bbd1cab per node--thresholds-mirror-the-prompt. Add a pointer so a reader does not take the deviation as current."
    },
    "applications/node--one-lever-from-supplied-entities.md": {
      "disposition": "keep",
      "reason": "A/B is coherent and its limits (live rate unmeasured, prose unchecked) are stated."
    },
    "applications/node--outcome-closed-by-own-metric-with-dead-band.md": {
      "disposition": "keep",
      "reason": "Verification calls re-checked by arithmetic; the half-pinned band deviation is stated."
    },
    "applications/node--thresholds-mirror-the-prompt.md": {
      "disposition": "keep",
      "reason": "Proof table counts are consistent (27/36, 9 of 12, 3 matching rungs) and the cohort benchmark is left owed explicitly."
    },
    "applications/node--wasted-spend-ranking.md": {
      "disposition": "keep",
      "reason": "The pattern miner's formula is shown equal to the technique's for converting rows; the limits are stated."
    }
  }
}
```

## 2026-10-31 - architecture review, after apply

The three clarify items above were applied in the same run; this record is against the
new bytes. The cohort-key-metric tension in the outcome technique is left for the
Director: the tree picks the lowest-ratio cohort, and changing the technique's
description would need a decision about whether that pick is a deviation.

<!-- architecture-review:v1 -->
```json
{
  "subject": "marketing/performance-root-cause-diagnosis",
  "date": "2026-10-31",
  "baseline": "c46c573d3",
  "digest": "sha256-b2:a1240d534ffad0f7",
  "disposition": "keep",
  "coverage": "Same reading as the record above (all 13 documents, two primary sources, application arithmetic). The three applied edits were re-read in place. Not evaluated: the private consumer tree, re-execution of cited tests. No verification date was refreshed.",
  "counterexamples": [
    "An on-target portfolio with a lagging network carrying a quarter of spend classifies as network imbalance, not healthy.",
    "A low-volume account at zero conversions can have working measurement ('Awaiting conversions' versus 'Misconfigured' in Google Ads).",
    "The lowest-ratio cohort can carry little acquisition spend; ranking by the ratio alone repeats worst-by-ratio."
  ],
  "sources": [
    {
      "url": "https://www.forentrepreneurs.com/saas-metrics-2/",
      "result": "As above: the ratio of three is 'only guidelines'."
    },
    {
      "url": "https://support.google.com/google-ads/troubleshooter/13455130?hl=en",
      "result": "As above: 'Misconfigured' and 'Awaiting conversions' are separate statuses."
    }
  ],
  "documents": {
    "performance-root-cause-diagnosis.md": {
      "disposition": "keep",
      "reason": "Unchanged; reasoning in the record above holds."
    },
    "techniques/advice-ledger-scores-past-advice.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    },
    "techniques/cause-ladder-tracking-gap-first.md": {
      "disposition": "keep",
      "reason": "Unchanged. Open lead: a platform conversion-action status can disambiguate the gap rung."
    },
    "techniques/one-lever-from-supplied-entities.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    },
    "techniques/outcome-closed-by-own-metric-with-dead-band.md": {
      "disposition": "keep",
      "reason": "Unchanged. Tension still owed to the Director: its cohort key metric is the lowest-ratio cohort, while wasted-spend-ranking now says to rank cohorts by acquisition spend the ratio does not justify."
    },
    "techniques/thresholds-mirror-the-prompt.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    },
    "techniques/wasted-spend-ranking.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the cohort/lead-source decision rule now names amounts (acquisition spend the ratio does not justify; excess cost per qualified lead times qualified leads) instead of two ratios, matching its own 'rank by the amount at stake'."
    },
    "applications/node--advice-ledger-scores-past-advice.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'three of the technique's refusals' -> 'four', matching the list."
    },
    "applications/node--cause-ladder-tracking-gap-first.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the coerceCause deviation is marked as fixed at 7bbd1cab with a pointer to node--thresholds-mirror-the-prompt."
    },
    "applications/node--one-lever-from-supplied-entities.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    },
    "applications/node--outcome-closed-by-own-metric-with-dead-band.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    },
    "applications/node--thresholds-mirror-the-prompt.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    },
    "applications/node--wasted-spend-ranking.md": {
      "disposition": "keep",
      "reason": "Unchanged."
    }
  }
}
```
