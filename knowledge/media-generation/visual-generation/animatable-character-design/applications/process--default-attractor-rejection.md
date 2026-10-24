---
layer: application
type: application
subject: animatable-character-design
technique: default-attractor-rejection
stack: process
status: draft
verified_on: 2026-10-25
applied: code
ab_verdict: better
proof: ab-paired
---

# An approved companion briefed by its bans returned four desk lamps

Source tree: `bp` (public, github.com/xkazm04/bp) on `master` at `d8b1fea`. The paths are from
its root. The project's concept image shows its companion, a white robotic lamp figure with a
glowing head and jointed arms, above a drafting table. The asset briefs live in a JSON file
that a script sends to an image service, one logged call per image.

## The brief that failed, and the one that worked

The first brief defined the companion by exclusion, as the rewritten entry's own note records:

- `docs/concepts/vr-light-table/lookdev/props.json:7 "not a robot, not a creature, no face"`

All four options came back as plain desk lamps. The image-to-3D build was faithful to them,
and the companion scored 1 of 3 on the scene scorecard. The rewritten brief describes the
figure positively from a crop of the target and attaches the crop as a reference. Its first
reference call matched the figure (shape, parts, light).

## Verdict

The pair was shown with labels shuffled: a negative-brief option against the positive-brief
option, with the target crop alongside. The arms differed at 3.2 times the distance between
two seeds of the negative brief (mean absolute pixel distance 0.130 against 0.040). The owner
answered "Lamp looks well" about the positive arm. That was in words, so the reveal is not
blind. In the assembled scene the companion moved to 2 of 3. Its remaining gap is the
model's surface finish, not its identity.
