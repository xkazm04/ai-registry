---
layer: application
type: application
subject: concept-scene-parity
technique: refine-or-pivot-with-every-round-kept
stack: process
status: forged
verified_on: 2026-10-29
applied: simulation
ab_verdict: better
---

# Nineteen rounds with only one non-passing verdict, replayed under refine-or-pivot

mage-arena (public, github.com/xkazm04/mage-arena) ran a look push in which every judged round's only
non-passing outcome was "polish further". This replays three real cases from the record under policy A (the
loop as run) and policy B (a refine-or-pivot verdict plus a named current best). The tree was read at
`58a6183` on 2026-10-29.

## What the tree records

docs/concepts/GRAPHICS-PUSH-RETROSPECTIVE-2026-10-29.md:49 "phase. They then cycled through wood grain, plastic, cardboard and white smears across eight rounds and never"
docs/concepts/RETARGET-CHALK-SLATE-2026-10-28.md:412 "  - The ward was too thin. Judges reversed their S7 preference and asked for broad sheets."
docs/concepts/RETARGET-CHALK-SLATE-2026-10-28.md:421 "s7b 25.3 (the best, in the same set). The owner's own read is about 20/36. The 30/36 gate was not reached."

## Three cases, A against B

- **The hands.**
  - Under A, each round refined the same approach: generated textures and material tweaks on one hand
    mesh. Eight rounds produced one defect class in four forms.
  - Under B, the same defect class returning after the second refine is the pivot signal. The third round
    changes the route instead: a different hand technique, a person with the craft, or a different look.
  - **Prediction:** about five rounds of hand polish saved, and the capability question raised five rounds
    earlier.
  - **Falsifier:** a third refine round that had moved the hands' style score by more than the panel's
    spread.
- **The ward.**
  - Under A, a round changed the effect to answer one panel's preference. The next panel preferred what it
    had left, and the round was lost.
  - Under B, a refine that would reverse the previous round's gain goes to the owner instead of into the
    build.
  - **Prediction:** one round saved.
  - **Falsifier:** an owner's blind pick that agreed with the reversing panel.
- **The last round.**
  - Under A, the series ended on s8, which its own set scored below s7b.
  - Under B, s7b is the named current best, s8 is reverted as a regression, and the record ends on s7b.
  - **Prediction:** the final build is the higher one, by about one point in the same set.
  - **Falsifier:** s8 scoring above s7b in a second set.

## Verdict: better (simulation)

- **Target:** rounds spent on an element whose approach had reached its cap.
- **Floor:** the final build's score must not fall.

All three cases move the target. The floor holds, and in the third case it rises. This is a walk through
recorded cases, not a re-run: the project is decommissioned, and no gate can replay the rounds.

## Deviation

None in the tree. Return condition for a stronger mode: a revived project that records each round's verdict
as refine or pivot and its current-best pointer, so the policy can be measured on live rounds.
