---
source: github:getzep/graphiti
kind: repository
url: https://github.com/getzep/graphiti
title: "getzep/graphiti: temporal knowledge-graph memory, open-core engine"
author: Zep
words: n/a (tree sweep; README treated as the least reliable surface)
extracted: 8
accepted: 0
declined: 0
leads: 4
already_covered: 3
untriaged: 1
dispatched: 0
applied: 0
shipped: 0
run_id: hv-se-1014-sea024
siblings: 0
---

# An open-core memory engine: catches and prompt-comment leads, no landing

**Class:** vendor repository, with the engine in the tree (extraction, edge resolution
and temporal invalidation), so the README is the advertisement and the code and prompt
comments are the yield. Queue row SEA-024, harvest batch `hv-se-1014`. Expected yield:
leads. Commit `8d8a12a22452cbef9335792afb73b8cbfe6a79fa` (shallow clone, deleted by
name). Fetches: 0 of 3. Memory lane: the nearest ladder arm is extraction over a
versioned store (0.92 accuracy, about 21,300 write tokens per event), which is already
priced, so no new arm would price anything. Forge-handoff count 0 to 1; the one
candidate (temporal invalidation) is already owned by `observation-clock` and
`stale-served-versus-stale-answered`. No handoff. `check-anchors` was not run.

**Swept:** `graphiti_core/prompts/dedupe_edges.py`, `utils/maintenance/{edge_operations,
temporal_edge_utils,dangling_endpoints}.py`, `edges.py`, `search/search_filters.py`,
`graphiti.py` (summary selection), `tests/test_saga_summary_budget.py`, `AGENTS.md`,
README last. **Not read:** driver, embedder, cross-encoder and LLM-client layers,
`mcp_server/`, `server/`, `spec/`, `tests/evals/`.

## Triage

| # | Candidate | Anchor | Decision |
| --- | --- | --- | --- |
| 1 | A supersedence judge must require explicit evidence, never recency | `graphiti_core/prompts/dedupe_edges.py:89` "Do NOT infer contradiction from recency alone" | **lead** |
| 2 | Role and ownership facts are not contradicted by activity facts | `dedupe_edges.py` "Do NOT treat additional activity, progress, status" | **lead**; no incident record |
| 3 | A late-arriving fact with an older start date is closed by a later-dated candidate | `edge_operations.py:731` "A candidate that starts later supersedes this edge, so expire this one instead." | **untriaged**; check against `observation-clock` before triage |
| 4 | Future-tense facts take the statement time as start; a soft deadline is never an end date | `temporal_edge_utils.py:39` `normalize_future_temporal_bounds` | **lead** |
| 5 | Two scopes for two verdicts: endpoint-pair for duplicates, group-wide for contradictions | `edge_operations.py:522` "Duplicate candidates have the same endpoints in either direction" | **already covered** (boundary of `scope-before-similarity`) |
| 6 | Retired edges are kept with `invalid_at`/`expired_at`; the expired filter is opt-in | `search/search_filters.py:259` | **already covered** (`stale-served-versus-stale-answered`); needs a measured arm, not a landing |
| 7 | Summary backlog packed oldest-first under a character budget; an oversized item is truncated, never skipped | `graphiti.py:146-176` `select_saga_summary_episodes` | **lead** |
| 8 | Missing edge endpoints become nodes, with an unreferenced-node cleanup pass | `utils/maintenance/dangling_endpoints.py:26,61` | **already covered** (off the prior-art list: `llm-extracted-entity-graph`) |

## Leads and return conditions

Rows 1, 2, 4, 7: all are design observations read from code and one prompt; none was
measured. Row 1 is the one worth an arm: a variant of the write-time verdict arm whose
reconciliation judge carries the explicit-evidence clause, compared on false retirements.
Return when that arm is built, or when `lane-reconciliation` is next amended.

README benchmark and comparison claims were not used as evidence; none was taken as a lead.
