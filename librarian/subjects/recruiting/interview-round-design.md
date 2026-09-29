---
subject: interview-round-design
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# interview-round-design

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian". Registry HEAD at dispatch 2cfe873e. The first pass read no consumer tree; the second pass below did.

## 2026-09-29 - a reliability figure was standing in for validity, and round count was credited as the top withdrawal reason

**Depth rung:** L1 synthesis (two web lanes; no primary paper opened, no blind lane, no consumer-tree lane).

**Corrected in the golden path:**
- "Validity plateaus past roughly two structured conversations" had no source and merged two things. The panel-of-four figure is one employer's decision-agreement analysis, reported second-hand (secondary sources disagree 94/95%), inside a structured process with a hiring committee. It is not criterion validity and says nothing about rounds. Replaced with that framing plus the 2022 structured-interview estimate (.42, 80% credibility .18-.66).
- "Too many rounds sits at the top of the stated reasons" is not supported: strongest numbers are scheduling latency and communication; round count rests on preference and prevalence data. "Largest withdrawal point" kept as roughly a quarter, flagged as aggregator-repeated. The worse-final-pool consequence is now labelled an inference.

**Verified, left alone:** rule "a round is justified by a judgment no earlier round made" (a design rule, not an empirical claim); mode, reducer, comparability and not-advanced sections (structure/law claims, not measured).

**Not evaluated:** the three applications' consumer trees (verified_on 2026-08-20); a training-data-only lane; primaries for the funnel figures (iCIMS 2025, Cronofy 2024). Return condition: a primary for the funnel numbers, or consumer deviation.

## 2026-09-29, second pass (dp-irdc-0929) - the tree lane the first pass did not run

Dispatched from the same scan reason (never swept). The first pass had landed hours before at 770c906a, so the reason had already cleared at dispatch HEAD. What that pass did not do was read kp, and the applications were still verified on 2026-08-20. That was the live clock, and the tree had moved.

**Depth rung:** L1 for the golden path. The web lane returned the corrections the first pass had already landed, from secondary sources only, and the blind lane agreed on direction with low confidence on figures. L2 for the applications: kp read at ec99bc406, every cited line re-resolved.

**The tree found what the corpus carried as a deviation, and one it did not.**
- **Tie at the cutoff: met on the reject side, open on the advance side.** `tieSafeBottomCount` now spares a tied group at the auto-reject cutoff. `autoPromoteSlate` (floor, stable sort, `slice(0, topN)`) still splits a tie at the boundary by arrival order. Executed against the real module: scores 90, 80, 70, 70 with topN 3 advance `c` or `d` depending only on input order (three orderings run). The technique now says to guard every cutoff.
- **A reducer that ranked two instruments as one number.** A keyless template score and a graded score sat in one cohort and the template 85 outranked a graded 72. kp now tiers by `evaluationCurrency` and withholds the incomparable. New technique section, marked single-deployment evidence.
- **The plan became stage-keyed.** The stacked default the application had recorded as doctrine is now a data shape (`steps[].rounds[]`). Line numbers re-resolved throughout; the round type and validator behaviour did not change.
- **Kit versions are pinned, scenario versions are not.** The comparability-group deviation is narrowed, not closed.

**Not landed:** a new technique. No lane convergence, and the currency rule is one deployment's incident, so it sits inside the reducer technique. Colorado SB 26-189 and the Illinois notice-rule dates from the web lane were single-source and belong to the legal subjects. Still open from the first pass: the funnel-figure primaries.

**Instrument note:** a `process` application may not carry `verified_against`; the bundle gate rejected it and it was dropped.

## Impact
Map dry-run at 770c906a: no project or context carries a judged verdict on this subject, so no stale queue and no map commit. Nothing new was earned (no technique, no flipped rule), so no applied.md row is owed.
kp: one contextual pair joins this subject, 0 stale verdicts after the regenerated map. No project's `/conform --stale` queue gains an entry from this landing.
