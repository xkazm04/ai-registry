---
layer: application
type: application
subject: eval-harness
technique: contrast-before-adoption
stack: rust
verified_on: 2026-11-06
verified_against: rust@1.80
applied: blind-ab
ab_verdict: not-better
proof: ab-paired
---

# A one-click prompt improver with no test set (Rust)

The seam is a desktop agent app's prompt lab, witnessed at rust 1.80 by its manifest's
`rust-version`. A model writes a new prompt version from a scored lab run and saves it as
experimental. A separate call marks a version as production. That call moves only the tag:
writing the prompt onto the live agent is the job of the rollback path. Nothing in this seam
compares the new version with the old one, and an agent with no scenarios has no scored run
to start from.

## What was compared

A cold agent was asked to design a one-click improver for agents with no test scenarios and
no expected outputs: what runs, what the user sees, what decides keep or discard, what is
recorded. Arm A got the brief. Arm B got the brief and the technique. Two draws per arm, one
mid-tier model, read-only. The rubric was written first, with five checks taken from the
deliverable. A blind judge from another vendor family, shown no labels and allowed to read
the code, scored all four. It ran once.

| Check | A (2 draws) | B (2 draws) |
| --- | --- | --- |
| Same task under both prompts, keeping the current one is named | 2 | 2 |
| What the user sees says how little this shows | 2 | 2 |
| Run variation dealt with | 0 | 2 |
| Later runs told what the comparison did not show | 0 | 2 |
| Fit: the code as it behaves, no labelled set, runs costed | 1 | 0 |
| **Total of 10** | **5** | **8** |

## Why the verdict is not-better

The two checks the technique governs moved 0 of 4 to 4 of 4. The floor fell. Both B designs
adopt a version by calling the tag step, which leaves the live prompt untouched. Both A
designs read that correctly and routed adoption through the path that writes it. One A draw
lost the fit check on a different claim, so the judge's count understates the split on this
one defect. The technique's step list may have displaced the code read, but two draws cannot
say so. The rule is mechanical: a target that moved while the floor fell is not better.

No floor tolerance was declared in advance, so a drop of one check counts in full. The
rubric's checks also sit close to what the technique says, which favours arm B, and B's
draws echo its vocabulary, so the judge could tell the arms had differed even with labels
hidden. Neither point helps the floor.

The technique gained its "Read the seam" section from this result. No code changed. Return
when the seam gets an improver, or when a third draw per arm can separate the floor.
