---
layer: application
type: application
subject: frame-direction
technique: boundary-transition-class
stack: process
status: forged
verified_on: 2026-10-21
applied: simulation
ab_verdict: better
---

# Process: declaring the joins of a real 34-beat direction plan

The seam is the worked direction plan in `gravitone-gcloud`
(`pipeline/DIRECTOR-DIMENSION.md:281-321`, `main` at `9c3cdac8`). It gives
every beat of a real five-minute script a function, a "shows" column and a
thread operation, across 7 threads and 3 single-use metaphor threads. The
scene-spec contract the app enforces (`lib/frames/sceneSpec.ts`) has no field
for what persists between adjacent frames.

## The simulation

**A** derives each of the 34 boundaries (35 visual obligations, since b4
splits) from the thread column alone. A shared thread across the boundary
means carry or agent. A new or non-adjacent thread means refresh. **B**
declares the class directly, using the beat's own "shows" and notes columns.
The test was chosen to falsify: if thread operations already settle every
join, the technique adds nothing.

| | boundaries | A determines | A cannot say |
|---|---|---|---|
| count | 34 | 28 (17 refresh, 11 carry/agent) | 6 |

All six undetermined boundaries sit at hold beats or at subtraction:

- **b4b → b5, b5 → b6.** "So what went wrong?" / "Nothing went wrong. That
  is the problem." Both read "nothing new", thread "—". Holding b4b (the
  wishlist beside the falling line) under the thesis is a different film from
  clearing to near-empty. The plan's own note says only "do not compete".
- **b14 → b15.** The ETF movement close is a hold after a carried
  comparison.
- **b27 → b28.** TURN 4 is "a reveal by subtraction: strip the frame back".
  That is legible only as carry-minus from b27's annotated price line. Thread
  "—" reads as a refresh to nothing.
- **b31 → b32, b32 → b33.** A hold between two `PORTFOLIO` frames. Whether
  b33's "line settling into the bundle" is an agent boundary depends entirely
  on whether b32 kept the picture.

With the class declared, B settles all 34. On the 28 that A determines, the
two agree.

## What the turns did

Three of the four turns sit on owned threads, and the plan breaks those in
place rather than cutting away from them. TURN 1 (b10, `ETF-PIPE` change) and
TURN 3 (b26, `RESERVE` change) are agent boundaries. TURN 4 is the carried
subtraction above. Only TURN 2 (b19, the flywheel seizing) is a refresh at its
own boundary, because the metaphor beat b18 sits between the flywheel's
establish and its change. That is the technique's decision rule: refresh at a
turn only when the turn has no adjacent picture to break. It matches the
data-video corpus convention (refresh for "a new topic or an abrupt turn")
only for topic openings: b7, b8, b16, b25 and b29 are all refreshes.

Refreshes make up 17 of the 28 determined boundaries. The coded corpus
reports refresh in about half of all transitions. The plan is close to that
base rate, so the declaration is not pulling the cut toward continuity for
its own sake.

## Verdict and return condition

`better`, by simulation on one real plan. B resolves 6 of 34 boundaries (18%)
that the thread vocabulary leaves to the renderer's default. All six are hold
or subtraction beats, and they include the thesis sentence (b6) and TURN 4,
two beats where the plan's own note makes a prohibition the whole direction. No
project change was made. The scene-spec schema would need a per-scene
`transition` field (carry / agent / refresh) and a check that a carry or agent
boundary names an element present in the previous scene. Return when the app
renders a held or subtracted beat. Then compare the two readings of b5-b6
side by side.
