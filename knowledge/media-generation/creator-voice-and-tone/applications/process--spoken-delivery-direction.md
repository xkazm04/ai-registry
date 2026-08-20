---
layer: application
type: application
subject: creator-voice-and-tone
technique: spoken-delivery-direction
stack: process
status: forged
---

# A worked casting ledger — the TTS / voice-generation landscape, August 2026

Spoken-delivery-direction says: cast deliberately, direct in the cast engine's
dialect, and verify the render by listening. This application IS the casting sheet a
voice director would work from — a dated, sourced snapshot of the synthetic-voice
landscape as of 2026-08, organized by the technique's three direction-interface
classes. It will go stale; that is what the dates are for.

## The direction-dialect split (the technique's three classes, instantiated)

| Engine / family | Interface class | Direction dialect | Notes |
|---|---|---|---|
| ElevenLabs Eleven v3 | inline performance cues | bracketed audio tags — `[pause]`, `[rushed]`, `[deliberate]`, `[stammers]`, `[emphasized]` — plus punctuation and a style-exaggeration slider | v3 explicitly does **not** honor SSML break tags; tags are probabilistic requests, same tags work via API and UI |
| Fish Audio / OpenAudio | inline performance cues | 50+ named emotion tags | #1 on TTS-Arena2 at access date; 80+ languages; the most emotion-addressable hosted engine |
| Bark, Dia/Dia2 (Nari Labs) | inline performance cues | nonverbal markers (laughter, sighs) in-text | open; Dia2 is dialogue-oriented, Apache-2.0 |
| Azure / Google Cloud TTS classic voices | deterministic markup | SSML — exact break durations, emphasis, phoneme spelling, rate | the surviving home of guaranteed-honored markup; less expressive ceiling |
| Hume (Octave / TADA, 2026-03) | style instruction | natural-language delivery description; text-meaning-conditioned prosody | TADA claims zero word-hallucinations across 1,000+ samples and 700 s single-pass long-form |
| Chatterbox / Chatterbox-Turbo (Resemble AI, MIT) | reference audio | ~5 s zero-shot clone, cross-lingual (clone in English, speak Japanese); emotion control | vendor's own blind test: preferred 65.3% vs ElevenLabs 24.5% — vendor-run, treat as a claim |
| XTTS-v2 (Coqui lineage) | reference audio | 6 s clone carries timbre *and* speaking style | check license before commercial use |
| Kokoro (82M, Apache-2.0) | none to speak of | fixed voices, no cloning | 210× real-time on one consumer GPU, CPU-viable — the draft-render workhorse |
| NeuTTS Air (Neuphonic, 0.5B) | reference audio | instant on-device cloning | the on-device end of the cost spectrum |
| Cartesia Sonic / LMNT | minimal (latency-first) | — | sub-100 ms / 150–200 ms streaming; agent voices, not narration casting |

The routing consequence the technique predicts is visible in the table: a script
directed with v3-dialect bracket tags renders the tags *as spoken words* on an SSML
engine and vice versa — **re-casting the narrator re-opens every delivery
decision**, so direction is authored per cast engine, never copied across.

## Casting notes for long-form factual narration (2026-08)

- **Consistency is the binding constraint, and it is now the differentiator.**
  Long-form guides converge on the same ranking criterion the technique states:
  hold timbre/pace/energy across chapters. Hosted leaders (ElevenLabs, Fish Audio)
  and consistency-marketed platforms sell exactly this; word-hallucination
  (skipped, repeated, invented words) remains a live TTS failure class — which is
  why Hume markets "zero hallucinations" as a headline. Verify-by-listening is not
  optional at any tier.
- **Open weights reached casting-viable quality.** Best open models score ~4.7 MOS,
  within reach of paid tools; Kokoro, Chatterbox-Turbo (MIT), Orpheus, Dia2, and
  Higgs Audio V2 (all Apache-2.0 or MIT) are commercially clean. The economic
  pattern mirrors the image bundle: draft-render on a free local engine, cast the
  finish voice on a hosted tier — but unlike image work, the *direction dialect*
  changes with the engine, so the cheap-draft/premium-finish split costs a
  re-direction pass.
- **Rate ground truth for the budgeting correction.** Professional human audiobook
  narration: 130–175 wpm, centered 150–160 (Audible/ACX calculates at 9,300
  words/hour = 155 wpm). Produced-video guidance: 130–170 wpm by format. Both sit
  well under the 197–252 wpm presenter-led band — the delivery-rate-budgeting
  technique's band caveat is sourced here.

## Cost classes

Premium per-character hosted APIs (ElevenLabs, Hume) · competitive hosted
(Fish Audio) · latency-priced streaming (Cartesia, LMNT) · free local compute with
clean licenses (Kokoro, Chatterbox, Orpheus, Dia2, Higgs Audio V2) · on-device
(NeuTTS Air). Per the cost-per-usable-output law: a local engine whose renders fail
the listening gate more often is not the cheap option for finish work.

## Sources (accessed 2026-08-20)

- https://elevenlabs.io/blog/v3-audiotags
- https://elevenlabs.io/blog/eleven-v3-audio-tags-precision-delivery-control-for-ai-speech
- https://help.elevenlabs.io/hc/en-us/articles/24352686926609-Do-pauses-and-SSML-phoneme-tags-work-with-the-API
- https://www.befreed.ai/blog/best-tts-model-2026
- https://fish.audio/blog/best-text-to-speech-for-audiobooks-2026/
- https://www.tryspeakeasy.io/blog/open-source-text-to-speech-2026
- https://findskill.ai/blog/best-open-source-tts-2026/ (Chatterbox blind-test figures)
- https://localclaw.io/blog/local-tts-guide-2026
- https://openvoxai.com/blog/best-tts-models-local-cloud-2026
- https://noiz.ai/use-cases/en/article/guide-to-text-to-speech-for-professional-audiobooks-2026 (Hume TADA)
- https://www.promptvo.com/blogs/whats-an-average-speaking-rate-how-many-words-per-minute-wpm-is-average-when-reading-an-audiobook-or-giving-a-presentation
- https://karencommins.com/2011/06/some_simple_math_about_audiobo.html (ACX 9,300 words/hour)
- https://flowshorts.app/blog/words-per-minute-speaking
