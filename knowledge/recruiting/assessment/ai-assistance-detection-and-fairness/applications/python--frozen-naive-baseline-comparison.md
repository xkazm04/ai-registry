---
layer: application
type: application
subject: ai-assistance-detection-and-fairness
technique: frozen-naive-baseline-comparison
stack: python
status: forged
verified_on: 2026-10-14
verified_against: python@3.12
applied: code
ab_verdict: better
---

# A baseline distance that reads "original" because the ruler was clipped

The technique's last "when not to use it" clause says the comparison can break on its
own mechanics: baselines are generated under size budgets, and a compared region larger
than the budget makes every candidate look original. A hiring product that freezes one
naive model solution per case and diffs every submission against it was the place to
check whether that clause is guarded or only written down.

## What the tree does

Most of the technique is already in place. The baseline is generated once, at approval,
by a role simulation of a fully delegating candidate, not a strawman. It is frozen on the
case and stamped with a prompt version. The comparison is Jaccard over lines added
against the supplied seed, weighted by lines contributed per file, with the decision log
excluded by path. The number is rendered as plain text beside a sentence, never a meter,
and a missing baseline reports "not run". One difference stood out: the baseline's file
contents are clipped to the generation budget (6,000 characters) while a submitted file
has no such limit, and nothing in the comparison knew.

## The experiment (A vs B, code)

A is the shipped comparison. B drops a path from the comparison when the baseline's copy
sits at the budget and the submitted copy is longer, names it, and reports no signal when
nothing comparable is left. The seam was chosen because it could refute the technique's
claim that added-line overlap survives clipping: the repo's own test covers a clip that
drops seed lines, not one that drops additions.

| Case | A | B |
| --- | --- | --- |
| pure delegator, output within the budget | 1.0 | 1.0 |
| pure delegator, same model output 25,760 characters, baseline clipped at 6,000 | 0.144 | unavailable, path named |
| a candidate's own work, same size | 0.0 | unavailable |
| in-budget file beside an over-budget one | 1.0 | 1.0, over-budget path named |

Target: a pure delegator must not read as original because of file size. Floor: the
in-budget cases and the existing 23 evaluation tests must not move. Both held. **Verdict:
better.** The 0.144 sat below the 0.85 line that aims the authorship interview, so the
largest delegated submissions were the ones the instrument silently stopped flagging.

## Where it stands

Shipped as a guard in the comparison, with two unit tests. Not changed: only one
baseline per case is generated, where the technique prefers a small family. Falsifier:
a case whose seed files are far below the budget and whose baseline is still clipped,
which the guard would not catch because it keys on the baseline sitting at the cap.
