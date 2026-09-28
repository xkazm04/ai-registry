---
domain: recruiting
subject: ai-assistance-detection-and-fairness
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# ai-assistance-detection-and-fairness

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-aadf-0926)

Dispatched by the Curator lane on "never swept by the librarian". The subject
already had two stacks (process, react), so it carried no single-stack debt.
Four lanes: a re-read of every citation in the one joined tree (kp) at its HEAD,
a survey of that tree's uncovered seams, web counter-evidence (eight claims), and
a blind training-data lane.

**Counter-evidence: nothing refuted, five claims conditioned, one unsourced figure
removed.**
- Detector bias. The 2023 figure holds with its basis (seven detectors, 91 essays,
  61% average false positives, near-perfect on native eighth-grade essays). "Later
  replications put the gap lower but still above 20%" had no source and was
  removed; the nearest number is that paper's own 19.78% unanimous rate. The
  bias belongs to each detector: a 2026 replication in Czech found no systematic
  bias across three detector families; a 2026 study of 13 detectors found
  false-positive rates on human text from 0% to 100%; a 16-system audit (ACL 2026)
  found the biases "generally inconsistent across systems" with non-white
  language-learner essays flagged disproportionately. "None uniformly fair"
  overstated that audit and became "no detector can be assumed fair until tested
  on your candidates and your kind of text".
- Honest use is punished. A 2026 evaluation: permitted light editing flagged at
  38-80%, humanized text under 4%, "Honest AI-editing results in a higher
  sanction risk than humanizer-assisted evasion." Landed as the second defect
  that survives a fair detector.
- Litigation. Holds for consumer protection (a 2025 FTC order against a
  detector vendor's 98% accuracy claim) and for student discipline, where courts
  ruled on process, not detector validity. No employment case found. The text
  now says so.
- Watermarking. Holds (SynthID-Text's own paper: weakened by paraphrasing). The
  EU transparency obligations that began applying on 2026-08-02 widen marking
  coverage and do not change the paraphrase result. Not landed; the text's rule
  (positive evidence only) is unchanged.
- The live conversation, "the only one that cannot be prepared against in
  general". Conditioned by web and blind together: overlay assistants and proxy
  or deepfake candidates in remote interviews, and employers moving rounds back
  in person. "Fair by construction" narrowed to the tool axis (blind lane: live
  speech carries its own error for second-language, anxious and neurodivergent
  candidates).
- Process telemetry is "the cheapest thing to fabricate". Holds, with the
  measured red-team round as its basis. The web lane found timing heuristics
  evaded by randomised timing, but finer keystroke models catch injected typing;
  landed as "those models are biometric capture".
- "Ordinary professional practice". Conditioned by web and blind: employers
  differ (some expect assistants in interviews, others forbid them in
  take-homes), so the policy is stated per assessment.

**Convergence.** The blind lane reached the subject's rules independently on
detectors, the matched comparison, the four-state canary, the frozen baseline
family, telemetry as null-not-negative, and no automated rejection. It also
reached the two conditions that landed on the conversation (identity binding,
interview everyone at the stage).

**Tree lane.** All three applications re-read at kp `a7340185d`. Most citations
had moved. Corrections: a prompt quote attributed to `reflect.py` was a
docstring in `submission_eval.py`; the red-team round had five personas, not six;
the margins quote was replaced by a dated re-measurement; the rendered example
is `src/rates.ts`. kp changed the non-inferiority comparator on 2026-08-21 to
the behaviour-matched peer, which the application now records. One deviation was
resolved upstream (the -5 on an unreadable trace). Another was partly wrong from
the start: the panel already counted ungradable canaries.

**Landed** (938c2f68): a node application of
observed-process-is-supporting-not-load-bearing (third stack, from the real
tree); the flipped golden-path waiver rule (by derivation, not "entirely"); the
conversation conditions in the golden path and the technique; the detector
section rewritten on the evidence above; the per-assessment tool policy;
keystroke dynamics as biometric; all three applications re-verified to
2026-09-26.

**Applied** (3 rows in [[applied]]): code better (kp `ac43761d4`, the waiver
missed commit-derived fields: 45 -> 75 in the A/B test), simulation better (the
conversation, 1 of 3 real surfaces moves: no identity binding), unapplied (no
fleet project runs an origin detector).

## Impact

Map regenerated for kp at registry 938c2f68 (kp `7ac877d0c`). kp: 3 contexts join
this subject (`devcase-core`, `devcase-eval` twice, `devcase-lifecycle-api`),
all `unknown`, **0 stale verdicts**. No other project joins it.

## Owed to projects

kp, each found by the tree lane and read in the code, none fixed in this pass
(one project per finding, and the waiver fix was the one):
- The bulk-paste tell tests size only (any paste of 600 characters or more) and
  is decisive alone at -65. Nothing checks whether the block was edited
  afterwards. That is the assistive-technology hazard the bulk-paste technique
  names.
- A failed integrity chain subtracts 70 rather than voiding the trace, and
  integrity never reaches the Python evaluation, so the model still reads
  untrusted events.
- "The assistant and stakeholder channels went unused" is shown for a
  submission whose channels were never captured (`observed = bool(msgs)`).
- The baseline similarity result does not record its baseline version, and no
  code detects the 6KB broken-ruler condition the red-team round decided to
  treat as no-signal.
- A short brief's paste ratio returns 0.0, which reads the same as none.
- An empty read-before-write pool returns a definite 0.0 into fluency, not
  no-signal.
- Nothing binds the live interviewee to the submitter (the applied row above).

## Open leads

- **Hidden-text "AI traps" in the supplied material** (for example, white text
  telling a model to mention a word). Blind lane: screen readers read it aloud,
  so it traps assistive-technology users, and it measures the tool, not
  verification. Single lane. Return: a source on trap-text prevalence or harm in
  assessments, to earn a "never a hidden instruction" line in
  planted-canary-with-real-ground-truth.
- **Take-homes as a malware vector against candidates.** A multi-agency advisory
  reported by trade press on 2026-09-18 counts fake coding assignments that
  infected more than 30,000 devices. A proposal for the work-sample design or
  candidate communication subjects, not this one. Single lane. Return: when
  either is next deepened.
- **Regulatory dates for neighbours.** Web lane, sourced but not landed here,
  because this subject cites no dates: EU Annex III employment obligations moved
  to 2027-12-02 by the AI omnibus in force 2026-07-27; Colorado's AI Act repealed
  and replaced by a narrower law effective 2027-01-01 with a right to human
  review; California's ADS regulations effective 2025-10-01; the EEOC withdrew its
  AI guidance in January 2025. Return: when a regulation-owning recruiting
  subject is next deepened.

## Declines

- Watermark regulation text (EU Art. 50 in force): true, and it changes no rule
  here; the positive-evidence-only rule already covers wider marking.
- A minimum cohort of 30 per cell (blind lane, low confidence): the technique's
  "derived from the difference you need to detect, low double digits" is the
  better rule, and a round number is what it warns against.
- Structural comparison over surface comparison for the baseline (blind lane):
  already the technique's delta-over-added-units rule.
