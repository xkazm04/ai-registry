---
layer: application
type: application
subject: cinematic-language
technique: movement-motivation
status: forged
stack: react
verified_on: 2026-09-01
verified_against: react@19
refresh_by: 2027-03-01
applied: simulation
ab_verdict: unmeasurable
---

# One scene schema holding both channel regimes at once — a numeric layout field beside a prose motion field, September 2026

movement-motivation says the discriminator for whether prose may describe a
dimension is not the model and not the modality but a single question:
**does anything other than the prose set this channel?** The interesting
thing about that question is that it is usually asked about a whole
pipeline. This tree answers it **twice, oppositely, inside one type** — and
nobody designed it to.

## The structural fact

A narrated-video pipeline authors one `SceneSpec` per beat
(`app/_phases/frames/sceneSpec.ts`). Two of its fields are spatial
direction, and they are typed nothing alike.

`elements` — the arrows, bars, brackets, markers, rules and loops laid over
a plate — carry position as **numbers on a normalized field**, parsed and
clamped:

```ts
const clamp = (v: number) => Math.max(0, Math.min(100, v));
// ...
x: clamp(num(el.x, 10)),
```

`motion` — what the plate does over its duration — is in the same struct, on
the same beat, and is a **free string**. Its whole validation is three
refusals: too short to picture, asks the generated layer for glyphs, or
merely restates the subject. The file states what it deliberately does not
check:

> no verb whitelist, no duration, no easing vocabulary. Nothing has measured
> those, and a validator built on an impression rejects good direction with
> total confidence.

The reason the two fields diverge is not a taste call about spatial
vocabulary. It is executor ownership, and the tree says so in the
neighbouring type — `FrameClip`'s motion is "Authored here, rendered
nowhere", and the spec's own comment notes "Nothing renders this yet and the
surfaces say so." The overlay layer is the project's own vector renderer, so
an element's position is a number it will execute. Nothing executes a
motion, so a motion is a sentence for a generative layer to read.

**That is the law's discriminating question answered by structure rather than
by argument.** Same schema, same authoring pass, same author — one field got
numbers because something sets that channel, the other got prose because
nothing does. A tree cannot be built to prove this; it falls out of which
half had a renderer.

## Why the confirming half is the weaker half

The reading that would be wrong here is that this tree validates the
subject's "described effects, not numbers" framing by keeping motion in
prose. It does not. The prose motion field is correct in this tree **by
default, not by measurement** — the project has never had a competing
authority for that channel, so it has never had to make the prose go silent.
This is a confirming instance of the rule's easy half.

The boundary — the half where a typed camera path arrives and the prose must
withdraw from a dimension it used to own — is **unexercised here and cannot
be exercised**. `isAuthoredClip` gates on a non-empty motion string; there is
no path that consumes one. The tree therefore has nothing to say about
whether the withdrawal is done correctly, and an application claiming
otherwise would be reading the easy arm as evidence about the hard one.

## What was tested, and what the verdict is

A `simulation` over three real cases from this tree, walked under the golden
path as it read before this run (policy A) and with the channel scope clause
added to it (policy B):

1. **A developer deciding whether the subject governs this pipeline.** Under
   A, the golden path's unqualified "never numbers" is contradicted by the
   first spatial field they open, and the honest conclusion is that the
   subject describes prose-only pipelines and not this one — which would
   skip movement-motivation, the technique that most directly governs the
   motion field. Under B, the numbers are explained by the executor and the
   subject still applies. **B better.**
2. **The day `FrameClip.motion` gains a renderer.** The comments name this as
   intended future work. Under B the reader meets the withdrawal boundary
   before building the executor, which is when the decision is cheap; under A
   they meet it only if they read past the opening. **B better.**
3. **The identity-conditioning probe**, where a reference already *is* a
   typed input. Governed by character-identity-continuity, not this subject;
   the clause changes nothing. **No difference — recorded because two of
   three is the honest count, not three of three.**

**Verdict `unmeasurable`, and the falsifier is real**: movement-motivation's
own `use_when` already names "the generator takes a camera path or action
script alongside the prompt", so a developer searching rather than reading
top-down reaches the boundary without the clause. Cases 1 and 2 are claims
about routing, and no instrument in this tree can see a routing improvement.

The instrument that would settle it is not a better argument — it is an
executor. When the motion channel gains one, the question stops being
navigational and becomes checkable in code: does the prose field go silent
on the dimension the executor now owns, or do the two authorities ship
side by side and produce the compromise the technique predicts?

## What this realization cannot do

- It cannot test the inversion, per the above — it holds only the arm where
  prose is uncontested.
- It says nothing about camera motion as such. The motion field describes
  what a *plate* does; there is no camera in this pipeline's model of a
  frame, so the grammar's push-in/orbit/carriage distinctions have no
  surface here to land on.
- The numeric channel it does own is 2D overlay layout, not staging in
  depth. Occlusion, relative distance and anything a proxy render would
  carry are absent, so this tree is not evidence about geometry-conditioned
  generation in either direction.
