---
layer: golden-path
type: golden-path
subject: shader-budget-authoring
status: forged
use_when: [authoring a physically-based material against a renderer's limits, a material fails to compile with too many texture samplers, translating a plain-language surface description into shading features, choosing quality settings per hardware tier]
techniques:
  - sampler-hard-and-soft-caps
  - channel-packing
  - surface-to-shading-model-map
  - feature-cost-with-a-cheaper-swap
  - forbidden-feature-combinations
  - hardware-tier-lighting-presets
---

# Shader budget authoring

A material is the only artifact in a content pipeline that is simultaneously a picture
and a program. The picture is what a designer asked for — *wet cracked asphalt after
rain*, *worn brass with a green patina*. The program is what the renderer will execute
for every pixel that surface covers, several million times a frame, on hardware the
studio does not own. Shader budget authoring is the craft of holding both: producing
the surface that was described while staying inside limits that are real, hard, and in
one specific case absolute.

Most of the difficulty is that the limits are not one kind of thing. Some are
correctness boundaries — cross them and the material does not compile, or worse,
compiles with maps silently dropped. Some are economics boundaries — cross them and
everything still works, and you have spent an unreasonable share of a frame on one
surface. Treating those as the same number is the central error of the subject, and it
is why teams that track only the compile limit ship materials that work and are
unaffordable.

## Two ceilings, and only one of them announces itself

Texture samplers are the canonical example. A pixel shader can bind a bounded number
of sampler registers — sixteen is the long-standing ceiling on mainstream graphics
hardware, and it has not moved in a decade because it is silicon, not policy. That is
the **hard cap**. It is enforced by the compiler; past it the material is not a slow
material, it is not a material.

The **soft cap** sits below it — thirteen is a defensible working figure against a
sixteen-sampler ceiling — and nothing enforces it. It is the point at which the
material has consumed enough of the frame that the next surface authored to the same
standard will not fit alongside it. Passing the soft cap and stopping at the hard cap
means the author had three slots of runway left when the compiler finally objected, and
had no runway at all for the shared samplers the renderer itself binds behind their
back: light maps, shadow atlases, environment probes, a decal buffer. Those are charged
to the same sixteen. A material that reaches the hard cap alone has already failed in
any scene that lights it.

The shape transfers to every runtime budget in a game, so a tool that reports an overrun
must say *which kind* it found: past a hard cap the only move is to remove or pack, while
past a soft cap the move is a substitution and the material still ships if a producer
accepts the cost.

## A budget nobody can plan against is a wish

Adjacent runtime-cost disciplines in the same production already solved the reporting
half of this. The convention that works: **state the budget for a class, state the
share it is expected to consume, and state the headroom left over.** A per-class frame
budget of 0.8 ms at 60 Hz with a target peak of 0.48 ms — sixty percent consumed, forty
percent headroom — is a number two people can plan against; one of them can add a
surface and know whether it fits. A per-class budget stated as a bare ceiling produces a
scene where every asset is individually compliant and the frame is over, because nobody
ever owned the sum.

State *both halves* in the label, and say which is which. A headroom percentage on its
own inverts silently: the same figure reads as "sixty percent consumed" or "sixty
percent headroom" depending on who wrote it, both are plausible, and the mistake
survives review because neither number looks wrong. Write the sentence out — *peak
0.48 ms of a 0.8 ms class budget: 60% consumed, 40% headroom* — and the inversion has
nowhere to hide.

Sampler counts and shader instruction counts both need this treatment, and both need
their basis attached ([a-number-carries-its-unit-and-basis](../_laws.md#a-number-carries-its-unit-and-basis)).
"About 200 instructions" is not information; instruction counts vary by pass, by quality
tier, and by whether the estimate counted the lighting model, so two people quoting the
same material can be a factor of three apart and both be right. The strongest fix is to
stop quoting absolutes and quote a **ratio against a named baseline surface** — *2.5×
a plain opaque metal base shader* — because the reference is stated in the number, the
ratio survives a renderer upgrade that moves every absolute, and a threshold expressed
in it is checkable by anyone.

## From a sentence to a shading model

The input to this work is almost never a technical specification. It is a phrase. The
craft is a **stated mapping** from plain-language surface descriptions to shading
models and property ranges — skin and foliage force a subsurface path, a lens or a
liquid forces a transparent path, a mirror-bright surface forces a high metallic value
and a near-zero roughness — held in one place and read by the tool that estimates cost,
by the authoring surface that suggests a starting point, and by any analyser that grades
a finished material. Three copies drift, and the drift shows up as a material that was
costed as one thing and shipped as another
([one-authority-per-quantity](../_laws.md#one-authority-per-quantity)).

The mapping is also where a *forced* choice must be recorded as forced. A description
that means skin is subsurface whether or not the author wanted the cost, and recording
that as forced rather than as a default is what keeps the estimate honest downstream:
the expensive path was not chosen, it was implied by the request, and the conversation
to have is about the request.

## Cost is only useful next to a substitute

A cost model that answers "how much" gets consulted once. A cost model that answers
"how much, and here is the cheaper thing that buys most of the look" gets consulted
every time. This is the single highest-leverage design decision in the whole subject
and it costs nothing to adopt: **every feature's cost is stated together with a named
cheaper alternative and what that alternative gives up.**

The estimate behind such a table does not need to be accurate, and chasing accuracy is
the trap. It needs to be **directionally correct**: right about which feature dominates,
right about the order of magnitude, right about when to stop. A guardrail exists so that
an author hits a wall at the authoring desk rather than in a compile queue two weeks
later, and a rough number that arrives at the right moment beats a precise one that
arrives after the material is built. Precision in a pre-authoring estimate is also
faintly dishonest: it invites people to plan against a figure that was always a model.

Tessellated displacement buys a real silhouette, and its substitute is parallax, which
gives up the silhouette entirely because it moves texture lookups rather than vertices;
parallax in turn falls back to a plain normal map, which gives up depth at grazing
angles. Each hop is a decision an author can make alone in ten seconds. Without the
second half, the same author files a ticket and waits two days for a graphics programmer
to say the same thing.

## Some costs do not add

The naive cost model is a sum: a baseline per surface type, plus a delta per enabled
feature. It is right often enough to be dangerous. Two classes of pairing break it.

The first is **pipeline contention**: two features that want the same stage of the
pipeline, where enabling both is not expensive but incoherent. Displacement that moves
real vertices and parallax that fakes the same depth in texture space are the standard
example — the fake is computed against a surface that has already moved, so the result
is wrong, not slow. That is an error, not a cost, and the correct output of a cost tool
is a refusal to return a number
([refuse-rather-than-destroy](../_laws.md#refuse-rather-than-destroy)).

The second is **superlinear interaction**: features whose individual deltas are honest
but whose combination multiplies, usually because one adds per-pixel iterations and the
other adds work inside the loop. These never announce themselves. They surface as a
compile failure or as a cliff in measured frame time — never as the linear increase the
model predicted — which is exactly why the discovery rule is *measure the pair, do not
sum the parts*, and why a combination that has never been profiled together must be
labelled unmeasured rather than estimated
([unmeasured-is-not-a-pass](../_laws.md#unmeasured-is-not-a-pass)).

## Tiering is a global decision, not a per-material one

The instinct when a material is too expensive is to make that material cheaper on weak
hardware. Resist it. Per-material tiering multiplies the authoring surface by the
number of tiers and guarantees that the low tier is never looked at. The scalable axis
is the **global lighting and quality preset**: a small closed set of configurations,
one per hardware tier, each naming its global-illumination method, its trace quality,
its shadow and reflection settings, and each stating the tier it targets. The material
is authored once against the top preset, and the preset decides what the lower tiers
actually run.

Two rules make presets honest. First, presets are a closed set with one owner; a
project that lets individual levels invent their own has no tiering, it has variance.
Second, **the most expensive available mode is usually not a shipping mode.** Where a
renderer offers a reference-quality path — full path tracing, a maximum-quality
software trace — it belongs to cinematics and marketing capture, and the preset table
should say so in words, because otherwise someone will select it for a playable build
and the profiling data will be meaningless.

## The facts belong to a version, not to the prose

Every number here — the sampler ceiling, the instruction baselines, the feature deltas,
the preset list — is a property of one renderer at one version. Write them as literals
inside authoring guidance and they will be wrong after the next engine upgrade, and
wrong silently, because prose does not fail to compile. Hold them in a single versioned
statement of renderer facts, and derive both the guidance and the check from it
([law-and-check-share-one-source](../_laws.md#law-and-check-share-one-source)). The
upgrade then becomes one edit with a visible blast radius instead of a scavenger hunt
through documents nobody remembers contain numbers.

## Failure modes of the naive reading

- **Counting textures instead of samplers, and assuming the allowance is yours alone.**
  A renderer holds far more textures resident than one shader can sample; the scarce
  resource is the sampler register, only shared samplers relieve it, and the renderer's
  own bindings come out of the same allowance.
- **Reading a compile pass as a budget pass.** The material compiled, therefore it is
  within budget, is the reasoning that produces a scene of individually legal
  unaffordable surfaces.
- **Packing without recording the layout.** Three grayscale maps in one texture is free
  performance and a permanent coupling; a packing whose channel assignment and colour
  space are not written down corrupts silently the first time someone re-exports it.
- **Adding features to reach a look, then costing at the end.** The budget is an
  instruction about the target, not a gate at the exit
  ([a-budget-shapes-the-output](../_laws.md#a-budget-shapes-the-output)). An author
  told the ceiling up front produces a different, cheaper material than one told
  afterwards.

## What sits either side of this

This subject consumes what tiling and seam acceptance produces — the maps that pass a
seam check and the channels that can honestly be derived from a colour source — and it
owns only what the material does with them, including how they are packed. It hands off
to mesh finishing, where the high-to-low bake decides what the normal map even
contains. And it has a sibling in another medium: authoring a spatial audio scene is
the same discipline with voice counts and reverb sends in place of samplers and
instructions, and the parallel is worth holding, because the arguments a team has about
one are the arguments it is about to have about the other.
