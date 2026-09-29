---
domain: recruiting
subject: hiring-need-as-structured-brief
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L3
---

# hiring-need-as-structured-brief

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-hb-0929)

The Curator lane dispatched this from the registry's attention scan ("never swept
by the librarian"). There was no subject note and no earlier pass. The subject had
stood at revision 2 since the 2026-09-20 drain, with its applications verified on
2026-08-20. The event was measured in the tree: about fifty kp commits had touched
the cited files since then, including a sentinel fix, a server-owned provenance
rule, a bounded transcript, a derived rubric frozen at promotion, and a coercer that
reads name synonyms. `check-currency` reported no row, since the node clock runs to
2027-02.

Four lanes: web counter-evidence (seven claims), primary texts (six targets), a
blind training-data lane on ten claims, and a re-read of kp at `d1d2377e6`.

**Counter-evidence: nothing refuted outright; six conditioned, two confirmed.**
- **A rendering may drop anything except a gate.** Primary: 41 CFR 60-1.3, read on
  eCFR. A basic qualification is one advertised as "must possess", or recorded
  "prior to considering any expression of interest". Blind lane: every hard gate
  must appear in the advertisement. Counter lane: Burning Glass and HBS 2024, where
  45% of firms changed postings "in name only". The brief is the record only while
  decisions are derived from it.
- **Stated is necessary to gate, not sufficient.** Primary: the 60-1.3 test,
  "noncomparative", "objective" and "relevant". Blind lane: a stated gate can be
  unlawful. Sibling role-intake-conversation: corroborate a hard filter. "An
  inference may not disqualify" is now labelled as this standard's own choice, not
  law.
- **Acquirability is the regulators' line, and it is a time.** Primary: 1607.14(C)(1)
  and 1607.5(F). Counter lane: the OPM template, where need-at-entry "2.0 or below"
  means within three months counts as entry. Blind lane: a time bound. This
  confirms the axis and conditions its binary form.
- **A lifted or fallback grade may not gate.** Blind lane: promote to a gate only on
  confirmation. Primary: 1607.5(F). The sibling's non-filtering fallback agrees. The
  exception, from 60-1.3, is a list published as must-possess, which its publisher
  stated.
- **Confidence orders a queue and is never a threshold.** Counter lane: Xiong et
  al. 2024, "0.522 to 0.605 in AUROC", with the abstract matched on arXiv. The blind
  lane converged unprompted.
- **Opening and publishing are two gates, and the floor is a heuristic.** Primary:
  2023/970 Art. 5(1), NY 194-b and C.R.S. 8-5-201. Blind lane: pay and location at
  publication. Counter lane: no outcome study exists, and a review prepared for
  performance-based hiring's seller concedes it.
- **A statement made after candidates were seen opens a version.** Blind lane:
  Uhlmann & Cohen 2005, verified here verbatim on PubMed. Primary: 60-1.3's "prior
  to considering".
- **Confirmed:** years are a weak proxy (Van Iddekinge 2019, .06), and the counter
  lane found the paper's own exception at job start. The two-axes grid is standard
  doctrine, not a novelty.

**Not landed:**
- **Single-lane or preprint items:**
  - the OPM "distinguishing value" third scale;
  - Karim & Uzuner's finding that omission, not invention, dominates dialogue
    extraction (a preprint);
  - a legally mandated duration being the requirement itself;
  - "a document is a valid source". Only the published-list case landed, on
    60-1.3.
- **Owned by siblings:** Abraham et al. 2024 (the Uber RCT, +7% applications) and
  the Behavioural Insights Team's 52%/56% belong to requirement-inflation-control
  or inclusive-job-advertising. The HP "100% qualified" figure is unsourced
  (Mohr's own text says only "a Hewlett Packard internal report"), and a grep
  found no subject repeating it. EU AI Act scope (Recital 53, "transforms unstructured data
  into structured data", as a narrow procedural task) and retention clocks belong
  to decision-audit-and-traceability, which already carries the 2 December 2027
  date.
- **Blind lane only, banked:** requestor authority by role, and a relayed basis for
  what a recruiter passes on.
- **C6 (intake improves outcomes)** is practitioner lore. The subject never
  claimed it, so nothing changed.

**The tree found what no lane asked.**
- **A fallback grade was a hard gate.** Both coercers filled a missing hardness with
  "prerequisite". The rubric added on 2026-09-14 blocks on must_have x prerequisite,
  so every ungraded row could end a candidacy. The technique's own lift said the
  same thing, and its rule "grade it down, not up" never reached the lift.
- **The forced enum lived in the coercer.** The prompt forbids it, and the coercer
  then did it after the model complied.
- **A human save cut facets to 20** against the merge's 32.
- **Deviations recorded, not fixed:**
  - neither the gate nor the rubric reads provenance;
  - the PATCH door is open and no actor is recorded;
  - a stated reversal overwrites in place;
  - deletes leave no record;
  - `sourceTurn` drifts across compactions;
  - a voice sweep can revert an edit;
  - promotion has an unguarded window.

**Convergence.** No new technique. Every flip landed as a section, a condition or a
decision rule inside an existing technique, plus two new failure modes in the
golden path.

**Applied** (eleven rows in `applied.md`):
- **code, better:** kp `8a44493f7`, local and not pushed. It carries three fixes:
  - the hardness fallback: blocking went from 3 of 3 to 1 of 3;
  - the forced enum: Band 5 was lost, now kept;
  - the facet cap: 20 of 33 kept, now 32.
  All tests were red first, tsc was clean, and the jobfit suite showed only the
  pre-existing `test_pipeline_stages_sync` failure.
- **simulation, better:** stated-only blocking over three cases (1 better, 1 tie,
  1 right under the new lift exception). Not changed in code, because it would
  re-version ADR-0012 rubrics.
- **unmeasurable:** a rendering keeps every gate. kp's job description is
  generated.
- **unapplied:** checkable gates, confidence as a queue (already holds),
  the publish gate, post-exposure versions (holds by construction), the
  acquirability horizon, and pointer rebasing.

**Applications.** All three were re-verified to 2026-09-29. The node one was
checked against node@24. Every citation moved. Two claims were corrected:
- "the interview loop reads the arrays" is now false, since the intent summary
  reads both homes;
- "the sentinel deviation" is mostly retired upstream; the map-less residue is
  recorded.

## Impact

- **kp:** 5 contexts joined (`jd-intake-brief-logic`, `jd-intake-studio` and
  `candidate-apply-api` strong; `decisions-review-ui` and `devcase-session-api`
  probable), all state unknown. 0 stale verdicts: no project carries a judged
  verdict on this subject.
- **The join missed every seam this pass fixed.** `rolebrief.py`, `brief-edit.ts`,
  `intake-brief.ts`, `role-rubric.ts` and `rolerubric.py` sit in no context.
  `intake.py` sits in `jobs-intake`, which does not join this subject. kp's commit
  hook did not route the fix commit here either. This is the third run in a row to
  record that miss.
- **Maps regenerated fleet-wide.** Twelve projects were committed locally on their
  active branches, none pushed. gigs has no context map.

## Saturation ledger

| | |
| --- | --- |
| Depth | L3: one code A/B across two languages with red-first tests on the real modules, one simulation on the real rubric |
| Last-pass yield | high: 6 conditioned, 2 confirmed, 3 code fixes, 2 application claims corrected |
| Dry streak | 0 |
| Clocks | eCFR as of 2026-09-22; 2023/970 transposed from 7 June 2026; OPM template undated; Xiong 2024 |
| Demand | kp only (5 contexts, seam files unjoined) |

## Banked leads

- **Provenance-aware rubric blocking.** Return: when kp re-derives rubrics or
  revisits ADR-0012.
- **An attributed promote override and actor columns.** Return: when kp writes
  `intake_promoted` events.
- **Superseded entries and deletion events.** Return: the same event writer.
- **`sourceTurn` rebasing at compaction.** Return: when kp touches
  `capTranscript`.
- **The TS edit path's forced enum and its `(key, label)` facet match.** Return:
  when `brief-edit.ts` is next touched.
- **The voice-sweep overwrite and the promote window.** Return: a kp concurrency
  pass. Both are read from code and were not executed.
- **Requestor authority** (blind lane only). Return: a second source on intake role
  authority.
- **The Uber RCT and the BIT 52%/56% figures.** Return: the next pass on
  inclusive-job-advertising or requirement-inflation-control.
- **The map join above.** Return: the next `/straighten` or manifest pass over kp.
