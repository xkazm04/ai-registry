---
layer: application
type: application
subject: agent-session-archive
technique: capture-before-parse
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Rust: the raw mirror in coding_agent_session_search, and the threshold that skips it

The tree is coding_agent_session_search (cass), crate version 0.10.0
(`Cargo.toml:3 "version = "` reads 0.10.0), at commit 7fc01958d367. The version
witness is the toolchain pin, `nightly-2026-08-31` in `rust-toolchain.toml`; a
nightly carries no stable release number in the tree, so `verified_against`
states the pin's date in dotted form. The per-harness parsers live in a
separate connector crate (franken_agent_detection @ 6b337ba434b7); its side of
the contract is cited in
[rust--ingest-disposition-accounting--franken-agent-detection](./rust--ingest-disposition-accounting--franken-agent-detection.md),
and this document cites only the cass tree. Everything below is restated; the
only verbatim text is in the anchor quotes.

## Confirmed: a pre-parse capture stage, with stated exclusions

cass copies harness transcripts into a versioned raw mirror in a stage that
runs between the connector's file discovery and its parse:
`src/indexer/mod.rs:33760 "fn capture_connector_sources_before_parse("`. When
a connector's discovery fails outright, the indexer still captures from the
configured roots rather than skipping capture:
`src/indexer/mod.rs:33825 "falling back to legacy explicit-root preparse capture"`.
The mirror's own admission path re-checks operator exclusions, because an
empty inventory can trigger that fallback and discovery alone is not trusted to
have applied them: `src/raw_mirror.rs:3 "Connector discovery is not the final privacy boundary"`.

Capture can be switched off, and the switch's documentation states the price
in the terms the technique asks for, which is the loss of the only copy once
the harness deletes: `src/raw_mirror.rs:43 "lost is the copy that survives a provider deleting"`.

Stores that hold more than conversations are refused wholesale, as the
technique's exclusion rule says, and the reason is written down per store:
`CHANGELOG.md:64 "raw-mirrored, because doing so would copy the parts"` and
`README.md:418 "so raw mirroring and remote database ingestion are disabled"`.

Cadence is a scheduled job on a short interval plus a nightly census, installed
by the tool itself: `README.md:2598 "job every 15 min and a"`. Fifteen minutes
against a thirty-day default window is ample margin; against a one-day window
it still is.

## Deviation: above 256 primary files, the pre-parse capture is skipped

The contract holds only for small stores. The limit is a constant,
`src/indexer/mod.rs:120 "PREPARSE_PRIMARY_SOURCE_CAPTURE_LIMIT: usize = 256;"`,
and when a connector discovers more primary session logs than that, the
indexer logs that it is deferring them,
`src/indexer/mod.rs:33785 "deferring large primary source raw-mirror capture"`,
and leaves their capture to the per-conversation path that runs after the
parse: `src/indexer/mod.rs:33757 "attach_raw_mirror_capture(data_dir, conv);"`.
That call sits at the end of per-conversation preparation, so it runs only for
sources that produced a conversation. The connector crate's reader for the
largest harness skips a file that yields no messages without emitting
anything, so a source that parses to nothing is never captured on any store
above the threshold, which is every long-lived installation. A test pins the
behaviour as intended:
`src/indexer/mod.rs:41899 "fn raw_mirror_preparse_defers_large_primary_source_sets_but_keeps_sidecars"`.

This is the boundary case the technique is written around: a capture that
scales by skipping fails on the format change it exists for. The repair is a
rate throttle over all inventoried files, not a count condition that reroutes
capture through the parser.

A smaller deviation in the same loop: sources the active-writer filter flags
are skipped from pre-parse capture as well as from parsing,
`src/indexer/mod.rs:33790 "if should_skip_active_session_source("`. The
technique separates the two: deferring the parse of a live file is right,
deferring its copy is not needed, because a partial capture is retired later
by prefix proof.

## Confirmed: remote history is pulled additively, into its own namespace

The remote sync deliberately runs its transfer without deletion, and says why
in the module's safety note: a misconfigured or empty remote must not erase
local copies, `src/sources/sync.rs:8 "The sync engine uses rsync WITHOUT the"`.
Each remote lands under its own directory,
`src/sources/sync.rs:854 "remotes/{source_name}/mirror/"`, and is then parsed
by the same connectors as local stores, with its origin injected at the
per-conversation chokepoint described in the identity application.

## The record and its projections

The recovery runbook names the canonical database as the archive of record,
`docs/planning/RECOVERY_RUNBOOK.md:16 "SQLite is the archive of record once a conversation"`,
calls every index derived and warns that rebuilding one proves nothing about
upstream, `docs/planning/RECOVERY_RUNBOOK.md:23 "do not treat an index rebuild as proof"`,
and carries the written never-delete list the golden path asks for, covering
the database and the raw mirror both:
`docs/planning/RECOVERY_RUNBOOK.md:29 "What Doctor Must Never Delete"`. The
layering differs from the golden path's in one respect: cass treats the
database as the record and the mirror as protection beside it, where the
golden path treats the capture as the record and the database as its
projection. Both are protected by the same list, so the difference matters
only for which one a re-derivation starts from.
