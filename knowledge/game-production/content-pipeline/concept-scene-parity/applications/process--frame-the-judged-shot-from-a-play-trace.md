---
layer: application
type: application
subject: concept-scene-parity
technique: frame-the-judged-shot-from-a-play-trace
stack: process
status: forged
verified_on: 2026-10-29
applied: experiment
ab_verdict: better
---

# A replay trace that moved the opponent from 16 m to 7 m

mage-arena (public, github.com/xkazm04/mage-arena) judged its opponent for most of a look push at 16 m: the
concept's framing and the opponent's spawn. Late in the push, a builder replayed two seated duels with an
opt-in trace and summarised where the opponent actually was. Read at `0dc4a18` on 2026-10-29.

## What the tree records

docs/archive/graphics-push-2026-10/notes/SPRITE-COVERAGE.md:14 "- He **moves 81 % of the time**, about 4.5 m/s, strafing and closing. There is no locomotion clip, so the card slides."
docs/archive/graphics-push-2026-10/notes/SPRITE-COVERAGE.md:15 "- He fights at **3.5-8 m, median 6.9 m**, not at the 16 m of the S30 shot (16 m is his spawn). At 7 m a flat card is"
docs/concepts/GRAPHICS-PUSH-RETROSPECTIVE-2026-10-29.md:85 "### 5. We judged at a framing the game never shows"

## What changed

- The judged set gained 7 m and 4 m shots and a 4 m stereo pair.
- At 4 m the panels found the card upscaled and soft. Two of three judges called its flatness a presence
  break, which the 16 m shot had hidden.
- A later state count from the same trace showed the opponent spent 93 % of its moving time in casting or
  hit states that outranked the walk clip, so the card would slide.

## Verdict: better

The trace changed what was judged and exposed two route-level costs (resolution at play distance, and
sliding) that the concept framing could not show. It took about an hour.

## Deviation

The trace was taken after the route was chosen, not before. The return condition: run it before the first
look round of any future character route.
