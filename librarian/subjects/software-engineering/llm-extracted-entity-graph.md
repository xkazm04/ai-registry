---
subject: llm-extracted-entity-graph
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# llm-extracted-entity-graph

Born 2026-09-02/03 from `/intake` run `intake-lightrag-0902` (intake 2.2.0, round 4 of
the 2.x series, every worker Opus): a scoped forge handoff over the graph-construction
system of a graph-RAG library, where three design decisions carried `corpus: NONE` and
one home - both routing clauses fired on the same cluster. Placed in
`llm-agent/prompt-and-context` (eighth of ten) beside `retrieval`, which consumes exactly
what this subject produces; the civic bundle's `civic-knowledge-graphs` is the boundary,
stated in prose without a link: it rejects text-derived identity in its own words, and
the discriminator is whether an identity authority exists for the corpus. Techniques:
`surface-form-identity-and-its-risk`, `accumulate-then-threshold-merge`,
`recall-passes-with-a-declared-cap` (renamed from the source's coinage),
`recoverable-fan-out-write` (renamed; twelve stores at one barrier, not two). Provenance
required in one axis (from what), review state permitted and named as the tell for the
civic subject. Director review: gate green, purity clean, `use_when` on all four,
taxonomy last, the "only 1 time" gleaning line opened and read verbatim. Spec:
`docs/subject-proposal-llm-extracted-entity-graph.md` (EXECUTED). Fleet: politicas is
the peer under the opposite identity regime and received the comparison study; no
project builds a surface-form graph, so the apply step is a source-tree task. Deviations
for the backlog: the case contract is a prompt request not code; recall passes run once
whatever the knob says; longest description wins instead of accumulating; identity
collisions and extraction recall are unmeasured.
