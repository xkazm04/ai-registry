---
layer: application
type: application
subject: broadcast-software-control
technique: claim-only-what-you-created
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.97
applied: code
ab_verdict: better
---

# Rust: a show recorder that owned its OBS objects but wrote into someone else's profile

overlord is an unattended stream show. Its daemon crate records a sandbox session in OBS
Studio: `shadowrunr stream sandbox --record` creates a scene and a browser source that
renders the show's stage, then sets the canvas, puts the scene on program, mutes OBS's global
desktop and mic inputs, and records. The workspace pins Rust 1.97.1 (`rust-toolchain.toml`).
Every anchor below is at overlord main @ 83a9156 and was opened on 2026-11-03.

This is the third kind of instance the golden path now names: neither the streamer's
hand-built instance nor a throwaway one a test harness launched. The guide installs OBS
"once per machine" for the recorder, and from then on it is a persistent install the tool
treats as its own.

## What the tree did before (the seam)

Until 83a9156 the recorder's `prepare` wrote straight into whatever OBS had open. It
adopted its fixed-name browser source when creation answered "already exists" -
`crates/shadowrunr-daemon/src/record/mod.rs:336 "Err(e) if e.code() == Some(code::RESOURCE_ALREADY_EXISTS) => {"`
- which `claim-only-what-you-created` would refuse on a streamer's instance, and which is
defensible only if the container holding it is the tool's. Nothing checked that it was.

Two facts from OBS's own source make that a defect rather than a style choice:

- obs-websocket's `SetVideoSettings` and `SetRecordDirectory` handlers write into
  `obs_frontend_get_profile_config()` and save it, so the canvas and the record path persist
  in the **current profile** (obs-websocket `src/requesthandler/RequestHandler_Config.cpp`,
  master, read 2026-11-03). `SetVideoSettings` is refused while any video output is active.
- OBS's scene-collection save writes the six global audio sources, each through
  `obs_save_source` (mute state included), into the **current scene collection**
  (obs-studio `frontend/widgets/OBSBasic_SceneCollections.cpp`, `OBSBasic::Save`, master,
  read 2026-11-03). Scenes and inputs live there too.

On the development machine the hazard was live, not hypothetical. OBS's own config listed
three profiles and three collections - `Untitled` and two that Castle Control's test lane
launches with `--profile`/`--collection` of its own - and the last-used pair was Castle
Control's film one. The recorder's scene and source sat in `Untitled` (written 2026-10-29).
The next ordinary OBS start followed by a recorded run would have created the show's scene
in another tool's film collection, put it on program, muted that collection's global
inputs, and rewritten that profile's canvas and record path.

## The change

`prepare` now calls `ensure_own_containers` first -
`crates/shadowrunr-daemon/src/record/mod.rs:297 "ensure_own_containers(obs).await?;"` -
which reads the current profile and collection, and when either is not `Shadowrunr`
(`crates/shadowrunr-daemon/src/record/mod.rs:43 "pub const PROFILE: &str = "`) checks the
stream output and refuses while it is live, then switches to the recorder's own, creating
each once (`SetCurrent*` when it exists, `Create*` otherwise). It does not take the switch on
OBS's word: `crates/shadowrunr-daemon/src/record/mod.rs:278 "let (p, c) = containers(obs).await?;"`
reads both names back and fails if either is not the recorder's. The doc comment carries the
reason, `crates/shadowrunr-daemon/src/record/mod.rs:244 "the current ones are theirs (OBS reopens whatever was open last). Switching is refused while"`.
No other profile or collection is edited or removed. `shadowrunr record check` prints which
pair is current, and `docs/guide/recording.md` explains the containers and says the old
`Shadowrunr Stage` left in `Untitled` is safe to delete by hand.

The adoption of the fixed-name source stays. Inside the recorder's own collection, the only
author of an object with that name is the recorder, which is the condition this technique's
"When not to use it" section now states.

## The A/B (code)

Instrument: a fake obs-websocket peer in the crate's tests that keeps the current profile and
collection and logs every request that writes into one the recorder does not own
(`crates/shadowrunr-daemon/src/record/mod.rs:1054 "async fn prepare_writes_only_into_the_recorders_own_profile_and_collection() {"`).
The fixture is the machine's real shape: another tool's film profile and collection current,
the recorder's collection present from an earlier run, its profile absent. The tests were
written first and run against the unchanged `prepare`.

| Arm | Writes into a container the recorder does not own | Switch while streaming |
| --- | --- | --- |
| A (before) | **6**: `SetVideoSettings`, `CreateScene`, `CreateInput`, `SetCurrentProgramScene`, `SetInputMute` x2 | proceeds (the fake does not refuse) |
| B (after) | **0**; profile created, existing collection switched to (3 collections, not 4) | refused, no `SetCurrent*` or `Create*` sent |

Floor: the crate's 27 recorder tests, the full daemon suite and `cargo clippy -D warnings` are
green. The streaming row overstates A for the canvas write: real OBS refuses
`SetVideoSettings` while an output is active, so an unchanged recorder fails at its second
write on a live OBS. What the new guard adds is that no container switch runs under a live
stream, and that switch is the bigger change to what is on air.

## What it does not cover

- A person who opens OBS's `Shadowrunr` collection and builds their own source with the
  recorder's name will still have it adopted. The container is a convention a person can walk
  into, not a lock.
- OBS stays on `Shadowrunr` after a recording. Switching back automatically would restore the
  person's view, at the price of a second switch the recorder would have to verify; the guide
  tells the operator instead.
- Peer-authored refusal comments still reach the CLI output verbatim through the crate's error
  type, which `credential-custody-for-the-control-socket` would map to fixed messages. Not
  changed here.
