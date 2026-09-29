---
subject: selection-score-calibration
domain: recruiting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# selection-score-calibration

First librarian note. `/deepen` was dispatched by the Curator lane on the scan finding "never swept by the librarian" (run dp-ssc-0929, registry HEAD at dispatch `cea57001`; worked from a detached origin/main worktree because the primary checkout is 50 ahead and 79 behind). The subject was at revision 1, dated 2026-08-21, with no note, no `applied.md` row, and three applications last verified 2026-08-20 whose line citations into kp had all moved.

## 2026-09-29 - the monitor's floor was the defect; the range and the law were wrong

**Depth rung:** L3 for the drift alarm and the skill verdict (run against kp's real module and against a known-truth generator, n visible), L2 for the literature (the CORP paper's arXiv text, the PSI paper, the selective-labels paper and the EU regulations read as fetched text; several sources abstract-only, listed below).

**Lanes:** a blind training-data lane (no tools); a counter-evidence lane on five statistical claims; a regulation and reviewer-anchoring lane; a re-read of kp at `006bf7a0a` for every citation in the three applications; two simulations against known ground truth (the drift alarm, the skill ladder) and one probe of the holdout hash.

**Corrected (a claim that carried no basis or a wrong one):**
- **"Reuse the same floor for the drift monitor as the curve."** Measured on kp's `detect_drift`, unchanged, over two windows drawn from one population under a perfectly calibrated score (every alarm false, 4,000 pairs per size): any-axis alarm on 99.8% of pairs at 20 outcomes, 91% at 50, 43% at 100, 6% at 200, 0.4% at 400. The technique's own "muted within a month" failure was built into the floor it named. It now says a per-axis floor above the curve's, about 200 for this design.
- **"A worsening of 0.05 is comfortably past run-to-run jitter."** The between-window delta has sd 0.057 at 20, 0.035 at 50, 0.018 at 200, and a cut equal to the change it must catch detects it about half the time at every size.
- **"The squared-error rule spans zero to a quarter."** It spans zero to one (Ferro and Fricker 2012, and the definition in the CORP paper's table); 0.25 is the constant-0.5 forecast. Converged: the blind lane and the web lane both reached it.
- **"PSI 0.1 / 0.25 as the standard."** A rule of thumb, cited to Lewis 1994 in the one paper that studies its statistics, "used without reference to statistical type I or type II error rates"; the no-shift expectation is (B-1)(1/n+1/m), 0.36 at ten bins and 50 per window. Converged: the blind lane gave the same formula before the paper was read. The measured PSI medians match it (1.78 at 20, 0.18 at 100).
- **"Calibration is a precondition for fairness."** Within-group calibration is one fairness criterion and conflicts with equal error rates when base rates differ (Kleinberg, Mullainathan and Raghavan; Chouldechova). Neither paper makes it a precondition.
- **"Modern regimes require a documented monitoring plan; the deployer carries oversight and log duties."** Right in outline, wrong in placement, and stale in date: the plan is the provider's (Article 72), the deployer monitors and reports up (26(5)) and keeps logs six months (26(6)), and the high-risk obligations apply from 2 December 2027 under Regulation (EU) 2026/1744, not 2 August 2026. I fetched the Official Journal text and checked Article 113, 26(5), 26(6), 72(1) and Annex III 4(a) myself.
- **kp's docstring cites Article 72 as a deployer's duty.** Recorded as a deviation; not edited (see below).

**Conditioned, not refuted:**
- "Fixed-width bins with a floor of about eight": right for reading rates either side of a cutoff, wrong as the reference for a claim about shape; the CORP paper finds the binned diagram "highly sensitive to the specification of the bins" and offers isotonic recalibration with consistency bands. The paper states no per-bin minimum, so eight is now called a convention. Not reproduced here: the paper's software, and the journal version.
- The skill score at small n: biased low for a calibrated score (measured 0.296 against a true 0.334 at 20 outcomes) and wide (sd 0.20). Ferro and Fricker decline to sign the bias of the ratio; the simulation signs it for a calibrated score only.
- "Reviewer saw the score" as a ceiling: supported as a mechanism (528 lay participants, 1,526 trials, one hiring experiment with simulated advice), not as an effect size for recruiters, and one crowdsourced study reports no anchoring. It stays as a conservative default; the way to lower it is a hidden-score arm nobody has run.
- The clean arm as the repair: a randomised sample of the unreached region is the standard remedy (Lakkaraju and colleagues, KDD 2017); reweighting and imputation assume no unmeasured confounders. The arm still says nothing about the range the gate always passes.
- The hire axis has its own negative (rejected anywhere without the terminal), which the technique had not stated.

**Left as written (verified):** deterministic membership keyed on the pair and not on the threshold or the policy version; fail closed on a malformed rate; the arm as sparings minus later auto-rejections; the structural bar above the skill ladder; the signed Brier delta; the degenerate-cohort rule; the report as a record. The membership hash spared 5.02%, 4.95% and 4.98% of 200,000 UUID, sequential and prefixed ids at 5%, inside one binomial sd.

**Applied:** one kp fix, `5deab937` (local, not pushed: kp's main carries sibling work), a second insufficient_data gate at 200 outcomes with a corrected comment on the Brier range, five tests changed and two added, 19 pass; false alarms 99.8% to 0% at 20 outcomes, unchanged from 200 up. Four `applied.md` rows: one code (better), one unapplied, two simulation (one not-better, one better).

**Measured, and left as a deviation on the application:** kp's headline reads "The screening score is well calibrated" from a Brier skill of 0.2 or more, and a score whose outcome probability is the score squared has skill 0.251 while overstating the advance rate everywhere; the drift module's input-shift index reads resolved outcomes only, so it is not the early signal the technique asks for; `verdictFor` has no representation of the medium ceiling (latent, the analysis arm is never judged); the clean arm is a 2,000-sparing recency window nothing prints.

**Not evaluated:** the CORP paper's journal version; Mason 2004, Weigel and colleagues 2007 and Bradley and colleagues 2008 (blocked or not opened, so the small-n bias rests on Ferro and Fricker plus the simulation); the Council press release and Parliament vote for the Omnibus; the follow-up literature on off-policy evaluation of screening models; Colorado's SB 26-189 beyond a skim for monitoring language; any recruiter-population anchoring study; whether a real screening score is closer to a probability or a rank percentile (the simulations use a probability). The drift simulation used one bin count and three score distributions. No CORP curve was implemented, no permutation or chi-square benchmark was built, and no interval was added to kp's verdict.

**Banked:** an input-shift index over every scored candidate (return: when anything calls `detect_drift`); a hidden-score reviewer arm (return: a project with volume and a policy to randomise); a CORP curve beside the binned one on kp's panel (return: when the panel is next edited); the rate-sizing panel the holdout technique asks for. The 2 December 2027 date is not new to the bundle (`multi-jurisdiction-hiring-compliance`, `rejection-with-dignity` and `pre-publish-fillability-forecast` already carry it), so this pass converges with them rather than correcting them; the `rejection-with-dignity` note lists the Omnibus text as not evaluated, and Article 113 of Regulation (EU) 2026/1744 has now been read from the Official Journal text.

## Impact

One project joins this subject: kp, eight contexts, all state `unknown` (never judged), so 0 stale verdicts and no `/conform --stale` queue from this landing; a `--dry-run` of the map builder from this tree lists twenty stale kp verdicts on other subjects and none on this one. The map was not regenerated or committed: it is built from the registry tree it is run in, kp's committed map already carries digests from local-only registry commits, and regenerating from origin/main would revert them. Regenerate on the reconciled tree. Yield high (six corrections, five conditions, one measured defect fixed), dry_streak 0, depth L3. Clocks: the law paragraph is dated 2026-09-29 and should be re-read by 2026-12-29 (the Omnibus is in force but its detail is moving); applications verified 2026-09-29 and current at kp `006bf7a0a`. See [[presenting-a-score-to-a-recruiter]], [[automated-screening-fairness-gates]] and [[recruiter-anchored-model-evaluation]].
