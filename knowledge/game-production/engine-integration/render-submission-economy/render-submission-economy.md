---
layer: golden-path
type: golden-path
subject: render-submission-economy
status: forged
use_when: [a frame on a constrained tile-based GPU misses its budget and the proposed fix is to cut effects or lower resolution, deciding what the render thread submits each frame and what it may keep, a frame-cost regression is traced to draw calls texture binds or per-frame uploads, declaring how much texture memory a game may hold resident on a small device]
techniques:
  - cost-per-effect-before-effect-count
  - batch-by-page-where-order-is-invisible
  - cull-before-submission
  - retain-what-did-not-change
  - spread-periodic-render-thread-bursts
  - residency-budget-checked-before-decode
  - prepare-off-the-render-thread-commit-on-it
---

# Render submission economy

A game aimed at a streaming stick, a phone or a standalone headset draws on a graphics
processor of the tile-based kind, behind a driver that charges real processor time for
every draw it is handed, every texture it is asked to switch to and every buffer it is
asked to fill again. The display fixes the frame interval and the device does not get
faster. When the frame misses, the cheapest-looking remedies are the visible ones: fewer
effects, fewer particles, a lower render scale. This subject is the craft that comes before
those remedies — lowering what each effect costs to submit, so that the whole feature set
fits the interval it has — and the rule that decides when the visible remedy is still
needed and who may take it.

The naive reading is that a frame is expensive because it shows too much. On this class of
device it is more often expensive because of how it asks for what it shows. The same
picture can be requested in twenty-six draws or in sixteen, with two texture switches per
car or with one per page, with the whole course resubmitted every frame or with the fifth
of it the camera can see, with a static line rebuilt from thousands of vertices each frame
or uploaded once and drawn from the graphics processor's own memory. None of those choices
is visible to a player. All of them are visible to the driver, and on a weak core the
driver is often the largest single consumer of the render thread.

## Three costs, three remedies

A frame on this hardware pays three different bills, and the first job is to know which one
is binding, because the remedies do not transfer between them.

**Submission** is processor time on the render thread: building vertices, issuing draws,
switching textures and other state, re-filling dynamic buffers, laying out text, and every
string or object the frame allocates along the way. It scales with the *number of requests*,
not with the number of pixels, and it is what batching, culling and retention lower. Vendor
guidance for this class is specific about where the price lies: less in the draw itself than
in the change of state between draws — a different texture, material or buffer — which is
why the page a sprite samples from matters more than how many sprites there are. The price is
highest on the older, driver-managed graphics interface most of these devices still run,
where the driver validates and translates state on every call; an explicit interface that
records command buffers lowers it without removing it.

**Fill** is the graphics processor's time per pixel: shading, blending, overdraw, bandwidth
to memory. On a tile-based processor the frame is split into small tiles that are shaded on
chip, and opaque surfaces hidden behind other opaque surfaces can be rejected before they
are shaded — but only when the hardware can prove they are hidden. Fragment discard and alpha
testing take that proof away on every design of this kind; blending forfeits it on some and
costs bandwidth on all, which is why the order vendors give is opaque first, then
alpha-tested, then blended. Fill is lowered by shading cheaper (the shader-budget subject's
ground), by drawing opaque layers as opaque, and by not covering the same pixel many times.
The opaque rule pays only where the layer underneath can be rejected too: an opaque layer
drawn over a full-screen layer that must stay blended leaves the hardware nothing hidden to
drop, and a device run is what says whether the rule paid at all.

**Residency** is memory: every texture page, render target and font atlas the game keeps on
the device, in a memory pool that the graphics processor shares with everything else the
process holds. It is not a per-frame cost at all, and it fails differently — not as a slow
frame but as an eviction, a failed allocation or a process the platform kills.

A profile that names the binding bill is worth more than any list of optimisations. A team
that batches draws on a frame bound by fill has made the code harder to read for nothing, and
a team that lowers resolution on a frame bound by submission has degraded the picture and
kept the stall.

## The picture is the invariant

Every technique in this subject changes how a frame is requested and must not change what it
shows. That is a strong constraint and it is the one that makes the work safe to do without
an art review each time: a batching pass, a cull and a retained mesh are each correct only if
the frame they produce is the frame the naive path produced, and the proof is concrete —
identical vertices from a retained buffer and from the immediate path, a culling margin that
exceeds the farthest point a draw can reach, a reorder that the overlap test proves invisible,
a screenshot comparison of the scenes the change touched. A pass that cannot prove the
picture is unchanged is not an optimisation; it is a visual change and is judged as one.

The same invariant applies to the simulation. A cull or a skipped rebuild is presentation
only and must have no path into what the game decides: an object that was not drawn still
collides, scores and counts
([every-effect-on-the-rules-is-visible](../../_laws.md#every-effect-on-the-rules-is-visible)).

## The order of moves

When a frame misses, the moves are taken in the order that preserves the most of what the
player sees per unit of time saved, and
[cost-per-effect-before-effect-count](./techniques/cost-per-effect-before-effect-count.md)
makes the order a rule. Remove work that draws nothing — duplicate decoration painted under
real art, objects off the stage
([cull-before-submission](./techniques/cull-before-submission.md)). Merge requests that the
driver would otherwise take separately
([batch-by-page-where-order-is-invisible](./techniques/batch-by-page-where-order-is-invisible.md)).
Stop rebuilding what did not change
([retain-what-did-not-change](./techniques/retain-what-did-not-change.md)). Stop letting a
periodic job land its whole cost on one frame
([spread-periodic-render-thread-bursts](./techniques/spread-periodic-render-thread-bursts.md)).
Keep one-off work — the first use of a level's derived data, the decode and check of a new
image — off the frame entirely: prepare it on one worker below the render thread before it is
needed, and let the render thread do only the upload and the swap
([prepare-off-the-render-thread-commit-on-it](./techniques/prepare-off-the-render-thread-commit-on-it.md)).
Only after those, and with the figure that shows they were not enough, does an effect, a
particle budget or a render scale become a candidate — and then it is a design decision
taken by whoever owns the look, not an optimisation taken by whoever owns the frame.

Residency runs alongside the order rather than inside it, because it is decided before the
first frame: a declared budget per allocation class, checked before an image is decoded, with
a fallback for whatever the budget refuses
([residency-budget-checked-before-decode](./techniques/residency-budget-checked-before-decode.md)).

## Measuring a submission change off the device

Submission changes can be developed on a desktop host because their effect is a count — draws,
texture switches, indices, sprites submitted, glyph quads laid out, bytes allocated per frame —
and a count of requests made for the same scenario at the same stage size is the same request
on any machine. Their *cost* is not. A desktop processor and a desktop driver price a draw
nothing like a streaming stick does, so milliseconds measured on the host are a statement about
the host. The performance-gating subject owns the rule that keeps the two apart; this subject
inherits it in one sentence: a submission change is reported with its counts from wherever it
was measured and with its device cost as unmeasured until a device run supplies it
([unmeasured-is-not-a-pass](../../_laws.md#unmeasured-is-not-a-pass)).

## Where this subject starts and stops

`shader-budget-authoring` owns what one material may cost to shade — sampler ceilings,
instruction deltas, a cheaper swap per feature — decided when the material is authored. This
subject owns what the frame costs to *request*: how many draws, binds and uploads the
renderer issues to put those materials on screen, decided in the renderer. The rule for picking
is whether the cost scales with pixels covered by one material, which is the shader's, or with
the number of things the frame asks for, which is here.

`sprite-and-atlas-production` owns the pages themselves — packing, margins, palettes, how
many pages a class may have. It produces the pages this subject batches by; the seam is that
which art shares a page decides how many texture switches a frame needs, so a page plan that
splits art always drawn together costs submissions forever. When the question is how to pack a
page, read the atlas subject; when it is how to draw from the pages that exist, read here.

`perf-regression-gating` decides whether a running build's cost rose and how a measured figure
may be compared; this subject is where the cost is lowered, and every figure it reports obeys
that subject's rules about basis and noise. `gameplay-runtime-patterns` owns the allocation and
lookup discipline of a simulation step; the render thread obeys the same discipline, and where a
render-side finding is a hidden allocation or a lookup by name, that technique already states the
rule. The device subject for streaming sticks owns the facts about the box; this subject owns
what to do with its graphics processor once the box is running the game.

## What also holds on standalone headsets

A standalone headset is the same class of target under a stricter clock: a tile-based mobile
graphics processor, a display refresh that fixes the frame interval with no variable-rate
escape, and two views per frame. The published platform guidance for such headsets fixes the
frame at the refresh — about fourteen, eleven or eight milliseconds at seventy-two, ninety or a
hundred and twenty hertz — and a frame that misses is not shown late; the application drops to
a new frame every other refresh. The same guidance names the change of state between draws, not
the draw, as the overhead, recommends atlased textures and draws sorted by material, places
texture memory in the same pool as every other allocation, and asks for culling before
submission. Its draw-call budgets per headset generation differ between its own pages by a factor
of two or more, so they are indicative ceilings, not limits to design against.

So the submission and residency rules here are written for that class, not for one box. The
evidence behind this subject's applications comes from a television stick only; no headset was
measured, and the transfer is a statement about the hardware class, supported by that guidance,
not a measured result. Two views per frame double the submission bill unless the platform's
multi-view path is used, which is the one place a headset changes the arithmetic rather than the
rules.

## Failure modes of the naive reading

- **Cutting what the player sees first.** Effects, particles and render scale are reduced
  while the frame still submits off-screen objects, rebuilds static geometry every frame and
  switches textures twice per car.
- **Reordering what overlaps.** A batching pass sorts by texture without proving that the
  reordered primitives cannot overlap, and a translucent sprite now draws under the one it used
  to cover.
- **A culling margin smaller than the draw.** The bound is the object's centre radius, not the
  farthest point its rotation, shadow offset or trail can reach, and things pop at the edge.
- **A cache with no invalidation story.** Retained geometry that is never rebuilt after the
  scene changes, or a text cache keyed on less than what changes the output.
- **The burst averaged away.** A job that runs every sixth frame is judged by its mean cost
  and lands whole on the frames that set the high percentile.
- **Laziness mistaken for removal.** A build deferred from startup to first use lands on the
  first frame that touches it, which is usually the first frame of play; moved to a network or
  input thread instead, it stalls that thread's own deadline.
- **A residency budget checked after the decode.** The oversized image is already in memory
  by the time the check refuses it.
- **A refusal with no fallback.** An over-budget or malformed asset disables a visual that the
  game needed, instead of drawing the procedural version it had before the art existed.
- **Host milliseconds reported as device time.** A desktop soak's frame cost offered as the
  device's, when only its counts transfer.
