---
domain: recruiting
subject: inference-labelling-and-refusal
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# inference-labelling-and-refusal

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (dp-ilr-0929)

The Curator lane dispatched this from the registry's attention scan ("never swept by
the librarian"). The reason held at dispatch HEAD `2cfe873e`: there was no subject
note and no earlier pass. The subject had stood at revision 1 since 2026-08-21 with
its applications verified on 2026-08-20. The event was measured in the tree: nine kp
commits touched the three applications' files after that date.

Three lanes: web counter-evidence (six claims), a blind training-data lane on seven
questions, and a re-read of kp at `ec99bc40`. No primary-text lane beyond the two
legal texts the counter lane fetched.

**Counter-evidence: none refuted outright, three conditioned, one unsupported
claim softened.**
- **"A model's confidence number carries no calibration": conditioned.** Tian et
  al. 2023 report verbalized confidence better calibrated than token probabilities
  on three QA benchmarks; Kadavath 2022 report encouraging self-evaluation
  calibration; Xiong 2024 report overconfidence. The blind lane reached "rarely
  safe unless calibrated on held-out task labels". Convergent: the claim becomes
  "unvalidated for this model, task and population", and the grammar rule stands
  because it never depended on the number being bad. Both the golden path and the
  technique were rewritten.
- **"Polish predicts access to help far better than performance": unsupported.**
  Horton's randomized trial of writing help (about 480,000 jobseekers) found more
  hiring and no loss of employer satisfaction. No source read shows polish failing
  to predict performance. The refusal is kept on fairness and construct grounds and
  no longer claims a measured validity gap (golden path and forbidden-inference
  technique).
- **"The AI-generated disclaimer is worth almost nothing": conditioned.** The label
  studies are adjacent-domain and were seen at snippet level only. Softened to
  "adds little on its own".
- **"Refusals in the instructions alone are style suggestions": direction kept,
  not quantified.** Compliance falls as constraints stack and rises when they match
  the model's priors; snippet level only. Wording left as it was.
- **Only authoritative verdicts may be frozen:** not attacked by any lane. Blind
  lane added the human-confirmation case (below).

**Law moved.** Art. 86(1) of the EU AI Act was read verbatim. Colorado SB26-189
(effective 2027-01-01) was read on the bill page only, so the golden path names it
as such and tells the reader to re-read the text. Regulation (EU) 2026/1744 and the
Annex III date belong to the sibling subject already carrying them.

**Blind lane only, landed as one-line rules with the source named:** count who
receives *could not determine*; a human confirmation of a degraded verdict is a
human decision citing the degraded input, never an upgrade.

**The tree found the larger movement.** Every application citation had shifted, and
three claims changed meaning:
- **A deviation was fixed.** `a17b5cca2` (2026-09-29) makes a grounding swap set
  `degraded`. The application had called this the repo's one shortfall. A second
  swap (invented verdict number, `f1d29dc4c`) was already tagged.
- **The subject of an application was deleted.** `DecisionsAiReviewCard.tsx` was
  removed on 2026-09-16 and its successor does not render the self-report. The
  technique now holds by omission, with the number computed and its i18n strings
  still present. Recorded as a new deviation-shaped risk, not fixed.
- **"26 buckets" was false.** It is 28, and the taxonomy moved to
  `skill-ledger.ts`, which also gave the third state a four-verdict type. The
  application now points at the test that pins the count instead of stating one.
- The per-README silent cut and the confidence-gated advance route still stand.

**Convergence.** No new technique. Every change landed as a condition, a rule line
or a rewritten application.

**Applied.** Nothing owed to `applied.md`: no technique is new and no golden-path
rule flipped in a direction a project could test (the confidence rule was
conditioned, not refuted). The only kp finding, the orphaned `modelSelfReport`, is
recorded in the application; removing it is a kp decision.

**Applications.** All three re-verified to 2026-09-29 against kp `ec99bc40`. No
`verified_against` was added: none of the three opens a runtime whose major version
the claims depend on.

## Impact

After regenerating the map, no project pairs this subject: 0 pairs, 0 judged, 0
stale verdicts in kp's map, and the slug appears in no fleet `registry-map.json`.
The subject is reachable only through the always-on rule, not through a judged
context. Nothing enters a `/conform --stale` queue.

## Saturation

Depth L2 (primary texts and tree, no measurement). Dry streak 0: this pass earned
conditions. Clocks: the legal paragraph should be re-read by 2027-01-01 (Colorado
effective date) and the label-effect and instruction-compliance claims, seen only as
snippets, are the standing reason to read the primaries before anything cites them.
