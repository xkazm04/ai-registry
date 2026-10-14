---
layer: application
type: application
subject: assessment-instrument-validation
technique: synthetic-candidate-behaviour-landscape
stack: python
verified_on: 2026-10-14
verified_against: python@3.12
applied: code
ab_verdict: better
---

# A constructed cast that already was a landscape, and a report that named neither its instrument nor its cast (the dev-case submission eval)

`pipeline/jobfit/devcase/submission_scenarios.py` is a close match for the technique
and was chosen to test whether it was already conformant. It is: behaviours, not a
quality ladder (careful verifier, AI-then-verify, TDD, exploratory with reverts,
big-bang without verification, AI without verification as the named gamer), generated
deterministically by index so the cast is fixed rather than redrawn, run through the
real evaluation pipeline, with only the sound invariants asserted (strong beats weak
and the gamer by a margin; verification rewarded; AI use not penalised) and a written
COVERAGE note naming the branches the commit cast does not reach and the test that
does. The report also says when the judge is the generator.

## The gap

`submission_eval.py` rendered its report with no record of what it had judged. The
prompt versions of the evaluation, transfer and follow-up prompts live as constants
in `evaluate.py`; none reached the output. So a stored report could not be told from
one produced after a prompt bump, and the rates read in the same grammar as a
measurement over candidates. Two of the technique's rules (freeze the instrument
version with the result; label synthetic results as synthetic) had no code behind them.

## What changed

`instrument_stamp` binds `synthetic: true`, mode (llm or deterministic), the five
prompt versions the run exercised, the rubric dimensions and a hash of the cast ids
(so a regenerated or enriched cast reads as a cohort change, not an instrument change)
into both the markdown and the `--json` output, and the markdown opens with a
synthetic-cast banner stating what the rates do not claim.

| Arm | Report names instrument | Banner | Cast change distinguishable |
| --- | --- | --- | --- |
| A (before) | no | no | no |
| B (after) | yes, 5 prompt versions + mode | yes | yes (fingerprint) |

Gate held: 26 tests in the eval file and 80 across the three devcase suites, ruff
clean, pre-push gate green.

## What this does not establish

- It records versions; it does not enforce invalidation. Nothing yet refuses a
  stored report whose stamp differs from the current one, because no stored report
  is read back anywhere. If a caller starts caching these, the check belongs there.
- The cast still has no minimal-effort, delegator, instruction-optimiser or
  ambitious-failure persona under those names on the commit path; the observed path
  and the case-sim rounds (untracked, local) cover some of them. Whether the missing
  shapes would find a blind spot was not run.
