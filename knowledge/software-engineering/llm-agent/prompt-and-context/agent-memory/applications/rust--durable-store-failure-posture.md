---
layer: application
type: application
subject: agent-memory
technique: durable-store-failure-posture
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A consolidation that replaces only what it read, and the tool that cannot say what it read (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a single-binary memory store for
coding agents, read at release 0.11.4. The stack version is the floor its crates declare
(`edition = "2024"`, Rust 1.85). Nothing was executed; every claim is a traced path.

## The design this tree made

Consolidation here is a model pass: a worker reads a topic's memories, asks a summarizer for
one summary, and writes it back. Hooks keep storing memories while it runs. The tree's first
answer replaced the whole topic with the summary, and in its 0.11.0 release it broke that call
on purpose (`crates/icm-cli/CHANGELOG.md:44 "needs `ids` to replace anything"`,
`crates/icm-cli/CHANGELOG.md:55 "consolidate_ids replaces only the memories that were read"`).
The store interface now states the read-set rule in full:
`crates/icm-core/src/store.rs:163 "Replace the memories a consolidation read with the summary it wrote"`,
nothing outside the read is removed, including
`crates/icm-core/src/store.rs:168 "not the part of a topic that did not fit in the prompt or in one"`
read, and the summary is written only if each read memory is unchanged, because otherwise
`crates/icm-core/src/store.rs:174 "summary, one forgotten meanwhile would come back through it, and a"`
`crates/icm-core/src/store.rs:175 "concurrent consolidation of the same memories would leave two"`
summaries.

The SQLite backend resolves the set inside one transaction
(`crates/icm-store/src/store/memory.rs:850 "The exact set this call removes, resolved inside the transaction"`)
and refuses with a named result rather than an error when a read item moved
(`crates/icm-store/src/store/memory.rs:901 "Gone, moved to another topic, or edited since it was"`,
`crates/icm-store/src/store/memory.rs:920 "return Ok(icm_core::Consolidated::Stale { changed });"`).
This is the technique's read-set section almost clause for clause, reached independently,
and it is the evidence the section cites for a tree that paid a breaking release for it.

## The structural fact: the token is optional, and the agent path drops it

The per-item token is the summary the caller saw, and the type makes it optional:
`crates/icm-core/src/store.rs:8 "Its summary when it was read."` When it is absent,
`crates/icm-core/src/store.rs:9 "id: the memory is then replaced whatever it holds now."`

The background summarizer carries the token: it builds its read set from the memories it
loaded (`crates/icm-cli/src/main.rs:9949 ".map(|m| icm_core::ReadMemory::from(*m))"`). The
tool an agent calls cannot. Its contract takes ids, so the tool builds the read set with no
token, and says so:
`crates/icm-mcp/src/tools.rs:2020 "Only ids are known here, not what the caller read under them: the"`
`crates/icm-mcp/src/tools.rs:2021 "store checks that each is still in the topic, nothing more."`

So the read-set check is complete on the path where the pass is code and the window is one
summarizer call, and reduced to a presence check on the path where the reader is a model that
listed the topic, thought about it for a turn, and came back with ids. That second window is
the longer one, and it is the one where an edit made meanwhile (a correction stored into the
same memory by another session's hook) is deleted together with a summary that never saw it.
The fix the tree's own type allows is a tool contract that carries a token per id, the
revision or a content hash the listing returned, which the listing call already has in hand.

## What the realization cannot do

The protected tier is never removed even when it was read, which keeps a "never forget" item
alive at the price of its content now living twice, in itself and in the summary. Nothing
records that the summary covers it.

## Return condition

`unmeasurable` until replayed: build the binary, list a topic through the agent tool, edit one
listed memory through a second session, then consolidate with the listed ids. The prediction
to falsify: the edited memory is removed and its edit is in neither the store nor the summary.
