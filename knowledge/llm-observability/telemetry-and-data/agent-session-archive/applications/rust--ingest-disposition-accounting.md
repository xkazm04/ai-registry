---
layer: application
type: application
subject: agent-session-archive
technique: ingest-disposition-accounting
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Rust: ingest diagnostics and the active-writer deferral in coding_agent_session_search

The tree is coding_agent_session_search (cass) 0.10.0 at commit 7fc01958d367;
the version witness is the toolchain pin `nightly-2026-08-31` in
`rust-toolchain.toml`, in dotted form because the tree names no stable
release. The connector crate's half of this contract, completion
certification and the inventory coverage test, is the second witness:
[rust--ingest-disposition-accounting--franken-agent-detection](./rust--ingest-disposition-accounting--franken-agent-detection.md).
Mechanisms are restated; anchor quotes are the only verbatim text.

## Confirmed: a closed disposition set, motivated by silence

The diagnostics module names the failure it exists for in one word, silence: a
provider limitation turned into a zero-message import, or two conversations
merged under one id:
`src/connector_ingest_diagnostics.rs:14 "The failure these share is *silence*"`.
Its per-source outcome type exists so a limitation is never reported as an
empty success: `src/connector_ingest_diagnostics.rs:135 "silently rendered as"`.
The set covers indexed, partially indexed, quarantined, skipped, locked and
unsupported-encrypted, plus a pending state for a source enumerated and not yet
processed: `src/connector_ingest_diagnostics.rs:141 "Discovered but not yet processed"`.
The run is opened over the discovered inventory, so the inventory is the
denominator: `src/indexer/mod.rs:33839 "ConnectorIngestRun::begin(provider, data_dir, ctx, &observed_sources)"`.

Deviation: the set has no unproductive member. When the run closes, only one
provider's durable stores that produced nothing are asked why,
`src/connector_ingest_diagnostics.rs:783 "Each Pi durable store that yielded no conversation"`;
for every other connector a source that was read and produced nothing stays in
the pending state. It is counted, which is better than silence, but it is
reported as not yet processed rather than as the format-change signature it
usually is.

## The incident: a transient condition given a terminal disposition

A release permanently quarantined most watch-mode ingest attempts on one
platform, including small files and transcripts the harness was writing at
that moment: `CHANGELOG.md:2991 "63% of"`. Two causes compounded. The
quarantine classified out-of-memory failures by matching text in the rendered
error chain, so ordinary mid-parse failures read as resource exhaustion,
`CHANGELOG.md:2993 "OOM detection is now typed, not a substring match."`;
and the active-writer filter relied on open-handle and advisory-lock probes
that the harness's buffered appender never triggers. The two fixes had to ship
together, because typing the errors without deferring live files would have
returned mid-write failures to an older crash loop:
`CHANGELOG.md:2996 "Both fixes ship together by necessity"`.

The deferral now checks modification time first, as the cheapest probe and
the only one that sees that writer:
`src/indexer/mod.rs:184 "Cheap mtime check first"`, citing the data-loss
regression it closes at `src/indexer/mod.rs:189 "the v0.5.1 data-loss"`. The
window defaults to 120 seconds, capped at an hour:
`src/indexer/mod.rs:218 ".unwrap_or(120)"`. The coarse watermark is held while
any source was deferred or excluded during the run:
`src/indexer/mod.rs:14926 "fn scan_watermark_preservation_active() -> bool {"`.

## Confirmed: the parser is in the skip-ledger key

The build script hashes the ingest code into a contract digest at compile
time, so a ledger entry written by one parser does not authorize a skip under
another: `build.rs:493 "cass-source-ingest-contract-v1"`. The source
fingerprint is a metadata tuple, size and nanosecond modification time with
device, inode and change time added where the platform exposes them:
`src/connectors/source_dependencies/observation.rs:59 "metadata.modified().ok()?.duration_since(std::time::UNIX_EPOCH)"`.
A missing or unreadable primary file cannot authorize a skip, and an
observation error is never stored as a value a corrupt row could match:
`src/connectors/source_dependencies/observation.rs:92 "Missing or unreadable primaries cannot prove a completed parse."`

The tree's own admission design rejects length plus modification time as a
receipt because a same-length rewrite with the time restored evades it:
`docs/LEXICAL_ADMISSION.md:23 "same-length rewrites with restored mtime evade it"`.
The skip ledger's tuple adds change time and file identity on platforms that
have them, which closes that hole there; on the platform without them the
tuple is size and modification time only.

## Not in this tree: one inventory for every consumer

The technique's rule against folder-scoped discovery is an upward lesson from
the installation measured for the golden path, not from cass. cass has one
discovery function per connector, shared by capture and parse, so the problem
of several tools with several folder rules does not arise inside it. For the
largest harness, that discovery covers every project folder plus redirected
and desktop roots and takes the project from the working directory recorded
in the session; those lines live in the connector crate and are cited in the
second witness.
