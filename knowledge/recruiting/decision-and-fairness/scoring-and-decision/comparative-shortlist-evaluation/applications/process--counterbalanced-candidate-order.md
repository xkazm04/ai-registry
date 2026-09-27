---
layer: application
type: application
subject: comparative-shortlist-evaluation
technique: counterbalanced-candidate-order
stack: process
verified_on: 2026-09-27
applied: experiment
ab_verdict: unmeasurable
---

# The comparison narrator, and the order it reads candidates in (Python pipeline)

The group evaluation's narrative comes from one prompt in the Python pipeline
(`pipeline/jobfit/group_compare.py`). The Node run path spawns it with a JSON
context (`app/_lib/group-eval-run.ts:297-326`). It is the one place in the engine
where real candidate names reach a model side by side. The file says so itself,
and states its protected-attribute rule where the ranking is made (`:62-72`).

Read 2026-09-27 against the tree's main at `29430f170`.

## What is already right

- **The labels are identifiers.** The system prompt forbids inferring any
  protected attribute from a name or any other field, and forbids letting one
  shape the ranking, the wording or the risks raised (`:68-72`).
- **Candidate text is fenced as untrusted data** (`fenced_untrusted`, in the user
  prompt at `:115-120`).
- **Ungrounded points are dropped.** A generated point that cites a number or a
  name the facts do not carry is removed, not rephrased (`:331-372`).
- **A withheld salary arrives as `null`**, per the neighbouring application.

## Where it stands against the technique

- **The model is asked who leads.** The output contract's headline is "ONE
  sentence — who leads and the single clearest reason" (`:124`). That is step 1
  of the technique failed: the winner is the model's to pick.
- **It is not handed the claims.** The context carries role, band and per-
  candidate facts (`group-eval-run.ts:297-324`). It carries no separation, no
  robustness status, no bands and no cohort size. A lead the run marked
  `overlapping` can still be narrated as a clear win.
- **The order encodes the verdict.** Candidates go in score-sorted, fixed,
  unrecorded order (`:301`). No swap and no second run exist.
- **The deterministic twin crowns regardless.** The fallback headline says
  "<lead> leads N candidates … on overall fit", with "Advance <lead> first"
  (`group_compare.py:291-294`), whatever the separation. The modal shows the
  narrative *instead of* the summary (`group-eval-run.ts:725-727`), so the
  overlapping caveat survives only as a chip.

## Why no A/B verdict

Measuring the order effect here needs the narrator run twice per cohort, in
score order and reversed, over the tree's fixture cohorts. The comparison is on
which candidate the headline names and which dimension each key point credits.
That is model spend, and this run was unattended with no authorization to incur
it. The instrument is named for the next run. Hand the context the run's
`separation` and `robustness`, point the headline at them, and then check
agreement under reversal. The first two changes are this subject's standing
rule and cost nothing. They should land before any counterbalancing budget is
spent.
