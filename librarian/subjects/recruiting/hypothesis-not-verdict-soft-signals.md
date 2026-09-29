---
domain: recruiting
subject: hypothesis-not-verdict-soft-signals
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# hypothesis-not-verdict-soft-signals

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-hnv-0929)

The Curator lane dispatched this from the registry's attention scan ("never swept
by the librarian"). The reason still held at dispatch HEAD `59766696`: there was
no subject note and no earlier pass. The subject had stood at revision 1 since
2026-08-21, with its applications verified on 2026-08-20. The event was measured
in the tree. The day after verification, kp renamed the checklist tag both
applications recorded as a deviation (`RED FLAG` became `TO CONFIRM`, with the
detail carried). It also fixed a Czech regex that read a candidate's grammatical
gender.

Four lanes: web counter-evidence (six claims), primary texts (six targets), a
blind training-data lane on ten questions, and a re-read of kp at `d14f0751`.

**Counter-evidence: two refuted as stated, four conditioned, none confirmed
unchanged.**
- **"Flight risk" as a no-information reading: refuted.** Counter lane: Barrick &
  Zimmerman 2005 (r -.16 to -.22; age d = -0.43 on months in the last job, from the
  PDF) and Sajjadiani et al. 2019 (H = 0.89; reasons for moving predict more
  strongly). Blind lane: ban the label, keep the fact, and justify it on fairness
  and construct, not validity. The golden path now says the line is a policy. The
  technique's own model sentence named "flight risk" and was rewritten on the
  record.
- **Deterministic detectors "free of any judgment": refuted.** Counter lane:
  Exley & Kessler 2022, Murciano-Goroff 2022 (11.07%, abstract matched on
  OpenAlex), Ng et al. 2024. Blind lane: reproducible is not neutral, with named
  encodings for sex, national origin, age and disability. Tree: the Czech
  participle bug (kp `029471eb`). This is a three-way convergence. It lands as a
  decision rule in trust ordering, a paragraph in claim-versus-evidence and one in
  the golden path.
- **A CV-derived probe fits structured interviewing: conditioned.** Counter lane:
  Levashina et al. 2014 ("only use planned neutral probes ... to probe equally
  across all applicants", from the PDF), Dipboye et al. 1984, Dougherty et al.
  1994. Sackett 1982 is the counterweight: experienced interviewers with set
  questions did not reliably confirm. Blind lane: a common scored core, probes as
  capped follow-ups. Primary: EEOC 2007 lists selective caregiving questions as
  evidence of disparate treatment. The probe technique gains a section. The
  checklist technique gains the rule that the rater gets the question, not the
  hypothesis.
- **"A demonstration yields proof": conditioned.** Counter lane: Sackett et al.
  2022 (.54 to .33; d = .67 against .23 for structured interviews, from the PDF).
  Blind lane: disagree with "proof". The golden path and the probe technique now
  say direct evidence.
- **Gaps "almost perfectly" a proxy with "almost no information": conditioned.**
  Counter lane: Weisshaar 2018 (most lapses come from job loss) and 2021 (the
  caregiver penalty survives positive information). No performance study was found
  in either direction, so "unvalidated" replaces "no information". Blind lane:
  recency of practice is a partial proxy for a break. That now carries three
  conditions.
- **Handing interviewers hypotheses is safe: conditioned.** The same evidence as
  the probe item. Klayman & Ha 1987 means the word "confirm" is not itself shown
  to bias, so nothing changed on vocabulary.

**Primary texts:**
- The EU AI Act's workplace emotion ban needs biometric input (Art. 5(1)(f) with
  3(39)). The subject's temperament ban is therefore its own choice, and now says
  so.
- Art. 6(3) makes a profiling recruitment system always high-risk.
- Regulation (EU) 2026/1744 moves Annex III obligations to 2 December 2027. That
  matches the date decision-audit-and-traceability already carries.
- GDPR Art. 4(4) and Recital 71 name "reliability or behaviour" as profiling.
- Under 6 RCNY 5-300, a question-only panel falls outside all three limbs, and a
  soft output that overrules an advance falls under the third. The golden path's
  hold rule gained that condition.
- The ICO 2024 audit says inferred characteristics are still special category
  data. That is cited in trust ordering.

**Not landed:**
- **Single-source or unread:** Colorado SB26-189, which repeals and re-enacts
  SB24-205 from 1 January 2027. Only the staff summary was read, and the enacted
  "materially influence" definition was not. The Illinois 103-0804 zip-code proxy
  text was read verbatim from an archived ILGA PDF, and the golden path's address
  rule already covers it.
- **Owned elsewhere:** Van Iddekinge 2019 (experience .06, turnover .00) belongs to
  experience-signal subjects. The 2026 Socio-Economic Review finding that short
  unemployment helps hiring is banked. Roulin & Levashina 2018 on profile length
  is banked.
- **Blind lane only:** suppressing a refuted hypothesis keyed on the document hash
  plus the detector version. It is banked beside the state deviation.

**The tree found what no lane asked:**
- **The export was one-sided.** kp marked `concrete_ownership` and `potential` as
  settled. The copyable checklist and the import-to-prep list keep only open rows.
  Over 66 seeded candidates, 60 had a probed strength that never left the screen,
  and 32 got a risks-only export.
- **The model fold pinned a gap flag.** `_folded_risk_flags` dropped only
  statements that no risk exists, and a test asserted "Two-year employment gap is
  unexplained." must survive into the panel.
- **The neutrality registry could not see the gender bug.** Its gendered prose
  pairs carry none of the concreteness detector's trigger words.
- **Recorded, not fixed:**
  - the raw model flag list is still stored, rendered on the job-fit tab, bulleted
    into the provenance export and turned into red-flag-defense questions;
  - the jobseeker critic matches a key (`claim_vs_evidence`) no detector emits and
    iterates `vague_delivery` evidence the detector never sets, so that branch
    yields nothing;
  - `panel_to_probe_briefs` has a CLI door and no caller;
  - there is no signal state.

**Convergence.** No new technique. Every flip landed as a condition, a decision
rule or a section inside an existing technique, plus two failure modes in the
golden path ("the one-sided export", "the balanced forbidden word").

**Applied** (eight rows in `applied.md`):
- **code, better:** kp `d9c8b17f`, local and not pushed. It carries three fixes:
  - strength symmetry: 32 of 66 risks-only exports became 0, and the export went
    from 42/11 to 42/76 lines (TO CONFIRM/STRENGTH);
  - the tenure sentence and probe;
  - the forbidden-category fold: 10 of 10 dropped, 7 of 7 kept, against 0 of 10
    dropped before.
  The new tests were red first, 12 failures. The gated suite ran 3332 tests with
  one failure, the pre-existing `test_pipeline_stages_sync`.
- **simulation, better:** the vocabulary perturbation. Under the masculine-only
  regex, 0 of kp's 2 registry prose pairs detect the bug, and one pair carrying
  the detector's verb detects it. Not changed in code, because a new perturbation
  runs against every registered scorer.
- **unapplied:** the structured-interview terms and withholding the hypothesis
  from the rater, direct evidence instead of proof, the recency conditions, the
  hold condition (holds by construction), and the subgroup firing-rate monitor.

**Applications.** All three were re-verified to 2026-09-29 against kp `d9c8b17f`,
and the react one against react@19. Every citation moved. Corrected claims:
- the praised model sentence named a forbidden reading;
- two `RED FLAG` deviations were retired, fixed upstream on 2026-08-21;
- "no production caller" still holds, but the CLI now has a
  `--focus-probes-json` door;
- "gaps are absent, and that is the right absence" is true of the detectors and
  was false of the model fold.

## Impact

- **kp:** 3 contexts joined (`devcase-detail`, `results-detail-tabs`,
  `devcase-lifecycle`), all state unknown. 0 stale verdicts: no project carries a
  judged verdict on this subject.
- **The join missed the seam again.** kp's commit hook routed
  `pipeline/jobfit/soft_signals.py` as an unmapped path. The engine this subject
  describes sits in no context, only its surfaces do. This is the fourth run in a
  row to record the miss.
- **Maps regenerated fleet-wide** from a clean worktree. Twelve projects were
  committed locally on their active branches, none pushed. gigs has no context
  map.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: a code A/B on the real module with red-first tests and a 66-candidate measurement, plus one simulation on the real neutrality registry |
| Last-pass yield | high: 2 refuted as stated, 4 conditioned, 3 code fixes, 4 application claims corrected |
| Dry streak | 0 |
| Clocks | Reg. 2026/1744 (Annex III from 2 December 2027); Colorado SB26-189 from 1 January 2027 (unread); Sackett 2022 |
| Demand | kp only (3 contexts, the engine file unjoined) |

## Banked leads

- **Filter the raw model flag list at the parse boundary.** Return: when kp touches
  `pipeline.py` flag coercion or the interview kit's red-flag bucket.
- **Wire `panel_to_probe_briefs` into case design.** Return: when kp designs a case
  for an analysed candidate.
- **Signal state plus refutation suppression keyed on document hash and detector
  version** (the blind lane's condition). Return: when kp carries interview answers
  back.
- **A vocabulary-bearing gendered prose pair in the neutrality registry.** Return:
  the next neutrality pass. It runs against every scorer.
- **The jobseeker critic's dead branch.** Return: when `jobseeker.py` suggestions
  are next touched.
- **Colorado SB26-189's enacted definition.** Return: a read of the enrolled act.
- **Short unemployment spells helping hiring** (Socio-Economic Review 2026) and
  **profile length** (Roulin & Levashina 2018). Return: a second source, or the
  next pass on a sibling that owns them.
- **The map join above.** Return: the next `/straighten` or manifest pass over kp.
