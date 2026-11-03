---
layer: application
type: application
subject: isolated-broadcast-software-test-lane
technique: never-touch-the-owner-instance
stack: rust
status: forged
verified_on: 2026-11-03
verified_against: rust@1.97
---

# The tool under test refuses the owner's OBS on its own (Rust)

Castle Control (`Spooky/CastleControl`, d15a474, read 2026-11-03; toolchain `1.97.1`,
edition 2024) is a desktop tool for Twitch streamers with a Rust core. Its night lane is
two programs. A Node script launches a second OBS beside the owner's; the Node application
of this technique covers that half. The other half is the program under test: a test-only
build of the product's Rust core, `crates/cc-core/examples/e2e-night`. It holds the
product's real OBS client, and the technique's last door is about it: "the code under
test". This application reads that half. The Node launcher strips the core's switches from
its environment. The core also refuses, in Rust and without trusting its launcher, every
route to the owner's instance it can name.

## What the core does

- **It refuses the owner's port itself.** The launcher already refuses 4455
  (`e2e/night/launch.ts:105 "Refusing the owner OBS websocket port 4455"`). The core refuses
  it again where it reads its upstream:
  `crates/cc-core/examples/e2e-night/main.rs:113 "if port == obs::OWNER_PORT || port == 0 {"`
  with `crates/cc-core/examples/e2e-night/main.rs:114 "CC_NIGHT_OBS_PORT must be an isolated OBS, never 4455"`,
  and the relay refuses it a third time
  (`crates/cc-core/examples/e2e-night/obs.rs:221 "refusing the owner's OBS websocket port 4455"`).
  The constant states the rule:
  `crates/cc-core/examples/e2e-night/obs.rs:21 "The owner's own OBS websocket port. The night core never connects to it."`.
  Port 0 is refused too, because "any port" is not an instance the lane launched.
- **No endpoint means a fake, never the default.** With no port in the environment the core
  does not fall back to a local OBS. It starts a generated one:
  `crates/cc-core/examples/e2e-night/main.rs:126 "let port = obs::fake_peer(password.clone()).await?;"`,
  documented at `crates/cc-core/examples/e2e-night/main.rs:11 "isolated OBS; without them a generated fake OBS peer is started."`.
  A missing variable is the commonest mistake a harness makes. This design makes that
  mistake land on a simulation instead of the streamer's session.
- **A port without its password is an error, not a guess.**
  `crates/cc-core/examples/e2e-night/main.rs:118 "CC_NIGHT_OBS_PASSWORD is required with CC_NIGHT_OBS_PORT"`.
- **The product's client never sees a stored credential.** The real client connects to a
  relay, and the relay authenticates upstream with the per-run password held in memory:
  `crates/cc-core/examples/e2e-night/obs.rs:2 "peer and an authenticating relay. The relay is how a per-run password reaches"`,
  wired at `crates/cc-core/examples/e2e-night/main.rs:147 "let relay = obs::relay(upstream, password).await?;"`.
  The production path reads a keychain label, and this build never reaches it. The secret
  derivations are `Zeroizing`
  (`crates/cc-core/examples/e2e-night/obs.rs:36 "let secret = Zeroizing::new(digest(&format!("`).
- **Only metadata leaves the process.**
  `crates/cc-core/examples/e2e-night/obs.rs:40 "Only metadata leaves the process: request type, scene, input and URL. Never"`.

## The owner-run suite, and why the lane strips its key

The same repository holds tests that do touch the owner's OBS, on purpose. They are the
mirror image of this subject and show where the boundary lies:
`crates/cc-obs/tests/live_support/mod.rs:1 "Owner-run wire observer. No connection, keychain read or overlay before guard."`,
connecting at `crates/cc-obs/tests/live_support/mod.rs:24 "port: 4455,"`. Every one of them
is `#[ignore]`d and opens only behind an exact switch:
`crates/cc-obs/tests/live_support/mod.rs:17 "live OBS disabled: CC_LIVE_OBS must be exactly 1; no network or keychain access attempted"`.
The file header names them
`crates/cc-obs/tests/live.rs:1 "LIVE twins are opt-in owner checks, never fixture evidence."`.
The night lane removes that switch from every child it starts, in both launchers
(`e2e/night/launch.ts:112 "for (const key of ['CC_LIVE_TWITCH', 'CC_LIVE_OBS', 'CC_LIVE_FLOOR', 'CC_NIGHT_OBS_PORT', 'CC_NIGHT_OBS_PASSWORD']) delete env[key];"`
and `scripts/night/run.mjs:26 "for (const k of ['CC_LIVE_TWITCH', 'CC_LIVE_OBS', 'CC_LIVE_FLOOR']) delete env[k];"`).
An owner-run suite is legitimate when the owner is present and chose it. An unattended
lane may not inherit that choice from a shell the owner left open.

## Deviations from the technique

- **The port check is a denylist of one number.** It refuses the default, not "every port
  but mine". If the owner moves their OBS to another port, this check does not stop the
  core. Protection then rests on the credential. The owner's instance refuses the per-run
  password, the relay's Identify fails, and nothing is sent. That is the technique's identity
  rule, and it holds. The number check is the cheaper, earlier half of it.
- **Identity is split across languages.** The technique knows the instance by two facts: the
  spawned process handle and a handshake with the run's password. The Rust core holds only
  the second. The handle lives in the Node launcher (`scripts/night/obs.mjs:216`, the
  `spawn` of `obs64.exe`), so the core alone cannot tell "the instance this run launched"
  from "an instance that knows this run's password". In practice those are the same thing.
- **The password crosses an environment boundary.** It reaches the core as
  `CC_NIGHT_OBS_PASSWORD`, which other processes of the same user can read while the core
  runs. The technique accepts that for a password that dies with the run, and this one does:
  `scripts/night/obs.mjs:203`, generated per run.
- **The isolated OBS's socket is not loopback-only.** The core and relay connect to
  `127.0.0.1`. The OBS they reach, obs-websocket 5.7.6 on OBS 33.0.1, listened on
  `0.0.0.0` and `[::]` when measured on 2026-11-03, and the plugin offers no loopback-only
  setting. The 48-hex-character per-run password is the only lock on it; see
  own-profile-port-and-password.
