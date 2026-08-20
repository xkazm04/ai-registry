---
layer: application
type: application
subject: voice-io
technique: duplex-agent-sessions
stack: react
---

# A hosted voice-agent session in a Next.js recruiting app — and the seam that kept it swappable

The candidate-facing AI screening interview in the `kp` recruiting studio runs as
a duplex agent session against ElevenLabs Agents, with OpenAI Realtime as a
second provider behind the same interface. This is the technique realized twice
over — once in the **brain** shape (the candidate interview) and once in the
**transport** shape (the role-intake dialog) — in one codebase, which is why it
is worth writing down: the two shapes sit side by side and their costs are
visible against each other.

## The adapter seam

`app/_lib/voice/types.ts` declares one `VoiceAdapter` interface — `requiredEnv`,
`available()`, `connect({ instructions, language, relay })` — and the two
adapters (`elevenlabs.ts`, `openai.ts`) are the only modules that know a vendor's
name. `requiredEnv` is the single source for "is this provider configured":
`available()` derives from it and the connect route builds its user-facing
"not configured — set X and Y" message from it via `missingVoiceEnv`, so a
renamed environment variable cannot leave a stale message behind. This is the
subject's engine-abstraction rule applied one level up, at the *session* rather
than the engine.

Two consequences the codebase actually exercises:

- **Failover is a layer, not a branch.** `connect-failover.ts` retries the other
  provider inside the same request when the preferred one's mint throws, and
  persists which provider *actually served* the call so the usage ledger and
  telemetry attribute to reality rather than to the request.
- **The vendor's protocol is not the vendor.** `self-hosted.ts` resolves the API
  host from `ELEVENLABS_BASE_URL`, so the same client path talks to a self-run
  service speaking the same signed-URL-then-socket protocol. Setting one variable
  moves an interview off per-minute billing with no client change — and
  `isSelfHostedVoice()` then relaxes the mint rate limit and zeroes the
  per-minute cost estimate, because the premise of both was per-minute vendor
  billing.

## Where the split of configuration bites

The stored agent is deployed and verified by `scripts/setup-eleven-agent.mjs`,
which holds `intendedConfig()` — prompt, ASR keyword bias, override unlock flags,
language, reasoning model, temperature, synthesis model, max duration — as one
structure consumed by **both** `--deploy` and `--check`. `--check` fetches the
live agent and diffs field by field through the pure `eleven-agent-diff.mjs`,
exiting `0` match / `1` drift / `2` cannot-verify: the three-state gate from the
technique, including the "cannot verify" state that a two-state check would
report as agreement. The header documents that `--deploy` rotates
`ELEVENLABS_AGENT_ID` because the platform has no upsert, and that in-flight
sessions keep running on the old agent.

The account-vs-session split shows up as a scar in the feature doc. The voice
harness caught the recognizer corrupting technology names — "React" heard as
"Rust", "PostgreSQL" as "později SQL" — which the scorecard then scored as a
fabricated skill set. The fix available at the time was a **static, account-wide**
keyword list in the deploy script, with the doc recording why: *"per-session
keywords aren't reachable through the browser SDK (its override type has no `asr`
field)"*. As of `@elevenlabs/client` 1.21.0 (2026-08-19) it is —
`overrides.asr.keywords`, capped at 50 per conversation — so the per-job keyword
list the fix originally wanted is now buildable. That is the technique's
"re-read the contract on every upgrade" rule paying out, roughly a month late.

## The brief that may be spoken aloud

ElevenLabs' signed-URL flow has no server-side session configuration: overrides
are sent by the browser, so anything the server hands the client for the session
is visible to the candidate. The recruiter's real brief is not — it carries gap
annotations and "internal red flag, never say this aloud" notes.

So `/api/interview/connect` sends ElevenLabs a **candidate-safe** brief built by
`app/_lib/voice/candidate-brief.ts` through allow-list sanitizers: run-of-show
topics, the questions asked aloud, time boxes, an opening-language hint — and
nothing else, structurally, because fields like `listenFor` and `redFlag` are
never copied rather than being stripped. The OpenAI path, which *does* accept
server-side session configuration, receives the full brief and never exposes it.
Same product behavior, two different disclosure surfaces, one route deciding
between them in `resolveAgentPrompt`.

The same route is where the meter starts, so the credential mint sits behind
every lifecycle guard (completed / revoked / expired / terminal pipeline entry),
a consent check, and a per-token rate limit of 6 mints per 10 minutes — keyed by
token rather than IP, because the link is the credential and rotating IPs must
not reset the budget.

## Verdict at the close

`app/_components/voice/transport/elevenlabs.ts` is a thin hook around
`useConversation`, and its three callbacks are precisely the technique's
end-of-session rules:

- `onConnect` checks a "we already finalized" latch and, if the 30-second connect
  timeout already fired, calls `endSession()` instead of going live — the
  late-arrival case, torn down rather than adopted;
- `onDisconnect` refuses to finalize when this provider is not the one that
  served the call, and hands the completed-vs-failed judgment to
  `finalize-status.ts`, which knows that ElevenLabs fires disconnect after every
  error too. A `failed` verdict skips scoring, skips the Interview→Offer
  approval, and leaves the link reconnectable;
- transcript turns are pushed from `onMessage`, so the transcript is the
  product's own record before the session ends rather than something fetched from
  the vendor afterward.

`minute-prices.ts` closes the loop at `/complete`: a ledger row carrying the
serving provider, the agent identity as the model, the clamped minute count, and
a per-minute cost estimate that is explicitly documented as a local estimate, not
a contractual rate — zeroed when the session was served by a self-hosted endpoint,
because leaving the hosted price on those rows would inflate every cost report by
exactly the spend that self-hosting removed.

## The other shape, in the same repo

`docs/architecture/voice-conversation-plane.md` states the transport shape as a
principle — *"a realtime voice provider is a speech transport, never the
conversational brain"* — and the role-intake dialog implements it: the provider
transcribes and speaks on command, while a fast server thread generates each
utterance from the persona and a compact captured/missing digest, and a slower
periodic thread re-extracts the structured brief every few exchanges. Two details
of that design are the transplantable part:

- the **fast/slow split**, because the full text-plane exchange (reply plus a
  full structured re-extraction) took 30–40 s — fine in text, unusable aloud;
- **server truth after every exchange**, which is what makes a mid-call transport
  swap a credential mint rather than a context migration, and what makes the
  keyless path honest: with no model available the deterministic slot engine *is*
  the fast thread, so the call still completes end to end.

The candidate interview still runs the brain shape. The gap between the two
surfaces is the honest cost accounting for the technique: the brain shape shipped
speech in days and now owns a remote configuration object, a drift-check script,
a sanitized-brief path, and a documented migration it has not made.
