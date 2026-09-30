---
layer: application
type: application
subject: multi-speaker-speech-production
technique: voice-asset-model-generation-binding
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@22
---

# A render cache that cannot see a model upgrade

Written against a video-timeline tool at commit 7c4bd092af, read from HEAD. Its streaming
narration route pins a model generation and caches renders, and the cache key is where the
technique's binding is missing. The file opened holds no cloned voices, so the cast-sheet
and consent halves of the technique were not evaluated here.

## Confirmed: the generation is pinned in code, per call

The render call names its model, `app/api/elevenlabs/stream/route.ts:226` "modelId:", so a
generation change is a code edit, which is a reviewable event. It is the only pin in the route.

## Deviation: the cache key omits the generation and the settings

The key is a hash of the text and the voice only,
`app/api/elevenlabs/stream/route.ts:27` "crypto.createHash('md5').update(", and a hit is served
with a one-year client cache header, `app/api/elevenlabs/stream/route.ts:213` "'Cache-Control': 'public, max-age=31536000'".
The voice settings sit in the render call and are not in the key,
`app/api/elevenlabs/stream/route.ts:227` "voiceSettings: {". Change the pinned model and every
previously seen text keeps being served from the old generation, while new texts render on the
new one. The production ends up with both generations mixed and no record of which clip is
which, and the cast sounds unchanged exactly where nothing was re-rendered. The standard
stays: the key names the generation and the settings, the voice carries its own generation
stamp, and an upgrade is gated on the per-voice acceptance pass, never on the identifier
having changed.
