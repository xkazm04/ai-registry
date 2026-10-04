---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: cast-ledger-with-consent
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@24
---

# A speech kind declared, refused, and specified but never served

Read against the game-production fleet project (pof) at commit `88f1b080`, opened read-only on 2026-09-30. **The fleet has no voice consumer and no cast ledger.** What exists is a provider registry that honestly refuses speech and a research spec that names the licence axes a ledger must record. This is a reading of that refusal and that spec, not a working ledger.

## Verification of "no voice consumer"

The speech kind occurs in the source tree only in its declaration and in the provider's refusal: `src/lib/audio-gen/types.ts:6` "export type AudioKind = 'sfx' | 'ambient' | 'music' | 'tts';". The single registered provider serves two kinds, `src/lib/audio-gen/providers/elevenlabs.ts:36` "capabilities: ['sfx', 'ambient']," and refuses speech in writing, `src/lib/audio-gen/providers/elevenlabs.ts:45` "tts: 'Text-to-speech needs". The type documents the contract: `src/lib/audio-gen/types.ts:35` "The kinds `generate` REALLY serves".

## Confirmed

- **The declared-but-unserved modality is caught.** The header records that a speech request used to be posted to the sound-effect endpoint and come back under the wrong label: `src/lib/audio-gen/providers/elevenlabs.ts:19` "used to claim `tts`". The capability gate now refuses before any billed call, which is the technique's "declaring an input is not consuming it" case fixed in the provider registry, where it belongs.
- **The downstream fact is recorded.** The step fact says the voice step produces text only: `src/lib/status/step-facts.json:1241` "claimed VO deliverable is text, not recorded voice".

## Upward lesson

The spec names the two licence axes the ledger row now carries, the weights' terms and the reference sample's terms: `docs/research/local-tts-provider-spec.md:81` "A generated voice carries two licences" and `docs/research/local-tts-provider-spec.md:87` "The reference sample." It declines to add a provenance field until a provider exists to fill it, `docs/research/local-tts-provider-spec.md:93` "Adding a `voiceProvenance` field", which is the same restraint as leaving the ledger empty until a real provider exists.

## Deviations

- **No consent field and no role-to-voice resolution exist.** The licence field is per kind, not per voice: `src/lib/audio-gen/types.ts:46` "commercialLicense: Partial<Record<AudioKind, CommercialLicense>>;", so it cannot carry a clone's reference terms.
- **The speech provider is a specification with a trigger, not code:** `docs/research/local-tts-provider-spec.md:96` "## Reconsider trigger".

## Seam

A ledger row sits beside the provider's licence map, keyed by role; the render route resolves role to row and refuses on an empty consent field, next to the existing kind refusal.
