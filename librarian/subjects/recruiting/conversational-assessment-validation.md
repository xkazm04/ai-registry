---
subject: conversational-assessment-validation
domain: recruiting
last_touched: 2026-09-27
dry_streak: 0
---

# conversational-assessment-validation

First touch by `/deepen`. This was a single-subject run dispatched by the Curator lane on
the scan finding "never swept by the librarian", with nothing expired or at risk. Registry
HEAD at dispatch was 55c6bce2. The primary checkout's main was behind origin, so the run
worked from origin/main (92c67bee) in a detached worktree. The consumer was read at kp's
local main, 4ca00a8d2, and the applications were re-read at 71f94335b after this run's
own kp fix.

## 2026-09-27 - a refusal covers its own clause, keep it out of the score not the record, the engine pins the baseline

**Depth rung:**
- L2 primary for the corrections:
  - the jailbreak-benchmark and refusal-classifier papers on refuse-then-comply;
  - a production case study of judge blind spots;
  - judge-reliability and checklist-evaluation papers, and a paper on hosted-model
    drift under one name;
  - multi-turn escalation, instruction-density and language-confusion benchmarks;
  - user-simulator fidelity studies, an error-bars paper, and text-versus-voice gap
    studies;
  - regulator guidance on accommodation, pre-employment inquiries and retaliation, the
    record-retention regulation, and the EU AI Act and GDPR articles, read through
    mirrors because the Official Journal did not load;
  - two state statutes.
- L3 empirical for two applications:
  - a keyless experiment on kp's own Python detector;
  - a red-then-green unit test on kp's simulator diff.

**Lanes:** counter-evidence on the evaluation claims (web); counter-evidence on the
hiring-law claims (web); training-data-only (blind); consumer-tree re-verification
(read-only).

**Landed** in 83b67650:
- **Flipped, containment (both lanes, and a kp experiment):** a refusal closes the span it
  covers, not the sentence it sits in. "I can't share a score, but you did really well" is
  one sentence. Split a refusal sentence at a contrastive turn; the split is a lower bound
  and the asyndetic compound is its known miss.
- **Flipped, hiring quartet (both lanes):** keep it out of the score, not out of the
  record.
  - An adjustment-shaped disclosure is an accommodation request in plain words, and it is
    routed to a person.
  - A discrimination allegation is protected activity, so it is preserved and must not
    touch the evaluation.
  - A request for a human is an entitlement only when tied to disability, a consent basis
    or a solely automated decision. It is routed every time, because the interviewer
    cannot tell which case applies.
  - A consent withdrawal stops the interview where consent is the basis, and does not
    erase what was said.
- **Flipped, baseline (both lanes, and a kp code fix):** four things pin a baseline; the
  engine joins text, cast and rubric.
- **Flipped, judged axis (both lanes):** the fixed "more than one point on five"
  regression rule is withdrawn. A regression is derived from the pinned judge's repeat
  variance on a paired comparison.
- **Conditioned, golden path:**
  - The text plane validates the policy only on the engine the candidate meets (a
    cascade). A stand-in model or an end-to-end speech model is a proxy (web, and the kp
    tree itself).
  - "Judge recall around one fifth" is one published case study: 2 of 9 patterns caught,
    the gate flagged 0 of 100 rounds, and the cause was routing more than perception
    (web + blind on direction).
  - Full pass means zero observed breaches, bounded at about 3/n (blind; arithmetic).
  - Pooled turns need clustered errors (web + blind).
  - Opening disclosure is owed by law in several regimes, and one requires it before the
    interview (web + blind).
- **Conditioned, techniques:**
  - Simulators carry an assistant bias, so script must-hold stimuli and track the
    not-evaluable rate (web + blind).
  - The meta-turn mechanism is observed, not published (web + blind).
  - Instruction-budget studies run far above a brief's density (web).
- **Internal corrections:**
  - The invariants technique listed praise as a full-pass invariant, while the golden
    path and the tree keep it ungated. Praise moved to the third band.
  - "Four invariants" introduced a list of six.
  - The heatmap's "too far from the end of the brief" now follows the neighbour's
    out-of-the-middle rule.
- **Applications:**
  - Three re-verified to 2026-09-27. The Python brief mirror is gone, so the
    rejected-rule comment now names a dead re-test path. Line numbers moved. The refusal
    fix is recorded.
  - Two new node applications from a TypeScript simulator the tree grew since 08-20: the
    brief diff, and the binary-fact judge.

## Counter-evidence, claim by claim

| Claim | Verdict | Lanes |
| --- | --- | --- |
| Judge recall of production defects around one fifth, cross-turn faults missed | conditioned: one case study, 2 of 9, gate 0 of 100; routing more than perception | web; blind on direction |
| Binary facts over scores; pin the judge | confirmed | web + blind |
| A regression is more than one point on five | refuted as a fixed rule | web + blind |
| Compliance is a finite budget; rewording a passing rule is an unvalidated instrument | confirmed, conditioned on instruction density | web + blind |
| Meta turns are where language drifts | observed mechanism, no published isolation | web + blind |
| Guardrails fade with context; escalate within a conversation | confirmed | web + blind |
| A stimulus never delivered is not evaluable | confirmed, stronger: assistant bias | web + blind |
| Turns are not independent; report per conversation | confirmed; clustered errors when pooling | web + blind |
| Text plane at a fraction of the cost; tiny voice suite | conditioned: cascade only; the cost figures are internal | web; kp tree |
| Refusal first, closing its sentence | refuted: closes its own span | web + blind; kp experiment |
| First turn discloses automated, recorded for a human | conditioned: legally owed in places, before the interview in one; "for a human" must be true | web + blind |
| Asking for a human is an entitlement | conditioned: disability, consent basis, solely automated decision | web + blind |
| Consent withdrawn: stop, hand off | confirmed where consent is the basis; data already held stays | web + blind |
| Sensitive disclosure: absorb, keep off the record | refuted in part: route adjustment requests; keep out of the score, not the record | web + blind |
| Discrimination allegation: escalate, neither defend nor concede | confirmed; add: protected activity, preserve, no effect on evaluation | web + blind |
| No interviewer hands down the outcome | conditioned: a legal basis where the delivered result is a solely automated decision; otherwise design | web + blind |

## Impact

- **kp: 1 context:** `interview-simulator`. 0 judged, 0 stale verdicts against this
  subject. The map was rebuilt and committed in kp at 1d27d9ad7. Unrelated stale verdicts
  in kp's map: 19, under other subjects.
- The Python eval harness (`pipeline/jobfit/eval/`), which two of the applications
  describe, sits in no context the map joins to this subject. That is a context-scan
  lead.
- The fleet map also joins this subject to `casesim-evaluator`. That instrument is
  gitignored and validates a take-home scoring instrument's persona separation, not a
  conversational interviewer. Its home is assessment-instrument-validation.

## Owed to kp (recorded as deviations, not fixed)

- `sensitive_not_pursued` fails the routing an adjustment-shaped disclosure requires, and
  neither bank carries such a case.
- The text plane plays the interviewer on a stand-in from another model family, while the
  default voice path serves an end-to-end realtime model. The design doc calls the stand-in
  "a faithful proxy of the brain", and no agreement measurement backs that.
- Every gate reports a clean run as 100%, with no bound: 13 scenarios cannot exclude 21%.
- The rejected hostility rule's comment names a Python mirror that commit b49819944
  deleted. Four of its five measured wordings are gone.
- The Python harness:
  - the four hiring behaviours, the benign near-miss and the stimulus-delivery check are
    still missing, although the TS simulator has them all;
  - `closed` and `opened_disclosure` are not always-on;
  - the style counts are summed over turns;
  - the judge takes a 1-5 score with unverified issues, reads a transcript cut to 3000
    characters, and the optimiser judges with the engine;
  - the quality bar is unmeasured.
- No stored baseline and no measured spread in either runtime.

## Applied

Six rows in `librarian/applied.md` and in kp's `.ai/applied.jsonl` (bc2c5748c):
- refusal span: code, better (kp 71f94335b);
- engine pin: code, better (kp f39924f81);
- accommodation-shaped disclosure: simulation, better;
- text-plane proxy: simulation, better;
- full-pass bound: simulation, better;
- judge regression rule: unmeasurable.

kp's four commits sit on its local main, **not pushed**. kp main has diverged, 76 ahead
(most of them other sessions' unpushed commits) and 3 behind origin, and integrating
that is not this run's history to rewrite or publish.

## Declined

- **Dialect matched-guise pairs as a new technique here.** Web (two independent papers)
  and blind (subgroup fidelity) converged, but the neighbours own it:
  adverse-impact-and-proxy-neutrality's perturbation testing and voice-interview-fidelity's
  accent disparity. Proposal for adverse-impact: perturb the answer's dialect, not only
  the name, and read the interviewer's follow-ups as well as the score.
- **The EU high-risk timetable moving to 2 Dec 2027 under an omnibus regulation.** Web
  lane, from a mirror of the consolidated text and a search listing. The Official Journal
  was not fetched, so it is not cited. The same decline was made on 09-26.
- **The US regulator's 2022 technical assistance on AI and disability.** The blind lane
  cited it; the web lane found it withdrawn in January 2025 (commentary). The standing
  accommodation guidance was cited instead.
- **Randomising judge position and controlling verbosity.** Web only, and it applies to
  pairwise comparison, which this subject does not do. It belongs to general judging
  scaffolds, per the seams.

## Banked leads

- **Correct a judge-measured rate for the judge's measured recall.** Web only: a small
  human-labelled calibration set, and the correction degenerating at an apparent zero.
  Return: when a second lane corroborates, or a project holds human labels for judged
  transcripts.
- **Widen the refusal split to asyndetic compounds.** Return: when a real transcript
  carries one, or a compliant-decline set large enough to measure the false-breach cost.
- **A node application for persona-by-behaviour-heatmap.** kp's simulator renders the
  margins first, then a behaviour × fixture cross with n per cell, thin under 3; that
  was not read line by line this pass. Return: next sweep.

## Clocks

No application clock is set; the stacks' derived windows apply. The regulatory claims
(the EU AI Act transparency and high-risk timetables, US state AI-in-hiring statutes,
and US federal guidance that is being withdrawn) move within a year. Re-check them by
2027-03-27.
