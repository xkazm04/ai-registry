---
layer: golden-path
type: golden-path
subject: asset-class-poly-budgeting
status: forged
use_when: [commissioning geometry from a generative service, a mesh came back roughly twice the size you asked for, setting per-asset-class geometry budgets, deciding what a part of a split generation may spend]
techniques:
  - triangles-as-the-authored-unit
  - provider-face-limit-conversion
  - quad-trap-detection
  - budget-shapes-output-not-just-caps
  - part-split-budget-division
  - class-ceiling-vs-requested-budget
---

# Asset class poly budgeting

A geometry budget is a number that crosses at least three boundaries before anyone
can tell whether it was honoured: the authoring desk that decides it, the generator
that is asked to work inside it, and the measurement that reads the delivered mesh
back. Those three layers routinely count *different primitives* and all of them call
the primitive a "face". That is the subject. Not "how many polygons should a
character have" — that question has answers you can look up and they change with the
hardware. The durable craft is making one number survive three translations without
silently changing meaning, and being able to state afterwards whether the thing you
received is the thing you asked for.

The naive reading is that a budget is a ceiling: pick a limit per asset class, check
the delivered mesh against it, pass or fail. Every part of that is wrong in a
generative pipeline. The limit is not a ceiling but an instruction — the generator
spends what it is handed. The check against the class ceiling is not the check that
matters — a mesh can sit under its class ceiling while being double what *this* asset
was commissioned at. And a "pass" computed from a missing measurement is not a pass at
all.

## One number, three meanings

Here is the shape of the failure, laid out as the layers actually sit:

| Layer | What it says | What "face" means there |
| --- | --- | --- |
| The authoring preset | "this class gets 40k faces" | usually nothing stated at all — the unit is in someone's head |
| The generator's limit parameter | "emit at most N faces" | whatever topology was requested; in quad mode a face is a **quad** |
| The measurement tool | "this mesh has N faces" | triangles — loaders triangulate on import, so measurement is always in triangles |

Hand the same "15K" down that column and you commission fifteen thousand of one thing
and receive fifteen thousand of a thing that is twice as expensive. This is not a
thought experiment: a controlled retopology comparison commissioned a 15K budget,
received 15K *quads* — about 30K triangles — and caught it only at review, where the
lesson was recorded as four words, *I should have said triangles*. That is the entire
subject in one sentence, and it is an instance of
[a-number-carries-its-unit-and-basis](../../_laws.md#a-number-carries-its-unit-and-basis):
a quantity handed across a boundary without its unit is not information.

The doctrine that follows is short and non-negotiable:

1. **Fix one authored unit and put it in the name of the thing.** Triangles, because
   triangles are what a runtime actually pays for and what every measurement reports
   after load (triangles-as-the-authored-unit).
2. **Convert explicitly at the edge**, in the adapter that talks to the service, in a
   named function, floored not rounded up (provider-face-limit-conversion).
3. **Detect the specific corruption a mismatch produces.** A unit error has a
   signature — a ratio near two — and it must be attributed to the unit trap by name,
   not reported as generic overrun (quad-trap-detection).
4. **Grade delivered against requested**, and let a missing measurement or a missing
   request render as *unmeasured*, never as honoured
   (class-ceiling-vs-requested-budget).

## Why triangles and not vertices, quads, or "polys"

Quads are an authoring convenience: they subdivide cleanly, they deform predictably,
and a quad-dominant mesh is what a rigger wants to receive. None of that survives
import. Loaders triangulate; the rasteriser consumes triangles; a quad is two
triangles the moment anything renders it. "Polys" is worse than either, because it
means quads in one tool, triangles in the next, and n-gons counted as one in a third.

Vertex count is the better predictor of memory and of transform cost, and a mature
pipeline tracks it too. It is not a good *budget* unit, because it is not what the
authoring side controls or what the generative service exposes. The rule is: budget in
triangles, report vertices alongside, and never let a document contain a bare face
count with no unit attached.

## Virtualized geometry changes the argument, not the need

Modern renderers with virtualized geometry pipelines will happily draw source meshes
of millions of triangles, and this is repeatedly misread as the end of poly budgets.
It is not, for reasons that are all still live:

- **Not every mesh is eligible.** Skinned and deforming meshes, translucent materials,
  and anything driven by per-vertex position offsets fall outside the virtualized path
  on most engines or take a slower route through it. Characters — the largest budget
  in the table below — are exactly the eligible-last category.
- **Downstream consumers are not virtualized.** Collision, navigation, physics proxies,
  lightmapping, a lower-spec or preview target, and anything exported for a partner all
  read the source topology.
- **Disk, memory and build time are still paid.** A virtualized renderer amortises
  draw cost, not import cost, package size, or the hours a build spends processing.
- **The generator still needs the number.** This is the decisive one: even if the
  runtime could draw anything, the density parameter is what shapes what the generative
  service produces. A budget too large does not merely make a heavier mesh — it makes a
  *worse* one.

So the budget stops being a rendering constraint and becomes an authoring instruction.
That is a change of argument, not a removal.

## The budget is a target, not a ceiling to max out

[a-budget-shapes-the-output](../../_laws.md#a-budget-shapes-the-output) is unusually
literal in geometry. A generative model spends the density it is granted. Given more
than the subject can absorb, it does not leave the surplus unspent; it invents
geometry to fill it. The measured example that settles this concerns hair: at 1,500
quads the result was an unusable mess; at 3,000 the generator resolved individual
strands; at 6,000 it invented an entire head that had no business existing, because
the budget had nowhere legitimate to go. Non-monotonic, with the optimum in the
middle — which is the signature of an instruction, not of a cap.

The consequence for practice: a class budget is an *upper bound on what may ship*, and
a per-asset requested budget is a *separate decision made per asset*. A simple asset
should be commissioned well under its class ceiling. Handing every asset its class
maximum is a defect-generating policy, not a conservative one
(budget-shapes-output-not-just-caps).

## Per-class budgets, and what makes them defensible

Budgets are only meaningful with their basis stated: which camera distance, which
platform target, which pipeline stage. A defensible corpus looks like this — the shape
matters more than the specific numbers, which are for a mid-distance overhead action
camera on a current desktop/console target:

| Class | Requested target | Ship ceiling | Substantial parts allowed | Why |
| --- | --- | --- | --- | --- |
| Character (hero or named) | 40k tris | 60k | 24 | matched to the character pipeline's game-tier spec; the highest per-asset budget in the project |
| Environment piece / building | 60k tris | 90k | 40 | large silhouettes earn more; still bounded because generated buildings fragment |
| Weapon / held item | 15k tris | 22.5k | 6 | close to camera at times, small on screen mostly; silhouette plus normal detail carries it |
| Prop / interactable | 10k tris | 15k | 6 | placed many times per scene, and ships to non-virtualized consumers |
| Modular part / swap piece | 8k tris | 12k | 3 | assembled in multiples; the per-part budget must leave room for the whole |

Three things about that table are the actual craft. First, the **ceiling is above the
target** — roughly 1.5x — because the requested budget and the ship limit are
different questions. Second, each class carries **companion class-aware limits** in the
same record; a component count is the one that matters most, because an assembled
character legitimately has two dozen shells and a class-blind fragmentation rule fails
it for being what it is. (Judging those shells is the structural-scorecard concern, and
it belongs to the mesh-acceptance subject, not here — what belongs here is that the
budget record is where the class-aware numbers live together.) Third, each row carries
its **rationale in the same record as the number**, because a budget whose reasoning
lives in a document elsewhere is a budget nobody can revise correctly.

## Divide the whole, do not repeat the part

Generating a complex asset as separate parts is usually the better workflow — each
part keeps local detail that a single-shot generation smears. The budgeting mistake is
mechanical and near-universal: each part is commissioned at the *modular part* limit,
and nothing sums them. Eight parts at 8k is 64k against a 40k character budget, and
the modular limit's own rationale, which claimed to "leave headroom for the assembled
whole", was never anything more than a claim.

The rule: the budget for a part is **derived from the budget for the whole**, divided
by the part count, and applied only when the naive per-part budget would overrun — a
three-part split does not need to be squeezed to a third of a character
(part-split-budget-division).

## Grade what was delivered against what was requested

A class gate that compares a measurement to a class ceiling answers a different
question from the one the commissioner asked. Both are needed; only one of them can
detect a provider that ignored the request. The observed failure modes are large and
loud once you look for them: the ~2x quad mismatch, and a service that ignored a
low-poly request entirely and returned 150K against a low five-figure ask.

Grading therefore takes a tolerance, and the tolerance is chosen with an argument:
decimators and remeshers land *near* a target rather than exactly on it, so about 10%
of slack absorbs honest imprecision without absorbing the failures worth catching,
which are observed at 2x and 10x. Anything you cannot state a reason for is a magic
number and will be widened until it means nothing.

And the honesty rule governs the outcome. If the mesh was not measured, or no budget
was requested for it, the verdict is *unmeasured* with a reason —
[unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass). The subtler corollary,
learned the hard way: for a generator that accepts **no** budget parameter, do not
fabricate a request so the grader has something to compare against. A fabricated
request produces the sentence "the provider ignored your budget" about a budget nobody
ever sent. Such a generator is graded against the class ceiling only, and the fact that
no request existed is stated.

## Failure modes of the naive reading

- **The unit lives in a variable name and nowhere else.** A field called `faceLimit`
  with no declared unit is the origin of every incident in this document.
- **Converting in the caller's head.** The halving is done correctly by the person who
  knew about it, once, and then that code is copied to a second call site.
- **Rounding the conversion up.** Rounding up authorises a mesh past the budget it was
  derived from. Floor.
- **Reporting a 2x overrun as "over budget".** True and useless. Naming it as the unit
  trap turns a re-roll into a one-line fix.
- **Grading only against the class ceiling.** Silently accepts a prop delivered at
  three times its commissioned budget because props are allowed 15k.
- **Promoting an unknown asset class to a "typical" one.** Grading an unclassified mesh
  as if it were a prop fails an assembled character for having parts. Degrade to
  class-blind defaults if you must, but *report* the degradation instead of hiding it.
- **Believing the budget only caps.** Handing every asset its class maximum, then
  wondering why simple objects come back with invented detail.

## The lesson generalises past geometry

Nothing above is specific to triangles. Any budget that crosses a service boundary
needs the same three things: a **declared unit** fixed on the authoring side, an
**explicit conversion at the edge** where the far side counts differently, and a
**delivered-versus-requested grade** with a stated tolerance and an honest
*unmeasured*. A team budgeting texture memory in megabytes against a service that
thinks in resolution, animation keys against a service that thinks in seconds, or a
context budget in tokens against a service that thinks in characters, has this exact
problem, and the same failure signature: a clean ratio between what was asked and what
arrived, discovered late, at review.

Two neighbouring concerns are deliberately not covered here. Grading a generated output
as a finished piece, and routing between generative providers in general, are the
general generative-media practice; what this subject owns is the part of the budget an
engine's renderer will actually have to pay at runtime. Pinning which model tier
answers a request — a low-poly topology tier will answer a hero request if you ask for
"the newest" — is provider auditing. Retopology, unwrapping and baking, the structural
scorecard that judges floaters and shells, world scale at the import edge, and whether
to re-roll or repair a bad delivery each have their own subject.
