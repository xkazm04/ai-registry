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

# Rust: the connector contract in franken_agent_detection

This is the second witness for the technique, and every anchor below is
root-relative to a different tree from the first witness: the connector crate
franken_agent_detection, version 0.3.10, at commit 6b337ba434b7, which
supplies the per-harness readers that coding_agent_session_search (cass)
ingests through. The version witness is the crate's toolchain pin,
`nightly-2026-08-31` in its `rust-toolchain.toml`, in dotted form because the
tree names no stable release. The first witness
([rust--ingest-disposition-accounting](./rust--ingest-disposition-accounting.md))
covers the host side: the disposition set, the active-writer deferral and the
skip ledger. This one covers what a reader promises the host, which is where
the inventory and the completion certificate are made. Mechanisms are
restated; anchor quotes are the only verbatim text.

## Confirmed: the inventory is a separate, pre-parse call

Every connector exposes a discovery call that lists the files it will read,
using the same root expansion and filters as its parser, and the contract
states the purpose the golden path gives it, letting the host copy sources
before a parser failure can hide them:
`src/connectors/mod.rs:118 "mirror precious source artifacts before parser failures"`.

## Confirmed: completion is certified, never assumed

A connector that can prove file boundaries reports a source complete only
after every conversation from it has been delivered, and never on a parse
failure, a callback failure or a cancellation:
`src/connectors/mod.rs:162 "fires only after EVERY conversation derived from"`.
A connector that cannot prove boundaries gets a default that certifies nothing
rather than guessing: `src/connectors/mod.rs:168 "truthful no-boundary fallback"`.
The largest harness's reader skips a source it could not read completely
instead of emitting what it got: `src/connectors/claude_code.rs:720 "Never emit or certify an incompletely read source."`

## Confirmed, one direction: the coverage test

A shared test helper checks, per connector fixture, that every source path the
parser produced a conversation from is in the discovery inventory:
`src/connectors/mod.rs:183 "fn assert_discovery_covers_scan_sources"`, failing
with `src/connectors/mod.rs:207 "discovery should include scanned source path"`.
Connectors call it from their own tests, for example
`src/connectors/aider.rs:698 "assert_discovery_covers_scan_sources(&connector, &ctx);"`.
The helper also refuses a fixture that produced nothing,
`src/connectors/mod.rs:202 "fixture should produce at least one scanned conversation"`,
so it cannot pass vacuously.

It checks the direction the technique calls the coverage test and not the
other: an inventoried source that produced nothing is not a test failure. That
is correct for a test and leaves the host to account for those sources, which
is where the first witness found its gap.

## Deviation: a source that parses to nothing leaves almost no trace

In the largest harness's reader, a file that yields no messages is skipped
with a debug log, and the log is emitted only for the first few such files:
`src/connectors/claude_code.rs:998 "if file_count <= 3 {"` guarding
`src/connectors/claude_code.rs:999 "claude_code no messages extracted"`. No
conversation is emitted, so the host's per-conversation capture never runs for
that file once pre-parse capture is skipped above its threshold. A format
change that empties every transcript produces three debug lines and a pending
count.

## Confirmed: one discovery, every root, project from the record

The same reader's discovery covers the redirected and desktop store roots as
well as the default one, `src/connectors/claude_code.rs:132 "roots.extend(Self::desktop_session_roots_resolved(home_dir));"`,
added because missing them dropped whole profiles without a word:
`src/connectors/claude_code.rs:93 "silently ignores caam-isolated profiles"`.
The project a session belongs to is taken from the working directory the
session recorded, not from the folder it was found in:
`src/connectors/claude_code.rs:735 "workspace = val.get("`. The external id is
the path relative to the store root, the root-relative identity the subject's
identity technique describes: `src/connectors/claude_code.rs:1034 "path.strip_prefix(base).ok()"`.
