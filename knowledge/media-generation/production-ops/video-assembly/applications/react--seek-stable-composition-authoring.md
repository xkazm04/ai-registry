---
layer: application
type: application
subject: video-assembly
technique: seek-stable-composition-authoring
stack: react
status: forged
verified_on: 2026-09-16
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
---

# The same hazard outside a renderer: a replay that inherits its own reset

The witness is the project's package manifest, which resolves react at 19.2.8
and the animation library at 12.42.2; the measurement used the project's own
easing constant rather than a stand-in.

The technique was written from a video renderer that splits frames across
workers. The seam that proved it was a marketing page with no renderer, no
workers and no frames — which is the more useful result, because it shows the
rule is about **entry paths**, not about video.

An animated demo on a public marketing site shows a local business climbing
from rank #4 to rank #1, with two counters ticking alongside: an average rank
(4 → 1) and a visibility percentage (12 → 67). It has a Replay button. Replay
called a reset that *animated* both counters back to their idle figures over
400ms, then started the climb on the very next animation frame.

Two writers, and the second one starts while the first is moving. The climb
does not declare where it begins — it animates *to* a target from wherever the
value currently sits — so its starting point is whatever the reset had reached
one frame in. The first run, entering from a fresh mount, begins at the idle
figures. The replay, entering mid-reset, does not.

## What was measured

The project's animation engine was driven headlessly, with the project's own
easing constant rather than a stand-in, and the counters sampled at display
rounding — the number a viewer actually reads. Three arms, one variable: how
the value is returned to idle before the climb starts.

| Arm | Rank counter shows | Distance travelled | Visibility travelled |
| --- | --- | --- | --- |
| A — first run (fresh mount) | 4 → 1 | 3 (100%) | 55 (100%) |
| B — replay, as shipped | **2 → 1** | 1 (**33%**) | 22 (**40%**) |
| C — replay, endpoint set | 4 → 1 | 3 (100%) | 55 (100%) |

The easing is a strong ease-out, so a single frame of a 400ms return already
covers roughly a third of the distance — which is why the defect is large
rather than subtle. The demo exists to show a climb, and on every replay it
showed a third of one.

**Target**: the distance the counters travel on replay, against a first run.
**Floor**: every arm must still settle on the shipped endpoints — rank 1 and
67% — so the fix moves only the starting point. The floor held in all three
arms; without it, "the counter moves more" could have been bought by changing
what the demo claims.

## The fix, and why it is a flag rather than a replacement

Setting the values instead of animating them gives the second writer an
explicit start. But the same reset serves a standalone Reset button, where an
animated return is the correct behaviour and nothing follows it — so the
instant path is a parameter, taken only by replay.

One detail is worth recording because it is a trap the technique's shape
invites: the reset was wired to the button as a bare handler reference, so a
positional boolean flag would have received a click event and read as true,
making the button instant as a side effect of fixing replay. Taking an options
object avoids it; the call site was made explicit anyway.

Shipped to the project's default branch; typecheck and lint green; 17 lines
added, 5 removed.

## What the tree said that the source did not

The renderer's static checker looks for a relative value (`+=`) with a second
writer. This seam has a second writer and **no relative value anywhere** — the
climb animates to an absolute target. The hazard is not the relative syntax;
it is an *implicit start*, and animating to a target from the current value is
implicit in exactly the same way. A checker written to the renderer's rule
would pass this file.

That widens the technique's rule rather than confirming it: state both ends,
not merely avoid an operator. It also explains why the corpus's stochastic
order-independence work does not cover this case — there is no randomness
here at all, no draw and no seed, and the value is still a function of the
route.
