---
layer: application
type: application
subject: concept-scene-parity
technique: blind-panel-with-a-control-frame
stack: process
status: forged
verified_on: 2026-10-26
applied: experiment
ab_verdict: better
---

# A blind three-judge panel that re-based a ten-round trail

bp (public, github.com/xkazm04/bp) asked whether its VR light table could reach 40 of 45 on its
fifteen-element concept scorecard. The answer decided whether the project became a game. The
scorecard and its grader rule are in the tree, read at `6bc4f02` on 2026-10-26. The panels and
their marks were run in the build session and are not committed, which is this application's
deviation.

## The rule the tree states

docs/concepts/vr-light-table/art-breakdown.md:65 "is scored 0 to 3 by the owner, with a vision-model pre-score as advice only:"
docs/concepts/vr-light-table/art-breakdown.md:72 "Pass: no element below 2, and elements 1, 4, 7, 9, 10 and 11 at 3."

In practice, the sprint scored each round with model judges briefed on the project. Early rounds had one strict judge. Later rounds had three judges per frame, and their
mean was taken. The briefed trail, panel means
of 45, over 2026-10-24 and 2026-10-25:

14 (starting frame) -> 27 -> 30 -> 32 -> 36 -> 34 -> 33 -> 34 -> 37 -> 38.

## The blind panel (2026-10-25)

- Three fresh judges.
- No project context, no history and no goal.
- Only the concept and three anonymised frames: the current build on two products, and the
  starting frame as a control.
- Per-element marks from each judge.

| Frame | Judges | Blind mean | Briefed panel gave |
| --- | --- | --- | --- |
| current build, product 1 | 36, 33, 33 | 34 | 38 |
| current build, product 2 | 33, 30, 30 | 31 | 38 |
| starting frame (control) | 8, 11, 11 | 10 | 14 |

The control moved 4 points with no change to the scene. That is the briefing offset, and it
matches the current frame's drop on product 1. Product 2's larger drop also carries that
product's sparser furniture. All three judges named product 1's frame the closest.

## Verdict: better

- Target: a go or no-go total the owner can trust.
- Floor that must hold: the judges' ordering of the frames, with the control lowest for every
  judge. It held.

The blind panel moved the answer from "38, nearly there" to "34, not reached". The scene had moved
24 points on one scale. The owner's decision was made on the blind figure.

## Other instrument effects in the same series

- **Builders read high.** Builders' readings ran 3 to 7 above their panels. One builder read its
  round at 41, and the panel gave 36.
- **Judges spread about 2 points.** The per-frame spread across three independent judges was
  about 2 points each side of the mean, so several consecutive rounds (34, 33, 34) were inside the
  spread. They were a plateau, not a regression and a recovery.

## Deviation

The tree holds the scorecard and the first round's run note. It does not hold the panel
composition, the briefings, the per-judge marks or the blind audit. A later reader of the tree can
see the rule and not the instrument that applied it. The return condition for `reconciled`: the
project commits a run note per scored round with its panel, its briefing and its control score.
