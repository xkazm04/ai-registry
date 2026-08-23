---
layer: application
type: application
subject: voice-io
technique: portable-provider-package
stack: node
status: forged
verified_on: 2026-08-23
---

# A source-only TTS package shared between a Next.js recruiting app and a Tauri desktop app

The `kp` recruiting studio ships spoken output through `packages/voice-tts/` — a
directory with no host imports, bound into the app by one file
(`app/_lib/tts.ts`), served by one route (`app/api/tts/route.ts`), compared by ear
in `app/_components/voice/TtsComparePanel.tsx` on the internal `/interview-lab`
page. The local engines it drives are the same ones the Personas desktop app
installs (`src-tauri/src/companion/tts/kokoro.rs` in that repo), found at the same
per-user home, so one model download serves both apps.

## Confirmed against the technique

- **The host seam is one object.** `packages/voice-tts/src/types.ts:82-90`
  defines `TtsHost { env, homeDir, cwd, log? }`; kp binds it in
  `app/_lib/tts.ts:19-28` from `process.env`, `os.homedir()`, `process.cwd()` and a
  console sink that only prints `fallback`/`error` events unless `KP_TTS_DEBUG`
  is set. Nothing under `packages/voice-tts/src` imports from `app/`; the package
  tests (`packages/voice-tts/src/registry.test.ts`) run with a literal
  `{ env: (k) => env[k], homeDir: () => "/home/x", cwd: () => "/app" }` host and
  the `FakeTts` provider — no audio, network or model files.
- **One dispatch door, one validation door.** `createTts().speak()`
  (`registry.ts:113-125`) runs `validateRequest` (`validate.ts:21-31`: 1200-char
  cap, `[A-Za-z0-9_-]` voice ids, language-tag shape, speed clamped 0.5–2) before
  resolving an adapter, and serializes `kind === "local"` providers through a
  promise chain (`registry.ts:118-122`) because the one-shot sidecars reload their
  model per call. The kp route passes raw body fields straight to `speak()`
  (`app/api/tts/route.ts:34-43`) and never validates on its own — the door is
  the package's.
- **Preference is the host's, resolution the package's.** kp writes
  `KP_TTS_PROVIDER` / `KP_TTS_PROVIDERS` from the onboarding skill
  (`.claude/skills/onboarding/SKILL.md`, group 3b) and hands them over via
  `preferenceFromEnv` (`registry.ts:48-59`), which drops unknown ids instead of
  throwing — the test "drops unknown ids and keeps preferred inside allowed"
  feeds it `retired-engine` and gets a clean set back. `resolve()`
  (`registry.ts:76-96`) walks requested → preferred → first allowed+ready, logs a
  `fallback` event and returns `fallbackFrom`; nothing ready throws
  `TtsError("unavailable", <last probe reason>)`.
- **The verdict survives every boundary.** The route forwards the resolution as
  `X-Tts-Provider`, `X-Tts-Voice`, `X-Tts-Elapsed-Ms`, `X-Tts-Fallback-From`
  (`route.ts:44-53`); `useTts` reads them back (`react/useTts.ts:100-105`); the
  panel renders "Spoken by X in N ms — fell back from Y" (`TtsComparePanel.tsx:136-143`).
  Error codes map to status at one place: 400 invalid, 503 unavailable, 504
  timeout, 502 engine failure (`route.ts:55-59`).
- **The route is policy.** `requireOperator()` on both verbs, and
  `rateLimit("tts:<ip>", 60 / 10 min)` placed before `getTts().speak(` — pinned by
  `app/api/rate-limit-contract.test.ts` (`./tts/route.ts` entry), which asserts the
  key, the limit constant's value, the 429 envelope and that the limiter precedes
  the expensive call.
- **Probe-only read.** `GET /api/tts` returns `{ providers: TtsStatus[] }` with
  each adapter's `probe` (`absent` + `setup` hint / `broken` + reason / `ready`),
  `allowed` and `preferred` flags — the thing onboarding verifies against without
  spending a credit.
- **Compare by ear, gated.** `TtsComparePanel` lists only `allowed` providers,
  disables non-ready ones with the reason in the tooltip and a hint list below,
  speaks one en/cs sentence through the pick. It is mounted only on
  `/interview-lab`; candidate surfaces (`/interview/[token]`) never import it.
- **Shared local engines.** `node/resolve-bin.ts:11-13` defaults the sidecar home
  to `~/.personas/companion-tts` (override `VOICE_SIDECAR_HOME`), the exact layout
  the desktop app's installer writes (`bin/sherpa-onnx-offline-tts.exe`,
  `kokoro/model.onnx`). On the machine this was verified on, kp's probe found the
  desktop app's Kokoro install ready with nothing downloaded, and both local
  engines synthesized through the package (Piper Czech 2.8 s, Kokoro English 2.5 s
  for one sentence).

- **Speech-ready text and chunking (added 2026-08-23, deepen round).**
  `packages/voice-tts/src/text/normalize.ts` (`speechReady`) and
  `text/segment.ts` (`segmentSpeech`) are pure and isomorphic; the validation
  door applies `speechReady` when `format: "chat"` (`validate.ts:21-23`), and
  `react/useTts.ts` runs the same two functions in the browser, then fetches
  chunk N+1 while chunk N plays (lookahead 2) and reports `firstAudioMs` plus a
  `{ spoken, total }` progress that survives a mid-utterance failure as a
  truncation string. The chunk maximum is the engine's declared
  `capabilities.maxClipChars` (cloud 1200, local 300); above it the registry
  itself segments and joins WAV clips (`registry.ts:125-140`) so a whole-clip
  host still gets one clip. Measured on this machine: a 450-char Czech
  paragraph through Piper = 10.1 s synthesis for 57.7 s of audio, which is
  the number that makes client-side pipelining mandatory rather than nice.
- **Like-for-like compare.** The cloud adapter now requests raw 24 kHz PCM and
  wraps it into WAV (`providers/elevenlabs.ts:84-86,104`) so all three
  providers return `audio/wav`; the sample rate still differs (22.05 / 24 /
  24 kHz) and is not yet shown next to the clip.
- **Kokoro language claim corrected.** `capabilities.languages` lists the
  eight languages the v1.0 pack actually speaks (`providers/kokoro.ts`); Czech
  and German are absent, and the adapter comment says what a Czech sentence
  does (English accent, not an error). The voice catalog grew to one female
  and one male US voice plus one GB voice; only `af_heart` is verified by ear.

## Deviations

- **Per-call sidecar spawn.** Both local adapters still spawn the engine per
  synthesize call (`providers/piper.ts`, `providers/kokoro.ts` via
  `node/spawn.ts`) and the registry serializes them. The technique's corrected
  framing holds: the bound is a CPU-budget choice, but the model reload per
  call is real cost (seconds for Kokoro's ~310 MB). Return condition: a host
  that needs sub-second local time-to-first-audio — then a resident process
  (Piper reads stdin line-by-line with the voice loaded once; sherpa-onnx's
  node binding loads once and renders per sentence with a callback).
- **No loudness normalization or leading-silence trim** on the compare
  surface; the technique names them, kp does not do them yet.
- **Numbers are not expanded for Czech.** `speechReady` deliberately leaves
  digits alone; a per-locale normalizer is the host's and does not exist.
- **Preference cannot be persisted from the compare surface.** kp has no settings
  row for voice yet; a pick in the panel is per-page-load and the durable choice
  is env-only. The technique wants the host to own persistence — kp owns it but
  only through onboarding, not through the UI.
- **No streaming adapter.** Every shipped provider declares `streaming: false`
  (chunked pipelining happens at the utterance level, above the adapters); the
  relay-mode conversation plane (`docs/architecture/voice-conversation-plane.md`)
  still uses the conversation provider's own synthesis rather than this package.
- **The desktop app does not consume the package.** Its engine layer is Rust
  (`companion/tts/mod.rs`) and only the *install layout* is shared; the TypeScript
  package duplicates the Kokoro wire protocol rather than importing it. The
  vocabulary is shared by convention (`af_heart` = speaker 3 in both), not by one
  authority.

## Upward lessons the repo taught

- The desktop app's decision to run the sidecar out-of-process because its bundled
  runtime collides with the app's own pinned runtime became the package's default
  for every local engine, not just that one — a subprocess boundary is cheaper
  than a runtime negotiation.
- The desktop app's curated single default voice (rather than exposing all 53
  speaker ids) carried over as `BUILTIN_VOICES` plus an env extension
  (`KOKORO_VOICES="id:sid"`): a voice catalog is a picker, not a download, and a
  small curated one is more honest than a long list nobody has listened to.
