---
layer: application
type: application
subject: multi-speaker-speech-production
technique: line-addressed-re-render
stack: node
status: forged
verified_on: 2026-09-30
verified_against: node@22
---

# A per-utterance narration route with no line identity

Written against a studio-story tool at commit f24abf0557, read from HEAD rather than its
working tree. The route is the closest thing that tree has to a per-line render, and it
shows what the technique adds: it renders one utterance per call, but nothing makes the
utterance an addressed, re-renderable line.

## What the route does

The narration route takes text, a voice id, an optional model id and a project id, and
renders one utterance: `src/app/api/ai/audio/tts/route.ts:33` "const { text, voice_id, voice_settings, model_id, project_id } = body;".
The model is a default the caller may override, `src/app/api/ai/audio/tts/route.ts:71` "model_id: model_id ?? 'eleven_v4',",
so the engine generation is a request-time default and part of no stored record.

## Deviation: the output is keyed by time, not by line

Every render is stored under a fresh path made from the clock and the voice,
`src/app/api/ai/audio/tts/route.ts:93` "const storagePath = ", and uploaded without
replacement, `src/app/api/ai/audio/tts/route.ts:99` "upsert: false,". There is no line
address in the path or the request, so a caller that changes one line cannot say that this
clip replaces that one, cannot ask which clips are stale, and accumulates a new file per
press of the button. The render key the technique requires (text, voice, engine generation,
compiled direction, lexicon version, continuity context) is recorded nowhere in this route;
only the voice id reaches the path. The standard does not move: the caller would have to
hold the address, the key and the accepted-clip pointer itself, and the route would have to
return what it rendered against.

## Not measured

No ten-render identity check exists in this tree, so whether the engine holds a speaker
steady across re-renders is unmeasured here, not confirmed. Adding a line id to the
request, storing renders as records keyed by the full tuple with an accepted-clip pointer,
listing stale lines on a script diff, and running the check once per voice would close it.
