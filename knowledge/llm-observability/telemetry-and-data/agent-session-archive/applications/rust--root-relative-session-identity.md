---
layer: application
type: application
subject: agent-session-archive
technique: root-relative-session-identity
stack: rust
status: forged
verified_on: 2026-10-15
counterpart: external
---

# Rust: conversation identity in coding_agent_session_search

The tree is coding_agent_session_search (cass) 0.10.0 at commit 7fc01958d367;
the version witness is the toolchain pin `nightly-2026-08-31` in
`rust-toolchain.toml`, in dotted form because the tree names no stable
release. The relative-path computation itself happens in the separate connector
crate, which this document describes but does not cite. Mechanisms are
restated; anchor quotes are the only verbatim text.

## Confirmed: one chokepoint, and the incident that forced it

Every parsed conversation passes through one preparation function before it
is stored, and that function applies identity in a fixed order: origin
provenance, external-id canonicalization, workspace rewrite, then capture.
`src/indexer/mod.rs:33673 "fn inject_provenance(conv: &mut NormalizedConversation, origin: &Origin) {"`
is its first step and
`src/indexer/mod.rs:33721 "fn canonicalize_claude_external_id(connector_name: &str"`
its second.

The canonicalization exists because two ingest paths rooted the same session
file differently. The watcher's external id carried one extra leading folder
segment that the full rebuild's did not, so whichever ran second missed the
existing row and inserted a duplicate:
`src/indexer/mod.rs:33716 "path that runs second fails to match the existing row"`.
The fix collapses both forms at the chokepoint the technique names:
`src/indexer/mod.rs:33718 "single ingest chokepoint makes every path produce one stable key"`.
The repair is specific to one harness, so the general rule, one
canonicalization for every connector, is only partly realized: the other
connectors depend on each computing its own relative path consistently.

## Confirmed: the origin joined the key when a second machine arrived

The original schema keyed conversations on agent and external id:
`src/storage/sqlite.rs:4355 "UNIQUE(agent_id, external_id)"`. Remote sources
share relative paths with local ones, so the key widened to include the
source: `src/storage/sqlite.rs:4493 "UNIQUE(source_id, agent_id, external_id)"`.
The source id is the operator's name for the machine:
`src/sources/config.rs:136 "This becomes the"`. The indexer's batch map carries
provenance in its key for the same reason, since two configured sources can
point at one local mirror path and still be different archives:
`src/indexer/mod.rs:111 "Provenance is part of the key because two configured sources"`.

A rewritten remote workspace path keeps its original value in metadata, so the
rewrite serves filtering across machines and never identity:
`src/indexer/mod.rs:34295 "The original workspace path is preserved in metadata"`.

## Confirmed: workspace folded in where native ids are workspace-local

One harness reused session ids across projects, merging distinct histories. The
diagnostics module folds the workspace into the external id deterministically:
`src/connector_ingest_diagnostics.rs:473 "pub fn disambiguated_external_id(base_id: &str, workspace: &str)"`.
It is applied for that harness only, at the point the ingest run observes a
conversation.

## Confirmed: a layout move needs a receipt and a prefix proof

When one harness moved from a flat to a dated layout, the same native id
appeared under two roots. cass refuses to merge on the native id,
`docs/codex-layout-migration.md:4 "native UUID alone is not permission to merge conversations"`,
and offers an explicit migration that writes a receipt and rechecks source,
native metadata and the complete overlapping prefix before reusing the old
identity: `docs/codex-layout-migration.md:102 "metadata and complete overlapping prefix before delivering the existing"`.
Conflicts are errors, never permission:
`docs/codex-layout-migration.md:111 "are errors, not permission to merge"`.
The same document scopes the guarantee to one archive generation, because a
full rebuild reallocates ids:
`docs/codex-layout-migration.md:127 "has its usual ID-reallocation semantics and is not an identity-preserving"`.

Deviation, on the evidence: the migration's regression tests were committed
without being run in the environment that wrote them, as the document itself
says: `docs/codex-layout-migration.md:157 "These Rust commands were not executed in the implementation"`.

## Row ids are not identity

A semantic watermark kept past deletions once resolved new messages to a
deleted message's vectors, because the store reuses freed message ids:
`CHANGELOG.md:715 "Because SQLite reuses freed message ids"`. That is the
technique's last section in incident form: anything that must survive must
bind to the natural key, not to an allocated row id.
