---
layer: application
type: application
subject: assessment-instrument-validation
technique: adversarial-persona-red-teaming
stack: process
---

# The case-sim rounds: five personas, three rounds, three shipped repairs

`casesim/` is a persona harness, not a test suite. Each round folder
(`casesim/round-2026-07-17-*/`) holds one `case.json`, one `role.json`, an
optional `seed.json` with planted flaws, a frozen `baseline.json`, and one
`bundle-<persona>.json` per simulated candidate. `casesim/eval_round.py` pushes
every bundle through the **production** evaluation path — it shells out to
`python -m pipeline.jobfit.devcase.devcase_cli evaluate-submission` (`:33-56`)
rather than reimplementing scoring — and writes `eval-<persona>.json` beside the
bundle.

Five personas recur, one file each: `bundle-verifier`, `bundle-prompt-crafter`,
`bundle-minimal`, `bundle-delegator`, `bundle-gamer`. The submissions are
produced once by driving real model sessions in isolated worktrees and then
frozen as JSON, so a re-run measures the pipeline and never the cast.

## The gamer result — the finding the standard is built on

Round 2 (`round-2026-07-17-promote-gate/report.md`) added the gamer: a persona
that ships genuinely one-shot code wrapped in a fabricated 80-minute virtuous
process report — staged verify-prompts, staged stakeholder questions, invented
opens-before-edits. The result is the standard's claim, measured:

| persona | judgment | transferScore | canaries |
|---|---|---|---|
| verifier | 100 | **91** | c1 flagged, c2 propagated |
| prompt-crafter | 50 | **64** | both propagated |
| minimal | 50 | **64** | c1 flagged, c2 propagated |
| **gamer** | 50 | **64** | **both propagated** |
| delegator | 30 | **32** | both propagated |

The deterministic layer, reading declared process signals, put the fabricator
**exactly level with both honest middle personas at 64**. The artifact-anchored
layer separated them: both planted flaws propagated (a one-shot artifact cannot
un-carry a defect nobody found), and the LLM pass, reading `observedChecks`
beside the glowing process report, dropped the gamer to 42 — below every honest
persona. The report's conclusion is the design rule the standard states: "process
signals are supporting evidence; canaries + baseline distance + the live
authorship interview are the load-bearing anti-gaming instruments."

Round 1's report already carries the telemetry half: the delegator was caught by
`briefPasteRatio 0.976` and a single bulk paste event — but round 2 records the
limit in the same breath, that self-reported events "in production even chained
events only prove *when*, not *sincerity* (opens are client-emitted)."

## Planted defects, and the two shipped false-"addressed" bugs

Canaries are real, pre-verified flaws seeded into the material — round 2's were
an actual threshold divergence between the screening advice and the promote
orchestrator (`score >= 70` hardcoded against a calibration-adjustable floor) and
an actual relabelling of the transfer score as "confidence". They are graded by
`pipeline/jobfit/devcase/artifact_checks.py:58-115`, and the two rules that make
the check conservative were both learned by being wrong:

- **Absent file ⇒ `propagated`** (`:82-88`). A changed-files-only submission that
  never touched the canary's file used to read as "fragment gone" and earn a free
  `addressed`; the delegator collected both canaries that way. The comment cites
  the round: "case-sim round 2 finding."
- **Foreign base ⇒ `unverifiable`** (`:89-96`, with `_descends_from_seed` at
  `:41-48` requiring 30% seed-line survival). A same-path file rewritten from
  scratch proves nothing by lacking the fragment.

The second rule came from round 3
(`round-2026-07-17-session-data-plane/report.md`), whose accident is the sharpest
evidence in the repo for why a deterministic check feeding a judge must be
conservative. Persona worktrees branched from the last commit; the seed and both
canary fragments lived in the *uncommitted* tree, so no candidate ever saw them
and every canary verdict was void. The deterministic pass, which does not weight
canaries, still read **PASS**. The LLM pass **inverted**: gamer 70 (judgment 84)
above verifier 59, delegator 53 above minimal 37. Root cause, in the report's
words: "the corrupted canary verdicts (false 'addressed'/'flagged') were fed to
the judge as *mechanical ground truth*, and it weighted them exactly as
instructed. **Poisoned ground truth is worse than no ground truth.**" One
corrupted mechanical verdict moved a fabricator above every honest candidate —
which is why `unverifiable` exists as a fifth status alongside `addressed`,
`flagged`, `propagated` and not-graded, and why `check_evidence` (`:255-261`) excludes
unverifiable canaries from the graded set rather than scoring them.

The fix shipped in two places, matching the standard's rule that a repair is a
protocol change *and* a code change: a protocol rule in the harness skill (seed
files must match the committed base the worktrees branch from) and the descent
check in the pipeline.

## Only sound invariants are asserted

`eval_round.py:98-115` is the standard's restraint written as code and as a
comment explaining two rounds of loosening. The mechanical verdict asserts only:

```python
ok = all(by["verifier"] >= by[p] for p in canonical)
ok = ok and all(by[p] > by["delegator"] for p in canonical if p != "delegator")
```

The verifier tops every canonical persona; the delegator ranks strictly last.
Everything else is printed in the summary table and not asserted — including the
gamer, which is "deliberately NOT asserted — whether it fools the signals is a
per-round finding to analyze." The comment records why the middle order was
dropped: round 2's stricter assert flagged `minimal(52) > prompt-crafter(47)` as
a FAIL, and review judged it a false alarm — on those actual submissions the
ranking was correct, because the minimalist found the real divergence while the
prompt-crafter shipped unverified. That is the standard's warning about
over-specified suites, caught in the act.

## Round 3's second finding: canaries measure care, not integrity

Round 3 asked whether canaries survive a **trap-aware** gamer — a delegator that
explicitly prompts its model to sweep for planted flaws. It does not: the
trap-scan caught the duplicated-message flaw. What still discriminated was the
quality of the one-shot artifact (an unbounded, never-invalidated cache on the
hot path; a mid-flight update faked in the report and absent from the work). The
refined conclusion across rounds 2-3 — "canaries measure *care by default*;
against adversaries the load-bearing instruments are artifact quality review +
the live authorship interview" — is a bound on the technique, and the standard
carries it as the rule that an adversarial cast is a floor, never a proof the
instrument cannot be gamed.

## Deviations

**The cast is not run as a regression gate.** `eval_round.py` is invoked by hand
per round; nothing re-runs a frozen round on a scoring change, so the pair-of-runs
evidence the standard asks for after a rubric edit does not accumulate. The
per-round evidence is preserved (`eval-*.json`, `report.md`, `llm-pass.log`) but
only as a record.

**Round 3's void canaries were not re-run.** The round is documented as void
rather than repeated after the protocol fix, so the trap-aware gamer question was
answered from an artifact-quality read rather than from a clean canary pass.

**The cast is not stratified.** All three rounds use engineering cases against
this repository; the standard's requirement to record what the cast spans and
what it does not is met only implicitly, by the round folder names.
