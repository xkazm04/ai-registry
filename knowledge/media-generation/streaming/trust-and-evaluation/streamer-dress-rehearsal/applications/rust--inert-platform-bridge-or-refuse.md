---
layer: application
type: application
subject: streamer-dress-rehearsal
technique: inert-platform-bridge-or-refuse
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97.1
---

# Inert Twitch bridge and relaunch-isolated store in a Rust streamer desktop

Castle Control (local checkout of main @ 8ef2d8e, toolchain pinned by
`rust-toolchain.toml` at 1.97.1) is a Tauri desktop for a human Twitch streamer: a
moderation gate (Gatehouse), giveaway draws (Lots), reactive visuals (Beacons), chat
duels (Tiltyard), and read-only overlay pages OBS renders as browser sources. Its dress
rehearsal is `cc-desktop --rehearsal`: the real native core, the streamer's own OBS,
generated SIMULATED chat and no Twitch session. This application walks the quarantine
edge and the store split, which carry the technique, and records where the build stops
short of the standard, chiefly on retakes.

## The composition refuses a live bridge

The core's rehearsal entry states its shape in one line:

- `crates/cc-core/src/integration/rehearsal.rs:1` "Rehearsal has native OBS/rendering capabilities and an inert Twitch bridge."

and enforces it before anything is attached:

- `crates/cc-core/src/integration/rehearsal.rs:15` "dress rehearsal requires an inert Twitch bridge"

The host builds that bridge by handing the native services an empty Twitch config, and
never spawns the device login in rehearsal:

- `apps/desktop/src-tauri/src/host.rs:55` "twitch: if options.rehearsal {"
- `apps/desktop/src-tauri/src/host.rs:95` ".filter(|_| options.login && !options.rehearsal)"

Requests that only make sense live are refused at the router rather than ignored:

- `apps/desktop/README.md:368` "The registry rejects `auth.twitch.start` and"
- `apps/desktop/README.md:369` "with `blocked_by_policy` before the native adapter"

Actions on viewers complete as simulated records. The rehearsal gate is opened in a mode
that cannot reach the platform, the mode is one-way for the instance, and a ban review in
that mode confirms only when both the message and the proposal are simulated:

- `crates/cc-core/src/gatehouse/live.rs:34` "review; nothing here can reach Twitch (no bridge, no executor), and the"
- `crates/cc-gatehouse/src/service.rs:98` "Irreversible for this instance, and only for a dress rehearsal store."
- `crates/cc-gatehouse/src/service.rs:100` "confirmed ban is only ever a SIMULATED ledger record"
- `crates/cc-gatehouse/src/review.rs:83` "(!self.simulated_only || (original.simulated && queued.simulated))"

## What stays real, and the one stage that is swapped

The public randomness beacon stays real on purpose, and the entry screen says what that
costs:

- `crates/cc-core/src/integration/rehearsal.rs:5` "Explicit rehearsal entry opts generated Lots into real quicknet HTTPS at"
- `apps/desktop/README.md:463` "fetches and verifies a public round over HTTPS and needs internet access"
- `apps/desktop/README.md:465` "no recorded randomness is substituted"

The chat classifier is the swapped stage. The rehearsal pipeline runs the rule engine
only, and the film tooling had to discover that before a take:

- `crates/cc-core/src/rehearsal/mod.rs:201` ".start(Some(self.door.sender.subscribe()), Arc::new(RulesOnly));"
- `film/build-film.mjs:48` "Caption truth depends on what classifies in rehearsal (rules engine vs model)"

**Deviation:** the rehearsal surface does not state that its verdict covers the rules
floor rather than the live classifier path; the standard asks it to.

## Separate store, chosen by relaunch

Rehearsal state is a sibling root that live state is never read from, and contradictory
start-up flags are refused together:

- `apps/desktop/src-tauri/src/host.rs:34` "Rehearsal never reads the owner's persisted rules, recordings, engine"
- `apps/desktop/src-tauri/src/host.rs:37` "let rehearsal_root = data_dir.join("
- `apps/desktop/src-tauri/src/options.rs:81` "rehearsal refuses login and live Steward options"

Entry and exit are relaunch commands. The README records why an in-process switch was
rejected, the secret-dropping side effect, that leaving never resumes live authority, and
the relaunch guards:

- `apps/desktop/README.md:392` "Switching composition inside the same process would therefore lack a proven"
- `apps/desktop/README.md:393` "The process relaunch also discards any in-memory"
- `apps/desktop/README.md:378` "Device login and live Steward opt-in are"
- `apps/desktop/README.md:382` "a second pending relaunch is refused"
- `apps/desktop/README.md:385` "marker enables up to 50 startup attempts, spaced 100 ms apart"

**Partial:** the mode binds one way. The rehearsal gate refuses unmarked chat, but the
live gate has no matching refusal of simulated input; the opposite leak is closed only by
the generator being reachable from the rehearsal composition alone.

- `crates/cc-gatehouse/src/live_capture.rs:223` "dress rehearsal screens only simulated chat"

## Where it falls short: retakes

Stop ends traffic and nothing else, by design, and the draw scenario reuses rehearsal
state across takes. That keeps the live sealing rule intact, which is correct, but the
rehearsal store is one fixed root for every take:

- `apps/desktop/README.md:402` "configuration and OBS sources; D3a's explicit"
- `crates/cc-core/src/rehearsal/scenarios.rs:122` "Reuse an accepting rehearsal pool without resetting its entries"
- `crates/cc-core/src/rehearsal/scenarios.rs:123` "sealed pool stays frozen"

**Deviation:** there is no reset and no per-take store. OBS sources are cleared by
recorded identity through a separate command, but armed rules, sealed draws and consumed
attempts are not reset. During filming on 2026-11-02 they persisted between takes and
broke retakes until the rehearsal stores were moved aside by hand (owner's filming
notes; no file in the tree records the incident).
