---
layer: application
type: application
subject: video-assembly
technique: generated-shot-sourcing
stack: react
status: forged
verified_on: 2026-09-08
verified_against: react@19
applied: simulation
ab_verdict: better
---

# React: a studio whose cut list cannot hold a cut

*Verified against the consuming tree at commit `7637553`, 2026-08-31; the
citations below re-resolved at `e1c31ec`, 2026-09-07 (the turn-marker loop now
sits at `CutTimeline.tsx:40-47`; the scene and clip fields are unchanged), when
the rung-zero section was added; the shots-lane citations re-resolved 2026-09-08
against the working tree when the beat-floor section was added.*

*Two findings, two verdicts. The rung-zero A/B below is `simulation` /
`better`, and the frontmatter carries it. The beat-floor section added
2026-09-08 is `unmeasurable`, and states its own instrument.*

The technique's rung 3 gained an amendment this run: two anchors from
unmistakably different spaces do not interpolate and break — they render as a
**cut**, and the cost is that the cut lands inside the clip where the assembly
cannot reach it. This tree has no generative-video path at all, which makes it
the wrong place to test the affordance and an unusually good place to test the
cost. The finding is what its shape says without having been designed to say
anything.

## The seam

The studio walks scenes through phases — research, script, frames, score, cut
— and the cut phase's structural beats are derived, not authored by hand.
`app/_phases/cut/CutTimeline.tsx:41-47` finds the act-two marker by walking
the scene list in order, testing each scene's `mood` for `/turn/i`, and
accumulating `targetS` until it matches:

```
let atS = 0;
for (const sc of SCENES) {
  if (/turn/i.test(sc.mood)) return { atS, slug: sc.slug };
  atS += sc.targetS;
}
return null;
```

The decision the amendment governs — *how many cuts does one clip contain* —
is made here by default, and the default is one. `app/_studio/projectTypes.ts`
makes it structural rather than incidental: a `Scene` carries exactly one
`pickedFrameId: string | null`, and a `TimelineClip` is one span with one
`startS`, one `durS` and one `offsetMs`. There is no field anywhere that can
say a clip contains an edit.

## A and B, over three shipped cases

**A** — rung 3 as it stood: the anchors must be cut from one cloth, so a
two-world pair is a mistake and the producer is told not to make it.
**B** — the amended rung: a two-world pair is a documented third row that buys
coverage plus a transition for one render, gated on whether the assembly needs
to own the cut point.

The cases are the five scenes of the project the studio actually ships
(`app/_studio/scenes.ts`, 31 seconds, states deliberately uneven):

1. **The act-two turn.** `sc-3` is `EXT. ROOFTOP — NIGHT`, mood
   `"vertigo / turn"`, and it is the only scene the marker logic can match.
   Under B a producer could brief `sc-2 → sc-3` as one two-world generation —
   the crane cab as head anchor, the rooftop as the second reference — and buy
   the turn for one render. **Prediction: the marker breaks.** `atS` is
   accumulated over discrete scenes, so a merged clip either shifts the marker
   off 13s or removes `sc-3` from the list entirely, in which case the scan
   falls through and returns `null` — no act-two marker drawn at all.
   *Falsifier:* if the turn were derived from a timestamp or a marker on the
   clip, merging two scenes would not move it. It is derived from the scene
   enumeration.
2. **The readiness signal.** `sc-4 → sc-5` (`INT. HARBOR GATE — NIGHT` to
   `EXT. WATERLINE — DAWN`) is the largest world gap in the project and the
   story's release beat — precisely the third row's case. `sc-5` is also the
   one scene with `pickedFrameId: null`, and that null is the only readiness
   signal the model carries. **Prediction: a clip spanning both leaves `sc-5`
   permanently unpicked while its footage exists** — the project reports
   incomplete when the cut is done, and no gate catches it, because per-scene
   picks are the whole instrument. *Falsifier:* readiness computed from
   timeline coverage rather than per-scene picks would not fire.
3. **The sync bench.** `TimelineClip.offsetMs` is written by the Cut's drift
   correction and moves the whole block on the ruler. A clip carrying an
   internal cut holds two shots against one offset. **Prediction: drift
   becomes uncorrectable** — if the model's cut lands early against the
   narration written for those beats, the operator can nudge the clip and
   cannot move the cut inside it. *Falsifier:* a timeline that could split a
   clip, or a pipeline that re-rendered instead of nudging. `TimelineClip` has
   no split.

## Verdict: better

All three predictions are read off shipped code and shipped data rather than
off a run, and the amendment answers all three with its own question — *does
the assembly need to own this cut point?* Here it does, three times over, and
for three unrelated reasons.

The reason this is `better` rather than `no change` is narrower than the three
cases. Rung 3 as it stood already told a producer not to pair two worlds. It
gave the right answer for the wrong reason — *it will break* — and that reason
does not survive contact with a two-world pair that comes back looking good,
which is exactly what the source demonstrating this had. An accidental
prohibition converts to a stated trade, and the trade is the part that holds.

## What the tree could not have been built to prove

This studio has no video generation. Nothing in `lib/` builds a motion request,
there is no frame-anchor code anywhere in the tree, and the cut phase assembles
over frames and score. It could not have been designed to demonstrate anything
about anchor pairs.

It demonstrates the amendment's cost anyway, structurally: **a clip that
contains its own cut is unrepresentable here.** One scene, one picked frame,
one span, one offset. The assembly owning every cut is not a policy this
project chose and could revisit — it is a shape, and a generated clip with an
edit inside it would enter the timeline as an atom, pass every instrument, and
be invisible to all three of the checks above. That is better evidence for the
amendment's warning than an adopting tree would have produced, because nobody
arranged it.

## Rung zero, measured by absence (added 2026-09-07)

The ladder gained a rung below text-only: the accepted still, moved by the
editor, with no generation made. This tree *is* that rung by construction,
and it says so in its own words. `app/_phases/frames/frames.ts:88-90`: "a clip
in this app is AUTHORED, never rendered, and `status` can only ever hold
`"not-started"`" — a frame owns a `FrameClip` whose `motion` is the intent
(what moves, in what direction, how far) and whose four-member status union
has exactly one reachable member in the product path. The step's header
(`FramesStep.tsx:12-14`) records that the still-versus-clip picker was
removed as "the image-to-video architecture this project measured its way
out of". Nobody called this rung zero; it is where the product landed.

Three real cases, under policy A (the ladder as it stood: text-only is the
lowest rung, so a shot that wants motion generates) and policy B (start at
rung zero, climb only for a named reason):

1. **The explainer cut** — sixteen frames, a vector text layer. Under A every
   frame that "feels static" becomes a generation request, and the text then
   rides the generated layer, which `sceneSpec.ts:147-148` already refuses
   ("The motion moves text. Our text layer is vector and ours — move the
   picture"). Under B rung zero is the shot's contract: exact identity, text
   untouched, the move typed. Prediction: B and the tree agree, and the tree
   refuses A's failure at its spec validator. Falsifier: a shipped explainer
   frame whose beat turns on a parallax or an atmospheric element the editor
   move cannot express.
2. **The promotional cut** — the shots lane. `ShotSheet.tsx` decomposes a
   trailer beat into shots and deliberately offers "no path from a shot to an
   image". Under A a trailer at rung zero is the "slideshow that scores well"
   the tree's own consistency spike named (`c99be91`). Under B the climb is
   named — figures and atmosphere are what a trailer beat is *about* — so
   these are the shots that leave rung zero, and they leave it with the
   performer channel open. Prediction: when a motion path is built, trailer
   shots need zero-beat direction for their set-dressing figures and explainer
   frames do not. Falsifier: a trailer shot that reads as intended at rung
   zero.
3. **Deck 03, "still built to move"** (`pipeline/decks/2026-08-23/`): the
   still is the variable, the motion line is constant, and the stills are
   judged first *as stills* — "which of these do I believe will move well?"
   Under A that is rung-two evaluation. Under B it is also the rung-zero gate:
   the question is answered before any generation, which is the decision the
   rung names. Prediction: a still that fails the deck's first-frame checklist
   is not promoted to a clip. Falsifier: the deck promoting stills to
   image-to-video that its own checklist marked doubtful.

**Verdict: better** — and the structural fact is the one the amendment's
closing sentence predicts. The decision to generate at all is made in this
tree by **the absence of a renderer**. Nothing on `Frame` or `FrameClip` can
say "this frame stays a still by choice" as distinct from "no render seam
exists yet"; the day one is built, every frame will read as waiting to be
rendered, and the rung-zero frames will be indistinguishable from the
not-yet-rendered ones. That is a field, not a policy, and it is missing.
Return: re-test as `code` when a render seam exists and the field does.

## The beat floor, refuted at the seam that was meant to prove it (added 2026-09-08)

The amendment "when the cap stops binding, the beat floor starts" was tested
here against the seam chosen because it could **falsify** the finding rather
than flatter it: the shot decomposition, where a beat's seconds are divided by
a shot count. `app/_phases/frames/shots.ts:529` does exactly the arithmetic the
amendment is about — `const holdS = round1(beatS / n)` — and if nothing checked
the quotient, the amendment would have had its confirming instance.

**It has one, and the check is upstream of where it was looked for.** A caught
outcome was defined before the arm ran: if this tree already enforced a floor,
the amendment was restating a solved problem and the row demotes. That is what
happened, twice over.

`shots.ts:294` declares `const FLOOR_S = 0.5` — "the fastest cut the sheets
measured. A shot shorter than this is not a shot" — and `shotCountFor` caps the
count by it before dividing (`:413`, `ceiling = Math.max(1, Math.floor(beatS /
FLOOR_S))`). The quotient therefore cannot fall below the measured floor. A
paired probe over the whole parameter space (five roles × 0.5–40 s at 0.5 s
steps, n=400) found the clamp firing on **1 of 400 pairs** — `rung` at exactly
0.5 s, wanting 2 shots and getting 1 — with the known-positive assertion firing
correctly, so the near-absence is a fact about the code and not a broken probe.
The floor is enforced *and* it is nearly never reached.

The second refutation is the one worth keeping. The clamp is nearly unreachable
because **this tree derives its beat count instead of enumerating it.** A
`reset` and a `tail` are one shot by citation; a `rung` is capped at two; only
`peak` and `setup` scale with the beat's seconds, and both take the conservative
end of their band because "over-decomposing invents shots nobody asked for"
(`:404-409`). No surface anywhere lets an author write ten beats into one
request and discover the division afterwards, and `shotPrompt.ts:5` closes the
last door: the prompt it builds is "the prompt a downstream image call WOULD use
for **one shot**". One request, one shot, one still. The model is never asked to
cut.

**So the verdict is `unmeasurable`, and the structural fact is the finding.**
The amendment's corrective — derive the beat count from the duration and a
measured floor rather than enumerating beats and letting the division land
where it falls — is not a proposal this tree could adopt. It is what this tree
already is, arrived at independently, for a reason that has nothing to do with
generative clip caps: a shot list is derived from a script's clock because
nobody may retype the script. Nobody built this to corroborate the amendment,
and it corroborates the corrective anyway, which is better evidence than an
adopting tree would have given.

It also locates the exposure precisely, which is what the amendment needed most.
The failure is not a property of long single-pass durations by themselves; it
is a property of **the enumerating surface**, and a pipeline can have the first
without the second. The return condition is therefore not "when the cap rises"
but a shape: *when a project grows a surface that sends one prompt enumerating
several beats into one fixed-duration generation.* This tree does not have it,
and the two checks that would catch the consequence if it did are the ones
already gated: `shotReview.ts:342-348` disengages the pace bands below 120 s
with an explicit and correct population argument — "a band applied outside its
population is not a stricter check, it is a wrong one" — which is precisely the
reasoning the amendment adopts for why the floor must come from the content's
own duration claim rather than from a borrowed band. The tree argued the
amendment's second rule before the amendment existed.

Instrument that would make this measurable: a beat-enumerating prompt builder
with a duration parameter, and the review's `unmeasured` verdict wired to the
seconds-per-beat quotient. Neither exists here, and neither should be built to
satisfy a test.

## What this realization cannot do

Nothing here was executed. The mode is simulation because the affordance half
has no seam in this fleet — neither media-generation project has a generative
video path — and the cost half cannot be run without one. The three
predictions are falsifiable and each names its falsifier, but they are
reasoning over a shipped tree, not measurements of it. Re-test as `code` when
the studio grows a motion-request path with frame anchoring.
