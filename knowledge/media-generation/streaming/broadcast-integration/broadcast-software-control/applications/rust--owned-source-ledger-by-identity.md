---
layer: application
type: application
subject: broadcast-software-control
technique: owned-source-ledger-by-identity
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Rust: an endpoint-scoped OBS ownership ledger behind one mutex

Castle Control (local checkout `Spooky/CastleControl`, main @ 8ef2d8e) keeps
a private record of every OBS input and scene it created on a streamer's machine, and the
desktop core routes every OBS call through it. This application covers the ledger and the
three techniques that lean on it most: claiming only what was created, reading the peer for
existence, and connection handling that never replays. Anchors re-opened 2026-11-02;
workspace `rust-version = "1.97"` (`Cargo.toml:8 "rust-version = "`).

## The ledger

The README describes it in one paragraph:
`crates/cc-obs/README.md:234 "`Ownership` keeps an atomic `ownership.json` snapshot (write, sync, rename) under"`
with `crates/cc-obs/README.md:238 "unknown fields. No password, keychain label, RPC session token or overlay URL is"` stored.
Each input entry carries the scene name, source name, input UUID and scene item id
(`crates/cc-obs/src/ownership.rs:28 "input_uuid: String,"`), grouped per endpoint
(`crates/cc-obs/src/ownership.rs:15 "endpoints: BTreeMap<String, Owned>,"`). Loading is strict:
`#[serde(deny_unknown_fields)]` on every level, and duplicate UUIDs, blank names or negative
item ids fail the open
(`crates/cc-obs/src/ownership.rs:57 "|| !uuids.insert(&input.input_uuid)"`). The write is
temp-file, `sync_all`, rename
(`crates/cc-obs/src/ownership.rs:173 "file.sync_all().map_err(|_| Error::Storage)?;"`,
then `crates/cc-obs/src/ownership.rs:175 "fs::rename(temporary, root.join("`).

Entries are written from the creation response: `create_source` refuses a response without a
UUID (`crates/cc-obs/src/ownership.rs:103 "if created.input_uuid.is_empty() || created.scene_item_id < 0 {"`)
and then records `inputUuid` and `sceneItemId` before returning. Cleanup addresses only those:
`crates/cc-obs/README.md:242 "`obs.rehearsal.clear` addresses inputs by recorded UUID, never by source name."`

## Claim only what you created (confirmed)

`ensure_scene` reads the scene list and returns without recording anything when the name
already exists (`crates/cc-obs/src/ownership.rs:69 "pub async fn ensure_scene("`, early return
at `crates/cc-obs/src/ownership.rs:85 "return Ok(false);"`); only a scene it created is pushed
into the ledger. The README states the rule:
`crates/cc-obs/README.md:253 "the scene inventory confirms absence. Preexisting scenes are never claimed. Records"`.
For inputs, OBS's own already-exists rejection is the collision guard, and it is never turned
into an adoption:
`crates/cc-obs/README.md:294 "explicit detachment. Existing inputs rejected by CreateInput (601) are never"` adopted, and
`crates/cc-obs/README.md:295 "adopted. Already-lost ledger entries from the old bug are not reclaimed by name."`
Tested as `crates/cc-obs/tests/ownership.rs:49 "async fn ensure_creates_once_and_never_claims_an_existing_scene() {"`
and `crates/cc-obs/tests/ownership.rs:104 "async fn capture_survives_restart_and_clear_preserves_foreign_items_and_nonempty_scene() {"`.

## Read the peer, not the ledger (confirmed)

The rehearsal status probe asks OBS which scenes exist and says why at the call:
`crates/cc-core/src/integration/obs.rs:42 "/// Read the peer, never infer scene existence from our ownership ledger."`

## No mutation replay (confirmed)

All endpoint changes, reconnects and ledger mutations share one lock:
`crates/cc-core/src/integration/obs.rs:1 "//! One mutex serializes endpoint changes, reconnects and ownership mutations."`
Every request runs under a five-second budget
(`crates/cc-obs/src/client.rs:48 "const BUDGET: Duration = Duration::from_secs(5);"`), any failed
operation drops the client (`crates/cc-core/src/integration/obs.rs:159 "state.connection.disconnect();"`),
and the next call reconnects lazily (`crates/cc-obs/src/connection.rs:70 "if self.client.is_none() {"`).
The README rules out the alternative:
`crates/cc-obs/README.md:52 "- **Reconnect:** no automatic reconnect, retry, input replay, or background"`.

## Credential custody (confirmed, with an upward lesson)

The password lives in the OS keychain under a fixed service
(`crates/cc-obs/src/client.rs:16 "/// Account label within the castlecontrol-obs keychain service."`,
opened at `crates/cc-obs/src/client.rs:28 "keyring::Entry::new("`). `configure`
writes it there only after authentication and `GetVersion` both succeed
(`crates/cc-obs/src/connection.rs:39 "/// Replace working state only after authentication, GetVersion and optional"`);
this store-after-proof ordering is an upward lesson the technique took. Endpoints must be
loopback, private or link-local (`crates/cc-obs/src/connection.rs:95 "IpAddr::V4(ip) => ip.is_loopback() || ip.is_private() || ip.is_link_local(),"`),
and numeric pseudo-addresses are refused
(`crates/cc-obs/src/connection.rs:114 "// Reject numeric pseudo-addresses rather than relying on resolver shorthand."`) -
a second upward lesson. Peer comments are never shown:
`crates/cc-obs/README.md:45 "Every other status becomes fixed `Error::Rejected`; peer comments are never"`.
A browser source is created only at the tool's own origin:
`crates/cc-core/src/integration/obs.rs:105 "source must use the owned overlay origin"`, and
`owns_source` also requires the page to be live (a sealed draw, an accepted visual) at
`crates/cc-core/src/overlay/mod.rs:263 "pub fn owns_source(&self, origin: &str, url: &str) -> bool {"`.

## Deviations from the technique

- **No pending entry before creation.** `create_source` calls OBS and only then pushes the
  record (`crates/cc-obs/src/ownership.rs:102 "let created = client.create_browser_source(source).await?;"`);
  a crash or a lost response between the two leaves an orphan the tool can never claim.
- **Scope is the endpoint, not the scene collection.** A streamer who switches collections
  keeps the same ledger key, and the tool sees the other collection's entries as merely absent.
- **Owned scenes are recorded by name, not `sceneUuid`** (`crates/cc-obs/src/ownership.rs:20 "scenes: Vec<String>,"`).
- **Plain host names pass on spelling alone.** `obs.local` and `obs-studio` are accepted
  without resolving them (`crates/cc-obs/src/connection.rs:137 "host.to_ascii_lowercase()"`),
  so a name that resolves publicly is not refused.
- **A collision is not a named state.** A 601 on `CreateInput` surfaces as the generic
  `Error::Rejected` ("OBS request rejected"), so the streamer is not told that a source of
  that name already exists or what to do.
- **No keychain deletion path.** Nothing in `cc-obs` or the core removes the
  `castlecontrol-obs` entry; disconnecting the integration does not forget the password.
