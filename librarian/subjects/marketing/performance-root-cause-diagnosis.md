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
