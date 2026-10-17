---
layer: application
type: application
subject: agent-session-archive
technique: queryable-surface-redaction
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Rust: index-time redaction in coding_agent_session_search

The tree is coding_agent_session_search (cass) 0.10.0 at commit 7fc01958d367;
the version witness is the toolchain pin `nightly-2026-08-31` in
`rust-toolchain.toml`, in dotted form because the tree names no stable
release. Mechanisms are restated; anchor quotes are the only verbatim text.

## Confirmed: precision at ingest, recall before export

Redaction runs during the map from the connector's normalized record to the
stored one, before anything reaches the database or the lexical index:
`src/indexer/redact_secrets.rs:7 "reaches SQLite or the FTS index"`. The
module states its precision choice outright, known prefix shapes and no
entropy heuristics, to keep ordinary code content searchable:
`src/indexer/redact_secrets.rs:8 "well-known prefix patterns rather than high-entropy heuristics"`.
It was added after tool-result secrets were found persisted unredacted:
`src/indexer/mod.rs:36001 "security fix for #112: tool-result secrets were persisted unredacted"`.

Structured metadata is walked by key semantics, with normalized spellings
matched against an exact list so ordinary identifiers that merely contain a
credential word are left alone:
`src/indexer/redact_secrets.rs:53 "semantics. Normalization deliberately accepts"`.

The recall-oriented scanner lives on the export path, with its entropy
threshold and minimum length as constants:
`src/pages/secret_scan.rs:25 "DEFAULT_ENTROPY_THRESHOLD: f64 = 4.0;"`. It
imports its credential patterns from the ingest module, so the ingest set is a
subset of the export set and cannot drift from it:
`src/pages/secret_scan.rs:5 "use crate::indexer::redact_secrets::{"`.

## Confirmed: the at-rest copy is declared, not redacted

The redaction switch's documentation states the trade the technique asks for:
the harness's own files and the raw-mirror blobs hold the same raw text on the
same disk, so index-time redaction protects the queryable surfaces and not
the disk: `src/indexer/redact_secrets.rs:366 "not disk-at-rest secrecy"`. The
privacy summary repeats it as a policy line on the mirror:
`src/privacy_exposure.rs:180 "raw-mirror stores verbatim source copies; treat as sensitive at rest"`.

## Confirmed: the pattern set is part of every cache key

Redaction results are memoized, and the memo key includes a fingerprint of the
pattern set, so tightening or adding a pattern invalidates every earlier entry:
`src/indexer/redact_secrets.rs:404 "automatically invalidates every prior cache entry"`.

## Measured: speed, once

Word-boundary semantics decided throughput. Unicode boundaries pushed the
whole pattern set onto the slow matching engine; ASCII boundaries kept it on
the fast one, measured on 593 MiB of real session text at roughly 10 MiB/s
against 261 to 284 MiB/s, with identical matches:
`src/indexer/redact_secrets.rs:132 "on 593 MiB of real"`. One run, described
only in a code comment, on private text.

## Deviation: exclusions were honoured at capture and not at the index

For most connectors, a session the operator excluded was kept out of the raw
mirror but still stored, searchable, and reported as a clean run:
`CHANGELOG.md:340 "withheld from the raw mirror but still"`. The fix enforces
exclusions at the ingest chokepoint and again at the capture boundary, which
is the technique's rule that an exclusion holds at every stage or at none.

## Gap: recall was never measured

The project's own audit marks index-time redaction as working against a code
range: `docs/planning/REALITY_CHECK_AND_BRIDGE_PLAN_2026-09-01.md:1720 "Index-time secret redaction"`.
No labelled secret corpus, recall figure or false-positive rate exists in the
tree, and the security audit documents in the tree cover the export
feature, not the ingest redactor. The
throughput number above is the only measurement. A team adopting this design
inherits a redactor whose speed is known and whose coverage is not, which is
the gap the technique's last section tells it to close first.
