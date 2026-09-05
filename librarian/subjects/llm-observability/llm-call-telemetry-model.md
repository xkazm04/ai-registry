---
subject: llm-call-telemetry-model
domain: llm-observability
last_touched: 2026-09-04
dry_streak: 0
---

# llm-call-telemetry-model

## 2026-09-02 - intake `deer-flow` v2 back half ([[2026-09-02-deer-flow-v2]], run intake-deer-flow-0902-v2)

Source-tree application added (python, against the source's own clone at
`08b27aef`), from the v2 design record's catch: the tree realises this
subject's forces one layer up from where the corpus wrote them. The design
record and its routing count live in [[2026-09-02-deer-flow-v2-replication]];
the catch, the anchors verified against the fresh clone, and what the tree
adds to the technique are in the application document itself.

Cross-bundle placement question recorded in the replication note (Q3): the agent gateway realises `server-owned-fields` with message metadata in place of billing attribution; whether llm-agent may share the technique across bundles or must mint a sibling is a registry rule, not decided here.

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Application `node--token-usage-quadruple`** (negative), from an agent harness
that computes cost in **two userspaces** because the model call can be made from
either of two executors. Its design document states this subject's rule with the
right reason - the two cache buckets are kept separately because reads and writes
bill at different rates, so a collapsed number cannot be re-derived. One userspace
implements it. The other - the default harness - reads the cache-*read* token
field and never reads cache-*creation*, so the number is discarded at the
provider-usage boundary before any pricing runs, and the persisted record carries
no latency either.

The consequence is this technique's own sentence realised: *folding writes into
input under-prices exactly the traffic engineered for reuse* - aggravated, because
the writes are not folded, they are dropped to zero, and because the field is
discarded at ingest rather than at pricing, re-pricing cannot recover it. That
defeats the store's own stated property that cost is re-derivable from tokens.

**The part worth keeping** is the claimed test. The design document specifies
exactly the coverage that would have caught this - assert the persisted cost
"through a Rust executor **and** through the TypeScript path, so coverage is
pinned on both userspaces". Searching every TypeScript test in the tree for an
assertion on the persisted cost field returns **zero**; the other side asserts it
in three places. So the parity a reader was told is pinned is pinned on one side.
The rule this sharpens: where a telemetry schema has more than one emitter, the
schema is not the contract - the emitters are, and a field is only as real as the
least complete one. A shared type carrying the right shape is not enforcement.
