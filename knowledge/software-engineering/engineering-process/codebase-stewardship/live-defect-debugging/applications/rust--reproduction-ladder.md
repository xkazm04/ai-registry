---
layer: application
type: application
subject: live-defect-debugging
technique: reproduction-ladder
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.96.1
applied: simulation
ab_verdict: better
proof: structural-only
---

# Three webhook-ingestion fixes in a desktop app, replayed against the ladder's rung-one check

What this realization cannot do: it is a replay of three committed fixes, not a run.
No cargo build was spent. Both arms are read from the crate graph and the test
bodies. The engine-crate test command cannot compile the app crate, so an app-crate
edit cannot change what that command reports. A build would only show that
dependency direction again. Nothing here measures how many escaped defects the
stronger check would have caught. n=3, one author line, one week.

Tree read: the public personas repository at `master` (`cd84f276a4`, 2026-10-31),
plus the three fix commits below, opened with `git show`. The version witness is the
repository's `rust-toolchain.toml`, which pins `channel = "1.96.1"` for every cargo
invocation. The citations are commit-message quotes and file lines at those shas.

## The seam

The project has two flows for defects. Its scan lenses hunt proactively. Their fix
commits record a rung-two reproduction as a `Before:` line that names the mutation
that turned the new test red. Its `/sentry` skill handles *reported* defects. That is
the flow this subject is about, and it verifies with `npm run check` and
`cargo check`, then marks the issue resolved: "Do not resolve the Sentry issue until
the check passes" (`.claude/skills/sentry/SKILL.md:207` "Do not resolve the Sentry issue"). No step makes a failing check
from the trace. A compile gate is green over every one of the three defects below,
because each parent commit compiled. So the reported-defect flow resolves on a gate
that cannot see the target. The proactive flow has the habit the ladder asks for.
The seam was chosen to falsify the ladder: the proactive flow is the tree's best
practice, and the question was whether rung one adds anything over it.

## The three cases

All three landed on 2026-10-20 and moved a decision into
`src-tauri/engine/src/webhook_ingest.rs`, a separate crate with unit tests. Each
commit cites `cargo test -p personas-engine --lib webhook_ingest` as its gate.

- **`6be02bb01a`: SSE decoded per chunk.** "Before: split-char and split-CRLF fixtures
  red under the old per-chunk algorithm (mutation run: 2 of 2 red...)". The whole
  mechanism moved into `SseDecoder`, and the tests feed it split chunks
  (`multibyte_char_split_across_chunks_survives`, line 288). What stays in the relay is
  `decoder.push(&chunk)`, which is wiring with no choice in it.
- **`5b966ac969`: a failed publish was remembered as handled.** "Before: failed
  publish -> replay skipped (mutation forget -> no-op: test red)". The test
  `forgotten_key_is_handled_again_on_replay` calls `forget` itself. The defect was in
  the relay's error arm: before the fix it only logged at debug (line 543 of `smee_relay.rs` at
  the parent). The fix is the call `dedup.forget(&dedup_key)` in that arm (now
  `src-tauri/src/engine/smee_relay.rs:521` "dedup.forget(&dedup_key);").
- **`cd04933a11`: a failed listing pruned watermarks.** "mutation prune_allowed ->
  true: test red". The test asserts `!watermark_prune_allowed(1)`. The defect was the
  unconditional `watermark_repo::prune` at the parent (line 455 of `cloud_webhook_relay.rs`).
  The fix is the `if prune_allowed` wrapper around it (now `src-tauri/src/engine/cloud_webhook_relay.rs:461` "let prune_allowed").

## A and B

- **A, the tree's practice:** mutate the helper the fix created and confirm the
  test goes red. Red in 3 of 3.
- **B, the ladder's rung-one check, read strictly:** reintroduce the defect where it
  lived by reverting the fix's call-site hunk, then run the same command. Red in 1 of 3.
  For the SSE case the mechanism is in the helper. For the other two, deleting line
  521 or the `if prune_allowed` guard leaves `cargo test -p personas-engine` green. The
  engine crate does not depend on the app crate, and the app crate's only tests near
  these sites cover a reconnect backoff policy (`src-tauri/src/engine/smee_relay.rs:819` "#[cfg(test)]" onward).
- **Target:** fixes whose reproduction fails when the reported defect comes back.
  A says 3/3. B says 1/3. The difference is two decisions that no test guards.
- **Floor:** all three fixes stay green on their cited command. It held, because
  nothing was changed.
- **Falsifier:** any test that reaches `relay_sse_core`'s error arm or
  `cloud_webhook_relay_tick`'s prune would make B 3/3 and void the amendment. A grep of
  the Rust tree and the test directories for both functions found none.

The finding held. The ladder's existing rule ("confirm it fails for the reason the
report describes") was what separated the two arms. The tree's practice met the
weaker reading, red on the new code, and missed the stronger one. That gap is the
technique's amendment, "Reintroduce the defect where it lived".

## What the project would change

Two changes, filed as the project's next work and not shipped from this run:

1. In `/sentry` Phase 3.4, before the edit, add a step: make a failing check from the
   trace and confirm it is red on the unfixed tree. If no check can be made (one
   machine's hardware, a third-party flake), record "not reproduced", because
   `inNextRelease` resolution is then provisional.
2. For the two call-site decisions, move the error-arm and prune choices into the
   tested helpers. For example, a function that takes the publish result and the
   dedup set and decides. Then the revert-the-call-site check goes red.
