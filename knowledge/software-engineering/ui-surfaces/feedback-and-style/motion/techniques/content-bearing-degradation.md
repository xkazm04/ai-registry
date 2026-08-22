---
layer: technique
type: technique
subject: motion
technique: content-bearing-degradation
status: forged
laws:
  - deletion-is-not-repair
  - failure-not-empty-success
shared_with: []
use_when: [deciding what a gesture renders when it will not play, a surface renders blank under reduced motion, a label still says live while its loop is stopped]
---

# Content-bearing degradation

Every motion system eventually grows a **degraded path**: the branch that
runs when a gesture is not going to play. Several conditions open it — the
reduced-motion preference, a loop the pause plane is holding, a surface that
never came into view, a capability verdict that this effect is too expensive
here, a page where the animation machinery was simply never started — and
whatever opened it, something still has to be on screen. This technique
answers the only question that matters about that branch: **may degrading a
gesture delete what the gesture was revealing?**

The naive reading answers yes, and it answers yes for a defensible reason.
The canonical example in every reduced-motion write-up is decorative — a
parallax field, a drifting shape, an ambient shimmer — and for those,
"render nothing" is exactly right. So the rule gets learned as *when motion
is off, skip the animation*, which is true where it was learned. Then it is
copied into a component whose animation was carrying the payload, and the
surface renders blank: an empty grid, a skeleton that never resolves, a
figure frozen at zero. The user who asked for less motion is handed less
information, which is not what they asked for, and it is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) at the
pixel layer — the artifact that exposed the content was removed instead of
the motion in it.

## The litmus

For every animated surface, ask one question: **if this gesture never plays,
is any information missing?**

Answer it against the sequence's *last* frame, not its first. A gesture is
**decorative** when its resting state already says everything — a shape that
floats carries nothing the still shape did not. A gesture is
**content-bearing** when the information exists only in frames the user has
not been shown yet: a headline typed out one character at a time, a figure
counted up from zero to its real value, a build-up that reveals a diagram
step by step, a sequence whose final panel is the answer. For those, the
animation is not decoration over the content; it is the *delivery mechanism*
for the content, and switching the mechanism off without replacing it drops
the payload.

The two classes get opposite degraded paths, and the split is the whole
technique:

- **Decorative degrades to absence.** Render nothing, or render the still
  form. There is nothing to preserve, and manufacturing a static substitute
  for an ambient effect is invention, not accommodation.
- **Content-bearing degrades to its resolved end state, immediately.** Not
  the first frame. Not a skeleton. Not nothing. The typed headline renders
  complete; the counted figure renders its real value; the built-up diagram
  renders assembled. The user reaches the same understanding, and reaches it
  sooner.

The three failure shapes are worth naming because they recur verbatim: a
value initialized to zero and animated to its target degrades into a
confident, wrong number; a progressive reveal degrades into a placeholder
that will never resolve, indistinguishable from a load that is still
pending; and a surface whose entire content is produced by a loop degrades
into an empty frame, indistinguishable from having no data. In all three
the degraded surface does not look broken. It looks *finished and empty*,
which is why these ship.

Two mechanics keep the resolved render honest. Where the end state is
*generated* rather than fetched — a surface whose content the loop would
have produced — the degraded render is built from a **deterministic seed**,
so every reader sees the same snapshot and a screenshot is reproducible; a
randomized stand-in turns one document's example into a different example
per load. And where the payload is a list revealed in sequence, the part
that actually costs the reader is not the travel but the **accumulated
stagger**: a twelve-item grid at a tenth of a second per item makes the last
item arrive more than a second after the first, and a reader who opted out
of motion is being made to wait for content that is already computed. The
resolved render collapses the stagger to zero and paints the whole set on
the first frame.

## Freeze on the most explanatory frame

Some content-bearing gestures have no end state, because they cycle. A
rotating demonstration, a stepping walkthrough, a sequence that loops back
to the start — there is no "final" frame to resolve to, so a degraded path
has to choose one. The default choice is frame zero, and frame zero is
almost always the emptiest frame in the cycle: the state before anything has
been demonstrated, which is exactly the frame that teaches least.

The rule: **a cycle degrades to its most explanatory frame, chosen
deliberately and named where the cycle is defined.** Whichever step of the
walkthrough carries the most meaning to someone who will see only one step
is the one the static render picks. This is a design decision with a right
answer per surface, not a default worth inheriting.

## The chrome must degrade with the loop

The corollary almost every implementation misses. A live surface is rarely
motion alone; it is motion plus **labels that describe the motion**. A badge
reading *live*, a caption reading *updating continuously*, a footer reading
*refreshes every few seconds*, a pulsing dot, a running counter of elapsed
time — each of those is a claim about a loop that is running.

When the loop is degraded off, those claims become false, and a false claim
is worse than a missing animation: the user is now waiting for updates that
will never arrive, and reading the frozen values as current. So **any label
asserting liveness is a function of whether the loop actually started**, and
resolves to the static truth when it did not — *snapshot*, *paused*,
*static view*, *example data*. Three properties make this hold:

- **Every repetition of the claim switches together.** Liveness copy is
  typically stated more than once on a surface — a header badge, a legend, a
  tooltip, an accessible description. All of them derive from the same
  answer, or one of them ships the old lie.
- **The switch is driven by the loop's real state, not by the preference.**
  The preference is one of several reasons a loop may not be running, and a
  label keyed to it alone still lies in every other case.
- **A stopped loop and an empty dataset are spelled differently.** This is
  [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
  on a rendered surface: a grid that is empty because nothing is streaming
  and a grid that is empty because there is nothing to stream look identical
  unless the degraded render says which, and the user's next action —
  wait, or leave — depends entirely on the difference.

## Replay and repeat controls take the instant path too

A surface offering *play again* has a second degraded path that is
routinely forgotten. Under degradation the control must not vanish and must
not do nothing; it re-resolves to the end state immediately. The user
pressed a button and something happened — the sequence ran, at zero
duration. A control that silently no-ops teaches the user the surface is
broken; a control that removes itself removes their ability to re-read the
content at all.

## When not to apply this

Do not manufacture a content-bearing story for a gesture that has none. A
decorative field of particles has no end state worth freezing, and inventing
a static rendering of one is work spent making the degraded path *busier*
than it needs to be, in service of a user who asked for calm. The litmus is
a question with two honest answers, and *decorative* is one of them.

Nor is this technique the place where capability is judged. Whether a device
can afford a given effect is a separate, measured question owned by the
adaptive-fidelity doctrine; this technique starts after that verdict, at the
moment something has decided a gesture will not play, and governs only what
the surface renders instead.

## Verifying it

The check is manual, cheap, and almost never automated correctly, because a
suite that asserts "no animation ran" passes on the blank render. The
verification is a *reading* test: enter each degraded state in turn — the
preference on, the loop stopped, the surface never scrolled into view — and
read each surface as someone who has never seen it move. Every number
present and correct, every headline complete, every sequence resolved, and
every liveness label telling the truth. What cannot be read in that pass was
being delivered by motion alone.
