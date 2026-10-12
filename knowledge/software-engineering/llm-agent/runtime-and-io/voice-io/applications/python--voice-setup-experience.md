---
layer: application
type: application
subject: voice-io
technique: voice-setup-experience
stack: python
status: draft
verified_on: 2026-10-07
---

# A daemon-held voice setup for a single-user agent: the second app on the machine

**Status: draft, a design being built.** Athena (athena-portable) is a
single-user agent whose desktop shell talks to a stdlib-only Python daemon
over HTTP. Its voice setup was designed on 2026-10-07 from the technique and
from the Personas Table studio (`react--voice-setup-experience.md`). It is
being built the same day. This document describes the decided design and
cites its decision record. The code was uncommitted and changing when this
was read, so no line is cited as shipped and nothing here counts as verified
behaviour. Promote to `forged` when the routes, the module and their tests
land and are re-read.

Decision record: `docs/adr/0028-athenas-voice-is-set-up-in-a-studio-and-speaks-locally-by-default.md`
(it extends ADR 0019, where voice is one socket on the daemon's port).

## How the design maps to the seven rules

- **1. Local, heard default; cloud labelled and opt-in.** The defaults are
  local synthesis with the voice verified by ear in the first application
  (`af_heart`), and local recognition with a small English model
  (`base.en`). The cloud recognizer is the only cloud engine. It is offered
  with a "cloud" label and its own key, sealed by the daemon's existing
  connector seal and never echoed back (`PUT`/`DELETE /voice/key`). Before
  this design, voice existed only when a cloud key happened to be in the
  shell's environment. That was an implicit cloud default with no setup at
  all, and it is what the ADR replaces.
- **2. One guided flow, install as a state machine.** The module runs a
  studio on first visit: *her voice* (engine, install, pick), *your voice*,
  *ready*. `POST /voice/install {component}` returns `202` with an
  `InstallState` whose states mirror the technique's table (`idle`,
  `not_needed`, `downloading_engine`, `downloading_model`, `extracting`,
  `completed`, `failed`, `manual`). A second request while one runs gets
  `409`. The client polls `GET /voice/install`. Download URLs are constants
  in the daemon, pinned to the same engine release and model package the
  first app pins. The client names a component, never an address. The
  install step is skipped when the probe reports the engine ready.
- **3. Compare by ear.** `POST /voice/preview` returns raw PCM with
  `X-Tts-Provider`, `X-Tts-Voice` and `X-Tts-Elapsed-Ms` headers, so the
  module can show who spoke and how long it took. The first completed
  preview speaks a time-of-day greeting and selects the voice through
  `PUT /voice/config`. Later previews speak one fixed line. Previews do not
  overlap, and leaving the step stops playback.
- **4. Hearing beside speaking.** `POST /voice/transcribe?engine=` runs one
  take through each ready recognizer, so the module can show the columns
  side by side with `elapsed_ms`. Speaking and hearing are separate fields of
  one config, and the daemon composes its voice backend from one speaker and
  one listener.
- **5. Receipts and re-entry.** Answered studio steps fold into receipts that
  reopen them. Later visits open a two-column Output/Input settings page whose
  "run the studio again" is the way back in. The daemon's
  `ATHENA_HOME/voice/config.json` is the one source both read. The UI decides
  whether voice is available from the config's `ready` and `reason` (`reason`
  is the first sentence of why not). It does not read the health route's
  socket list, which was a second, drifting answer to the same question.
- **6. Speaker id pinned.** The voice table maps `af_heart` to speaker 3 of
  `kokoro-multi-lang-v1_0`, pinned by a test. It inherits the first app's
  hand-verified id, so it inherits the gap too: the id is pinned by
  convention, not read from the package.
- **7. Shared home, install lock.** The daemon resolves the first app's home
  (`$PERSONAS_HOME`, else the per-user `.personas`) for both synthesis and
  recognition, so on the machine this was designed on the synthesis engine
  was already present and ready. The ADR names an install lock between the
  two apps. That lock is the cross-process exclusion the first app lacks.

## What the design adds to the technique

- **Live switching without a restart.** `PUT /voice/config` swaps the
  gateway's backend in place. A setup flow whose choices need a restart
  cannot use a receipt's *change* honestly.
- **Not-ready is a typed refusal on the live channel too.** The `/voice`
  socket is always registered. A `start` while not ready returns a
  `turn.error` with a reason from the daemon's closed error vocabulary, with
  the config's reason as detail. The surface never sees a socket that is
  missing for no stated reason.
- **Absent means `null`, never omitted.** The config contract spells every
  absent value as `null`, so "no model chosen" is not mistaken for "field
  not sent" ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Known costs, stated in the ADR

- The first sentence of a live reply still waits about 1.7 s for the model
  to load, because the engine runs as one process per sentence.
  Sentence n+1 is synthesized while sentence n plays, which hides the load
  after the first sentence. A resident engine is future work under
  `real-time-synthesis-budget`.
- A machine with neither app installed needs one download of about 400 MB to
  speak and one recognizer model (75–466 MB) to hear. On the machine this was
  designed on, the recognizer binary was present and no recognizer model was
  installed yet, so the default `base.en` is a download.
