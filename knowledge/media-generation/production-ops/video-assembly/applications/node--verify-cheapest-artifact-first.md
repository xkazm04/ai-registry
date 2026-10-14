---
layer: application
type: application
subject: video-assembly
technique: verify-cheapest-artifact-first
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@22
---

# A code-first video engine that writes the ladder into its own skills

The witness for the stack is the tree's `engines` field, which pins node 22 or later; the tree was read at commit `7263a951` of a code-first video engine that renders headlessly on a native GPU backend, with no browser.

The engine ships four agent skills, and two of them state the ladder as a rule rather than a hint. The setup skill opens its verification section with `plugins/framefields/skills/framefields/SKILL.md:249` "Never go straight to a full video render." and lists five rungs: type check, single frames, a contact sheet, a live preview, the export. The render skill is blunter about why the order exists: `plugins/framefields/skills/framefields-render/SKILL.md:20` "Always proceed through the ladder in order." and the next sentence prices it, a layout or timing bug caught at the first two steps taking seconds against minutes after a long export.

It also records the diagnosis that the ladder is for. A black frame is not a finding, it is a symptom with three known causes: `plugins/framefields/skills/framefields/SKILL.md:252` "A black frame usually means a missing font". The skill sends the reader to the still rung, not the export, to tell them apart.

## The boundary the tree states for the cheap rungs

The engine's vision effects read the layer's previous drawn frame, and its skill says what that does to the cheap rungs: `plugins/framefields/skills/framefields-effects/SKILL.md:166` "Render vision frames in order." Stills need at least two consecutive frames with one renderer, and a frame grid is named as a case that cuts out pixels from whatever frame was drawn before it. The live preview has the same limit while paused or skipping frames: "check them paused, or in the export". The technique's section on cheap rungs generalizes this: a cheap artifact stands in for the export only for what it can reproduce.

## What the tree confirms that nobody designed

Four rungs are real code, not prose: a schema that rejects unknown fields, a static lint, a frame-grid renderer and a preview server. Rung 1 is cheap by construction because the lint is a pure function of the source (`packages/compositions/src/program/lint.ts:2` "Static checks for things that render"). The tree has no rung between the grid and the preview for audio: sound is only judged live or in the export, which is where the technique says container-level properties live anyway.

## What this realization cannot do

It cannot tell the author which rung should have caught a defect found late; the ladder is advice, not a gate. Nothing stops a script going straight to the export, and the tree's own example scripts do. Applied to a project, the missing piece is a report that names the first rung at which a failing output would have been visible.
