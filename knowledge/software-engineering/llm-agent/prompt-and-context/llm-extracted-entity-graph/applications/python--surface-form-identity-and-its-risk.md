---
layer: application
type: application
subject: llm-extracted-entity-graph
technique: surface-form-identity-and-its-risk
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# Surface-form identity in LightRAG

Read against `HKUDS/LightRAG` at commit `c1248646e4eda4d89054926af2e094730daf23fe`. The
version witness is the tree's own manifest: `pyproject.toml:14` declares
`requires-python = ">=3.10"`, and `pyproject.toml:100` confirms the floor is live rather
than vestigial — a dependency comment reads *"requires-python allows 3.10, which needs this
backport instead"*. So 3.10 is the runtime this tree actually witnesses, not the newest one
it happens to run on.

LightRAG is the reference realization of this whole subject: it builds a typed
entity/relation graph out of arbitrary prose with no register anywhere in the loop, which
is exactly the condition the technique is written for. What follows is where its identity
contract matches the standard, and the five places it falls short.

## The key, and the function that makes it

The node key is the model's entity name, normalised, and nothing else.
`lightrag/operate.py:724` is the whole identity decision:

```python
entity_name = normalize_entity_name(record_attributes[1])
```

Relation endpoints go through the identical call at `lightrag/operate.py:788-789`, so an
edge's endpoints are keys in the same space as nodes — the technique's requirement that
normalisation be one door, satisfied structurally. The graph read at
`lightrag/operate.py:2456` (`await knowledge_graph_inst.get_node(entity_name)`) then
*defines* sameness: two mentions are one entity iff this string matches.

`normalize_entity_name` (`lightrag/utils.py:5391-5393`) delegates to
`sanitize_and_normalize_extracted_text(..., remove_inner_quotes=True)`, whose rules are
enumerated in the docstring at `lightrag/utils.py:5396-5421` and implemented from
`lightrag/utils.py:5422` onward. The list is conservative in exactly the direction the
technique demands: HTML paragraph and break tags stripped, full-width letters and digits
folded to half-width (`lightrag/utils.py:5427-5435`), CJK punctuation mapped to its ASCII
equivalent (`:5438-5450`), quotes removed, whitespace between CJK characters collapsed.
Every one of these is a transport artifact. **Nothing in the function collapses
abbreviation, honorific, legal-form suffix, or case.** That is the contract this technique
prescribes, implemented.

Two related decisions land the same way. Self-loops are refused at
`lightrag/operate.py:806` (`if source == target: return None`) — a relation whose endpoints
normalise to one key is a normalisation artifact, not a fact. And the edge lock is taken on
the *sorted* endpoint pair (`lightrag/operate.py:3832-3836`,
`sorted_edge_key = sorted([edge_key[0], edge_key[1]])`) while the node lock is taken on the
bare key (`lightrag/operate.py:3745-3747`), so an undirected relation has one identity
regardless of which way a passage phrased it.

## Deviation 1 — the case contract lives in the prompt, not in the code

`lightrag/utils.py` never case-folds an entity name; only the entity *type* is lowered
(`lightrag/operate.py:698`, `entity_type.replace(" ", "").lower()`). Case-consistency of
the key is instead requested of the model, at `lightrag/prompt.py:63` (text mode) and
`lightrag/prompt.py:182` (JSON mode):

> `entity_name`: The name of the entity. If the entity name is case-insensitive, capitalize
> the first letter of each significant word (title case). Ensure **consistent naming**
> across the entire extraction process.

This is the technique's "the contract cannot be delegated to the extraction instructions",
verbatim. The instruction is a request; a model that title-cases `Neural Network` in one
passage and emits `neural network` in the next produces two nodes, and nothing in the tree
notices. The standard's position stands: whatever the prompt asks for, the code enforces —
and a declared case rule (fold, or refuse to fold, but decide in the function) would cost
one line here.

## Deviation 2 — no measurement of the collision or split rate exists

The technique requires the identity exposure to be measured on a labelled sample of the
corpus's own names and carried as the graph's predicate. The tree measures neither, and its
evaluation surfaces confirm the gap rather than fill it. `docs/Reproduce.md` and
`reproduce/batch_eval.py` implement the published methodology: an LLM pairwise judge scoring
two systems' *answers* on **Comprehensiveness, Diversity and Empowerment**, with a win rate
as the output. That is a downstream answer-preference metric — it cannot attribute a
regression to the identity key, the normalisation contract, or the merge operator. The one
instrument that reports precision-shaped numbers,
`lightrag/evaluation/offline_retrieval_check.py:67` (`recall_at`), scores document
retrieval with a deterministic lexical ranker (`:1-6`) and never touches the graph.

So the graph ships with an unmeasured, undisclosed identity risk — which is the condition
the technique exists to end, and it is the tree's single largest shortfall against this
subject.

## Deviation 3 — the identity inference is not carried on the node

The node written at `lightrag/operate.py:2727-2735` carries `entity_id`, `entity_type`,
`description`, `source_id`, `file_path`, `created_at` and a `truncate` marker. `source_id`
is real per-claim provenance in the axis the golden path requires — the chunk keys that
contributed — and it is well maintained (the full, untruncated list is kept separately in
`entity_chunks_storage`, `lightrag/operate.py:2513-2521`, precisely so the displayed
`source_id` cap does not destroy the record).

What is absent is any marker that the *node's identity* is an inference. Nothing records
the normalisation contract version, and nothing distinguishes "these mentions were treated
as one entity" from "this is an entity". A consumer rendering the node — the graph explorer
included — has no way to say which.

## Deviation 4 — the vector row is keyed off the same surface form

`lightrag/operate.py:2743` derives the index id as
`compute_mdhash_id(str(entity_name), prefix="ent-")`. Both stores therefore key on the same
string, which is consistent and is the reason a rename is a genuinely hard operation here:
changing a node's key orphans its index row unless the rename path removes the old id
explicitly. The tree has a dedicated manual-rename path for this (`lightrag/utils_graph.py`,
exercised by `tests/api/routes/test_graph_entity_name_normalization.py`), which is the
right shape — but it also means the identity decision is not confined to one store, so a
normalisation contract change is a full reindex rather than a graph migration. The
technique's "declared exception with the observation that justified it" is the cheap
protection against ever needing that.

## Deviation 5 — the attribute vote gives history one vote

Adjacent to identity and worth recording here because it has the same shape. The node's
type is resolved at `lightrag/operate.py:2576-2582` by `Counter` majority over
`[dp["entity_type"] for dp in nodes_data] + already_entity_types`, where
`already_entity_types` contributes **exactly one entry** — the stored value, appended once
at `lightrag/operate.py:2475` — regardless of how many passages established it. Two new
mentions therefore outvote a hundred historical ones, and the next document can flip it
back. The merge technique's requirement is that every non-set attribute resolve by an
order-independent rule; this one is order-dependent through the vote's tie-break and
evidence-blind through the single stored vote.

## What the tree gets right that the standard should keep

The dedup that protects convergence is real and hard-won. `_combine_descriptions_dedup`
(`lightrag/operate.py:2383-2425`) deduplicates across *stored* and *new* fragments, not
merely within the incoming batch, and its docstring names the incident that produced it
(issue #3367: a re-extracted description appending a duplicate fragment on every reprocess).
It also compares fragments **after** sanitisation on both sides, because a raw-versus-clean
comparison misses the duplicate exactly when cleaning changed the string — so the fragments
that would survive the gap are the malformed ones. Both rules are in
`accumulate-then-threshold-merge` because this tree learned them the expensive way.
