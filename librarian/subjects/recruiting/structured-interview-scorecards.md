---
subject: structured-interview-scorecards
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
---

# structured-interview-scorecards

First touch by `/deepen`, dispatched by the Curator lane on the scan finding "never swept by the librarian" (run `dp-sis-0929`). Registry HEAD at dispatch 3c6fbf46; the work was done in a detached worktree of origin/main (362c2ad0) because the primary checkout is 104 commits behind it. No prior note existed and no earlier pass had touched the subject since the bundle joined.

## 2026-09-29 - the standard's figures were unsourced, the anchors claim was one half of a mechanism, and the tree had moved under three applications

**Depth rung:** L2 for the applications (kp read at 60aab8088, every cited line re-resolved, two behaviours executed against the real module). L1 for the golden path: one web lane (Crossref and Europe PMC abstracts opened for Melchers 2011, Huffcutt 2013, Kuncel 2013, Roch 2012, Sackett 2022; Huffcutt and Woehr 1999 abstract via a search summary), one blind lane. Full text opened by the lane only for Sackett 2022 and Simms 2019.

**Corrected in the golden path and techniques:**
- "Settled" for structured over unstructured now carries the figures: about .42 against about .19 (2022 overcorrection-adjusted), the 80% credibility range .18 to .66, and the 1998 .51/.38 pair marked as the superseded figure most citations repeat. The blind lane reached .42/.19 independently.
- **"Anchors are the instrument" was half a mechanism.** The one controlled interview comparison (Melchers 2011, a 2x2 on videotaped interviews) found anchored scales and frame-of-reference training each lifted accuracy and reliability by a comparable amount, and both together lifted accuracy further. The blind lane recalled the same study, and read it as FOR beating anchors; the abstract says comparable. The golden path now says anchors and calibration are two halves, and "the intervention with the best evidence" became "the strongest meta-analytic support among rater trainings" (Roch 2012), with the interview-specific caveat.
- **Retranslation** was "the only reliable test". Its thresholds are convention (60-80%) and no test was found that passing predicts later reliability or validity, so it is now a clarity screen.
- **Five levels** was "the workable default; adding levels adds argument". It is a convention; the scale-length research finds precision flat past about six options on a self-report inventory and never tests anchored interview ratings. Range four to six, decided by what can be anchored.
- **Independent scoring** was "unambiguous". The basis is the group-judgment literature and the independent-then-aggregate protocol in *Noise*, not a hiring-debrief experiment, and what it demonstrably buys is preserved variance. "Least to most senior" has no source found and is now labelled a heuristic. New: independent ratings are not independent observations. Panels agree at .74 against .44 for separate interviewers (Huffcutt 2013), and panel format added no validity (Huffcutt and Woehr 1999).
- **A neutral placeholder** was "neutral so it neither helps nor harms". On a scale that names its bar at the midpoint, the placeholder is the level that meets the bar. The golden path and technique now prefer omitting the rating and say what an integer-forcing schema must do. This flips a rule, and owes an `applied.md` row (below).
- **Arithmetic**: "a number invites arithmetic the judgment cannot support" now carries Kuncel 2013 (mechanical combination beats holistic by more than 50% for job performance): the fault is missing grounding and thresholds over small gaps, not the arithmetic. Pointer only; the decision subjects own it. The unassessed technique also states how its "rescaling is laundering" reconciles with the measurement bundle's renormalise-over-present (a disclosure, not a decision input).

**New in techniques (single-deployment evidence, marked as such):** a containment check on drafted quotes with its three ways of being fooled (wrong speaker, the rating outliving its evidence, not counting it); the human form needs the same evidence rule; coverage should come from an independent record of the loop, not the producer's sentinel, with four states and null for unknown.

**The tree found what the corpus did not record, and closed one it did.**
- Closed: "no per-interviewer identity". Human scorecards are keyed by (interviewer, round) since r09; the form seeds only from the caller's own record; the compare CSV never averages a panel ("2 / 5").
- Still open, sharper: nothing gates the *reveal*. The GET returns the whole panel and the modal, drawer and grid show every record, so the form is blind but the reading is not.
- Closed: "nothing checks drafted quotes against the transcript". A containment pass shipped 2026-09-04. Executed: **the rating outlives its evidence** (an invented quote on a 4 returns a live 4 with placeholder evidence; the guard needs a 3) and **the check is speaker-blind** (an interviewer line credited to the candidate is grounded).
- New: a director-derived coverage record now arbitrates the grid (`covered` / `asked` / `not_reached` / `not_planned`, null when undirected).
- Wider than recorded: the whole **experienced** core (five axes, one of them "Motivation: Genuine interest") is description-only. Only the early-career model has anchors, so the largest population is scored on the generic scale on every axis.
- Human path: a rating may carry no note, by doctrine.
- Line numbers in the two older applications were off by tens of lines against a file unchanged since before their `verified_on`; all re-resolved.

**Verified, left alone:** the versioning technique (stamp at write time, content hash, superseded-not-deleted, honest backfill) and its kp application; separate-rubric-per-population; the role-family extension and its three-state gap enum; near-verbatim capture and the read-back rule. The kp behaviours cited (hash, off-rubric flagging, cohort grouping, prefix contract) all still hold.

**Not evaluated / return conditions:** Kingstrom and Bass 1981, Conway 1995, Levashina 2014, Preston and Colman 2000, Lozano 2008 and *Noise* itself were read as summaries only, so the golden path leans on none of them. The LLM quote-extraction figure (~1% strict invention; misattribution the larger class) is one medRxiv preprint on a single focus-group transcript and is cited only as a hedge. Regulatory clocks the lane verified (EU Annex III employment obligations from 2027-12-02 after the Omnibus; Colorado SB26-189 effective 2027-01-01 with 3-year retention; California's 2025-10-01 rule with 4-year retention reaching selection criteria and ADS data) belong to the governance subjects and were not landed here; the California record-retention scope is the one that bears on scorecards as stored records. Return condition for the golden path: a primary for the interview-specific anchoring evidence, or a consumer deviation. Not run: a scorecards-from-real-loops check (the tree holds only test databases).

## Impact
Map dry-run (kp only, nothing written) at origin 362c2ad0: no context carries a judged verdict on this subject, so no stale queue and no map commit. Three rows owed to `librarian/applied.md` for the flipped or new rules, all `unapplied` with return conditions (kp already reaches the placeholder rule itself; the two evidence rules are executed deviations without a measure of frequency).
