---
layer: application
type: application
subject: voice-io
technique: voice-setup-experience
stack: react
status: forged
verified_on: 2026-10-07
verified_against: react@19
---

# A desktop companion's first meeting: the "Table" studio over one setup engine

The Personas desktop app (React front end, Rust back end) introduces its
companion through a ten-step setup flow. The voice part is three steps of
"her voice" (`voice_engine`, `voice_install`, `voice_pick`) and one of "your
voice" (`stt`). One engine hook emits one card per step, and several shells
render it. The "Table" shell, which won the project's design contest, is the
one read here. Everything below was read at personas `658137ea`
(2026-10-07); the cited files were clean against that commit. Measurements
were taken on the same machine the same day.

## Confirmed against the technique

- **One local, heard voice is the default.** The engine slot defaults to the
  local engine (`src/stores/slices/system/athenaSlice.ts:342`,
  `athenaVoiceEngine: 'kokoro'`). The engine card marks it recommended with a
  reason (`useCreateAthenaEngine.ts:216-217`, `recommended: 'kokoro'`). The
  catalog exposes exactly one voice, `af_heart`, chosen in a measured
  four-engine bake-off and an owner's by-ear verdict
  (`src-tauri/src/companion/tts/kokoro_catalog.rs:49-60`;
  `docs/concepts/athena-voice-studio-v2.md`, "Where this comes from"). The
  catalog's own comment says it is "purely the picker, not a size lever":
  the model is monolithic, so curating to one voice costs nothing on disk.
- **Install is a named state machine, verified after extraction.**
  `InstallState.phase` is exactly `not_needed | idle | downloading_engine |
  downloading_model | extracting | completed | failed | manual`
  (`sub_create/engine/createAthenaTypes.ts:59-75`), derived in one place
  (`useCreateAthenaInstall.ts:139-164`). `manual` is what non-Windows
  installs get, with links and "check again". After extraction the installer
  re-resolves the binary and the model files and fails with a reason if
  either is missing (`src-tauri/src/companion/tts/kokoro_installer.rs:159-170`,
  "never report success on a half-extracted tree"). Download addresses are
  compile-time constants and the model package is pinned by name
  (`kokoro_installer.rs:36-38`, `kokoro-multi-lang-v1_0`, "v1_1 may reorder
  speakers").
- **Resumable, and an installed engine skips its step.** The step pointer is
  persisted (`useCreateAthenaEngine.ts:56`, `athenaOnboardingStep`), and
  steps behind it count as done on resume (`createAthenaSteps.ts:74-76`).
  `autoSkipKind` passes `voice_install` over as done when the phase is
  `not_needed` (`createAthenaSteps.ts:38-45`). When the step is reached
  before status is known, an effect leaves it once status says installed
  (`useCreateAthenaEngine.ts:108-113`). Test: "voice_install is passed over
  as done when the engine is already installed"
  (`sub_create/__tests__/useCreateAthenaEngine.test.tsx:136`).
- **Compare by ear: greet first, then one line, no overlap, leaving stops.**
  `previewVoice` (`useCreateAthenaVoices.ts:119-156`) stops any preview in
  flight, takes a latest-wins generation, and speaks `pickWakeUpLine`
  (time-of-day greeting, `createAthenaSteps.ts:140-150`) until the first
  *completed* play. That play calls `onWoke`, which selects the voice
  (`useCreateAthenaVoices.ts:141-145`, `useCreateAthenaEngine.ts:77-83`).
  Later previews speak `voice_test_sentence`. A late synthesis is revoked
  unplayed (`useCreateAthenaVoices.ts:132-135`). Leaving `voice_pick` calls `stopPreview`
  (`useCreateAthenaEngine.ts:145-149`). Test: "first preview speaks a
  wake-up line and selects the voice; the second speaks the test sentence"
  (`useCreateAthenaEngine.test.tsx:146`). The play button has a separate
  `synth` loading state (`TableCardListen.tsx:37`). Measured here: the
  comparison line takes 2.56–3.01 s of wall time per preview (three runs,
  2.9 s of audio, engine-reported RTF 0.375), so about 1.5 s of each preview
  is the per-call model load.
- **Hearing beside speaking, one take, latency shown.** The `stt` card runs
  both recognizers over one held take (`useSttComparison.ts`, header
  comment: the browser recognizer only accepts a live mic, so both listen at
  once). It shows a level meter and each column's latency from release
  (`TableCardListen.tsx:53-100`, `create_stt_latency` at `:90`). A missing
  model mutes its column with "not installed", and a refused mic gets one
  translated sentence (`useCreateAthenaStt.ts:27-34`). Leaving the step
  stops an open take (`useCreateAthenaStt.ts:54-59`).
- **Receipts from the real store, and *change* reopens.** `receiptText`
  phrases every answered step from the persisted keys, "never a local copy"
  (`variants/table/useTableFacts.ts:1-5,57-82`). `Receipts` renders done and
  skipped steps with a *change* button bound to `goTo`
  (`variants/table/TableThread.tsx:30-52`). Test: "shows a receipt for every
  answered step, and "change" reopens that step"
  (`__tests__/CreateAthenaTable.test.tsx:73`).
- **Speaker id pinned by a test.** `af_heart_is_sid_3`
  (`kokoro_catalog.rs:90-96`) asserts the pair, with a comment naming the
  package and the source it was checked against.
- **Shared engine home.** `engine_dir()` resolves `PERSONAS_HOME` or the
  per-user `companion-tts/bin` (`src-tauri/src/companion/tts/mod.rs:32-44`).
  The model goes under `companion-tts/kokoro` (`tts/kokoro.rs:66-76`).
  Another app on this machine already probes that home and finds it ready
  (see `node--portable-provider-package.md`). Measured on disk: the engine
  `bin` is 47 MB and the model folder 383 MB.

## Deviations

- **The default recognizer's residency is not labelled.** The stored default
  is `athenaSttEngine: 'browser'` (`athenaSlice.ts:353`), and its column is
  titled "Browser" while the other says "Whisper (local)"
  (`src/i18n/locales/en.json`, `create_stt_browser` / `create_stt_whisper`).
  The platform recognizer's audio path belongs to the webview vendor, and
  the card does not say where the audio goes. The technique's rule 1 asks for
  that sentence.
- **A second engine is offered in setup despite the plan.** The engine card
  lists both engines (`useCreateAthenaInstall.ts:166-169`), including the
  experimental cloning engine that the plan says is "not offered in setup"
  (`athena-voice-studio-v2.md`, "Deferred and declined"). It is labelled
  experimental, not hidden.
- **Settings is a second implementation, not the re-entry.** The setup
  install hook "Mirrors `VoiceEngineInstallBlock`" from the Voice settings tab
  (`useCreateAthenaInstall.ts:1-5`). The Voice tab (`sub_voice/VoicePanel.tsx`)
  is its own flow with its own engine selector. The only way back into the
  setup flow is `restart`, which goes to the intro (`useCreateAthenaEngine.ts:166-169`).
  Return condition: phase 6 of the plan, when the Table shell becomes the
  default.
- **Readiness is file presence, not a sample synthesis.** `is_model_installed`
  checks that four paths exist (`tts/kokoro.rs:135-140`). A truncated
  `model.onnx` reads as installed.
- **The install lock is per-process.** `INSTALL_INFLIGHT` is a static in the
  app process (`kokoro_installer.rs:44,56-58`). A second app installing into
  the same home at the same time is not excluded.
- **The speaker-id pin is by convention.** The test asserts a constant that
  was hand-checked against published documentation. Nothing reads the speaker
  order from `voices.bin` or the package. This is the technique's named gap.
- **Voice selection is null until a preview completes.**
  `athenaKokoroVoiceId: null` (`athenaSlice.ts:343`). A person who skips the
  pick step has an engine and no voice, and the handoff line switches to its
  no-voice copy (`createAthenaSteps.ts:121-124`). That is honest, but it is
  not the "Heart by default" the plan describes.

## Upward lessons the repo taught

- "Selection on *completed* first play" was a design choice the repo made
  and the technique adopted. Selecting on press would let a failed synthesis
  select a voice the person never heard.
- The ten-step engine with several shells made the receipts cheap: the
  shell only phrases facts the engine and the store already hold, which is
  what kept the receipts from drifting.
