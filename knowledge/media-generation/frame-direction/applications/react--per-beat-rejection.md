---
layer: application
type: application
subject: frame-direction
technique: per-beat-rejection
stack: react
status: forged
---

# React/TypeScript: a scene-spec validator that fails one beat at a time

How one app (repo `gravitone-gcloud`) realizes per-beat rejection in the
TypeScript module that parses a directing model's JSON output:
`app/_phases/frames/sceneSpec.ts`.

## The report shape encodes the three verdicts

`SceneSpecReport` (`sceneSpec.ts:103-113`) returns `specs` (applied),
`rejected: SpecRejection[]` (tried and refused, each with `beatAt` + a
`reason`), and `missing: string[]` — beats the engine never mentioned. The
comment at :106-112 states the disjointness argument directly: "a beat it
tried and got wrong has a reason attached, and reporting that beat as missing
too would replace the reason with a vaguer one and count the same defect
twice. Their frames keep what they had — a report rather than a throw,
because fifteen good scenes are worth having even when the sixteenth never
arrived." `SpecRejection` (:91-99) even covers scenes claiming a nonexistent
timestamp — "a scene invented for a timestamp that does not exist… has no row
to sit on."

## First-defect-per-beat via a throwing parser

`parseScene` (:120-177) validates one scene and throws a `SceneSpecError`
describing "the FIRST thing wrong with THIS beat — the caller catches it and
moves to the next one" (:115-117). Messages are written to render on the
beat's own row, so they never repeat the timestamp (:118-119). This is the
one-root-cause-not-five-costumes rule as control flow: exceptions per beat,
caught per beat.

## Measured checks only

The checks map exactly to the technique's "enforce only what is measured"
list:

- **Text in the generative layer** — `ASKS_FOR_TEXT` (:85-89), a word-boundary
  regex over text/label/caption/number/etc., applied to both `subject` (:126-127,
  "Plates carry no glyphs") and `motion` (:136-137, "Our text layer is vector
  and ours — move the picture"). The doc comment names it "the one
  unconditional defect."
- **The restatement defect** — :138-139 rejects a motion that
  case-insensitively equals its subject: "A still is not a move."
- **The integrity gate** — a `figure` text without a `factId` is rejected
  (:163-164, "Every number on screen must be traceable"), and any cited
  `factId` must exist in the run's notebook (:165-166).
- **Structural invariants** — unknown element kinds and text roles are
  rejected (:144-145, :160); coordinates are clamped to 0-100 and labels
  sliced to length (:82-83, :148-153, :169) rather than rejected, the
  clamp-what-is-safe / reject-what-changes-meaning split.
- **Deliberate non-checks** — :129-133 documents what is *not* validated: "no
  verb whitelist, no duration, no easing vocabulary. Nothing has measured
  those, and a validator built on an impression rejects good direction with
  total confidence."

## The economics, stated to the generator

The upstream prompt (`pipeline/FRAMES-SCENE-PROMPT.md:136-139`) tells the
directing model the gate's granularity as an incentive: "Rejection is per
beat, not per run… a defect you are unsure about costs one beat — but sixteen
careless ones cost the run, and each rejected beat keeps whatever was there
before, which is usually the template output this pass exists to replace."
The 35-scene output at `frames-direction-out/scenes.json` is the artifact of
this loop: real applied specs whose figures all carry `factId`s and whose
subjects are form-only descriptions with the lower third reserved.

## Transplant note

The pattern needs no framework: it is a pure function from untrusted JSON to
`{applied, rejected, missing}`. What is React-adjacent is the destination —
rejection reasons written short and timestamp-free because each renders on
its beat's own row in the review UI, a constraint worth copying: write
validator messages for the surface that will display them.
