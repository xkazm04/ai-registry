---
layer: golden-path
type: golden-path
subject: image-to-3d-input-gating
status: forged
use_when: [about to spend on image-to-3D generation, designing a rubric that judges a source image, reconstructions keep coming back malformed and nobody knows why, assembling reference images for a character or prop]
techniques:
  - single-subject-plain-background
  - canonical-pose-rule
  - score-defect-verdict-protocol
  - multi-view-master-reference
  - reference-role-tagging
  - text-is-never-geometry
---

# Image-to-3D input gating

An image-to-3D model does not interpret. It reproduces and amplifies whatever it is fed.
A shadow becomes a groove. A busy background becomes attached geometry. A closed silhouette
becomes a fused limb. Nothing downstream removes any of it: retopology preserves the shape,
retexturing preserves the shape, a human retexture pass preserves the shape, and a second
generation from the same source produces the same class of result because the defect is a
property of the input, not of the draw.

That is the whole economic argument, and it is worth stating in the crudest possible terms
before anything else. In a pipeline where every stage after generation costs money — the
reconstruction itself, the finishing pass, the rig, the retarget, the material author, the
engine import, the review — the input gate is the only check positioned *upstream of all of
it*. It costs one cheap vision call and a few seconds. It is also the check teams skip,
universally, for one reason: the input looks fine. It is a nice picture. Someone approved it
in a review. The rules that decide whether an image reconstructs are not the rules that
decide whether an image is good, and a picture can satisfy every aesthetic instinct a
human has while violating four of five reconstruction criteria at once.

So the subject is narrow and it is early: **before the paid stage, is this image
reconstructable, and if not, can it be prepared so that it is?** Both halves matter. A gate
that only rejects converts a cheap intervention into a bottleneck; a gate that only prepares
never learns what it cannot fix.

## The gate judges reconstructability, not quality

Hold this line hard, because everyone will push on it. The input gate is not an art
director: whether the concept is on-brief or the colour scheme is right are creative
judgments made by people, and they happen before or beside the gate, never inside it. The
gate answers a mechanical question with mechanical criteria — does this image give a
reconstruction enough unambiguous information to produce a coherent solid?

Two consequences. First, the criteria must be *checkable* — a rule an examiner can verify
against the stored image without knowing the brief. "The subject is fully within frame and
uncropped" is checkable; "the pose is dynamic and appealing" is not. Second, a pass from
this gate is never a quality claim, and any report it emits must say so, or by the third
week someone will be pasting input scores into a review deck as evidence that the asset is
good.

The paired judgment on the far side — grading the mesh that comes back — is a separate
subject with a separate rubric and separate defect classes. Input gating and output
acceptance are two ends of the same generation and are designed together: the input gate
prevents defects that no output gate can diagnose, and the output gate catches everything
the input could not predict. Neither substitutes for the other. Placement of gates ahead of
paid stages in general — which stage, which spend, what a placeholder is — is its own
concern too; what follows is only the part specific to a two-dimensional input feeding a
three-dimensional reconstruction.

## The five criteria, and why they are five

A rubric with three criteria under-specifies and a rubric with twelve is not answered
honestly by any judge, human or machine. The stable set for a reconstruction input is:

1. **Subject isolation** — one subject, cleanly separable from its background.
2. **Silhouette clarity** — the outline is unambiguous and limbs do not merge into the body
   or each other.
3. **Pose canonicality** — the subject is in a neutral, symmetric, self-occlusion-minimising
   stance, seen from a known angle.
4. **Lighting neutrality** — even, diffuse illumination; no strong directional shadow, no
   blown highlight, no coloured rim.
5. **Detail legibility** — resolution and focus sufficient that the features that must
   become geometry are actually resolved.

Each maps to a distinct reconstruction failure and each has a different remedy, which is
precisely why they stay separate and are scored separately. Isolation failures are usually
fixable by preparation. Pose failures are usually not — a source in a dynamic three-quarter
crouch cannot be un-posed by cropping. Lighting failures are sometimes fixable and always
worth flagging, because baked shadow is the defect that survives furthest into the pipeline
disguised as material.

The criteria are enforced by [single-subject-plain-background](techniques/single-subject-plain-background.md)
and [canonical-pose-rule](techniques/canonical-pose-rule.md), which carry the specific
thresholds and the preparation procedures.

## A defect's severity comes from what depends on it

This is the load-bearing idea of the whole subject and it generalises far past images.
Rank a defect not by how bad it looks but by **what downstream stage consumes the part it
damages**.

The clean demonstration comes from the sibling gate on motion input: fused feet are
disqualifying while blob hands are survivable — not because feet look worse, but because
foot contact drives root motion, so a fused foot corrupts every frame of locomotion, while
hands at that stage are replaced or hidden anyway. Same visual severity, opposite verdicts,
and the reason is entirely downstream.

Apply the same test to reconstruction inputs and the ranking falls out. For a character
that will be rigged, an occluded or merged limb junction is disqualifying — the skeleton
binds at exactly those junctions, and a fused shoulder produces a rig that cannot be fixed
without remodelling. A missing detail on the back of the head is survivable: nothing binds
to it, and the reconstruction will invent something plausible. For a face that will drive
expression, the eyes are disqualifying at the input stage — glow, heavy makeup, obscured
sclera or soft pupils produce eye geometry that no retexture repairs, and the face is the
one region a viewer inspects at close range. For a prop that will only be seen at
silhouette distance, most detail criteria drop to warnings and only isolation and
silhouette remain hard.

So the fail set is derived, not decreed. For each candidate defect ask: *is there a
downstream stage that resolves this as a matter of course?* If yes, it is a warning. If no,
and something later binds to the damaged region, it is a fail. Write the reason next to the
rule, because the rule looks arbitrary without it and someone will relax it.

## The output of a gate is a contract, not an opinion

A vision model asked "is this a good input?" returns paragraphs. Paragraphs are unusable as
a gate: they cannot be thresholded, they cannot be diffed between runs, they cannot be
counted, and they invite the reader to negotiate. The gate's response must be a fixed,
parseable shape — a number on a stated scale, an **enumerated** defect list drawn from a
closed vocabulary, and a verdict — with the threshold declared in the same place the
criteria are. The vocabulary is closed because the list exists to be *counted*, and free
text cannot be.

The band between the fail threshold and the pass threshold is not indecision, it is the
most valuable region in the rubric. Below the fail line, generation is refused. Above the
pass line, it proceeds. In between, the honest answer is *prepare it and re-gate*, and that
is where the preparation techniques earn their keep — most middle-band inputs are one
background removal or one crop away from passing. Naming the band explicitly is what
prevents the two failure modes at the edges: a single threshold set high rejects almost
everything and gets disabled within a week; set low it passes everything and is theatre.
The protocol, the scale, the closed defect vocabulary and the band are
[score-defect-verdict-protocol](techniques/score-defect-verdict-protocol.md).

Three constraints follow from the laws and are not negotiable. The gate is run by an
observer separate from whatever produced the image — a generator's own confidence that its
output is a good input is an input to the verdict, never the verdict. The scale is anchored
to what actually reconstructs successfully in production, not graded against the batch — a
rubric calibrated on the current pile of candidates drifts down with the pile. And a gate
reports **three** honest states, not two: it ran and produced a verdict, it could not run,
or the caller opted out. The last two are not passes and they are not failures either — a
gate that measured nothing cannot condemn an image any more than it can clear one. What it
can do is stamp the artifact as *submitted ungated*, permanently, so that no downstream
reader ever mistakes silence for approval.

## References are roles, not a pile

Once more than one image is involved, the naive model — "here are five pictures, please use
them" — degrades the result rather than improving it. Conflicting evidence about the same
surface makes reconstruction worse than one clean view, because the model averages what it
cannot reconcile.

The working model is that each reference plays a **declared role** — one supplies form,
another colour, another surface, exactly one supplies identity — and that the order they are
assembled in matters, because later references are read as refinements of earlier ones and
the last to speak on a property wins. Colour and material must be split: a single image asked
to do both teaches the reconstruction that a highlight is a colour. See
[reference-role-tagging](techniques/reference-role-tagging.md) for the role set and the
assembly discipline.

Where multiple genuine views of the same subject exist, they are worth more than any amount
of prompt effort, and they change what the gate is checking: consistency *across* the views
becomes a criterion in its own right, and the set is judged as a set.
[multi-view-master-reference](techniques/multi-view-master-reference.md) covers when to
demand views, how many, and what makes a view set self-contradictory. Composing prompts and
locking a visual style across generated images in general belongs to the neighbouring craft
of generative media; the part owned here is only what a *reconstruction* needs from the
images it is handed.

## Things that never become geometry

Some content in a source image is not merely hard to reconstruct — it is guaranteed to come
back as noise at any budget. Lettering, logos, insignia and interface text top the list:
they reconstruct as extruded, deformed, unreadable relief that costs polygons and always
needs manual removal. Transparent and refractive material, fine mesh, hair strands and thin
wires belong to the same family. The rule and the substitutions are
[text-is-never-geometry](techniques/text-is-never-geometry.md).

The reason to name this as a rule rather than let the gate catch it: it is a *briefing*
constraint, applied when the source image is being made or chosen, and by the time the gate
sees it the cheapest fix has already been missed.

## The failure modes of the naive reading

**"We will fix it in the mesh."** No stage downstream of reconstruction changes shape
topology in a way that recovers information the source never contained. Fixing a fused limb
means modelling it.

**"The image looks fine."** The most expensive sentence in the pipeline. Aesthetic quality
and reconstructability are close to uncorrelated; a hero concept render with dramatic rim
light, a stylised crouch and a painted environment is a beautiful image and a terrible
input.

**"The gate is slowing us down."** Measure it: gate latency and cost against the fully
loaded cost of the stages that run on a bad input. If the gate is genuinely the bottleneck,
the fix is a faster judge, not a disabled gate. Judge size is a measured selection, not a
default — a four-billion-parameter vision critic returning a structured verdict in about
three seconds on roughly nine gigabytes of accelerator memory has been shown to name real
reconstruction defects specifically, while the next size class up failed not on capability
but on being unable to share a runtime with the generator at all. Select the critic that
coexists with the thing it gates; a critic that forces its own environment can break the
generator it was added to protect.

**"There is a gate."** Check that something calls it. A gate function with no caller is the
most convincing failure mode in this whole subject: the code exists, it is tested, its
documentation claims a saving, and the paid path posts the raw image straight past it. The
gate is real only at the line that spends money, and the proof is that a fail there returns
an error instead of a job.

**"It scored 6, ship it."** The middle band means prepare and re-gate. A middle-band input
that is generated from anyway becomes an expensive mesh with a predictable defect and a
paper trail showing someone knew.

**"We gated the concept, so the character is fine."** The input gate and the output gate are
both required. A clean input raises the odds; it does not certify the result. Every
generation is still judged on what came back.
