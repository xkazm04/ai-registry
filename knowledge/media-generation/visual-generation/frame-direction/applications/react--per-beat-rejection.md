---
layer: application
type: application
subject: frame-direction
technique: per-beat-rejection
stack: react
status: forged
verified_on: 2026-10-21
verified_against: react@19
---

# React/TypeScript: a scene-spec validator that fails one beat at a time

How one app (repo `gravitone-gcloud`, `main` at `9c3cdac8`) realizes per-beat
rejection in the TypeScript module that parses a directing model's JSON
output: `lib/frames/sceneSpec.ts`. The module was first read at
`app/_phases/frames/sceneSpec.ts` on 2026-08-19 and moved to `lib/` in the
project's Phase 0.4 refactor (`574e5313`). The line numbers below are from the
re-verification on 2026-10-21.

## The report shape encodes the three verdicts

`SceneSpecReport` (`sceneSpec.ts:104-114`) returns `specs` (applied),
`rejected: SpecRejection[]` (tried and refused, each with `beatAt` + a
`reason`), and `missing: string[]` — beats the engine never mentioned. The
comment at :107-112 states the disjointness argument directly: "a beat it
tried and got wrong has a reason attached, and reporting that beat as missing
too would replace the reason with a vaguer one and count the same defect
twice." `SpecRejection` (:92-100) also covers scenes claiming a nonexistent
timestamp, a scene that "has no row to sit on."

## First-defect-per-beat via a throwing parser

`parseScene` (:126-207) validates one scene and throws a `SceneSpecError`
describing "the FIRST thing wrong with THIS beat" (:121-122); the caller
catches it and moves to the next one. Messages are written to render on the
beat's own row, so they do not repeat the timestamp (:124-125). This is the
one-root-cause-not-five-costumes rule as control flow: exceptions per beat,
caught per beat.

## Measured checks only

The checks map exactly to the technique's "enforce only what is measured"
list:

- **Text in the generative layer** — `ASKS_FOR_TEXT` (:86-90), a word-boundary
  regex over text/label/caption/number/etc., applied to both `subject` (:136-137,
  "Plates carry no glyphs") and `motion` (:146-147, "move the picture"). The
  doc comment names it "the one unconditional defect."
- **The restatement defect** — :148-149 rejects a motion that
  case-insensitively equals its subject: "A still is not a move."
- **The integrity gate** — a `figure` text without a `factId` is rejected
  (:179-180, "Every number on screen must be traceable"), and any cited
  `factId`, on a text or on an element, must exist in the run's notebook
  (:158-160, :181-182).
- **The grade cap, added since the first reading** — an exact `figure` drawn
  from a fact the notebook grades `low` is refused (:183-197), with the
  escalation in the message: draw the shape, the band or the disagreement,
  or re-grade the fact. It caps only `figure` and only at `low`, because a
  medium-confidence figure "is a real question this cannot answer". This is
  restraint applied to a new check as well as to the original ones.
- **Structural invariants** — unknown element kinds and text roles are
  rejected; coordinates are clamped to 0-100 (:84) and labels sliced to
  length (:163, :200) rather than rejected, the clamp-what-is-safe /
  reject-what-changes-meaning split.
- **Deliberate non-checks** — :139-143 documents what is *not* validated: "no
  verb whitelist, no duration, no easing vocabulary. Nothing has measured
  those, and a validator built on an impression rejects good direction with
  total confidence."

## What still fails the whole pass

`reviewSceneSpecs` (:231) collects per-beat findings, and its header
(:213-226) names the exceptions: "What still fails hard is what invalidates
the whole response rather than one beat of it: no JSON object, malformed
JSON, no `scenes` array" (:239, :247). The catch takes only the gate's own
refusal type (:268-271): a `TypeError` from the parser is a bug in it, and
swallowing that "would turn a crash into sixteen quiet rejections nobody
could explain." Both now stand in the technique's "What still fails the run"
section.

## The unit is one scene per beat, keyed by timecode

The duplicate guard at :264 refuses a second scene for a beat ("the first
one stands"), and the beat key is `beatAt`, a timecode. The project's own
conform pass (2026-10-15, `.ai/conform-detail.json`, frames-step) recorded
this as a deviation from one-function-per-visual: the gate forbids splitting
a beat into several stills under the same narration. Its shot model
(`lib/frames/shots.ts:362-371`) independently records that `beatAt` "is a
position and positions repeat" and groups by beat identity instead. That
pair is the evidence behind the technique's rule: key by identity, and make
the gate's unit the still when the direction step may split.

## The economics, stated to the generator

The upstream prompt (`pipeline/FRAMES-SCENE-PROMPT.md:184-187`) tells the
directing model the gate's granularity as an incentive: "Rejection is per
beat, not per run… a defect you are unsure about costs one beat — but sixteen
careless ones cost the run, and each rejected beat keeps whatever was there
before, which is usually the template output this pass exists to replace."
`applySceneSpecs` (:299) keeps that promise in code: a frame with no spec is
returned untouched (:294-297). On 2026-08-19 a 35-scene run output was read
at `frames-direction-out/scenes.json`. That path is gitignored local run
state and did not exist at re-verification, so nothing here rests on it.

## Transplant note

The pattern needs no framework: it is a pure function from untrusted JSON to
`{applied, rejected, missing}`. What is React-adjacent is the destination —
rejection reasons written short and timestamp-free because each renders on
its beat's own row in the review UI, a constraint worth copying: write
validator messages for the surface that will display them.
