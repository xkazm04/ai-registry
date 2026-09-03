---
layer: application
type: application
subject: retrieval
technique: query-decomposition-before-the-lanes
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# A two-tier keyword decomposition in a graph-augmented retrieval engine

Read against `HKUDS/LightRAG` at commit
`c1248646e4eda4d89054926af2e094730daf23fe`. **Version witness:** the tree
declares `requires-python = ">=3.10"` (`pyproject.toml:14`) and lints at
`target-version = "py310"` (`pyproject.toml:238`); the interpreter on the
reading host reported `Python 3.12.1` (`python --version`), which is the
version these citations were resolved at.

This is the clearest in-the-wild realization of the stage the technique names:
a decomposition that runs *between the query arriving and any lane executing*,
emitted as a readable artifact, feeding two indexes that answer at different
levels of abstraction.

## The stage exists, and it is a real stage

`kg_query` (`lightrag/operate.py`) calls the decomposer before it builds any
context at all:

```python
# lightrag/operate.py:4642
hl_keywords, ll_keywords = await get_keywords_from_query(
    query, query_param, global_config, hashing_kv
)
```

`get_keywords_from_query` (`operate.py:4844`) is a thin authority wrapper: a
caller may **pin** the decomposition by supplying the tiers on `QueryParam`
(`operate.py:4866-4867`), and only otherwise does it call
`extract_keywords_only` (`operate.py:4981`), which issues one model call
against `PROMPTS["keywords_extraction"]` (`operate.py:5026-5030`).

The tier vocabulary is defined once, in the prompt itself
(`lightrag/prompt.py:489-490`):

- `high_level_keywords` — "overarching concepts or themes, capturing user's
  core intent, the subject area, or the type of question being asked";
- `low_level_keywords` — "the specific entities, proper nouns, technical
  jargon, product names, or concrete items".

The tier→lane policy is stated as a comment above the dispatch
(`operate.py:5182-5183`) and then executed: low-level keys go to the entity
vector index via `_get_node_data`, high-level keys to the relationship vector
index via `_get_edge_data`, and the raw query is embedded separately for the
chunk index (`operate.py:5194-5211`, dispatch at `5235-5280`). Three keys,
three indexes, one query — which is exactly the "one embedding of the whole
query is a blend" argument, implemented.

The artifact survives into the result: the tiers are logged
(`operate.py:4646-4647`), carried in the response metadata
(`operate.py:5985-5995`), and stored on the cache record
(`operate.py:4800-4801`). That is the technique's "decomposition is an
artifact, not a mood" clause, met.

The undecomposed baseline is also present as a first-class mode rather than a
debug flag: `naive` dispatches to `naive_query` (`lightrag/lightrag.py:4153-4155`
and `4259-4260`; definition at `operate.py:6591`), which skips the decomposer
and the graph entirely and reports empty tiers honestly in its metadata
(`operate.py:6752-6753`).

## Where the tree falls short

**1. The caller's mode flag still outranks the decomposition.**
`_build_query_context` re-reads the caller-supplied string and gates each tier
on it:

```python
# lightrag/operate.py:5194-5196
mode = query_param.mode
need_ll = mode in ("local", "hybrid", "mix") and bool(ll_keywords)
need_hl = mode in ("global", "hybrid", "mix") and bool(hl_keywords)
```

The decomposition is computed unconditionally for all four graph modes
(`operate.py:4642`), so a `local` query pays the model call that produces
high-level keys and then discards them at line 5196 — and a `global` query
does the same to its low-level keys. Lane choice is therefore a property of
the flag, not of the decomposed query: the standard's central rule is the one
the tree does not implement. Worse for measurement, `local` and `global` are
*alternatives* rather than a superset relation, which is the lane-replacement
the golden path forbids.

**2. The decomposition cache is partitioned by a key the decomposer never
reads.** The cache hash includes the mode:

```python
# lightrag/operate.py:5002-5008
args_hash = compute_args_hash(
    param.mode,
    text,
    language,
    ...
)
```

and the lookup repeats it (`operate.py:5010-5012`). But the prompt built at
`operate.py:5026-5030` is formatted from `query`, `examples` and `language`
only (`prompt.py:484-515`) — mode is not an input to the decomposition. The
same question asked in `local` and then in `hybrid` re-pays a model call for a
byte-identical answer, up to four partitions deep. This is the caching
mistake the technique names, in its exact form: keying a derived value on its
neighbours rather than its inputs.

**3. The all-empty fallback branches on a character count.** When both tiers
come back empty:

```python
# lightrag/operate.py:4654-4659
if hl_keywords == [] and ll_keywords == []:
    if len(query) < 50:
        logger.warning(f"Forced low_level_keywords to origin query: {query}")
        ll_keywords = [query]
    else:
        return QueryResult(content=PROMPTS["fail_response"], llm_generated=False)
```

Two problems. A query is not less decomposable for being long, so `50` is a
magic number standing where a confidence signal belongs — and a long query
that the decomposer could not handle is refused outright rather than falling
back. And the short-query path recovers silently: the fallback is a `warning`
in the log, never a label on the slice, so the consumer cannot tell a
decomposed answer from an undecomposed one. Contrast the `naive` path, which
does report its empty tiers structurally (`operate.py:6752-6753`) — the
honest treatment already exists in the tree, one branch away.

## What the tree teaches back

Two details are worth copying. Refusing to cache a decomposition parsed from a
truncated reply (`operate.py:5056`, guarded by `is_truncated_response`) closes
a real trap — a partial tier set that would otherwise replay forever. And
pinning the tiers on the request object (`operate.py:4866-4867`) is the right
shape for an override: it substitutes for the decomposition rather than
bypassing the stage, so the tier→lane policy downstream is unchanged.
