---
layer: application
type: application
subject: video-assembly
technique: silent-defects-get-a-code-or-an-error
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
---

# A video engine's lint pass and its fail-fast release note

The witness for the stack is the tree's `engines` field (node 22 or later); the tree was read at commit `7263a951`.

The engine states the technique's two moves in two places. The first is the lint module's own opening: `packages/compositions/src/program/lint.ts:2` "Static checks for things that render" fine but not as intended, with a colour the parser cannot read drawn transparent, text lost in its background and a layer parked off-canvas as the examples. Its findings are `{ severity, code, message, layerId }`, which is the three-part shape the technique asks for, and the setup skill adds that the same entries are folded into the render's quality report.

The second is a release note in the tree's change set: `.changeset/missing-media-fail-fast.md:7` "Fail fast when referenced local media files cannot be opened", instead of silently resolving with black frames or silent audio. The renderer had been taking the quiet default for a missing file, and the project's own words for the change are the technique's first move.

## The severity ladder and the honesty clause

Severity follows consequence, as the technique prescribes: a gradient the renderer cannot read, or an image layer pointed at a video, is an error because nothing is drawn; an unknown colour, low contrast and an off-canvas layer are warnings; a track whose every keyframe holds one value is info. The lint is also honest about what the static view lacks. Its contrast rule keeps a running backdrop and drops it once something paints: `packages/compositions/src/program/lint.ts:241` "The backdrop is known only until something paints over it". The offscreen rule skips layers whose position is animated (`packages/compositions/src/program/lint.ts:186` "A static layer entirely outside the canvas never shows").

The contributor rules in the tree list the defects the lint cannot see under a heading that names the class: `.agent/rules/general-information.md:54` "Engine gotchas (violations fail silently)". Those entries (a border shorthand ignored, a premultiplied-alpha blend that makes fades murky) are the rules not yet written.

## What this realization cannot do

The lint has no rule for text extent: it checks the colour of text against its backdrop, not whether the drawn text fits its box. The class of defect the technique's third section names, a long unbreakable word that overflows after a character cap passed, is outside its rules.
