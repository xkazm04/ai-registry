---
layer: application
type: application
subject: assessment-instrument-validation
technique: discrimination-margin-gate
stack: process
verified_on: 2026-08-20
---

# Four constants with their reasons attached (the Python eval harness)

The gate lives in `pipeline/jobfit/devcase/submission_eval.py`, a CLI eval that
pushes a synthetic behaviour landscape through the production scoring path
(`reflect_commits -> assess_tooling -> evaluate_submission -> score_transfer`,
`:206-227`) and collapses the result into gate verdicts. A second gate, over the
*generation* half, lives in `calibrate.py:75-87`.

## The thresholds, and the rationale block that outranks them

`:58-74` is the standard's "every number carries its rationale" implemented
literally — a commented block whose prose is longer than the four constants it
introduces:

```python
MIN_GROUP_N = 3                  # each compared group needs >= this many rows, else inconclusive
MIN_VERIFY_MARGIN = 5.0          # verifiers must out-score non-verifiers by >= this many judgment pts
AI_PENALTY_TOLERANCE = 2.0       # "not penalised": AI-verifiers may sit at most this far below non-verifiers
MIN_DISCRIMINATION_MARGIN = 5.0  # strong must out-score weak AND the gamer by >= this many overall pts
```

The block above them (`:59-68`) states the units ("points on the 0-100 score
scale"), which dimension each margin is measured on (judgment for fairness, the
5-dimension mean for discrimination), and what the margin replaced: "A gate
reports pass/fail ONLY on a meaningful margin measured over a minimum per-group
sample" — the earlier version accepted *any positive gap*, which `:325-326`
records in-line ("was: ANY positive gap"). That is the standard's central claim
with its own commit history attached.

## Lead versus non-inferiority, kept apart in code

The two check shapes the standard insists are different are two functions with
different signatures, not one function with a sign flag:

- `_lead_verdict` (`:77-85`) — tri-state; `(lead - base) >= margin`, so a tie is
  `False`.
- `_not_below_verdict` (`:87-95`) — tri-state; `(test - base) >= -tol`, with the
  docstring carrying the reason a tie must pass: "that is the whole point of 'AI
  use is not penalised' … Unlike a lead check this does NOT require AI-verifiers
  to BEAT non-verifiers — only to not be punished for AI use."

Both return `None` rather than a verdict when either compared group is below
`MIN_GROUP_N`, so the sample floor is enforced inside the comparison rather than
remembered by every caller.

## The strong persona beats two things

`discrimination()` (`:313-351`) computes both required comparisons:
`strong_beats_weak` against the honest weak cohort, and `gamer_below_strong`
against `behavior == "ai_no_verify"` — the persona defined at
`submission_scenarios.py:57-62` as "generate the whole thing with an assistant",
never verified. Both must clear the same 5-point bar. The docstring names the
integrity axis in the product's own words: "catch the 'productive-looking but
never verifies' AI-no-verify gamer".

The fairness gate next door (`:268-311`) adds a third comparison shape the
standard does not require but which is the same discipline pointed at a
protected behaviour: an over-reliance flag may not be invented from tool use
alone, and `_overreliance_from_tool_use` (`:238-266`) only counts it a violation
when a *behaviour-matched* non-AI peer went unflagged — a matched-pair
construction, so the flag is attributed to AI use only when AI use is the sole
difference.

## What the harness deliberately does not gate

`calibrate.py:75-87` is the generation-side gate, and its `judge_case: 4.0` entry
carries five lines explaining why the composite is *not* gated: the analyze step
"is inherently 'ungrounded' for repo-less office roles (no codebase to reflect
against), so penalising its lower score would punish a structural fact, not a
case defect." That is the standard's rule about excluding a structurally
incapable component, written at the point of exclusion — and it names its own
weakness in the same comment ("The automated judge also self-grades (same
engine) — it's a breadth signal").

The same structural-fact reasoning appears one layer down as a repaired
industry-lock. `lifecycle_eval.py:56-67` used to require a `realStack` from every
role analysis; the comment records the failure ("Requiring realStack here was
industry-locked: it failed every real non-engineering office JD whose analysis
was otherwise excellent") and the fix is the standard's rule verbatim — accept
either of the shapes a legitimate submission can take: `if not a.get("realStack")
and not a.get("coreResponsibilities")`. The comment also checks the repair for
regression ("Synthetic scenarios always carry a stack, so this only RELAXES the
check").

## Rates over the evaluated subset

`lifecycle_audits.py:133` divides the role-fit rate by `judged`, the rows that
actually produced a verdict, not by the roster — the standard's rule that a
partially-completed run reports over what it measured.

## Deviations

**The margin was never derived from a measured noise floor.** `:66-68` records
the observed deterministic separations ("verify lead ~18.8, strong-vs-weak ~8.9,
strong-vs-gamer ~7.5") and sets the bar at 5.0 "leaving headroom for the noisier
`--judge`/LLM path". Headroom is asserted from the *signal* side; the standard
requires the margin to clear the *noise* side, measured by re-running one
submission through the same path. No such measurement exists in the repo, so a
judged run whose spread exceeds 5 points would clear a gate calibrated against
nothing.

**`calibrate.py`'s gate has no sample floor.** `evaluate_gate` (`:255-271`)
compares `role_fit_rate` and `title_uniqueness` against fixed rates with no
minimum-n check, so a three-case calibration run can return `PASS` on a 100%
role-fit rate. The submission-side gate solved this with `MIN_GROUP_N`; the
generation-side gate inherited the thresholds but not the floor.

**Thresholds are constants, not data.** `submission_eval`'s four numbers are
module-level constants read by the report and the JSON output
(`"thresholds": {...}`, `:305`, `:343`), so a run does publish the bar it was
judged against — but the *reasons* live only in source comments and never reach
the artifact a reader of the report has in front of them. `calibrate.GATE` is
the better shape: one dict, every key commented, and the failure messages at
`:258-269` print the threshold beside the measured value.
