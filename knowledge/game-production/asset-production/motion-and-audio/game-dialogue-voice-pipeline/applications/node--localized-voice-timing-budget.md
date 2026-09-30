---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: localized-voice-timing-budget
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@24
---

# A word cap standing in for a voice-timing budget

Read against the game-production fleet project (pof) at commit `88f1b080`, opened read-only on 2026-09-30. The fleet has no voice consumer, so no take is ever measured; this records the closest existing timing rule and how it differs from the technique.

## What the tree does

The dialogue pipeline declares its voice timing constraint as a word count in the step's own produced data: `src/lib/catalog/pipelines/dialog-trees.ts:392` "maxLineLength: 10". The feature doc calls it timing: `docs/features/dialog-trees/README.md:39` "VO timing constraint".

The step once declared the cap and accepted on a count of lines, so an over-long line passed. The checker that now enforces it is `src/lib/catalog/acceptance/dataCheckers.ts:287` "export function maxWordsPerEntry", and it returns pending, not pass, on an empty field: `src/lib/catalog/acceptance/dataCheckers.ts:291` "status: 'pending'". The recorded step fact says the audio half is still unpowered: `src/lib/status/step-facts.json:1241` "The AUDIO half stays unpowered".

The cap is parsed from the project's canon law: `src/lib/catalog/acceptance/invariants.ts:144` "export const VO_LINE_MAX_WORDS". Under the profile of a reference game whose town speech runs 15 to 54 words a line, the check is ungraded rather than failed: `src/lib/catalog/acceptance/invariants.ts:142` "grades UNGRADED, not fail".

## Confirmed and deviations

Confirmed: a declared limit needs a checker that can see it, and an unmeasured field reports pending (the technique's not-a-pass rule).

Deviations, standard unchanged:

- **The unit is words, not seconds.** Nothing measures a rendered take, so the constraint is silent about every locale and about any voice's pace.
- **The cap is global, not per attachment.** No line carries a ceiling tied to its animation or beat, and the cinematic pipeline states no lip-sync pipeline exists: `src/lib/catalog/pipelines/cutscenes.ts:74` "NO dedicated lipsync pipeline exists today".
- **Ungraded is honest under the long-monologue profile,** but the whole class then carries no timing check.

## Seam

When a take exists, add a sibling of `maxWordsPerEntry` that reads a measured duration and a per-locale ceiling from the same row, and keep the word cap as a cheap early warning.
