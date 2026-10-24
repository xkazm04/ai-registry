---
kind: semantic
confidence: 0.3
namespace: engineering
source: vendor-pages-2026-10-24-not-yet-probed
---

# Meta Model API for an agent product (as of 2026-10-24, not yet probed)

What Meta's hosted models offer an agent that reads paper, hears calls and sees rooms, and how to
call them. Read from Meta's own pages (`dev.meta.ai/docs/models`, `dev.meta.ai/docs/pricing-rate-limits`)
on 2026-10-24. Confidence 0.3 because **no row has been measured yet**; the featured-chore spikes in
athena-portable (from 2026-10-26) replace rows with measured ones, each with its date, n and run id,
and raise the confidence only when every row it rests on is measured.

| Need | Model id | What it does | Price (Standard) | Tag |
|---|---|---|---|---|
| Reading, agents, tool calls | `muse-spark-1.3` | text, image, video, audio, PDF in; 1,048,576-token context; structured output, search grounding | $1.25 / $4.25 per M tokens (cached in $0.15) | press |
| Audio input to the reasoning model | `muse-spark-1.2` | same as 1.3; Meta recommends 1.2 for audio because 1.3 audio is "not fully supported" | same | press |
| Long-horizon agent, computer use | `muse-wonder-1.0` | preview; effort `minimal`..`max` | $4 / $20 per M | press |
| Masks, counts, tracking | `sam-3.1` | all instances of a noun phrase, or prompted boxes/points; tracks objects across video; Responses endpoint, Files API for clips | $2.50 / 1,000 images; $0.20 / 1,000 video frames, min 50 frames per request | press |
| Speech to text | `muse-voice-transcribe-1.0` | streaming diarization, endpointing, keyword biasing, 25 languages, turn-level (not word-level) timestamps; realtime WebSocket or file | $0.18 / audio hour | press |
| Images | `muse-image-1.0` | generation and editing | $0.01 / image | press |
| Local or private lane | Muse Glimmer (open weights) | text + image in; distilled from Spark; vLLM, SGLang, llama.cpp, ExecuTorch | self-hosted | press |

Facts that cost time if unknown:

- Base URL `https://api.meta.ai/v1`; Meta's examples use the OpenAI SDK against it, so an existing
  OpenAI-compatible client with a base-URL field is the shortest path (press; streaming not stated).
- **Contributor mode** (`-contributor` ids, about a tenth of the price) grants Meta the right to
  train on prompts, files and responses. Never route a person's data there; enforce it in code, not
  in a prompt.
- Rate limits are **per team, not per API key** - parallel agents share them.
- A SAM video request is billed for at least 50 frames: sample frames yourself for short clips.
- Hackathon credits (Meta Global AI Developer Hackathon, 2026-10-26 to 2026-11-04) were $150 per
  participant for ten days; budget per workstream.

Related: the live findings vault of the spikes is consumer-local (athena-portable `.spark/Spark/meta/`);
what generalises beyond Meta arrives as technique leads through the librarian, not here.
