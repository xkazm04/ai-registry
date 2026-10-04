---
layer: application
type: application
subject: multi-speaker-speech-production
technique: chunk-boundary-continuity
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@22
---

# A narration route that sends a whole card in one call

Written against a story-editor tool at commit a12f7c0530, read from HEAD. The route renders
one card's narration and shows the length problem before anyone has hit it: no cap, no cut,
no continuity input.

## What the route does

It validates only that the text is non-empty, `src/app/api/ai/elevenlabs/route.ts:64` "if (!text || !text.trim()) {",
then sends the whole trimmed text as one generation, `src/app/api/ai/elevenlabs/route.ts:89` "text: text.trim(),".
The model and the single cast voice are module constants,
`src/app/api/ai/elevenlabs/route.ts:7` "const MODEL_ID = 'eleven_v4'" and
`src/app/api/ai/elevenlabs/route.ts:6` "const VOICE_ID = ". The clip is named by card id and clock,
`src/app/api/ai/elevenlabs/route.ts:115` "const fileName = ", so its address is the card and every re-render is a new file.

## Deviation: no limit awareness

Nothing compares the text length with the engine's per-generation character cap, so a long
card fails at the engine and the route reports a generic status,
`src/app/api/ai/elevenlabs/route.ts:106` "success: false, error: ". The cap belongs in configuration read from the
engine's current model list, with a pre-check that cuts at speaker turns and sentences.

## Deviation: no continuity input

The request body carries text, model, voice settings and a language code and nothing for
preceding or following text or earlier request identifiers,
`src/app/api/ai/elevenlabs/route.ts:88` "body: JSON.stringify({". Cards rendered in sequence for one story would each start cold,
and the joins between cards are the seams the technique audits. No seam audit exists in the
tree at this commit, so joins are unmeasured, not passing. At single-voice single-card scale
this is fine; the gap shows when a story outgrows one card or gains a second speaker.
