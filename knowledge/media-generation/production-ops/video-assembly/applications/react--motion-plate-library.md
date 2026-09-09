---
layer: application
type: application
subject: video-assembly
technique: motion-plate-library
status: forged
stack: react
verified_on: 2026-09-09
verified_against: react@19.2
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A plate library that banks renders — what a typed neighbour proves

The version above is witnessed by the tree's own dependency pins, not by a
dispatch's guess; the surrounding framework is pinned in the same file one line
away, and the plates below were read at the commit those pins describe.

A studio that scripts, frames, scores and cuts a short film ships six motion
plates as presets. Each is a pair of files sitting side by side in the same
directory: a small specification object, and the clip it produced. The pair is
the technique's library discipline made literal, and reading which half carries
what turns out to say more about the built-versus-sampled boundary than the
plates themselves do.

## What the specification types, and what it leaves as prose

The spec object is not thin. It pins a seed, an output size in pixels and
frames, a frame rate, and the engine identifier that produced the clip. Those
four fields make the plate **reproducible**: re-running the record returns the
same frames, and the render is in that sense a derivation of something the
library actually holds.

The move is not among them. What the camera does arrives as one prose
sentence — a drift, a push, a hold — and it is the only field in the object
with no type at all. So the library reproduces its plates and cannot edit
them: there is no number for how far the drift travels or how long the push
takes, and asking for the same move a third slower is not a change to the
record, it is a fresh sample of everything the sentence did not pin.

The same split appears one layer up, in the authoring surface. A frame's
composition is typed to the decimal — every element and every text block
carries a percent box, four numbers, vector so it survives any output size —
and its motion carries a free-text string beside them. The tree is candid
about the consequence in its own comments: the motion field is *authored here,
rendered nowhere*, and the type that holds it says so twice. **The dimension
nobody typed is the dimension nobody can render**, and the studio discovered
that by building everything else.

## The paired arm

The measurable is the technique's own demand of a built blockout — that it
states every number, because a blockout is worth building precisely to leave
nothing to guess. Two predicates over the same six shipped plates, one
instrument, both arms asserted against a known positive and a known negative
before either was run:

| Arm | Predicate | Plates passing (n=6) |
|---|---|---|
| A | the studio's own: a clip is authored when its motion string is non-empty | 6 |
| B | the technique's: the motion states at least one magnitude — a distance, a duration, a speed, an angle | 0 |

Six of six against zero of six. Every plate in the library reads as authored by
the surface that counts them, and none of them records what its camera
actually did.

## What the seam refuted

The seam was chosen because it could falsify the reading, and it did falsify
the first version of it. The claim going in was that a prose plate cannot
reproduce its render. That is wrong here, and wrong for a reason worth keeping:
seed plus engine plus prose *is* a reproduction record, and this library has
all three. What a sampled plate cannot be is editable, and that is a different
property with a different failure mode — not a plate that will not come back,
but a plate that will only ever come back unchanged.

That correction is what the amendment now carries. It is also why the studio's
library is not yet the amortizing asset the technique describes: six plates
that can be replayed and not adjusted are six templates, and the second project
that wants the drift slower pays the authoring cost again.

## What this stack cannot show

Nothing in the tree renders motion, so no gate here can see a plate improve —
the verdict above is read from the predicate comparison, not from an output.
The instrument that would close it is a renderer for the motion channel, or a
typed move schema the existing spec validator could refuse violations of the
way it already refuses malformed composition. Until one exists, the authored
count is a count of non-empty strings, and it should be read as one.
