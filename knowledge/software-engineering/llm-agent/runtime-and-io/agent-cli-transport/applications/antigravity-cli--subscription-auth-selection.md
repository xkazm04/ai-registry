---
layer: application
type: application
subject: agent-cli-transport
technique: subscription-auth-selection
stack: antigravity-cli
verified_on: 2026-10-02
verified_against: antigravity-cli@1.2.15
---

# Seat-vs-key selection for Google's agent CLIs after the Gemini CLI retirement

Observed on win32 on 2026-10-02 with a personal Google account holding a consumer AI subscription.

## The old seat path now refuses, loudly

**[RUN]** `gemini` (Gemini CLI 0.62.0, auth `oauth-personal`) with `-p` exited with
`IneligibleTierError: This client is no longer supported for Gemini Code Assist for individuals. To continue using
Gemini, please migrate to the Antigravity suite of products`, `tierId: 'free-tier'`. The CLI still runs with an API key
(metered billing), so a host that silently falls back from seat to key would keep working and start spending.
Selection must be explicit: the seat for a personal subscription is now the Antigravity CLI.

## The Antigravity CLI seat

- Sign-in is interactive once (browser OAuth, then an authorization code pasted into the **same** waiting process).
  **[RUN]** a headless run with no cached credentials prints "Waiting for authentication (timeout 60s)", then exits 1
  with `{"status": "ERROR", "error": "authentication failed or timed out"}` - it does not hang. An authorization code
  is single-use and bound to the process that requested it; one pasted into a later process cannot be redeemed.
- After that, headless runs reuse the cached credentials. **[RUN]** `agy models` listed the seat's models
  (Gemini 3.8 / 3.7 / 3.6 Flash at low/medium/high, Gemini 3.1 Pro low/high, and third-party models served on the same
  quota); `agy -p ... --model gemini-3.8-flash-high --output-format json` answered a code-reading task in 15-51 s and
  reported `usage` (input, output, thinking, cache-read tokens) per turn.
- The JSON result carries `conversation_id, status, response, duration_seconds, num_turns, usage, denied_actions`.

## What the seat covers and what it does not

- **Covered (headless):** agent turns on the listed models; the built-in image tool. **[RUN]** asked to generate and
  save an image, the agent produced a 1024x1024 JPEG in the workspace in 29 s with no extra auth.
- **Not covered by the seat:** the vendor's model **API** (image, video, music by call) is billed per call even for a
  subscriber, and the subscription's video and music studios are browser apps an agent cannot drive. A host that
  needs those headlessly is choosing metered billing, which is a budget decision, not an auth detail.
