---
layer: application
type: application
subject: broadcast-software-control
technique: verify-absence-not-acknowledgement
stack: rust
status: forged
verified_on: 2026-11-02
verified_against: rust@1.97
---

# Rust: an OBS cleanup that detaches by UUID and counts only what it saw vanish

Castle Control (local checkout `Spooky/CastleControl`, main @ 8ef2d8e) is a
desktop tool for human Twitch streamers. Its `cc-obs` crate drives the streamer's own OBS
Studio over obs-websocket v5, and its rehearsal flow creates a browser source and sometimes a
scene that it must later remove. The workspace pins `rust-version = "1.97"` (`Cargo.toml:8 "rust-version = "`).
Every anchor below was re-opened on 2026-11-02.

## The defect that made the technique concrete (upward lesson)

The first version of `obs.rehearsal.clear` treated a `RemoveInput` status of 100 as proof of
removal. An isolated review against OBS 33.0.1 / obs-websocket 5.7.6 showed otherwise:
`crates/cc-obs/README.md:280 "the old clear treated status 100 as actual removal, discarded the input UUID and"`
and left the scene behind. The mechanism is recorded beside it:
`crates/cc-obs/README.md:284 "calls `obs_source_remove`, which marks removal; associated scene items are pruned"`
by the scene's render pass, and `crates/cc-obs/README.md:286 "An off-air scene need not render."`
This contradicts the protocol reference, which documents `RemoveInput` as "Will immediately
remove all associated scene items". The lesson the registry's golden path took from it - a
documented post-state is still not an observed one - came from this tree.

The same note names why the test suite had not caught it:
`crates/cc-obs/README.md:281 "then left its still-nonempty off-air scene behind. The fake peer had synchronously"`
deleted inputs and placements. The fix changed the fake as well as the code: the stateful peer
in `tests/ownership_removal.rs` retains placements until they are detached, and its first test
is `crates/cc-obs/tests/ownership_removal.rs:13 "async fn off_air_remove_acknowledgement_retains_items_until_uuid_matched_detachment() {"`.

## The cleanup, step by step

The module states the rule in its header:
`crates/cc-obs/src/ownership/cleanup.rs:1 "//! OBS 33 prunes source_remove scene items while rendering their scene. An"`
and `crates/cc-obs/src/ownership/cleanup.rs:2 "//! off-air scene may never render: explicitly detach UUID-matched placements."`

1. **Observe first.** `remove` records whether the owned input existed before touching it
   (`crates/cc-obs/src/ownership/cleanup.rs:25 "let mut existed = present(client, &input.input_uuid).await?;"`).
2. **Detach by identity pair.** Each placement in the recorded scene is removed only when its
   `sourceUuid` matches the ledger's input UUID; the reason is written at the branch:
   `crates/cc-obs/src/ownership/cleanup.rs:27 "// A source name or scene item ID can have been reused by the owner."`
   and `crates/cc-obs/src/ownership/cleanup.rs:28 "// Neither grants authority to delete a different input UUID."`
   A test pins the impostor case:
   `crates/cc-obs/tests/ownership_removal.rs:90 "async fn foreign_replacement_reusing_source_name_and_item_id_is_never_removed_or_counted() {"`.
3. **Remove the input by UUID, accepting "not found".** Detaching the last placement can
   release the input itself:
   `crates/cc-obs/src/ownership/cleanup.rs:41 "// Removing the last placement can itself release the input on OBS 33."`
   The 600 status is mapped to `Missing` only on cleanup calls
   (`crates/cc-obs/src/client.rs:198 "if missing"`); everywhere else it is a plain rejection,
   as the README states: `crates/cc-obs/README.md:49 "OBS failure codes introduce no separate product errors. Cleanup alone maps"`.
4. **Poll the inventory, not the status.** Global input list and the scene's items are read
   until both lack the UUID, for at most three seconds
   (`crates/cc-obs/src/ownership/cleanup.rs:46 "let deadline = Instant::now() + Duration::from_secs(3);"`).
   On expiry the ledger record is kept:
   `crates/cc-obs/src/ownership/cleanup.rs:57 "// Keep the ledger record: a status-100 acknowledgement is not proof"`.
   Tested as `crates/cc-obs/tests/ownership_removal.rs:58 "async fn success_status_without_actual_removal_times_out_and_keeps_cleanup_authority() {"`.
5. **Persist per verified removal.** `clear` drops a record and saves after each input, so a
   partial failure resumes:
   `crates/cc-obs/src/ownership.rs:121 "/// Persist each verified removal so a partial failure can safely resume."`
   The count is honest: `crates/cc-obs/README.md:247 "absence drops the record; only a previously observed input/placement contributes"`.
6. **Scenes last, and only empty owned ones.** `remove_scene` returns early on a non-empty
   scene (`crates/cc-obs/src/ownership/cleanup.rs:67 "Ok(items) if !items.scene_items.is_empty() => return Ok(false),"`)
   and then polls the scene list because
   `crates/cc-obs/src/ownership/cleanup.rs:75 "// Frontend scene-list invalidation can follow the removal acknowledgement."`
   The race is named, not hidden:
   `crates/cc-obs/README.md:255 "requests; OBS does not provide a conditional RemoveScene transaction, so an owner"`.

Success itself is two fields:
`crates/cc-obs/src/client.rs:197 "if !response.request_status.result || response.request_status.code != 100 {"`.
And no step ever cuts the program to force a render:
`crates/cc-obs/README.md:287 "dependency. No program-scene switch is used."`

## Deviations from the technique

- **Only the recorded scene is checked for placements.** Both detachment and verification
  read `input.scene_name` (`crates/cc-obs/src/ownership/cleanup.rs:26 "for item in items(client, &input.scene_name).await? {"`).
  If the streamer duplicated the tool's source into a second scene by reference, that
  placement is neither detached nor verified; the technique asks for every scene the source
  may sit in.
- **Timeouts surface as an error, not as a per-identity "unverified" list.** `clear` returns
  `Error::Timeout` from the first input that does not settle and stops; the streamer is told
  cleanup failed, honestly, but not which objects remain.
- **Scenes are addressed by name.** `remove_scene` lists and removes by `scene_name`; the
  ledger records owned scenes as names (`crates/cc-obs/src/ownership.rs:20 "scenes: Vec<String>,"`),
  although `CreateScene` returns a `sceneUuid`. The empty-scene guard limits the damage, but a
  scene the streamer recreated under the same name and left empty would be removed.
