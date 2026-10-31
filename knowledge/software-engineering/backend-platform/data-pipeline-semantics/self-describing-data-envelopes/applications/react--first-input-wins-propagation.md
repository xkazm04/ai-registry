---
layer: application
type: application
subject: self-describing-data-envelopes
technique: first-input-wins-propagation
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
---

# A spoken reply heard in two voices and reported in one

The stack version comes from the tree's own `"react": "^19.3.1"` (package.json, kp at
commit `5039739e0`). The seam is in xkazm04/kp, a public Next.js app. Its text-to-speech
layer is a source-only package with cloud and local engine adapters behind one
interface, plus a browser hook that plays a long reply in chunks.

## Two joins, and only one of them was a join on purpose

Every synthesized clip is an envelope: the audio bytes, plus the engine that served it,
the engine it fell back from, the voice used, and the synthesis time. Two places in the
package combine several of these into one.

**The server join was already correct.** When a text is longer than an engine's clip cap,
the registry resolves an engine once, synthesizes sentence chunks with it, and joins them
into one clip. It treats the join as a domain operation, the way the technique says it
should. The engine is resolved once for the whole text, at
`packages/voice-tts/src/registry.ts:179 "const { provider, fallbackFrom, unsupportedLanguage } = await resolve"`.
The voice is taken from the first chunk, at
`packages/voice-tts/src/registry.ts:194 "voiceId: clips[0].voiceId,"`. Synthesis
time is summed and the chunk count is recorded. The byte join refuses chunks whose
sample rate, channel count or bit depth differ, which is a domain operation refusing
in a place built to refuse, not inside arithmetic. Nothing here needed to change.

**The browser fold was the gap.** The hook splits a reply at sentence boundaries and
plays chunk N while it fetches chunk N+1. Each chunk is a separate request to the host
route, and the route resolves an engine **per request**. So one utterance can be served
by two engines. The cloud adapter caches a ready probe for a minute and drops the cache
on any failure that is not a 429, at
`packages/voice-tts/src/providers/elevenlabs.ts:100 "if (res.status !== 429) this.probeCache = null"`.
Once the cache is dropped, the next chunk's request can land on another engine. The hook
built its `served` summary, which its own doc comment calls "the provider that served
the utterance", from chunk 0 and never updated it after that. That is first-input-wins
applied to a fusion. Chunk 0's slots were right for chunk 0, but the summary claimed the
whole utterance, and an engine switch never reached any surface. The operator heard two
voices and was shown one.

## What changed

The scalar slots stay chunk 0's. That is the technique's rule, and the reason holds here:
two chunks that disagree on `fallbackFrom` have no merged value. Picking "whichever has
one" would label chunk 0 with a fallback it never made. What the fusion adds is the
sources list the technique asks a join to carry: every serving engine, in order of first
appearance, without repeats. The field is declared at
`packages/voice-tts/src/react/useTts.ts:186 "providers?: TtsProviderId[];"`, and the
pure fold is `packages/voice-tts/src/react/useTts.ts:196 "export function servedWithChunk("`.
A repeated engine returns the previous object unchanged
(`packages/voice-tts/src/react/useTts.ts:214 "return providers.includes(chunk.provider) ? prev"`),
so a uniform utterance re-renders nothing it did not re-render before. The hook calls the
fold on every chunk start, at
`packages/voice-tts/src/react/useTts.ts:430 "setServed((prev) => servedWithChunk(prev, idx, chunk, firstAudioMs));"`.

## Proof

This was a paired A/B in the package's own test file. Arm A is the replaced rule, inlined:
chunk 0 sets `served` and later chunks never touch it. Arm B is the shipped fold. Both
arms ran over the same four scripted utterances: uniform; falls back mid-utterance;
recovers mid-utterance; switches back and forth. That is n = 4 utterances, 13 chunks and
7 distinct utterance-engine pairs.

| Measure | A | B |
| --- | --- | --- |
| target: serving engines visible in `served` | 4/7 | 7/7 |
| floor: utterances whose existing slots (provider, fallbackFrom, elapsedMs, firstAudioMs, voiceId, unsupportedLanguage) are identical across arms | - | 4/4 |

The package's suites (37 tests), lint and the project type check stayed green. The
project's pre-push gate ran green on the push.

**The seam was chosen to falsify.** The technique sends a multi-source fusion to an
explicit domain operation that records every input's source. The result that would have
caught it: per-chunk resolution can never diverge within one utterance. In that case the
list would always hold one engine and the change would be a no-op (`not-better`). The
tree rules that out structurally. Resolution runs per request, and the probe cache is
invalidated mid-minute by design. So the finding held. The server join also showed the
technique's other half in a tree that had arrived at it independently: first-input-wins
for the slots, refusal in a domain operation, no merge.

## What the realization cannot do

The proof is scripted. It shows that a mixed utterance is now reported as mixed. It does
not show how often real utterances are mixed. That needs a count over the host log's
`fallback` events grouped by utterance, and the host does not record an utterance id. No
surface renders the new list yet either. The voice panel still shows `served.provider`,
so the information reaches the hook's state and stops there until a surface reads
`providers.length > 1`. The list also records engines and not voices. A switch between
two voices of one engine is not visible, although the per-request voice header carries
it.
