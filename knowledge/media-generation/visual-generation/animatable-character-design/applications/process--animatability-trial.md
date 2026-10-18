---
layer: application
type: application
subject: animatable-character-design
technique: animatability-trial
stack: process
status: forged
verified_on: 2026-10-18
use_when: [planning a drive trial for non-human character stills, reading a face-detector rejection as a route decision, choosing between a parametric rig a neural driver and a hybrid]
---

# Two non-human stills through three routes

Read on 2026-10-18 against the athena-portable tree and its spike worktree
`.claude/worktrees/spark-athena-avatar` (paths relative to the athena-portable
root). The owner picked two round-2 portraits, both 1024 x 1024 Leonardo
renders — B04 "The Fiber-Optic Owl" and D08 "The Origami Axiom" — and the
spike ran both through three animation tracks the same day: a parametric
WebGL rig (T1), neural talking-head models (T2), and a hybrid that plays
voice-predicted motion through the T1 rig (T4). n = 2 stills, 3 lines each,
one RTX 4090 box; not a population figure.

## Detection and mesh are separate verdicts

- `.claude/worktrees/spark-athena-avatar/spikes/avatar/t2-neural/README.md:92` "InsightFace box yes (score 0.77, threshold irrelevant); MediaPipe 478-mesh **no**"
- `.claude/worktrees/spark-athena-avatar/spikes/avatar/t2-neural/README.md:94` "InsightFace: no box at any threshold; MediaPipe: none"

The origami bust passed the box detector and failed the mesh stage, which
crashed the stock run; a neutral fallback for that one input (eye
conditioning from a human sample) made it usable "modest". That is the
technique's pipeline-side repair. The owl was never seen as a face at all.

## The look kept, the speech dropped

- `.claude/worktrees/spark-athena-avatar/spikes/avatar/t2-neural/README.md:93` "look kept perfectly but nearly static (mean frame difference 0.25 vs 1.40 for Ditto's face) and the mouth facet never moves"

A whole-frame model rendered D08 flawlessly and never drove its speaking
element. Only the frame-difference figure separated it from a pass — the
upward lesson folded into the technique's speech-drive probe.

## A rejection routed, it did not end

The parametric rig split both stills as light on black and drove them at
display rate with no face anywhere:

- `.claude/worktrees/spark-athena-avatar/spikes/avatar/t1-rig/README.md:93` "Prep reads the portrait as light."
- `.claude/worktrees/spark-athena-avatar/spikes/avatar/t1-rig/README.md:109` "fps p50 59.9 / p5 59.5-59.9, CPU 0.5-0.8 % of 16 cores, GPU process 128-130 MB"

The owl, undrivable by every neural route, was fully drivable by the rig.

## Drivable is not moving well — the owner's blinded verdict

The bench clips were shown to the owner on a page with the routes hidden
behind letters:

- `.spark/Spark/ideas/athena-avatar.md:230` "Blinded page ~/.athena-avatar/bench/compare.html (owl 2 entries, origami 3); letter map _blind.json."
- `.spark/Spark/ideas/athena-avatar.md:232` "T4 seems to have superior movement without being GPU demanding. T1 fails"
- `.spark/Spark/ideas/athena-avatar.md:233` "to move with origami. T2 seems to be comparable in origami but I don't like the resources usage. For"

Three findings the draft did not have: the parametric rig that drove both
stills still read as not moving on the rigid origami; the hybrid won on
motion; and the neural route that did drive D08 lost on running cost, not
on quality. The trial chose the route (rig plus hybrid motion), and the cost
column decided between two routes the owner judged comparable.

## Deviations

The trial ran on the two stills the owner had already chosen as art, not on
the whole shortlist, so beauty was decided before drivability was known — the
order the technique warns against. Both happened to survive, so nothing was
lost this time. And the hybrid's motion generation is not yet live or
light: the director's caveat records about 1.3 GB of graphics memory and at
least four seconds of latency per utterance
(`.spark/Spark/ideas/athena-avatar.md:236` "~1.3 GB VRAM, 4 s windows => >= 4 s latency) per utterance; not yet live or GPU-free.").
The owner's "without being GPU demanding" judged playback only; the cost
column for that route is incomplete.
