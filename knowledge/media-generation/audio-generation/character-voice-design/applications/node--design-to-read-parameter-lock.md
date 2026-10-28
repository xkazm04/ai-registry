---
layer: application
type: application
subject: character-voice-design
technique: design-to-read-parameter-lock
stack: node
status: forged
verified_on: 2026-10-28
---

# A companion's locked render key, and the design record it does not keep

**Pinned commit:** bp at `672bc7a9198cc9cc873d4b4b81548d9e9cdf6f75`, read on 2026-10-28.

bp is a TypeScript monorepo whose desktop page has a companion character, Glim, that reads its replies aloud. The voice
was designed on 2026-10-27 with ElevenLabs Voice Design. The owner cast it from ten candidates, which were designed with
`eleven_ttv_v3` at seed 7 and guidance 6. Three shortlisted voices were saved and each read four situation lines under
`eleven_v3`. A consistency test then chose the read settings. One pure module holds the result, and the server route,
the page and a check script all import it.

## What the tree confirms

- **The render key is one record.** `packages/core/src/companion/voice.ts:8 "Changing any of them changes the cache key"`
  states the rule. The record is right below it:
  - the voice, `packages/core/src/companion/voice.ts:10 "voiceId: 'SVlo1tpEuzf5ilPRxsRZ',"`;
  - the settings, `packages/core/src/companion/voice.ts:12 "settings: { stability: 1.0, similarity_boost: 0.8 },"`;
  - the seed, `packages/core/src/companion/voice.ts:13 "seed: 4242,"`.

  The model and output format complete it. This is the lock the technique describes: one definition, imported
  everywhere, with the cache keyed on all of it.
- **The stability was chosen by a listening test and its reason recorded.**
  `docs/blueprint-ui.md:1068 "at stability 1.0 with seed 4242"` and
  `docs/blueprint-ui.md:1069 "The owner picked that setup over steadier ones in a consistency test, because it is playful."`
  The owner made the choice by ear and wrote the reason down. Nothing defaulted.
- **The effect that shipped is the effect that was auditioned.**
  `packages/core/src/companion/voice.ts:21 "the casting test's ffmpeg chain"` records that the playback graph is a port
  of the exact chain the owner heard during casting. This is the finishing-effect-layer rule, carried in a comment.

## Upward lessons taken into the subject

- **A constant effect masks take variance.** `docs/blueprint-ui.md:1076 "so it masks small differences between takes"`.
  The repo presents this as a benefit. The subject now states both sides: it helps consistency, and it hides defects.
  So acceptance listening for dropped words happens on the clean render.
- **The owner may choose liveliness over steadiness.** The recorded reason, "because it is playful", is why the
  technique says a steadier setting is not automatically better, and that the decision is kept with its reason.

## Deviation (the standard stays)

**The design record is missing.**
- The module keeps the stored voice's identifier but not the description, design text, design seed or designer
  generation that produced it.
- The identifier is valid only on the owner's provider account. Another account cannot resolve it, and a future
  designer generation could not rebuild it from this tree.
- The technique says the design inputs are recorded with the saved voice. Here they live only in a scratch script from
  the casting session.
- **Consequence:** if the account changes or the stored voice is lost, the voice can be matched by ear, not rebuilt.
- **Fix:** add a `design` block beside `VOICE`: the description, the design text, seed 7, guidance 6 and the designer
  model, plus a reference clip for each audition line.
