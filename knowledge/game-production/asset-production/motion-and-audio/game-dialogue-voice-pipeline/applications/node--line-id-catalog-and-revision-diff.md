---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: line-id-catalog-and-revision-diff
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@24
---

# Voice-line keys in a TypeScript catalog generator

Read against the game-production fleet project (pof) at commit `88f1b080`, opened read-only on 2026-09-30. The project has no voice consumer: nothing renders speech. What it has is a catalog that already emits one text row per would-be voiced line, which is the shape this technique's catalog would extend.

## What the tree does that the technique wants

Each dialogue step emits its voiced lines as `KEY: "text"` rows, so a line's identity is separable from its words: `src/lib/catalog/reference/dialogueTrees.ts:356` "const voLines = lines.map((line) =>" and `src/lib/catalog/reference/dialogueTrees.ts:357` "voiceClip:". The bark generator does the same with the engine's speech id as the key: `src/lib/catalog/reference/heroBarks.ts:195` "const voLines = barks.map((bark) =>". The consuming checker counts only the quoted half because the key is not spoken: `src/lib/catalog/acceptance/dataCheckers.ts:283` "the localization key is not spoken".

The honest-gap rule matches the technique's "a missing take is a state": an unvoiced reference line reports itself rather than inventing a path, `src/lib/catalog/reference/dialogueTrees.ts:360` "no clip name was invented".

## Where it falls short (deviations; the standard stays)

- **Identity is derived from a name.** The gatekeeper exemplar builds keys from the entity's display name: `src/lib/catalog/pipelines/dialog-trees.ts:380` "DIALOG_${slug(e.name).toUpperCase()}_VAEL_THREATEN_WARN". Renaming the entity re-keys every line, which orphans every attached recording. The key is also a speaker-plus-role label, not the graph node's identifier, so a second identity scheme already exists beside the graph's.
- **One revision, not two.** A row has text and a clip name and no script revision or render revision, so a change of voice or model has nowhere to be recorded.
- **No diff.** Nothing compares two states of the rows by key.

## Seam if the fleet grows a voice consumer

Use the node identifier plus a variant marker as the key where the rows are built (`src/lib/catalog/reference/dialogueTrees.ts:356` "const voLines = lines.map"), carry the script and render revisions as bracketed fields beside the clip field, and keep the "no clip name was invented" state as the value of a missing take.
