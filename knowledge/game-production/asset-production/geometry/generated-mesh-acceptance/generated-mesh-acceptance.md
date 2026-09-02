---
layer: golden-path
type: golden-path
subject: generated-mesh-acceptance
status: forged
use_when: [deciding whether a generated mesh may enter the engine, designing an automated geometry gate, a gate is rejecting everything or passing everything, routing a rejected mesh to repair or re-generation]
techniques:
  - structural-scorecard
  - floater-vs-part-face-share-rule
  - defect-code-taxonomy-not-prose
  - stage-declared-grading
  - unmeasured-is-not-pass
  - face-rig-shell-readiness
---

# Generated mesh acceptance

A generative model hands you geometry. Some of it is usable, some of it is debris that
looks fine in a turntable preview and destroys a build three stages later. This subject
is the decision made **without a human in the loop**: may this mesh enter the engine at
all, and if not, what should happen to it instead.

It is a narrow decision on purpose. The gate answers *can this be imported, rigged and
rendered without breaking something downstream*. It does not answer *is this the right
character*, *does this read at silhouette distance*, or *does it look good* — those are
perceptual judgments, they need rendered pixels and a critic that can see, and treating a
clean structural card as an answer to them is the single most expensive mistake available
here. Grading a generated output as a finished creative piece is a general concern of
generative media and lives outside this bundle; what follows is only the engine-readiness
half.

## Structural acceptance is necessary and never sufficient

State this at the top of every report the gate emits, because otherwise the number gets
read as a quality score by everyone downstream. A mesh that is watertight, correctly
wound, free of degenerate faces, within its face budget and at the right world scale can
still be a formless blob. Every one of those properties is about whether the data is
*well-formed*, and well-formed geometry of the wrong shape is still the wrong shape.

The practical consequence is architectural, not rhetorical: the structural gate is the
**cheap first tier**, and it must be designed so a perceptual tier can stack on top of it
without renegotiating the contract. That means the structural card carries a verdict about
structure only, labelled as such, and a perceptual verdict — a critic looking at a fixed
multi-view render, judged for content match and geometric plausibility — arrives as a
separate card with its own basis. The current published practice for such critics is a
fixed camera rig, two independent judge families, and discarding verdicts that flip when
the presentation order is reversed. That is a different subject; the point here is that
your structural card must never be the thing that gets promoted into a quality claim
because nothing else was available.

## The mesh is the wrong shape of thing to judge with one number

The first instinct is a score: run the metrics, weight them, emit 0–100, threshold it.
This fails immediately and for a specific reason — the properties being measured have
*different remedies*, and a scalar erases which one you have. A mesh that is 40× over its
face budget needs a finishing pass. A mesh returned empty needs a fresh generation. A mesh
covered in disconnected specks needs neither: finishing does not remove them, and
re-generating produces the same class of result because it is a property of the stage, not
of the draw.

So the card's primary payload is a **list of findings**, each one naming a defect class,
each carrying a severity. The aggregate score exists for sorting and for dashboards, and
it is derived from the findings rather than the other way round. A defensible default: a
fail costs a large fixed amount, a warn a smaller one, floor at zero — the number then
means "how many things, how badly", which is all a scalar can honestly mean here. The
procedure and the threshold set are [structural-scorecard](./techniques/structural-scorecard.md).

## Fail and warn are different claims, and the split is not about severity

The tempting reading is that a fail is a big problem and a warn a small one. The useful
reading is different: **a fail means the mesh cannot proceed; a warn means it can proceed
and someone must be told.** Face count is the canonical warn. A wildly dense mesh is not
broken — it is *unfinished*, and the finishing stage exists precisely to fix it, so
failing on it means failing every mesh for being at the stage it is at. Meanwhile a
shattered component structure is a fail even though each individual speck is tiny,
because no downstream stage removes it and importing it drags the debris all the way to
runtime.

Build the fail set from that test and no other: *is there a downstream step that resolves
this as a matter of course?* If yes, it is a warn. If no, and the defect breaks import,
rigging, or rendering, it is a fail.

## An assembled asset is not a shattered one, and a count cannot tell them apart

This is the load-bearing distinction of the whole subject, and nearly every first-draft
gate gets it wrong.

A correct production character is **assembled, not welded**: head, lashes, brows, layered
eyes, an interior mouth carrying teeth and tongue, body, hands, hair, cape, accessories.
Every one of those is its own connected component, and that is not a defect — it is the
prerequisite for expression rigging and for modular swap slots. A gate that fails on
"too many connected components" rejects correct characters and accepts nothing that a
character artist would recognise as a character.

But a shattered generation *also* has many components. The naive count conflates two
completely different populations into one number. The fix generalises far beyond meshes:
**when one count conflates two populations, replace the count with a distribution over a
normalised share.** Measure each component's share of the total face budget. Substantial
components are parts; components below a small share floor are specks. Now the same
histogram yields two independent measurements — how many parts, how much debris — which
are two separate defects that a single count reported as one. Measured on real generated
character output, 375 components resolved to 61 substantial parts plus 314 specks holding
36% of the face budget: two problems, and the count reported neither. The rule, its
threshold, its minimum-absolute-size guard and its behaviour on truncated histograms is
[floater-vs-part-face-share-rule](./techniques/floater-vs-part-face-share-rule.md).

The same shell structure has a second consequence that catches tools by surprise: an
operator that selects "interior faces" by counting how many faces share each edge only
finds **welded** interior. A body under separate armour and a scalp under a separate
helmet are different shells, so the operator returns nothing. A zero result from such a
probe means "no welded interior found", never "nothing is hidden". Occlusion between
shells requires visibility testing — casting rays or rendering — and any gate that
concludes "no hidden geometry" from an adjacency operator is asserting something it did
not measure.

## Every verdict declares which stage it graded

Geometry arrives at wildly different stages of finish: straight from a generator,
pre-retopology and pre-unwrap; or after a finishing pass that joined, decimated, unwrapped
and baked. The same thresholds mean different things at each. Grading raw output against
finished-asset thresholds produces a rejection that is a statement about the calendar, not
about the mesh.

Two disciplines follow. First, the verdict carries the stage it was told about, and an
undeclared stage is reported as **undeclared** — never guessed from face count or any
other proxy, because the guess would be exactly the correlation the gate is supposed to
be testing. Second, the stage assessment is **display and routing only**: it may explain
why a verdict looks harsh, and it must contain no path that turns a fail into anything
else. "The gate is mis-tiered" is a diagnosis; it must never become "so ship it anyway".
See [stage-declared-grading](./techniques/stage-declared-grading.md).

There is a craft lesson embedded here that outlives the subject. A standing claim about
one such gate held that it rejected nearly everything because it graded raw output against
finished face-count thresholds. Re-measured against a real 52-file corpus, the claim was
right in substance and wrong in mechanism: face count never failed a single mesh — there
was no fail rule for it at all — the real rejection rate was 10 of 52, and *every one of
those ten* was debris, not density. Worse, the finishing pass that supposedly cured the
problem multiplied it: one mesh went from 2 components and 1 speck at 1.48M faces to 17
components and 16 specks at 47k faces, warn to fail. Decimation collapses the face count
and shatters the small stuff. The correct response was to make the gate state its stage,
not to re-tune the threshold the claim blamed — because re-tuning that number would have
changed exactly zero verdicts. **Fix the mechanism you measured, not the one you
assumed**, and be prepared for the measurement to invert the remedy you were about to
build.

## Silence is not compliance

An unmeasured property must render as unmeasured. If the metric extractor emitted no
per-component histogram, the component split is `not measured` — not zero parts, not zero
specks, and above all not a clean line on the card. If no face budget was requested, the
card says no budget was supplied rather than showing a satisfied budget. If no target
world size was given, the card says the size is unknown rather than implying the
generator's normalised unit box is correct.

This is an output-contract discipline, not a philosophical one: the consumer must be able
to read *which properties were examined and which were not* off the card itself, and the
two must be different values with different types. See
[unmeasured-is-not-pass](./techniques/unmeasured-is-not-pass.md). The partial case has its
own asymmetry, and it is the one worth internalising: when a measurement is truncated and
you cannot tell which side an omitted item falls on, resolve toward the **harsher**
verdict. Neither branch of an ambiguity may be allowed to manufacture a pass.

## Findings are codes, and the codes are chosen by remedy

Every consumer that needs to reason about *which kind* of defect a mesh has will otherwise
end up matching against the human-readable reason string — blanking digits, comparing
prefixes, and getting it wrong twice before anyone notices. A stable defect code says the
same thing exactly, and it is what lets the routing layer exist at all.

The taxonomy is not a neutral enumeration of everything measurable. Choose the code
boundaries so that **each code maps to a distinct remedy**: this class is resolved by the
finishing stage, this class justifies paying for another generation roll, this class is
resolved by neither and requires a human or a different input. A code that never changes
what anyone does is a code that should be merged into its neighbour. And where the card
shape gets borrowed by a gate whose defects have no place in the taxonomy — a critic
grading an input image, say — the code field is genuinely absent rather than filled with
an invented value. See
[defect-code-taxonomy-not-prose](./techniques/defect-code-taxonomy-not-prose.md).

## Structural readiness for a downstream capability is its own axis

Some questions are not "is this mesh healthy" but "can this mesh do a specific job later".
The clearest case: a head can only be given expressions if the eyes, lashes, brows and
interior mouth exist as separable shells. Welded into one shell, no rigging tool can drive
them, and that is knowable from geometry alone before any rigging attempt spends time.

Keep this out of the health score. A prop with one shell is perfect; a head with one shell
is merely unsuitable for a different job. Fold the second into the first and you have
built a gate that fails props for being props. Fitness-for-a-downstream-capability is a
separate, routable output on the same card —
[face-rig-shell-readiness](./techniques/face-rig-shell-readiness.md).

## What this subject deliberately does not own

- **What the budget should be, and in which primitive.** Per-class polygon targets, the
  triangle-versus-quad unit trap, and deriving a part's budget from the whole's are a
  separate subject. This gate consumes a budget; it does not set one.
- **What to do about a rejected mesh economically.** Whether to repair, re-roll or hand to
  a human is a cost decision with its own subject. This gate emits the routing signal —
  which defect classes are finish-resolvable and which are re-roll-resolvable — and stops
  there.
- **The finishing itself.** Retopology, unwrap and bake are a production stage with their
  own craft, including the fact that the low-poly must fully cover the high-poly or baked
  detail sinks below the surface.
- **World scale as a subject**, and **gating the 2D input before generation** — the
  cheapest rejection is the one that happens before a mesh exists.

## The failure modes of the naive reading

- **Passing structure as quality.** Covered above; it is the expensive one.
- **Counting components.** Rejects every assembled character; the face-share rule exists
  because of this.
- **Failing on density.** Rejects everything at the raw stage and teaches operators to
  ignore the gate, which is worse than having no gate.
- **A neutral default for a missing metric.** Zero specks and no histogram render
  identically, and the dashboard goes green on absence.
- **Prose-matched defects.** Works until a number changes inside the string.
- **Assuming the finishing stage cures what it does not.** Publishing a "finishing will
  fix this" caveat for a defect class the finishing stage demonstrably worsens is a lie
  the tool tells at scale.
- **Inferring the stage.** Guessing raw-versus-finished from face count couples the gate's
  explanation to the very metric under dispute.
