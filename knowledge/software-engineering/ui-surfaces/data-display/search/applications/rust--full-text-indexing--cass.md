---
layer: application
type: application
subject: search
technique: full-text-indexing
stack: rust
status: forged
verified_on: 2026-10-15
verified_against: rust@2026.08.31
---

# Count-certified publication of a rebuilt index (cass)

The tree is cass (coding_agent_session_search), a Rust tool whose canonical SQLite
archive of coding-agent transcripts feeds a separate full-text engine (Quill, which
replaced Tantivy) and, below a size bound, an SQLite FTS5 shadow. Read at commit
`7fc01958d367`. The stack version is the toolchain pin (nightly 2026-08-31, written as a dotted date); the crate version is `Cargo.toml:3 "version"` (0.10.0);
the toolchain is a dated nightly pinned in `rust-toolchain.toml` with no release
number. Nothing was executed here.

The sibling application `rust--full-text-indexing.md` shows the synchronous posture:
triggers plus a boot-time count reconciliation. cass sits at the other end. Its index
is rebuilt as a whole generation and published by swapping directories, so the
technique's reconciliation becomes a publication gate: a generation is certified only
when a fresh reader proves it serves what the build counted. The tree adds three things
to the technique and shows one window it does not close.

## The hollow-index incident, and the rule it produced

A completed rebuild checkpoint once certified a generation that served three documents
against roughly a million (`src/search/asset_state.rs:1506 "3 live documents against ~1M certified"`).
The verification existed; it ran only when a count was observable, so it verified
nothing in exactly the cases that mattered
(`src/indexer/mod.rs:9516 "shape verified nothing"`). The fix makes an unobservable
count a failed proof. The post-publish proof opens the generation with a fresh reader,
refuses to certify when no reader can open it or no generation is found, and compares
the served count to the build's count with strict equality
(`src/indexer/mod.rs:9513 "the post-publish proof that a rebuild's generation serves exactly"`;
`src/indexer/mod.rs:9539 "if summary.docs != indexed_docs {"`).

This is the technique's "measure the index through its own storage" and "not equal,
not less than" clauses, plus one the technique lacks: **a reconciliation that cannot
read its target fails; it does not skip.** The synchronous sibling logs and skips on
an unreadable shadow count, which is defensible for a boot-time repair that only ever
triggers a rebuild. For a gate that certifies, skipping is certifying.

## The expected count is the derivation's predicate, not the source's row count

The technique says to count the source and count the index. cass found the trap in
that sentence. Its lexical sink deliberately drops noise messages (empty content, tool
acknowledgements), so a healthy index always holds fewer documents than the raw message
table. Gating a checkpoint refresh on the raw count made the refresh skip forever and
drove repeated forced rebuilds
(`src/indexer/mod.rs:13199 "Gating this refresh on the raw count made the"`). The fix
compares against the noise-adjusted count the rebuild planner uses
(`src/indexer/mod.rs:13202 "Gate on the same noise-adjusted expectation the rebuild planner uses"`).

The general rule: where the derivation filters, the source-side count must pass
through the same filter, or the comparison measures the filter and not the drift. The
technique's own example (rows written before the index existed) assumes an index that
holds every source row; any tokenizer or sink that discards input breaks that
assumption.

## Index or scan, decided by the engine's maintenance cost

The technique sizes the index-or-scan decision on query cost. cass shows a second input
that can reverse it. Its FTS5 shadow rebuilds its whole in-memory index on each reload
after a write, which on the owner's archive of 631,657 messages cost about 20 GB
resident before any row was written
(`src/storage/sqlite.rs:18010 "cost about 20 GB resident and minutes before cass"`). So
above a message-count bound the shadow is dropped and the SQL fallback scans the
message table (`src/storage/sqlite.rs:18015 "Above this bound the shadow is dropped"`).
The derived structure is abandoned precisely when the corpus is largest, because its
maintenance scales worse than its queries save. The technique's portability input names
a capability that differs by engine; this is the same point about cost.

## Status from metadata alone

Readiness surfaces call the live generation hollow when its served count falls below
half of what the last completed checkpoint certified
(`src/search/asset_state.rs:1507 "LEXICAL_HOLLOW_LIVE_DOC_FLOOR_PERCENT: u64 = 50;"`).
The comment above it argues the served count never legitimately drops below the
certified one and then chooses half anyway as margin
(`src/search/asset_state.rs:1504 "Half is a generous"`). The result is a one-sided check
with a wide band: it catches the incident shape by orders of magnitude, and it cannot
see an index that lost a third of its documents or one that serves phantoms above the
certified count. It is a smoke alarm, not the reconciliation, and it is right to be
cheap; it should be read as such.

## Where the gate may open late (unconfirmed)

The candidate-build path refuses an unreadable or hollow candidate before it can replace
the live generation
(`src/indexer/mod.rs:27950 "Refuse an unreadable/hollow candidate before it can replace a usable"`)
and verifies again after the swap. The staged path that publishes a merged shard
artifact does not, in the lines read: it swaps first
(`src/indexer/mod.rs:26549 "publish_staged_lexical_index(&final_merge_artifact.publish_path, index_path)"`)
and proves the count afterwards
(`src/indexer/mod.rs:26558 "verify_published_lexical_doc_count(index_path, indexed_docs,"`).
The run did not read the federated publisher's internals, so whether it counts before
the swap is **unconfirmed**. If it does not, there is a window in which the live path
serves an uncertified generation, and a failed proof afterwards is reported, not undone:
nothing in the lines read swaps the parked prior generation back. The tree's comment on
the other path accepts the same posture for post-swap failures
(`src/indexer/mod.rs:28054 "A post-swap failure is still reported,"`).

The generation manifest compounds the reading problem: it is marked published while
still in the staged directory, before either the swap or the proof
(`src/indexer/mod.rs:7545 "LexicalGenerationPublishState::Published,"`), so an
inspector reading the manifest of a generation whose proof then failed sees a published
state the gate never granted.

## What the realization cannot do

- **Prove the build counted the right thing.** The publication proof compares the
  served count to the count the build itself recorded. A build that skipped
  conversations and counted only what it wrote passes it; that class is left to the
  separate checkpoint refresh, which does compare against the source's noise-adjusted
  expectation.
- **Prove content, only cardinality.** A generation that holds the right number of
  wrong documents passes every check here. The tree's metamorphic search tests (see
  the model-based-oracle application of this tree) are what check that served documents
  answer queries correctly.

## What the tree's shape says about the technique

It confirms the reconciliation clauses under a harsher regime (whole-generation
publication instead of row triggers) and adds three rules: an unobservable count fails
the gate, the source-side count passes through the derivation's own filter, and an
engine's maintenance cost belongs beside query cost in the index-or-scan decision. Its
unconfirmed staged path is the remaining lesson: a verify-before-swap rule held on one
path and not the next is the hollow-index incident waiting for its second instance.
