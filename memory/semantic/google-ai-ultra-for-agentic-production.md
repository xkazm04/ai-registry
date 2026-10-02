---
kind: semantic
confidence: 0.6
namespace: engineering
source: vendor-research-and-probe
---

# Google AI Ultra in an agent-orchestrated production (as of 2026-10-02)

What a consumer **Google AI Ultra** subscription gives a team whose work is driven by an orchestrating agent, split by
whether an agent can reach it headlessly. Researched from Google's own pages and probed on a win32 machine on
2026-10-02; confidence 0.6 because quota numbers are unpublished and plans change.

| Need | Route covered by the subscription | Headless for an agent? |
|---|---|---|
| Coding, review, analysis | **Antigravity CLI (`agy`)**: Gemini 3.8 / 3.7 / 3.6 Flash, Gemini 3.1 Pro and some third-party models on one shared quota (a 5-hour window plus a weekly cap; Ultra is a multiple of Pro, no absolute numbers published) | **Yes** (verified), see `agent-cli-transport` applications `antigravity-cli--*` |
| Images (concept art, glyphs, UI) | the image tool inside `agy`; also the Flow web app | **Yes** via `agy` (verified: 1024x1024 in ~30 s); Flow is browser-only |
| Music | Flow Music (Lyria), credits per month, commercial rights stated | **No** - browser only; the agent writes prompt sheets, a person generates |
| Video, trailer | Flow (Veo), credits per clip | **No** - browser only |
| Sound effects | no dedicated tool (audio only as part of generated video) | - use another SFX source |
| 3D models, rigging, animation | **none** usable as game assets (world models produce explorable worlds, not meshes) | - source elsewhere |
| The Gemini **API** (image, video, music, TTS by call) | **not covered** - billed per call even for a subscriber | yes, but it is metered spend: a budget decision |

Facts that cost time if unknown:

- **Gemini CLI no longer serves personal subscriptions** (retired for them on 2026-06-18). Its personal sign-in now
  fails with `IneligibleTierError ... migrate to the Antigravity suite`; with an API key it still works, metered.
- Driving `agy` as a child process on cached credentials is reported as supported; extracting its credentials to call
  backend endpoints directly is not (forum guidance, not confirmed as Google staff).
- Subagents spend the shared quota in parallel; keep worker fan-out low.
- Generated media carries an invisible SynthID watermark; check any competition's AI-disclosure rules.
