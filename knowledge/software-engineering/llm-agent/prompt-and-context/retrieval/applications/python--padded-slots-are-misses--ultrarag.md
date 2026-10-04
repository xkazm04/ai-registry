---
layer: application
type: application
subject: retrieval
technique: padded-slots-are-misses
stack: python
status: forged
verified_on: 2026-09-30
verified_against: python@3.11
---

# A pad-and-skip check at the one place identifiers become text (UltraRAG)

UltraRAG is an open RAG framework whose retriever is one independent server behind a
pluggable index backend. This document reads it at commit
`a763d34432007fcd1b261209f222bb10df907beb`. The Python witness is its declared floor
(`pyproject.toml:10` "requires-python"). Read only: the tree was not modified and its
vector-library test was not run, since the library is an optional extra.

## What the design gets right

The fix sits at the boundary the technique names. The backend's search method is the
single place where the engine's integer identifiers become passage strings, and the
sentinel test is there, before the lookup
(`servers/retriever/src/index_backends/faiss_backend.py:212` "if doc_id == -1:"; the
lookup it guards is `servers/retriever/src/index_backends/faiss_backend.py:214` "cur_ret.append(self.contents[doc_id])").
Every retrieval mode that goes through this backend inherits it, and nothing is repaired:
the padded slot is skipped and the list comes back shorter. The comment beside the check
states the failure in the technique's own terms: the filler would "silently return the
LAST document instead of signalling a miss".

The tree's test file is the second thing it gets right. It builds an index of three
documents with one orthogonal embedding each and asks for five, then asserts uniqueness
and exact content in rank order, and it covers k below, equal to and above the index
size and the one-document index (`tests/servers/retriever/test_faiss_search_padding.py`
"test_single_passage_index_does_not_repeat_padding"). Its docstring records the observed
pre-fix result: three passages came back as five, two of them copies of the last.

## Where it stops short

The fix is one of three backends. The factory also offers Milvus and Qdrant
(`servers/retriever/src/index_backends/__init__.py`), and the padding test exists for
the first only. Whether the other two can return a filler is an engine property the tree
does not state, so the technique's "test for the sentinel before any lookup" is enforced
for one of three and assumed for two.

The shorter list is also not checked downstream. Nothing in the test asserts what the
reranker or prompt assembler do with fewer than k entries, which is the last bullet of
the technique, and it is the half a reader cannot see from the retriever.

## What the realization cannot do

It cannot say how often the defect fired before it was fixed. The docstring's "three
passages came back as five" is a fixture result, and a real corpus is larger than any k,
so the field frequency is close to zero and concentrated at bootstrap. The technique is
about the failure that costs nothing to prevent and is nearly impossible to notice, and
this tree confirms the second half only by having found it with a fixture.
